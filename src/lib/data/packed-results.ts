import { gunzipSync } from 'node:zlib';
import type { AreaRecord, Level } from './normalize.ts';

export type PackEntry = { offset: number; length: number };
export type PackIndex = Record<string, PackEntry>;
export type Bundle = { source_id: string; directory_snapshot_id: string; object_key: string;
  previous_object_key: string | null; previous_index_json: string | null; raw_length: number; index_json: string };

// Legacy snapshots remain readable during rollout and for historical elections.
// For packed sources, area_results is a stable directory, not a second result copy.
export const joinedResults = `FROM source_documents d
  LEFT JOIN result_bundles b ON b.source_id=d.id
  JOIN area_results r ON r.source_id=d.id
    AND r.snapshot_id=COALESCE(b.directory_snapshot_id,d.active_snapshot_id)`;
export const resultColumns = `r.year,r.level,r.area_id,r.province_id,r.municipality_id,r.ward_id,r.name,
  r.reported_at,r.source_id,d.active_snapshot_id AS snapshot_id,
  CASE WHEN b.object_key IS NULL THEN r.payload ELSE NULL END AS payload,
  b.object_key AS bundle_key,d.url,d.last_checked_at,d.last_success_at,d.last_error,d.last_modified`;

type PackedRow = { level: Level; area_id: string; source_id?: string; bundle_key?: string | null;
  payload: string | null; reported_at: string; name: string };

/** Hydrate only requested rows, coalescing nearby byte ranges for municipality pages.
 * The index and object key are immutable for the duration of this read. */
export async function hydrateResults<T extends PackedRow>(db: D1Database, bucket: R2Bucket | undefined, rows: T[]): Promise<(T & { payload: string })[]> {
  const packed = rows.filter(row => row.bundle_key);
  if (!packed.length) return rows as (T & { payload: string })[];
  if (!bucket) throw new Error('Packed result storage is unavailable');
  if (packed.some(row => !row.source_id)) throw new Error('Missing packed result source');
  const sourceIds = [...new Set(packed.map(row => row.source_id!))];
  const bundles = await db.prepare(`SELECT * FROM result_bundles WHERE source_id IN (${sourceIds.map(() => '?').join(',')})`)
    .bind(...sourceIds).all<Bundle>();
  // Do not combine a directory/snapshot from one version with bytes from another.
  for (const row of packed) {
    const bundle = bundles.results.find(b => b.source_id === row.source_id);
    if (bundle?.object_key !== row.bundle_key && bundle?.previous_object_key !== row.bundle_key) {
      throw new Error('Results changed during read; retry the request');
    }
  }
  // Bound concurrent R2 calls and memory even for province-wide views.
  for (let start = 0; start < bundles.results.length; start += 4) {
    await Promise.all(bundles.results.slice(start, start + 4).map(async bundle => {
      const sourceRows = packed.filter(row => row.source_id === bundle.source_id);
      const key = sourceRows[0]!.bundle_key!;
      const index = JSON.parse(key === bundle.object_key ? bundle.index_json : bundle.previous_index_json!) as PackIndex;
      const selected = sourceRows.map(row => {
        const entry = index[`${row.level}:${row.area_id}`];
        if (!entry) throw new Error('Area missing from published pack');
        return { row, ...entry };
      }).sort((a, b) => a.offset - b.offset);
      for (let i = 0; i < selected.length;) {
        const first = selected[i]!;
        let end = first.offset + first.length;
        let next = i + 1;
        while (next < selected.length && selected[next]!.offset - end <= 8192
          && selected[next]!.offset + selected[next]!.length - first.offset <= 512 * 1024) {
          end = selected[next]!.offset + selected[next]!.length;
          next++;
        }
        const object = await bucket.get(key, { range: { offset: first.offset, length: end - first.offset } });
        if (!object) throw new Error('Published result pack is unavailable');
        const bytes = Buffer.from(await object.arrayBuffer());
        if (bytes.length !== end - first.offset) throw new Error('Incomplete result pack range');
        for (const { row, offset, length } of selected.slice(i, next)) {
          const record = JSON.parse(gunzipSync(bytes.subarray(offset - first.offset, offset - first.offset + length),
            { maxOutputLength: 2_000_000 }).toString('utf8')) as AreaRecord;
          if (record.level !== row.level || record.id !== row.area_id) throw new Error('Result pack index mismatch');
          row.payload = JSON.stringify(record.payload);
          row.reported_at = record.reportedAt;
          row.name = record.name;
        }
        i = next;
      }
    }));
  }
  return rows as (T & { payload: string })[];
}
