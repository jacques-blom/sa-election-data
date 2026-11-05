-- D1 holds a stable area directory and one pointer/index per source. Result
-- payloads and exact source bytes live together in a ranged-readable R2 pack.
CREATE TABLE IF NOT EXISTS result_bundles (
  source_id TEXT PRIMARY KEY,
  directory_snapshot_id TEXT NOT NULL,
  object_key TEXT NOT NULL,
  previous_object_key TEXT,
  previous_index_json TEXT,
  raw_length INTEGER NOT NULL,
  normalizer_version INTEGER NOT NULL,
  party_directory_hash TEXT NOT NULL,
  index_json TEXT NOT NULL CHECK(json_valid(index_json))
);

CREATE TABLE IF NOT EXISTS sync_budget (
  period TEXT PRIMARY KEY,
  checks INTEGER NOT NULL DEFAULT 0,
  queue_messages INTEGER NOT NULL DEFAULT 0,
  r2_writes INTEGER NOT NULL DEFAULT 0,
  decoded_bytes INTEGER NOT NULL DEFAULT 0,
  exhausted_resource TEXT
);
