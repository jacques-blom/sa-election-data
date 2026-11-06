import { gunzipSync } from 'node:zlib';
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { BOUNDARY_BATCH_SIZE } from './config.ts';
import type { GeometryRow } from './geometry.ts';

export function parseBoundaryIds(params: URLSearchParams): string[] | null {
  const ids = (params.get('ids') ?? '').split(',');
  if (ids.length > BOUNDARY_BATCH_SIZE || ids.some(id => !/^\d{8}$/.test(id))) return null;
  return [...new Set(ids)].sort();
}

/** Adjacent ward records share an R2 range read instead of one read per polygon. */
export async function readBoundaryBatch(bucket: R2Bucket, rows: GeometryRow[]) {
  if (rows.length > BOUNDARY_BATCH_SIZE || rows.some(row => !Number.isSafeInteger(row.byte_offset) || row.byte_offset < 0
    || !Number.isSafeInteger(row.byte_length) || row.byte_length <= 0 || row.byte_length > 3_000_000)
    || rows.reduce((total, row) => total + row.byte_length, 0) > 4_000_000) throw new Error('Boundary batch exceeds read limit');
  const ranges: { key: string; offset: number; length: number; rows: GeometryRow[] }[] = [];
  for (const row of [...rows].sort((a, b) => a.object_key.localeCompare(b.object_key) || a.byte_offset - b.byte_offset)) {
    const previous = ranges.at(-1);
    const end = row.byte_offset + row.byte_length;
    if (previous && previous.key === row.object_key && row.byte_offset >= previous.offset + previous.length
      && row.byte_offset - (previous.offset + previous.length) <= 16_384 && end - previous.offset <= 1_000_000) {
      previous.length = end - previous.offset;
      previous.rows.push(row);
    } else ranges.push({ key: row.object_key, offset: row.byte_offset, length: row.byte_length, rows: [row] });
  }
  const features = new Map<string, Feature<Polygon | MultiPolygon>>();
  let decodedBytes = 0;
  let failed = false;
  const results = await Promise.allSettled(Array.from({ length: Math.min(4, ranges.length) }, async () => {
    try {
      while (ranges.length && !failed) {
        const range = ranges.shift()!;
        const object = await bucket.get(range.key, { range: { offset: range.offset, length: range.length } });
        if (!object) throw new Error('Boundary unavailable');
        const bytes = Buffer.from(await object.arrayBuffer());
        if (bytes.length !== range.length) throw new Error('Incomplete boundary range');
        for (const row of range.rows) {
          const offset = row.byte_offset - range.offset;
          const remaining = 16_000_000 - decodedBytes;
          if (remaining <= 0) throw new Error('Boundary batch exceeds decoded limit');
          const decoded = gunzipSync(bytes.subarray(offset, offset + row.byte_length), { maxOutputLength: remaining });
          decodedBytes += decoded.length;
          const feature = JSON.parse(decoded.toString('utf8')) as Feature<Polygon | MultiPolygon>;
          if (feature.type !== 'Feature' || String(feature.properties?.id) !== row.id) throw new Error('Mismatched boundary record');
          features.set(row.id, feature);
        }
      }
    } catch (error) { failed = true; throw error; }
  }));
  const failure = results.find(result => result.status === 'rejected');
  if (failure?.status === 'rejected') throw failure.reason;
  return rows.map(row => features.get(row.id)!);
}

export async function wardBoundaryBatch(db: D1Database, bucket: R2Bucket, ids: string[]): Promise<FeatureCollection | null> {
  const { results } = await db.prepare("SELECT * FROM map_geometries WHERE level='ward' AND id IN (SELECT value FROM json_each(?)) ORDER BY id")
    .bind(JSON.stringify(ids)).all<GeometryRow>();
  if (results.length !== ids.length) return null;
  return { type: 'FeatureCollection', features: await readBoundaryBatch(bucket, results) };
}
