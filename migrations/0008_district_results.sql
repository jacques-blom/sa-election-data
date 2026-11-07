-- District ballots elect only the directly elected portion of the district council.
-- Keep these results separate from local/metro ballots and council-seat outcomes.
CREATE TABLE IF NOT EXISTS district_results (
  id TEXT PRIMARY KEY,
  year INTEGER NOT NULL DEFAULT 2026 CHECK (year = 2026),
  source_url TEXT NOT NULL,
  payload TEXT CHECK (payload IS NULL OR json_valid(payload)),
  reported_at TEXT,
  checked_at TEXT,
  successful_at TEXT,
  published_at TEXT,
  etag TEXT,
  last_modified TEXT,
  raw_hash TEXT,
  content_hash TEXT,
  raw_key TEXT,
  previous_raw_key TEXT,
  last_error TEXT,
  pending_token TEXT,
  pending_since TEXT,
  retry_after TEXT,
  failures INTEGER NOT NULL DEFAULT 0
);
