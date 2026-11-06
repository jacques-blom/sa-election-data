import test from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { parseBoundaryIds, readBoundaryBatch, wardBoundaryBatch } from '../src/lib/maps/boundary-batch.ts';
import type { GeometryRow } from '../src/lib/maps/geometry.ts';

function fixture() {
  const features = ['19100001', '19100002', '19100003'].map(id => ({ type: 'Feature', properties: { id },
    geometry: { type: 'Polygon', coordinates: [[[18, -34], [19, -34], [19, -33], [18, -34]]] } }));
  const parts = features.map(feature => gzipSync(JSON.stringify(feature)));
  let offset = 0;
  const rows: GeometryRow[] = parts.map((part, i) => {
    const row = { level: 'ward', id: features[i]!.properties.id, minx: 18, miny: -34, maxx: 19, maxy: -33,
      object_key: 'geometry.pack', byte_offset: offset, byte_length: part.length };
    offset += part.length;
    return row;
  });
  const bytes = Buffer.concat(parts);
  const reads: { key: string; offset: number; length: number }[] = [];
  const bucket = { async get(key: string, options: { range: { offset: number; length: number } }) {
    reads.push({ key, ...options.range });
    const { offset, length } = options.range;
    return { arrayBuffer: async () => bytes.subarray(offset, offset + length) };
  } } as unknown as R2Bucket;
  return { features, parts, bytes, rows, reads, bucket };
}

test('boundary batches reject malformed and oversized requests and canonicalize duplicate IDs', () => {
  assert.deepEqual(parseBoundaryIds(new URLSearchParams('ids=19100002,19100001,19100002')), ['19100001', '19100002']);
  for (const query of ['', 'ids=', 'ids=9', 'ids=__proto__', 'ids=19100001,', `ids=${Array(41).fill('19100001').join(',')}`]) {
    assert.equal(parseBoundaryIds(new URLSearchParams(query)), null, query);
  }
});

test('adjacent and nearby ward records share one R2 read, preserving complete polygon geometry and order', async () => {
  const { features, rows, reads, bucket, bytes } = fixture();
  assert.deepEqual(await readBoundaryBatch(bucket, [rows[2]!, rows[0]!]), [features[2], features[0]]);
  assert.deepEqual(reads, [{ key: 'geometry.pack', offset: 0, length: bytes.length }]);
});

test('a ward batch makes one directory query and does not silently omit unknown boundaries', async () => {
  const { features, rows, bucket, reads } = fixture();
  const queries: string[] = [];
  const db = { prepare(query: string) {
    assert.match(query, /level='ward'/);
    return { bind(ids: string) { queries.push(ids); return { all: async () => ({ results: rows }) }; } };
  } } as unknown as D1Database;
  const ids = rows.map(row => row.id);
  assert.deepEqual(await wardBoundaryBatch(db, bucket, ids), { type: 'FeatureCollection', features });
  assert.deepEqual(queries, [JSON.stringify(ids)]);
  assert.equal(reads.length, 1);
  assert.equal(await wardBoundaryBatch(db, bucket, [...ids, '19100004']), null);
  assert.equal(reads.length, 1, 'incomplete directory matches must not read or cache a partial batch');
});

test('range and decompression failures reject the whole batch, with explicit size limits', async () => {
  const { rows, bucket, reads } = fixture();
  await assert.rejects(readBoundaryBatch(bucket, [{ ...rows[0]!, byte_length: 3_000_001 }]), /read limit/);
  await assert.rejects(readBoundaryBatch(bucket, Array(41).fill(rows[0])), /read limit/);
  await assert.rejects(readBoundaryBatch(bucket, rows.map(row => ({ ...row, byte_length: 2_000_000 }))), /read limit/);
  assert.equal(reads.length, 0);
  await assert.rejects(readBoundaryBatch(bucket, [{ ...rows[0]!, byte_length: 2000 }]), /Incomplete/);
  await assert.rejects(readBoundaryBatch(bucket, [{ ...rows[0]!, id: '19100099' }]), /Mismatched/);
  const large = gzipSync(Buffer.alloc(16_000_001, 65));
  const oversized = { get: async () => ({ arrayBuffer: async () => large }) } as unknown as R2Bucket;
  await assert.rejects(readBoundaryBatch(oversized, [{ ...rows[0]!, byte_length: large.length }]));
});
