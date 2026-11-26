CREATE TABLE presence (
  session_id TEXT PRIMARY KEY,
  last_seen INTEGER NOT NULL
);

CREATE INDEX presence_last_seen ON presence (last_seen);

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  level_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('route', 'map')),
  duration_ms INTEGER,
  received_at INTEGER NOT NULL
);

CREATE INDEX events_received_at ON events (received_at);
CREATE INDEX events_run ON events (run_id, mode, kind);
