-- Separate from immutable result snapshots: polling, scheduling and publication state.
CREATE TABLE IF NOT EXISTS sync_state (
  source_id TEXT PRIMARY KEY,
  content_snapshot_id TEXT,
  content_sha256 TEXT,
  last_observed_at TEXT,
  last_reported_at TEXT,
  last_sha256 TEXT,
  last_raw_key TEXT,
  last_published_at TEXT,
  hint_sha256 TEXT,
  applied_hint_sha256 TEXT,
  pending_token TEXT,
  pending_since TEXT,
  last_enqueued_at TEXT,
  retry_after TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sync_locks (
  name TEXT PRIMARY KEY,
  token TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_status (
  id TEXT PRIMARY KEY,
  last_started_at TEXT,
  last_completed_at TEXT,
  last_error TEXT,
  enqueued_count INTEGER NOT NULL DEFAULT 0,
  backoff_until TEXT
);
