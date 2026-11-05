import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Election, Source } from '../../src/lib/data/catalogue.ts';
import type { AreaRecord } from '../../src/lib/data/normalize.ts';
import { NORMALIZER_VERSION } from '../../src/lib/data/normalize.ts';
import { addedColumn, migrationFiles } from './migrations.ts';

export const DATA_DIR = resolve('.data');
export function openStore(directory = DATA_DIR) {
  mkdirSync(directory, { recursive: true });
  const db = new DatabaseSync(resolve(directory, 'elections.sqlite'));
  db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  for (const file of migrationFiles()) {
    for (const sql of file.statements) {
      const added = addedColumn(sql);
      if (added && db.prepare(`PRAGMA table_info(${added.table})`).all().some(row => row.name === added.column)) continue;
      db.exec(sql);
    }
  }
  return db;
}

export type StoredSource = {
  etag: string | null;
  last_modified: string | null;
  active_snapshot_id: string | null;
  raw_path: string | null;
  sha256: string | null;
  reported_at: string | null;
  fetched_at: string | null;
};

export function getSource(db: DatabaseSync, source: Source): StoredSource | undefined {
  return db.prepare(`SELECT d.etag, d.last_modified, d.active_snapshot_id, s.raw_path, s.sha256, s.reported_at, s.fetched_at
    FROM source_documents d LEFT JOIN snapshots s ON s.id = d.active_snapshot_id WHERE d.id = ?`)
    .get(source.id) as StoredSource | undefined;
}

export function recordUnchanged(db: DatabaseSync, source: Source, checkedAt: string) {
  db.prepare(`UPDATE source_documents SET last_checked_at = ?, last_success_at = ?, last_error = NULL WHERE id = ?`)
    .run(checkedAt, checkedAt, source.id);
}

export function recordFailure(db: DatabaseSync, source: Source, error: unknown) {
  db.prepare(`INSERT INTO source_documents(id, year, kind, area_id, url, last_checked_at, last_error)
    VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET
    last_checked_at = excluded.last_checked_at, last_error = excluded.last_error`)
    .run(source.id, source.year, source.kind, source.areaId, source.url, new Date().toISOString(), String(error).slice(0, 1000));
}

export function saveDocument(db: DatabaseSync, election: Election, source: Source, metadata: {
  sha256: string; checkedAt: string; reportedAt: string; rawPath: string;
  etag: string | null; lastModified: string | null;
  reprocess?: boolean;
}, records: Iterable<AreaRecord>) {
  const snapshotId = `${source.id}:v${NORMALIZER_VERSION}:${metadata.sha256}`;
  db.exec('BEGIN IMMEDIATE');
  try {
    const previous = getSource(db, source);
    if (previous?.reported_at && Date.parse(metadata.reportedAt) < Date.parse(previous.reported_at)) {
      throw new Error('Rejected a source snapshot older than the last published report');
    }
    db.prepare('INSERT OR REPLACE INTO elections(year, iec_event_id, status) VALUES (?, ?, ?)')
      .run(election.year, election.eventId, election.status);
    db.prepare('DELETE FROM area_results WHERE snapshot_id = ?').run(snapshotId);
    const insert = db.prepare(`INSERT INTO area_results
      (snapshot_id, source_id, year, level, area_id, province_id, municipality_id, ward_id, name, reported_at, payload)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    let count = 0;
    for (const record of records) {
      insert.run(snapshotId, source.id, election.year, record.level, record.id, record.provinceId,
        record.municipalityId, record.wardId, record.name, record.reportedAt, JSON.stringify(record.payload));
      count++;
    }
    db.prepare(`INSERT OR IGNORE INTO snapshots
      (id, source_id, year, sha256, fetched_at, reported_at, raw_path, record_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(snapshotId, source.id, election.year, metadata.sha256, metadata.checkedAt, metadata.reportedAt, metadata.rawPath, count);
    if (metadata.reprocess) {
      // Reinterpreting an archived payload is not a successful new upstream fetch.
      db.prepare('UPDATE source_documents SET active_snapshot_id = ? WHERE id = ?').run(snapshotId, source.id);
    } else db.prepare(`INSERT INTO source_documents
      (id, year, kind, area_id, url, active_snapshot_id, etag, last_modified, last_checked_at, last_success_at, last_error)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
      ON CONFLICT(id) DO UPDATE SET active_snapshot_id = excluded.active_snapshot_id,
        etag = excluded.etag, last_modified = excluded.last_modified,
        last_checked_at = excluded.last_checked_at, last_success_at = excluded.last_success_at, last_error = NULL`)
      .run(source.id, election.year, source.kind, source.areaId, source.url, snapshotId,
        metadata.etag, metadata.lastModified, metadata.checkedAt, metadata.checkedAt);
    db.prepare('DELETE FROM area_results WHERE source_id = ? AND snapshot_id != ?').run(source.id, snapshotId);
    db.exec('COMMIT');
    return count;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
