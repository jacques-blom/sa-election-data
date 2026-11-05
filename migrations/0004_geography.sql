-- Source geography and canonical named places are independent of live result snapshots.
CREATE TABLE IF NOT EXISTS place_directory (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  aliases TEXT NOT NULL,
  province TEXT NOT NULL,
  municipality TEXT NOT NULL,
  kind TEXT NOT NULL,
  indexable INTEGER NOT NULL DEFAULT 0,
  payload TEXT NOT NULL CHECK(json_valid(payload))
);
CREATE VIRTUAL TABLE IF NOT EXISTS place_search USING fts5(
  name, aliases, province, municipality,
  content='place_directory', content_rowid='rowid', tokenize='unicode61 remove_diacritics 2'
);
CREATE TABLE IF NOT EXISTS map_geometries (
  level TEXT NOT NULL,
  id TEXT NOT NULL,
  minx REAL NOT NULL,
  miny REAL NOT NULL,
  maxx REAL NOT NULL,
  maxy REAL NOT NULL,
  object_key TEXT NOT NULL,
  byte_offset INTEGER NOT NULL,
  byte_length INTEGER NOT NULL,
  PRIMARY KEY(level,id)
);
CREATE INDEX IF NOT EXISTS geometry_bbox ON map_geometries(level,minx,maxx,miny,maxy);
CREATE INDEX IF NOT EXISTS indexable_places ON place_directory(indexable,slug);
