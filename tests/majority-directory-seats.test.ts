import test from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { builderCouncils, builderSeatIds, getBuilderSeatSummaries } from '../src/lib/seats/directory.ts';
import type { AreaRecord } from '../src/lib/data/normalize.ts';

function payload(reported = false): AreaRecord['payload'] {
  return { party_list_scope: 'all_rows_in_source', ballot_scope: 'source_combined',
    parties: [60, 40].map((votes, i) => ({ source_entry_id: String(i + 1), party_id: String(i + 1),
      party_name: `Party ${i + 1}`, entry_type: 'party_or_candidate', party_name_source: 'result_file',
      candidate_name: null, source_share_percent: null, votes: { pr: votes, ward: votes, source_total: votes * 2 },
      seats: reported ? { ward: 1, pr: i ? 0 : 2, total: i ? 1 : 3 } : { ward: 0, pr: 0, total: 0 } })),
    progress: { municipalities: null, voting_districts: null,
      seats: { expected: 4, completed: reported ? 4 : 0 }, wards: { expected: 2, completed: reported ? 2 : 0 } },
    reported_totals: { valid_ballot_papers: 200, registered_voters: null, ballot_papers_cast: null, spoilt_ballot_papers: null } };
}

test('unread summaries remain distinct from genuinely unavailable seats', () => {
  const unknown = builderCouncils([{ id: '3003', status: 'pending' }]).find(c => c.id === '3003')!;
  assert.equal(unknown.loaded, false);
  const pending = builderCouncils([{ id: '3003', status: 'pending' }], new Set(['3003'])).find(c => c.id === '3003')!;
  assert.equal(pending.loaded, true);
  assert.equal(pending.majority, null);
});

test('viewport queries are limited to eight known councils', () => {
  assert.deepEqual(builderSeatIds('9006,3003,9006'), ['3003', '9006']);
  for (const query of [null, '', '999999', '3003 OR 1=1', builderCouncils().slice(0, 9).map(c => c.id).join(',')]) {
    assert.throws(() => builderSeatIds(query));
  }
});

test('viewport summaries hydrate council-only packs and keep storage errors separate from unavailable allocations', async () => {
  const packed = gzipSync(JSON.stringify({ level: 'municipality', id: '3003', name: 'Johannesburg', reportedAt: '2026-11-06', payload: payload() }));
  const rows = [
    { level: 'municipality', area_id: '3003', source_id: 'joburg', bundle_key: 'joburg.pack', payload: null },
    { level: 'municipality', area_id: '9006', source_id: 'cape-town', bundle_key: null, payload: JSON.stringify(payload(true)) },
    { level: 'municipality', area_id: '9928', source_id: 'knysna', bundle_key: 'missing.pack', payload: null },
  ];
  const bundles = [
    { source_id: 'joburg', object_key: 'joburg.pack', index_json: JSON.stringify({ 'municipality:3003': { offset: 0, length: packed.length } }) },
    { source_id: 'knysna', object_key: 'missing.pack', index_json: JSON.stringify({ 'municipality:9928': { offset: 0, length: 10 } }) },
  ];
  const db = { prepare(sql: string) { return { bind(...values: unknown[]) { return { async all() {
    return { results: sql.includes('SELECT * FROM result_bundles') ? bundles.filter(b => values.includes(b.source_id)) : structuredClone(rows) };
  } }; } }; } } as unknown as D1Database;
  const reads: string[] = [];
  const bucket = { async get(key: string, options: { range: { offset: number; length: number } }) {
    reads.push(key);
    if (key !== 'joburg.pack') return null;
    assert.deepEqual(options.range, { offset: 0, length: packed.length });
    return { async arrayBuffer() { return Uint8Array.from(packed).buffer; } };
  } } as unknown as R2Bucket;
  const result = await getBuilderSeatSummaries(db, ['3003', '9006', '9928', '1117'], bucket);
  assert.deepEqual(result.councils, [
    { id: '1117', status: 'pending', total: null, majority: null },
    { id: '3003', status: 'estimated', total: 4, majority: 3 },
    { id: '9006', status: 'reported', total: 4, majority: 3 },
  ]);
  assert.deepEqual(result.failed, ['9928']);
  assert.deepEqual(reads.sort(), ['joburg.pack', 'missing.pack']);
});
