CREATE TABLE IF NOT EXISTS elections (
  year INTEGER PRIMARY KEY,
  iec_event_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('provisional', 'historical'))
);

CREATE TABLE IF NOT EXISTS snapshots (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  reported_at TEXT NOT NULL,
  raw_path TEXT NOT NULL,
  record_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS source_documents (
  id TEXT PRIMARY KEY,
  year INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('summary', 'municipality')),
  area_id TEXT NOT NULL,
  url TEXT NOT NULL,
  active_snapshot_id TEXT,
  etag TEXT,
  last_modified TEXT,
  last_checked_at TEXT NOT NULL,
  last_success_at TEXT,
  last_error TEXT
);

CREATE TABLE IF NOT EXISTS area_results (
  snapshot_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('national', 'province', 'municipality', 'ward', 'voting-district')),
  area_id TEXT NOT NULL,
  province_id TEXT,
  municipality_id TEXT,
  ward_id TEXT,
  name TEXT NOT NULL,
  reported_at TEXT NOT NULL,
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  PRIMARY KEY (snapshot_id, level, area_id)
);

CREATE INDEX IF NOT EXISTS area_lookup ON area_results(year, level, area_id, snapshot_id);
CREATE INDEX IF NOT EXISTS area_parent ON area_results(year, level, municipality_id, ward_id);
CREATE INDEX IF NOT EXISTS active_sources ON source_documents(year, kind, active_snapshot_id);
CREATE INDEX IF NOT EXISTS source_result_rows ON area_results(source_id, snapshot_id);
