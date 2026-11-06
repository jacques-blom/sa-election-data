import { councilSnapshot } from '../../src/lib/overview/snapshot.ts';
import type { AreaRecord } from '../../src/lib/data/normalize.ts';
import type { Source } from '../../src/lib/data/catalogue.ts';
import type { prepareRecords } from './pack.ts';

export function dashboardStatement(db: D1Database, source: Source, content: ReturnType<typeof prepareRecords>,
  snapshotId: string, guard: string, fence: (string | null)[]) {
  if (source.year !== 2026 || source.kind !== 'municipality') return null;
  const records = content.records.filter(r => r.directory.level !== 'voting-district').map(r => JSON.parse(r.json) as AreaRecord);
  const summary = councilSnapshot(records);
  if (!summary) throw new Error('Council summary is missing its municipality');
  return db.prepare(`INSERT INTO council_dashboard(source_id,snapshot_id,summary_json)
    SELECT ?,?,? WHERE ${guard}
    ON CONFLICT(source_id) DO UPDATE SET snapshot_id=excluded.snapshot_id,summary_json=excluded.summary_json`)
    .bind(source.id, snapshotId, JSON.stringify(summary), ...fence);
}
