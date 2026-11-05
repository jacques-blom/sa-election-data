import { resolve } from 'node:path';
import { getPlatformProxy } from 'wrangler';
import { openStore } from './lib/store.ts';
import { migrateD1 } from './lib/migrations.ts';

const db = openStore();
// This API emulates bindings locally. Remote bindings are explicitly disabled.
const { env, dispose } = await getPlatformProxy<Env>({ configPath: 'wrangler.jsonc',
  persist: { path: resolve('.wrangler/state/v3') }, remoteBindings: false });
const target = env.RESULTS_DB;

function insert(table: string, row: Record<string, unknown>, mode: 'IGNORE' | 'REPLACE') {
  const columns = Object.keys(row);
  return target.prepare(`INSERT OR ${mode} INTO ${table} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`)
    .bind(...Object.values(row));
}

try {
  await migrateD1(target);
  const existing = await target.prepare('SELECT id, active_snapshot_id FROM source_documents').all<{ id: string; active_snapshot_id: string | null }>();
  const active = new Map(existing.results.map((row) => [row.id, row.active_snapshot_id]));
  for (const election of db.prepare('SELECT * FROM elections ORDER BY year DESC').all()) {
    await insert('elections', election, 'REPLACE').run();
  }
  const sources = db.prepare('SELECT id FROM source_documents ORDER BY year DESC, id').all();
  let copied = 0;
  let refreshed = 0;
  for (const { id } of sources) {
    // Capture a consistent source and its rows while another process may be backfilling.
    db.exec('BEGIN');
    try {
      const source = db.prepare('SELECT * FROM source_documents WHERE id = ?').get(id!)!;
      const snapshotId = source.active_snapshot_id;
      if (typeof snapshotId === 'string' && active.get(String(id)) !== snapshotId) {
        const snapshot = db.prepare('SELECT * FROM snapshots WHERE id = ?').get(snapshotId)!;
        await insert('snapshots', snapshot, 'IGNORE').run();
        let batch: D1PreparedStatement[] = [];
        let bytes = 0;
        for (const row of db.prepare('SELECT * FROM area_results WHERE snapshot_id = ?').iterate(snapshotId)) {
          batch.push(insert('area_results', row, 'IGNORE'));
          bytes += Buffer.byteLength(String(row.payload));
          if (batch.length >= 50 || bytes >= 1_000_000) {
            await target.batch(batch);
            batch = [];
            bytes = 0;
          }
        }
        if (batch.length) await target.batch(batch);
        copied++;
      }
      // This single write publishes the fully staged snapshot. Failed batches keep the old pointer.
      await insert('source_documents', source, 'REPLACE').run();
      if (snapshotId !== null) {
        await target.prepare('DELETE FROM area_results WHERE source_id = ? AND snapshot_id != ?').bind(id, snapshotId).run();
      }
      db.exec('COMMIT');
      refreshed++;
      if (refreshed % 50 === 0) console.log(JSON.stringify({ localD1SourcesRefreshed: refreshed, total: sources.length, copiedSnapshots: copied }));
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
  console.log(JSON.stringify({ localD1SourcesRefreshed: refreshed, copiedSnapshots: copied, remote: false }));
} finally {
  db.close();
  await dispose();
}
