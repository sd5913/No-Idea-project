import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import worker from '../analytics/worker.mjs';
import { createPlaytestDatabase } from './fixtures/playtest-db.mjs';

const site = 'https://game.test';
const base = 'https://api.test';

function fixture(t) {
  const { sqlite, db } = createPlaytestDatabase();
  t.after(() => sqlite.close());
  const env = { DB: db, SITE_ORIGIN: site };
  return {
    sqlite,
    env,
    fetch: (path, body, origin = site) => worker.fetch(new Request(base + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }), env),
  };
}

test('在线统计去重，并淘汰过了 90 秒的会话', async t => {
  const app = fixture(t);
  const a = randomUUID();
  const b = randomUUID();
  for (const sessionId of [a, a, b]) {
    assert.equal((await app.fetch('/presence', { sessionId })).status, 204);
  }
  assert.equal((await (await app.fetch('/stats')).json()).online, 2);
  app.sqlite.prepare('UPDATE presence SET last_seen = ? WHERE session_id = ?').run(Date.now() - 91_000, a);
  assert.equal((await (await app.fetch('/stats')).json()).online, 1);
});

test('试玩数据去重，跳关局排除在正常路线通关率和中位数之外', async t => {
  const app = fixture(t);
  const sessionId = randomUUID();
  const log = async (runId, kind, options = {}) => {
    const payload = { id: randomUUID(), sessionId, runId, kind, levelId: 'j01', mode: 'route', ...options };
    assert.equal((await app.fetch('/events', payload)).status, 204);
  };
  const [completed, alsoCompleted, incomplete, assisted] = Array.from({ length: 4 }, () => randomUUID());
  await log(completed, 'visit');
  for (const id of [completed, alsoCompleted, incomplete, assisted]) await log(id, 'run_start');
  await log(completed, 'run_complete', { durationMs: 40_000 });
  await log(alsoCompleted, 'run_complete', { durationMs: 80_000 });
  await log(assisted, 'level_enter', { mode: 'map' });
  await log(assisted, 'run_complete', { mode: 'map', durationMs: 4000 });
  const fallId = randomUUID();
  await log(completed, 'fall', { id: fallId });
  await log(completed, 'fall', { id: fallId });
  const result = await (await app.fetch('/stats')).json();
  assert.equal(result.visits, 1);
  assert.equal(result.routeRuns, 3);
  assert.equal(result.completedRuns, 2);
  assert.equal(result.medianMs, 60_000);
  assert.equal(result.levels.find(row => row.mode === 'route').falls, 1);
  assert.equal(result.levels.find(row => row.mode === 'map').entered, 1);
  assert.equal(JSON.stringify(result).includes(sessionId), false);
});

test('API 验证来源、大小和格式，并限流和清理过期数据', async t => {
  const app = fixture(t);
  const sessionId = randomUUID();
  assert.equal((await app.fetch('/presence', { sessionId }, 'https://unrelated.test')).status, 403);
  assert.equal((await app.fetch('/events', { sessionId, kind: 'unknown' })).status, 400);
  assert.equal((await app.fetch('/presence', { sessionId, padding: '.'.repeat(1100) })).status, 400);
  const preflight = await worker.fetch(new Request(base + '/events', {
    method: 'OPTIONS', headers: { Origin: site },
  }), app.env);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), site);
  assert.equal((await app.fetch('/presence', { sessionId })).status, 204);
  app.env.RATE_LIMITER = { limit: async () => ({ success: false }) };
  assert.equal((await app.fetch('/presence', { sessionId })).status, 429);
  const now = Date.now();
  app.sqlite.prepare('UPDATE presence SET last_seen = ?').run(now - 86_400_001);
  app.sqlite.prepare("INSERT INTO events VALUES (?, ?, ?, 'visit', 'j01', 'route', NULL, ?)")
    .run(randomUUID(), sessionId, randomUUID(), now - 15 * 86_400_000);
  await worker.scheduled(null, app.env);
  assert.equal(app.sqlite.prepare('SELECT COUNT(*) AS total FROM presence').get().total, 0);
  assert.equal(app.sqlite.prepare('SELECT COUNT(*) AS total FROM events').get().total, 0);
});
