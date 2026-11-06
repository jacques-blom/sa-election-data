-- Derived homepage summaries, matched to the source's active snapshot.
CREATE TABLE IF NOT EXISTS council_dashboard (
  source_id TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL,
  summary_json TEXT NOT NULL CHECK(json_valid(summary_json))
);
