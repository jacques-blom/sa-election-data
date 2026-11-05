import { gzipSync, gunzipSync } from 'node:zlib';
import type { AreaRecord } from '../../src/lib/data/normalize.ts';
import type { PackIndex } from '../../src/lib/data/packed-results.ts';
import { recordHash, sha256, SOURCE_LIMIT } from './helpers.ts';

export const MAX_PACK_BYTES = 8 * 1024 * 1024;
export const MAX_INDEX_BYTES = 512 * 1024;
export type DirectoryRecord = Omit<AreaRecord, 'payload' | 'reportedAt'>;

/** One normalization pass; retain serialized strings, not a second object graph. */
export function prepareRecords(records: Iterable<AreaRecord>) {
  const prepared: { key: string; json: string; directory: DirectoryRecord }[] = [];
  const hashes = new Map<string, string>();
  let bytes = 0;
  for (const record of records) {
    const key = `${record.level}:${record.id}`;
    if (hashes.has(key)) throw new Error(`Duplicate area in source: ${key}`);
    hashes.set(key, recordHash(record));
    const json = JSON.stringify(record);
    bytes += Buffer.byteLength(json);
    if (bytes > 40 * 1024 * 1024 || Buffer.byteLength(json) > 2_000_000) throw new Error('Normalized source exceeds packing limits');
    const { payload: _payload, reportedAt: _reportedAt, ...directory } = record;
    prepared.push({ key, json, directory });
  }
  if (!prepared.length) throw new Error('Source contains no area results');
  // Place municipality + wards together so UI pages need one small range read.
  prepared.sort((a, b) => Number(a.directory.level === 'voting-district') - Number(b.directory.level === 'voting-district')
    || a.key.localeCompare(b.key));
  return { records: prepared, hash: sha256(JSON.stringify([...hashes].sort(([a], [b]) => a.localeCompare(b)))), count: prepared.length };
}

export function packRecords(raw: Buffer, prepared: ReturnType<typeof prepareRecords>) {
  const index: PackIndex = {};
  const chunks = [raw];
  let offset = raw.length;
  for (const record of prepared.records) {
    const bytes = gzipSync(record.json, { level: 1 });
    index[record.key] = { offset, length: bytes.length };
    chunks.push(bytes);
    offset += bytes.length;
    if (offset > MAX_PACK_BYTES) throw new Error('Result pack exceeds storage budget');
  }
  const indexJson = JSON.stringify(index);
  if (Buffer.byteLength(indexJson) > MAX_INDEX_BYTES) throw new Error('Result pack index exceeds limit');
  return { body: Buffer.concat(chunks), indexJson, rawLength: raw.length };
}

export async function archivedRaw(bucket: R2Bucket, key: string, rawLength?: number | null) {
  const object = await bucket.get(key, key.endsWith('.pack') ? { range: { offset: 0, length: rawLength! } } : undefined);
  if (!object) throw new Error('Validated source archive is missing');
  return gunzipSync(await object.arrayBuffer(), { maxOutputLength: SOURCE_LIMIT }).toString('utf8');
}
