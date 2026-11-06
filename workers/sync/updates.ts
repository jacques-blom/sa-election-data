import type { AreaRecord } from '../../src/lib/data/normalize.ts';
import type { Source } from '../../src/lib/data/catalogue.ts';
import { hydrateResults, joinedResults, resultColumns } from '../../src/lib/data/packed-results.ts';
import { milestones, milestoneChanges, type Milestones } from '../../src/lib/updates/milestones.ts';
import type { ResultRow } from '../../src/lib/places/results.ts';
import type { prepareRecords } from './pack.ts';

/** Return guarded statements for the publisher's existing atomic D1 batch. */
export async function updateStatements(env: Pick<SyncEnv, 'RESULTS_DB' | 'RAW_RESULTS'>, source: Source,
  content: ReturnType<typeof prepareRecords>, previousSnapshotId: string | null, snapshotId: string,
  observedAt: string, publishedAt: string, guard: string, fence: (string | null)[]) {
  if (source.year !== 2026 || source.kind !== 'municipality') return [];
  const db = env.RESULTS_DB;
  const records = content.records.filter(r => r.directory.level !== 'voting-district').map(r => JSON.parse(r.json) as AreaRecord);
  const next = milestones(records);
  const state = await db.prepare('SELECT snapshot_id,milestones_json FROM result_update_state WHERE source_id=?')
    .bind(source.id).first<{ snapshot_id: string; milestones_json: string }>();
  let before: Milestones;
  if (state && state.snapshot_id === previousSnapshotId) before = JSON.parse(state.milestones_json);
  else if (previousSnapshotId) {
    // Rollout starts from the last published result, not an invented empty count.
    const rows = await db.prepare(`SELECT ${resultColumns} ${joinedResults}
      WHERE d.id=? AND d.active_snapshot_id=? AND r.level IN ('municipality','ward')`)
      .bind(source.id, previousSnapshotId).all<ResultRow & { province_id: string | null; ward_id: string | null }>();
    if (!rows.results.length) throw new Error('Missing baseline for result updates');
    const hydrated = await hydrateResults(db, env.RAW_RESULTS, rows.results);
    before = milestones(hydrated.map(r => ({ level: r.level, id: r.area_id, name: r.name,
      provinceId: r.province_id, municipalityId: r.municipality_id, wardId: r.ward_id,
      reportedAt: r.reported_at, payload: JSON.parse(r.payload) })));
  } else before = next; // First-ever import establishes a baseline, not news.

  const prior = await db.prepare(`SELECT milestone_key,MAX(id) AS id FROM result_updates WHERE source_id=? GROUP BY milestone_key`)
    .bind(source.id).all<{ milestone_key: string; id: number }>();
  const lastEvent = new Map(prior.results.map(row => [row.milestone_key, row.id]));
  const statements: D1PreparedStatement[] = [];
  for (const change of milestoneChanges(before, next)) {
    const previousEventId = lastEvent.get(change.key) ?? null;
    if (!change.after && !previousEventId) continue;
    const milestone = (change.after ?? change.before)!;
    const action = previousEventId ? (change.after ? 'corrected' : 'withdrawn') : 'announced';
    statements.push(db.prepare(`INSERT OR IGNORE INTO result_updates
      (event_key,year,source_id,milestone_key,kind,action,province_id,municipality_id,area_id,area_name,municipality_name,
       observed_at,published_at,reported_at,source_url,from_snapshot_id,to_snapshot_id,previous_event_id,before_json,after_json)
      SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? WHERE ${guard}`)
      .bind(`${source.id}:${previousSnapshotId}:${snapshotId}:${change.key}`, source.year, source.id, change.key,
        milestone.kind, action, milestone.provinceId, milestone.municipalityId, milestone.areaId,
        milestone.areaName, milestone.municipalityName, observedAt, publishedAt,
        records.find(r => r.id === milestone.areaId)?.reportedAt ?? records[0]!.reportedAt,
        source.url, previousSnapshotId, snapshotId, previousEventId,
        change.before ? JSON.stringify(change.before) : null, change.after ? JSON.stringify(change.after) : null, ...fence));
  }
  statements.push(db.prepare(`INSERT INTO result_update_state(source_id,snapshot_id,milestones_json,started_at,published_at)
    SELECT ?,?,?,?,? WHERE ${guard}
    ON CONFLICT(source_id) DO UPDATE SET snapshot_id=excluded.snapshot_id,
      milestones_json=excluded.milestones_json,published_at=excluded.published_at`)
    .bind(source.id, snapshotId, JSON.stringify(next), publishedAt, publishedAt, ...fence));
  return statements;
}
