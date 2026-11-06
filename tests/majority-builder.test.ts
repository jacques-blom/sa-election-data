import test from 'node:test';
import assert from 'node:assert/strict';
import { councilOutcome, majorityHeadline } from '../src/lib/seats/majority.ts';
import { builderCouncils, matchesBuilderCouncil } from '../src/lib/seats/directory.ts';
import type { AvailableSeats } from '../src/lib/seats/allocation.ts';

function seats(counts: number[], status: 'reported' | 'estimated' = 'reported'): AvailableSeats {
  const total = counts.reduce((n, count) => n + count, 0);
  return { status, total, majority: Math.floor(total / 2) + 1, reportedWardSeats: 0, expectedWardSeats: 0,
    parties: counts.map((count, i) => ({ count, party_id: String(i + 1), source_entry_id: String(i + 1),
      party_name: `Party ${i + 1}`, entry_type: 'party_or_candidate', party_name_source: 'result_file',
      candidate_name: null, source_share_percent: null,
      votes: { pr: 0, ward: 0, source_total: 0 }, seats: { ward: 0, pr: count, total: count } })) };
}

test('municipality headlines explain the majority or the largest party’s shortfall, including estimate basis', () => {
  assert.deepEqual(majorityHeadline(seats([6, 4])), {
    title: 'Party 1 has an outright majority', detail: 'Party 1 has 6 seats. 6 seats needed in a 10-seat council.',
  });
  assert.deepEqual(majorityHeadline(seats([5, 4, 1])), {
    title: 'Hung council', detail: 'Party 1 is 1 seat short. 6 seats needed in a 10-seat council.',
  });
  assert.match(majorityHeadline(seats([5, 4, 1], 'estimated')).title, /on current estimates$/);
  assert.match(majorityHeadline(seats([5, 4, 1], 'estimated')).detail, /short on current estimates/);
  assert.match(majorityHeadline(seats([6, 4], 'estimated')).detail, /6 estimated seats/);
  assert.match(majorityHeadline(seats([6, 4], 'estimated'), true).title, /on historical estimates$/);
});

test('ties, independent groupings and missing seats do not produce a false party lead', () => {
  assert.equal(majorityHeadline(seats([5, 5])).detail, '6 seats needed in a 10-seat council.');
  const independent = seats([7, 3]);
  independent.parties[0]!.party_id = '0';
  assert.equal(majorityHeadline(independent).title, 'Hung council');
  const unavailable = { status: 'unavailable' as const, reason: 'No votes have been published yet.' };
  assert.equal(majorityHeadline(unavailable).title, 'Council seats pending');
  assert.equal(majorityHeadline(unavailable, true).title, 'Council seats unavailable');
  assert.equal(majorityHeadline(unavailable).detail, unavailable.reason);
});

test('public council states require reported seats and a strict seat majority', () => {
  assert.equal(councilOutcome(seats([5, 5])).state, 'hung', 'exactly half is not a majority');
  assert.equal(councilOutcome(seats([5, 4])).state, 'majority', 'five of nine is a majority');
  assert.equal(councilOutcome(seats([6, 4])).label, 'Party 1 outright majority');
  for (const counts of [[6, 4], [5, 5], [4, 3, 3]]) {
    const estimated = councilOutcome(seats(counts, 'estimated'));
    assert.equal(estimated.state, 'estimated');
    assert.match(estimated.label, /pending.*estimate/);
    assert.doesNotMatch(estimated.title, /Hung council/);
  }
  const independents = seats([6, 4]);
  independents.parties[0]!.party_id = '0';
  assert.equal(councilOutcome(independents).state, 'hung', 'independents grouped together are not a party');
  const unavailable = { status: 'unavailable' as const, reason: 'Incomplete allocation' };
  assert.equal(councilOutcome(unavailable).state, 'pending');
  assert.equal(councilOutcome(unavailable, true).label, 'Seats unavailable');
});

test('every current metro and local council is searchable even with no available result', () => {
  const councils = builderCouncils();
  assert.equal(councils.length, 213);
  assert.equal(new Set(councils.map(c => c.id)).size, councils.length);
  assert.equal(councils.filter(c => c.metro).length, 8);
  assert(councils.every(c => c.status === 'pending' && c.majority === null && c.href.endsWith('/coalition')));
  for (const [query, slug] of [['CPT', 'cape-town'], ['Jozi', 'johannesburg'], ['WC048', 'knysna'], ['9006', 'cape-town']]) {
    assert(councils.filter(c => matchesBuilderCouncil(c, query!)).some(c => c.slug === slug), query);
  }
  assert.equal(councils.filter(c => matchesBuilderCouncil(c, 'Knysna western', '9', 'pending')).length, 1);
  assert.equal(councils.filter(c => matchesBuilderCouncil(c, 'Knysna', '3')).length, 0);
  assert.equal(councils.filter(c => matchesBuilderCouncil(c, 'not a real council')).length, 0);
});

test('allocation filters distinguish reported seats from estimates and missing allocations', () => {
  const councils = builderCouncils([
    { id: '9006', status: 'reported', total: 230, majority: 116, winner: { id: '1', name: 'Party A', count: 120 }, parties: [{id:'1',name:'Party A',count:120},{id:'2',name:'Party B',count:110}] },
    { id: '3003', status: 'estimated', total: 270, majority: 136, winner: null, parties: [{id:'1',name:'Party A',count:135},{id:'2',name:'Party B',count:135}] },
  ], new Set(builderCouncils().map(c => c.id)));
  assert.equal(councils.filter(c => matchesBuilderCouncil(c, '', '', 'reported')).length, 1);
  const pending = councils.filter(c => matchesBuilderCouncil(c, '', '', 'pending'));
  assert.equal(pending.length, 212);
  assert.equal(pending.find(c => c.slug === 'johannesburg')?.majority, 136);
  assert.equal(pending.find(c => c.slug === 'knysna')?.majority, null);
  assert.equal(councils.find(c => c.slug === 'cape-town')?.winner, 'Party A');
});

test('allocation filters allow unknown councils to load before deciding whether to hide them', () => {
  const council = builderCouncils().find(c => c.slug === 'knysna')!;
  assert(matchesBuilderCouncil(council, 'Knysna', '9', 'reported'));
  assert(!matchesBuilderCouncil({ ...council, loaded: true }, 'Knysna', '9', 'reported'));
  assert(matchesBuilderCouncil({ ...council, loaded: true, status: 'reported' }, 'Knysna', '9', 'reported'));
});
