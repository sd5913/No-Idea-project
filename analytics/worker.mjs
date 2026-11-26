const SECOND = 1000;
const DAY = 86_400 * SECOND;
const ONLINE_WINDOW = 90 * SECOND;
const kinds = new Set(['visit', 'run_start', 'level_enter', 'level_clear', 'fall', 'retry', 'treasure', 'run_complete']);
const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const level = /^[jiv]\d{2}$/;

const runSummary = `
  WITH starts AS (
    SELECT DISTINCT run_id FROM events
    WHERE kind = 'run_start' AND mode = 'route' AND received_at >= ?
  ), route_runs AS (
    SELECT s.run_id FROM starts s WHERE NOT EXISTS (
      SELECT 1 FROM events e WHERE e.run_id = s.run_id AND e.mode = 'map'
    )
  ), times AS (
    SELECT MIN(e.duration_ms) AS elapsed FROM route_runs r JOIN events e USING (run_id)
    WHERE e.kind = 'run_complete' AND e.mode = 'route' GROUP BY r.run_id
  ), ranked AS (
    SELECT elapsed, ROW_NUMBER() OVER (ORDER BY elapsed) AS position, COUNT(*) OVER () AS total
    FROM times
  )
  SELECT (SELECT COUNT(*) FROM route_runs) AS routeRuns,
         COUNT(*) AS completedRuns,
         AVG(CASE WHEN position IN ((total + 1) / 2, (total + 2) / 2) THEN elapsed END) AS medianMs
  FROM ranked`;

async function readJson(request) {
  const mediaType = request.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase();
  if (mediaType !== 'application/json' || !request.body) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return JSON.parse(text + decoder.decode());
      size += value.byteLength;
      if (size > 1024) {
        await reader.cancel();
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
  } catch {
    return null;
  }
}

async function stats(db, now) {
  const since = now - 7 * DAY;
  const [online, visits, runs, levels] = await db.batch([
    db.prepare('SELECT COUNT(*) AS total FROM presence WHERE last_seen >= ?').bind(now - ONLINE_WINDOW),
    db.prepare("SELECT COUNT(DISTINCT session_id) AS total FROM events WHERE kind = 'visit' AND received_at >= ?").bind(since),
    db.prepare(runSummary).bind(since),
    db.prepare(`
      SELECT level_id AS level, mode,
        SUM(kind = 'level_enter') AS entered, SUM(kind = 'fall') AS falls,
        SUM(kind = 'retry') AS retries, SUM(kind = 'level_clear') AS cleared,
        SUM(kind = 'treasure') AS treasures
      FROM events WHERE received_at >= ? AND kind IN ('level_enter', 'fall', 'retry', 'level_clear', 'treasure')
      GROUP BY level_id, mode ORDER BY level_id, mode`).bind(since),
  ]);
  return {
    online: online.results[0].total,
    onlineWindowSeconds: ONLINE_WINDOW / SECOND,
    visits: visits.results[0].total,
    ...runs.results[0],
    levels: levels.results,
    updatedAt: new Date(now).toISOString(),
  };
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    const origin = request.headers.get('Origin');
    const allowed = Boolean(origin && origin === env.SITE_ORIGIN);
    const headers = new Headers({ 'Cache-Control': 'no-store', Vary: 'Origin' });
    if (allowed) headers.set('Access-Control-Allow-Origin', origin);
    const json = (body, status = 200) => Response.json(body, { status, headers });
    const write = path === '/presence' || path === '/events';
    if (!write && path !== '/stats') return json({ error: 'Not found' }, 404);
    if ((origin && !allowed) || (!allowed && write)) return json({ error: 'Origin denied' }, 403);
    if (request.method === 'OPTIONS') {
      headers.set('Access-Control-Allow-Methods', write ? 'POST, OPTIONS' : 'GET, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type');
      return new Response(null, { status: 204, headers });
    }
    const now = Date.now();
    try {
      if (path === '/stats' && request.method === 'GET') return json(await stats(env.DB, now));
      if (!write || request.method !== 'POST') {
        headers.set('Allow', write ? 'POST, OPTIONS' : 'GET, OPTIONS');
        return json({ error: 'Method not allowed' }, 405);
      }
      if (env.RATE_LIMITER) {
        const key = request.headers.get('CF-Connecting-IP') ?? 'unknown';
        if (!(await env.RATE_LIMITER.limit({ key })).success) return json({ error: 'Too many requests' }, 429);
      }
      const data = await readJson(request);
      if (typeof data?.sessionId !== 'string' || !uuid.test(data.sessionId)) {
        return json({ error: 'Invalid session' }, 400);
      }
      if (path === '/presence') {
        await env.DB.prepare(`
          INSERT INTO presence (session_id, last_seen) VALUES (?, ?)
          ON CONFLICT(session_id) DO UPDATE SET last_seen = excluded.last_seen
          WHERE presence.last_seen < excluded.last_seen`).bind(data.sessionId, now).run();
      } else {
        const { id, runId, kind, levelId, mode, durationMs } = data;
        const validDuration = kind === 'run_complete'
          ? Number.isSafeInteger(durationMs) && durationMs >= 0 && durationMs <= DAY
          : durationMs === undefined;
        if (typeof id !== 'string' || !uuid.test(id) || typeof runId !== 'string' || !uuid.test(runId) ||
            !kinds.has(kind) || typeof levelId !== 'string' || !level.test(levelId) ||
            (mode !== 'route' && mode !== 'map') || !validDuration) {
          return json({ error: 'Invalid event' }, 400);
        }
        await env.DB.prepare(`
          INSERT INTO events (id, session_id, run_id, kind, level_id, mode, duration_ms, received_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`)
          .bind(id, data.sessionId, runId, kind, levelId, mode, durationMs ?? null, now).run();
      }
      return new Response(null, { status: 204, headers });
    } catch {
      return json({ error: 'Playtest statistics unavailable' }, 503);
    }
  },

  async scheduled(_event, env) {
    const now = Date.now();
    await env.DB.batch([
      env.DB.prepare('DELETE FROM presence WHERE last_seen < ?').bind(now - DAY),
      env.DB.prepare('DELETE FROM events WHERE received_at < ?').bind(now - 14 * DAY),
    ]);
  },
};
