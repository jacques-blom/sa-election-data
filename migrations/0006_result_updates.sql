-- Milestones are published in the same transaction as the source pointer.
CREATE TABLE IF NOT EXISTS result_update_state (
  source_id TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL,
  milestones_json TEXT NOT NULL CHECK(json_valid(milestones_json)),
  started_at TEXT NOT NULL,
  published_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS result_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_key TEXT NOT NULL UNIQUE,
  year INTEGER NOT NULL,
  source_id TEXT NOT NULL,
  milestone_key TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('ward_won','council_decided','count_complete')),
  action TEXT NOT NULL CHECK(action IN ('announced','corrected','withdrawn')),
  province_id TEXT NOT NULL,
  municipality_id TEXT NOT NULL,
  area_id TEXT NOT NULL,
  area_name TEXT NOT NULL,
  municipality_name TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  published_at TEXT NOT NULL,
  reported_at TEXT NOT NULL,
  source_url TEXT NOT NULL,
  from_snapshot_id TEXT,
  to_snapshot_id TEXT NOT NULL,
  previous_event_id INTEGER REFERENCES result_updates(id),
  before_json TEXT CHECK(before_json IS NULL OR json_valid(before_json)),
  after_json TEXT CHECK(after_json IS NULL OR json_valid(after_json))
);
CREATE INDEX IF NOT EXISTS result_updates_province ON result_updates(year,province_id,id);
CREATE INDEX IF NOT EXISTS result_updates_municipality ON result_updates(year,municipality_id,id);
CREATE INDEX IF NOT EXISTS result_updates_kind ON result_updates(year,kind,id);
CREATE INDEX IF NOT EXISTS result_updates_source ON result_updates(source_id,milestone_key,id);
CREATE INDEX IF NOT EXISTS result_updates_previous ON result_updates(previous_event_id);
