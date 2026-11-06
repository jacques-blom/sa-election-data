import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboardCouncils } from '../src/lib/overview/dashboard.ts';
import { councilSeatChanges, electionHighlights } from '../src/lib/overview/highlights.ts';
import { COUNCIL_SNAPSHOT_VERSION, type CouncilSnapshot } from '../src/lib/overview/snapshot.ts';

const ids = dashboardCouncils().slice(0, 7).map(c => c.id);
function snapshot(id: string, counts: number[], status: 'reported' | 'estimated' = 'reported'): CouncilSnapshot {
  const total = counts.reduce((n, count) => n + count, 0);
  return { version: COUNCIL_SNAPSHOT_VERSION, id, reportedAt: '2026-11-06T10:00:00Z',
    progress: { completed: 10, expected: 10, percent: 100 },
    seats: { status, total, majority: Math.floor(total / 2) + 1,
      parties: counts.map((count, i) => ({ id: String(i + 1), name: `Party ${i + 1}`, count })).sort((a, b) => b.count - a.count) },
    votes: null, pendingRace: null, races: [], wardsCovered: 0 };
}

test('majority turnover counts losses to hung councils, gains from hung councils and party switches once each', () => {
  const current = new Map([
    [ids[0]!, snapshot(ids[0]!, [4, 3, 3])], // Party 1 -> hung
    [ids[1]!, snapshot(ids[1]!, [3, 7])], // hung -> Party 2
    [ids[2]!, snapshot(ids[2]!, [3, 7])], // Party 1 -> Party 2
    [ids[3]!, snapshot(ids[3]!, [3, 7], 'estimated')], // never count estimates
    [ids[4]!, snapshot(ids[4]!, [3, 7])], // no historical allocation
  ]);
  const previous = new Map([
    [ids[0]!, snapshot(ids[0]!, [7, 3])],
    [ids[1]!, snapshot(ids[1]!, [4, 3, 3])],
    [ids[2]!, snapshot(ids[2]!, [7, 3])],
    [ids[3]!, snapshot(ids[3]!, [7, 3])],
  ]);
  const h = electionHighlights(dashboardCouncils(current, previous));
  assert.equal(h.changes.length, 3);
  assert.equal(h.changesToHung, 1); assert.equal(h.changesFromHung, 1); assert.equal(h.changesBetweenParties, 1);
  assert.deepEqual(h.balance.map(p => [p.id, p.gained, p.lost, p.net]), [['1', 0, 2, -2], ['2', 2, 0, 2]]);
  assert.equal(h.comparable, 3);
});

test('majority gaps use the strict majority threshold, exclude estimates and ambiguous largest parties', () => {
  const current = new Map([
    [ids[0]!, snapshot(ids[0]!, [5, 3, 2])],
    [ids[1]!, snapshot(ids[1]!, [4, 3, 3])],
    [ids[2]!, snapshot(ids[2]!, [5, 5])], // tied largest
    [ids[3]!, snapshot(ids[3]!, [5, 3, 2], 'estimated')],
    [ids[4]!, snapshot(ids[4]!, [6, 4])],
    [ids[5]!, snapshot(ids[5]!, [7, 3])],
  ]);
  const h = electionHighlights(dashboardCouncils(current));
  assert.deepEqual(h.nearMajorities.map(r => [r.council.id, r.short]), [[ids[0], 1], [ids[1], 2]]);
  assert.equal(h.hung, 3); assert.equal(h.reported, 5);
});

test('most divided councils rank by the largest party share, include ties, and exclude estimates and outright majorities', () => {
  const current = new Map([
    [ids[0]!, snapshot(ids[0]!, [40, 35, 25])], // 11 seats short, but largest party has 40%
    [ids[1]!, snapshot(ids[1]!, [3, 3, 2, 2])], // 3 seats short; tied largest parties have only 30%
    [ids[2]!, snapshot(ids[2]!, [6, 4])],
    [ids[3]!, snapshot(ids[3]!, [2, 2, 2, 2, 2], 'estimated')],
  ]);
  const h = electionHighlights(dashboardCouncils(current));
  assert.deepEqual(h.fragmentedCouncils.map(r => [r.council.id, r.share, r.short]), [[ids[1], 30, 3], [ids[0], 40, 11]]);
  assert.deepEqual(h.fragmentedCouncils[0]!.leaders.map(p => p.id), ['1', '2']);
  assert(!h.nearMajorities.some(r => r.council.id === ids[1]), 'the closest list still excludes ambiguous largest parties');
});

test('independents remain in the seat denominator but are not treated as one party in divided councils', () => {
  const current = snapshot(ids[0]!, [6, 3, 1]);
  current.seats!.parties.find(p => p.id === '1')!.id = '0';
  const allIndependent = snapshot(ids[1]!, [10]); allIndependent.seats!.parties[0]!.id = '0';
  const h = electionHighlights(dashboardCouncils(new Map([[ids[0]!, current], [ids[1]!, allIndependent]])));
  assert.equal(h.fragmentedCouncils.length, 1);
  assert.deepEqual(h.fragmentedCouncils[0]!.leaders.map(p => p.id), ['2']);
  assert.equal(h.fragmentedCouncils[0]!.share, 30);
  assert.equal(h.fragmentedCouncils[0]!.short, 3);
});

test('province totals retain pending and unavailable councils and count-to-watch requires unfinished reporting', () => {
  const counting = snapshot(ids[0]!, [5, 5], 'estimated');
  counting.progress = { completed: 8, expected: 10, percent: 80 };
  const h = electionHighlights(dashboardCouncils(new Map([[ids[0]!, counting]]), new Map(), [], new Set([ids[1]!])));
  assert.equal(h.provinceOutcomes.reduce((n, p) => n + p.total, 0), 213);
  assert(h.provinceOutcomes.every(p => p.majority + p.noMajority + p.pending + p.unavailable === p.total));
  assert.equal(h.provinceOutcomes.reduce((n, p) => n + p.unavailable, 0), 1);
  assert.deepEqual(h.counting.map(c => c.id), [ids[0]]);
  assert.equal(h.changes.length, 0); assert.equal(h.gains.length, 0); assert.equal(h.nearMajorities.length, 0);
});

test('seat gains include hung and unchanged councils, matching party IDs and counting new and departed parties', () => {
  const unchanged = snapshot(ids[0]!, [6, 2, 2]);
  unchanged.seats!.parties.find(p => p.id === '1')!.name = 'Renamed party';
  unchanged.progress = null; // Reported seats remain authoritative even without count progress.
  const current = new Map([
    [ids[0]!, unchanged],
    [ids[1]!, snapshot(ids[1]!, [4, 3, 3])], // hung both times
    [ids[2]!, snapshot(ids[2]!, [7, 3])], // party 3 no longer has a row
  ]);
  const previous = new Map([
    [ids[0]!, snapshot(ids[0]!, [6, 4])],
    [ids[1]!, snapshot(ids[1]!, [4, 4, 2])],
    [ids[2]!, snapshot(ids[2]!, [6, 3, 1])],
  ]);
  const h = electionHighlights(dashboardCouncils(current, previous));
  assert.equal(h.changes.length, 0, 'seat shifts do not require a majority change');
  assert.equal(h.seatChanges.comparable, 3);
  assert.deepEqual(h.seatChanges.parties.map(p => [p.id, p.previous, p.current, p.delta]), [
    ['3', 3, 5, 2], ['1', 16, 17, 1], ['2', 11, 8, -3],
  ]);
  assert.equal(h.seatChanges.currentTotal, 30);
  assert.equal(h.seatChanges.previousTotal, 30);
});

test('seat changes exclude unmatched, missing and estimated allocations on either side', () => {
  const current = new Map([
    [ids[0]!, snapshot(ids[0]!, [6, 4])],
    [ids[1]!, snapshot(ids[1]!, [6, 4], 'estimated')],
    [ids[2]!, snapshot(ids[2]!, [6, 4])],
    [ids[3]!, snapshot(ids[3]!, [6, 4])],
  ]);
  const previous = new Map([
    [ids[0]!, snapshot(ids[0]!, [5, 5])],
    [ids[1]!, snapshot(ids[1]!, [2, 8])],
    [ids[2]!, snapshot(ids[2]!, [2, 8], 'estimated')],
    [ids[4]!, snapshot(ids[4]!, [2, 8])],
  ]);
  const changes = councilSeatChanges(dashboardCouncils(current, previous));
  assert.equal(changes.comparable, 1);
  assert.deepEqual(changes.parties.map(p => [p.id, p.previous, p.current, p.delta]), [['1', 5, 6, 1], ['2', 5, 4, -1]]);
  assert.equal(changes.currentTotal, 10); assert.equal(changes.previousTotal, 10);
  assert.deepEqual(councilSeatChanges(dashboardCouncils()), { comparable: 0, previousTotal: 0, currentTotal: 0, parties: [] });
});

test('seat changes retain unchanged parties and grouped independents, and reconcile council size changes', () => {
  const now = snapshot(ids[0]!, [7, 2, 2]), before = snapshot(ids[0]!, [6, 2, 1]);
  for (const s of [now, before]) {
    const independent = s.seats!.parties.find(p => p.id === '3')!;
    independent.id = '0'; independent.name = 'IND';
  }
  const changes = councilSeatChanges(dashboardCouncils(new Map([[ids[0]!, now]]), new Map([[ids[0]!, before]])));
  assert.equal(changes.previousTotal, 9); assert.equal(changes.currentTotal, 11);
  assert.equal(changes.parties.reduce((n, p) => n + p.delta, 0), 2);
  assert.deepEqual(changes.parties.find(p => p.id === '0'), { id: '0', name: 'Independents (combined)', previous: 1, current: 2, delta: 1 });
  assert.equal(changes.parties.find(p => p.id === '2')!.delta, 0);
});
