import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize } from '../src/lib/data/normalize.ts';
import { ELECTIONS, sourceFor } from '../src/lib/data/catalogue.ts';
import { milestones, milestoneChanges } from '../src/lib/updates/milestones.ts';
import { feedOptions, pageFeedOptions, feedUrl } from '../src/lib/updates/feed.ts';
import { coalitionHref, milestoneTitle, sastDay, sastTime } from '../src/lib/updates/presentation.ts';
import { simulationEvents } from '../src/lib/updates/simulation.ts';

const source = sourceFor(ELECTIONS.find(e => e.year === 2026)!, '9909');
function document() {
  const parties = [
    { ID: 1, Name: 'Party A', CandidateName: 'Example A', WardVotes: 60, PRVotes: 40, TotalValidVotes: 100, WardSeatsWon: 0, PRSeatsWon: 0, TotalSeatsWon: 0 },
    { ID: 2, Name: 'Party B', CandidateName: 'Example B', WardVotes: 40, PRVotes: 60, TotalValidVotes: 100, WardSeatsWon: 0, PRSeatsWon: 0, TotalSeatsWon: 0 },
  ];
  return { ElectoralEventID: 1887, ProvinceID: 9, MunicipalityID: 9909, Municipality: 'WC022 - Example municipality',
    ReportDate: '2026-11-06T09:00:00Z', VDExpected: 2, VDsComplete: 1, SeatsExpected: 4, SeatsComplete: 0,
    WardExpected: 2, WardsComplete: 0, PartyBallotResults: structuredClone(parties),
    WardResults: [{ WardID: 10202001, ReportDate: '2026-11-06T09:00:00Z',
      VDExpected: 0, VDsComplete: 0, PartyBallotResults: parties, VotingDistrictResults: [] }] };
}
const extract = (doc: ReturnType<typeof document>) => milestones([...normalize(doc, source)]);

test('vote leaders and partial counts produce no milestone', () => {
  assert.deepEqual(extract(document()), {});
});
test('ward wins require one explicit seat, irrespective of progress placeholders', () => {
  const doc = document();
  doc.WardResults[0]!.PartyBallotResults[0]!.WardSeatsWon = 1;
  const found = extract(doc);
  assert.equal(found['ward:10202001']!.winner!.id, '1');
  assert.equal(found['ward:10202001']!.marginVotes, 20);
  assert.equal(milestoneTitle(found['ward:10202001']!), 'Party A wins Ward 1');
  doc.WardResults[0]!.PartyBallotResults[1]!.WardSeatsWon = 1;
  assert.deepEqual(extract(doc), {});
  doc.WardResults[0]!.PartyBallotResults[0]!.WardSeatsWon = 0;
  assert.deepEqual(extract(doc), {}, 'contradictory ward votes and awarded seat are withheld');
});
test('independent ward winners use the candidate identity', () => {
  const doc = document();
  const party = doc.WardResults[0]!.PartyBallotResults[0]!;
  party.ID = 0; party.WardSeatsWon = 1;
  assert.equal(milestoneTitle(extract(doc)['ward:10202001']!), 'Example A wins Ward 1');
});
test('completion requires a positive integer denominator and exact full reporting', () => {
  const doc = document();
  doc.VDsComplete = 2;
  assert.equal(extract(doc)['count:9909']!.districts, 2);
  for (const [expected, complete] of [[0, 0], [2, 3], [1.5, 1.5], [-1, 0]]) {
    doc.VDExpected = expected!; doc.VDsComplete = complete!;
    assert.deepEqual(extract(doc), {});
  }
});
test('only full reconciled seat allocations create council outcomes, combining simultaneous completion', () => {
  const doc = document();
  doc.VDsComplete = 2;
  doc.PartyBallotResults[0]!.WardSeatsWon = 1;
  doc.PartyBallotResults[1]!.WardSeatsWon = 1;
  for (const p of doc.PartyBallotResults) { p.PRSeatsWon = 1; p.TotalSeatsWon = 2; }
  doc.WardsComplete = 2; doc.SeatsComplete = 4;
  let found = extract(doc);
  assert.equal(found['council:9909']!.winner, undefined);
  assert.equal(found['council:9909']!.majority, 3);
  assert.equal(milestoneChanges({}, found).length, 1);
  assert.equal(milestoneChanges({}, found)[0]!.after!.kind, 'council_decided');
  doc.PartyBallotResults[0]!.PRSeatsWon = 2; doc.PartyBallotResults[0]!.TotalSeatsWon = 3;
  doc.PartyBallotResults[1]!.PRSeatsWon = 0; doc.PartyBallotResults[1]!.TotalSeatsWon = 1;
  found = extract(doc);
  assert.equal(found['council:9909']!.winner!.id, '1');
  doc.PartyBallotResults[0]!.TotalSeatsWon = 4;
  assert.equal(extract(doc)['council:9909'], undefined);
  doc.SeatsComplete = 3;
  assert.equal(extract(doc)['council:9909'], undefined);
});
test('clock changes, party labels and routine vote totals are quiet, reversals are not', () => {
  const doc = document();
  doc.WardResults[0]!.PartyBallotResults[0]!.WardSeatsWon = 1;
  const before = extract(doc);
  doc.ReportDate = '2026-11-06T10:00:00Z';
  doc.WardResults[0]!.PartyBallotResults[0]!.WardVotes = 80;
  doc.WardResults[0]!.PartyBallotResults[0]!.Name = 'Full party name';
  assert.equal(milestoneChanges(before, extract(doc)).length, 0);
  doc.WardResults[0]!.PartyBallotResults[0]!.WardSeatsWon = 0;
  assert.equal(milestoneChanges(before, extract(doc))[0]!.after, null);
});
test('filter validation, cursor links and SAST day boundaries', () => {
  const options = feedOptions(new URLSearchParams('q=Ward+1&province=9&type=wins&before=12'));
  assert.equal(options.before, 12);
  assert.equal(feedUrl(options), '/updates?type=wins&province=9&q=Ward+1&before=12');
  for (const query of ['type=anything', 'province=10', 'before=-1', 'before=2.3', 'limit=51', 'after=1&before=2', 'event=1&before=2', 'before=9007199254740992']) {
    assert.throws(() => feedOptions(new URLSearchParams(query)));
  }
  assert.equal(sastDay('2026-11-05T23:30:00Z'), '6 November 2026');
  assert.equal(sastTime('2026-11-05T23:30:00Z'), '01:30');
});

test('Updates opens with council outcomes while explicit filters, saved announcements and API defaults survive', () => {
  assert.equal(pageFeedOptions(new URLSearchParams()).type, 'councils');
  assert.equal(pageFeedOptions(new URLSearchParams('province=9&q=Knysna')).type, 'councils');
  assert.equal(feedOptions(new URLSearchParams()).type, 'all', 'public API default is unchanged');
  assert.equal(pageFeedOptions(new URLSearchParams('event=2')).type, 'all', 'saved ward announcements stay reachable');
  for (const type of ['councils', 'all', 'wins', 'complete', 'corrections'] as const) {
    const options = pageFeedOptions(new URLSearchParams(`type=${type}&province=9&q=Knysna&before=12`));
    const link = feedUrl(options);
    assert.deepEqual(pageFeedOptions(new URL(link, 'https://counted.co.za').searchParams), options);
    const apiLink = feedUrl({ ...options, before: null, after: 12, limit: 1 }, '/api/v1/updates');
    assert.equal(feedOptions(new URL(apiLink, 'https://counted.co.za').searchParams).type, type, 'polling keeps the selected type');
  }
  assert.equal(feedUrl({ type: 'councils' }), '/updates');
  assert.equal(feedUrl({ type: 'all' }), '/updates?type=all');
});

test('current no-majority outcomes lead to the council builder, including corrected allocations', () => {
  const events = simulationEvents();
  for (const event of [events[3]!, events[7]!]) {
    const update = { ...event, municipality_id: '9928', municipality_name: 'WC048 - Knysna' };
    assert.equal(coalitionHref(update), '/2026/places/knysna/coalition');
    assert.equal(coalitionHref({ ...update, municipality_id: 'unmapped' }), '/majority-builder?q=Knysna');
    assert.equal(coalitionHref({ ...update, superseded_by: 20 }), null);
    assert.equal(coalitionHref({ ...update, action: 'withdrawn', after: null }), null);
  }
  for (const event of [events[0]!, events[1]!, events[4]!]) assert.equal(coalitionHref(event), null);
});
