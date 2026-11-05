ALTER TABLE sync_budget ADD COLUMN cpu_ms INTEGER NOT NULL DEFAULT 0;
ALTER TABLE sync_budget ADD COLUMN cpu_meter_seen_at TEXT;
