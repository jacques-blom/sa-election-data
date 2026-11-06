import type { AreaRecord } from '../../src/lib/data/normalize.ts';
import { hydrateResults, joinedResults, resultColumns } from '../../src/lib/data/packed-results.ts';
import { councilSnapshot, COUNCIL_SNAPSHOT_VERSION } from '../../src/lib/overview/snapshot.ts';

type Row = { level: AreaRecord['level']; area_id: string; name: string; province_id: string | null;
  municipality_id: string | null; ward_id: string | null; reported_at: string; payload: string | null;
  source_id: string; snapshot_id: string; bundle_key: string | null };

/** Populate derived summaries from published packs, without fetching or republishing IEC results.
 * Snapshot guards make this safe to run while the normal sync is publishing updates. */
export async function backfillDashboard(db: D1Database, bucket: R2Bucket,
  options: { apply?: boolean; limit?: number; progress?: (completed: number, total: number) => void } = {}) {
  const sources = await db.prepare(`SELECT id,active_snapshot_id FROM source_documents
    WHERE year=2026 AND kind='municipality' AND active_snapshot_id IS NOT NULL ORDER BY id`).all<{ id: string; active_snapshot_id: string }>();
  const stored = await db.prepare(`SELECT source_id,snapshot_id,json_extract(summary_json,'$.version') AS version FROM council_dashboard`)
    .all<{ source_id: string; snapshot_id: string; version: number }>().catch(error => {
      if (!options.apply && /no such table: (?:main\.)?council_dashboard/i.test(String(error))) return { results: [] };
      throw error;
    });
  const existing = new Map(stored.results.map(s => [s.source_id, s]));
  const candidates = sources.results.filter(s => {
    const summary = existing.get(s.id);
    return summary?.snapshot_id !== s.active_snapshot_id || summary?.version !== COUNCIL_SNAPSHOT_VERSION;
  }).slice(0, options.limit || undefined);
  const result = { checked: candidates.length, generated: 0, written: 0, changedDuringRead: 0, failures: [] as { source: string; error: string }[] };
  let completed = 0;
  for (let start = 0; start < candidates.length; start += 4) {
    await Promise.all(candidates.slice(start, start + 4).map(async source => {
      try {
        const { results: rows } = await db.prepare(`SELECT ${resultColumns} ${joinedResults}
          WHERE d.id=? AND r.level IN ('municipality','ward')`).bind(source.id).all<Row>();
        const council = rows.find(r => r.level === 'municipality');
        if (!council) throw new Error('Published municipality is missing');
        await hydrateResults(db, bucket, rows);
        const summary = councilSnapshot(rows.map(row => ({ level: row.level, id: row.area_id, name: row.name,
          provinceId: row.province_id, municipalityId: row.municipality_id, wardId: row.ward_id,
          reportedAt: row.reported_at, payload: JSON.parse(row.payload!) })));
        if (!summary) throw new Error('Summary generation failed');
        result.generated++;
        if (options.apply) {
          const written = await db.prepare(`INSERT INTO council_dashboard(source_id,snapshot_id,summary_json)
            SELECT ?,?,? WHERE EXISTS(SELECT 1 FROM source_documents WHERE id=? AND active_snapshot_id=?)
            ON CONFLICT(source_id) DO UPDATE SET snapshot_id=excluded.snapshot_id,summary_json=excluded.summary_json`)
            .bind(source.id, council.snapshot_id, JSON.stringify(summary), source.id, council.snapshot_id).run();
          if (written.meta.changes === 1) result.written++; else result.changedDuringRead++;
        }
      } catch (error) { result.failures.push({ source: source.id, error: String(error) }); }
      options.progress?.(++completed, candidates.length);
    }));
  }
  return result;
}
