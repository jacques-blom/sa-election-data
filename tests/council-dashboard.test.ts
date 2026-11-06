import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize } from '../src/lib/data/normalize.ts';
import { ELECTIONS, sourceFor } from '../src/lib/data/catalogue.ts';
import { closeRace, closeCouncilRace, comparisonShares, councilSnapshot } from '../src/lib/overview/snapshot.ts';
import { dashboardCouncils, dashboardHighlights } from '../src/lib/overview/dashboard.ts';
import { councilFilters, councilFilterUrl, matchesCouncil, partyMajorityChanges } from '../src/lib/overview/dashboard-filter.ts';
import { nationalUrl } from '../src/lib/history/comparison.ts';

const source = sourceFor(ELECTIONS.find(e => e.year === 2026)!, '9909');
function records() {
  const party = (id: number, votes: number, wardSeats: number, prSeats: number) => ({ ID: id, Name: `Party ${id}`,
    WardVotes: votes, PRVotes: votes, TotalValidVotes: votes * 2, WardSeatsWon: wardSeats, PRSeatsWon: prSeats, TotalSeatsWon: wardSeats + prSeats });
  return [...normalize({ ElectoralEventID: 1887, ProvinceID: 9, MunicipalityID: 9909, Municipality: 'WC022 - Witzenberg', ReportDate: '2026-11-06T09:00:00Z',
    VDExpected: 4, VDsComplete: 4, SeatsExpected: 4, SeatsComplete: 4, WardExpected: 2, WardsComplete: 2,
    PartyBallotResults: [party(1, 600, 1, 2), party(2, 400, 1, 0)], WardResults: [] }, source)];
}

test('council outcomes use seats; metros precede locals even without results', () => {
  const current = councilSnapshot(records())!;
  const previous = structuredClone(current);
  previous.seats!.parties[0]!.count = 1; previous.seats!.parties[1]!.count = 3;
  const all = dashboardCouncils(new Map([['9909',current]]), new Map([['9909',previous]]));
  assert.equal(all.length, 257);
  assert.equal(all[8]!.id, '9909');
  assert(all.slice(0,8).every(c=>c.metro)); assert(all.slice(8).every(c=>!c.metro));
  let c = all.find(c=>c.id==='9909')!;
  assert.equal(c.status, 'majority'); assert.equal(c.winnerId, '1'); assert(c.changed);
  current.seats!.status='estimated';
  c=dashboardCouncils(new Map([['9909',current]]),new Map([['9909',previous]])).find(c=>c.id==='9909')!;
  assert.equal(c.status,'pending'); assert.equal(c.winnerId,''); assert.equal(c.changed,false);
  current.seats!.status='reported';current.seats!.parties.forEach(p=>p.count=2);
  c=dashboardCouncils(new Map([['9909',current]]),new Map([['9909',previous]])).find(c=>c.id==='9909')!;
  assert.equal(c.status,'no-majority'); assert.equal(c.largest,null); assert(c.changed);
  assert.equal(dashboardCouncils(new Map(),new Map(),[],new Set(['9909'])).find(c=>c.id==='9909')!.status,'unavailable');
});

test('all metros lead; available results come first within metros and local councils', () => {
  const catalogue = dashboardCouncils();
  const [metroA, metroB, metroC] = catalogue.filter(c=>c.metro);
  const [localA, localB, localC] = catalogue.filter(c=>!c.metro);
  const reported=councilSnapshot(records())!, estimated=structuredClone(reported);
  estimated.seats!.status='estimated';
  const counting=structuredClone(estimated); counting.seats=null; counting.progress!.completed=2;
  const ordered=dashboardCouncils(new Map([
    [metroA!.id,reported],[localA!.id,reported],
    [metroB!.id,estimated],[localB!.id,estimated],[localC!.id,counting],
  ]),new Map(),[],new Set(['9909',metroC!.id]));
  assert(ordered.slice(0,8).every(c=>c.metro));assert(ordered.slice(8).every(c=>!c.metro));
  assert.deepEqual(ordered.slice(0,2).map(c=>c.id),[metroA!.id,metroB!.id]);
  assert.equal(ordered[7]!.id,metroC!.id);
  assert.deepEqual(ordered.slice(8,11).map(c=>c.id),[localA!.id,localB!.id,localC!.id]);
  assert.equal(ordered.filter(c=>c.kind==='local').at(-1)!.id,'9909');
  assert(catalogue.slice(0,8).every(c=>c.metro));
});

test('party majority changes include losses to hung councils and other parties, excluding pending and missing history', () => {
  const comparison = (winnerId: string, previousWinnerId: string, provinceId = '9', comparable = true) =>
    ({ winnerId, previousWinnerId, provinceId, comparable, kind: 'local' as const });
  const councils = [comparison('1',''), comparison('','1'), comparison('2','1'), comparison('1','2'),
    comparison('1','1'), comparison('1','','1'), comparison('','1','9',false), comparison('1','','9',false), comparison('','')];
  assert.deepEqual(partyMajorityChanges(councils,'1'), { gained:3, lost:2, comparable:7 });
  assert.deepEqual(partyMajorityChanges(councils,'1','9'), { gained:2, lost:2, comparable:6 });
  assert.deepEqual(partyMajorityChanges(councils,'2','9'), { gained:1, lost:1, comparable:6 });
  assert.deepEqual(partyMajorityChanges(councils,'1','2'), { gained:0, lost:0, comparable:0 });
  assert.deepEqual(partyMajorityChanges(councils,''), { gained:0, lost:0, comparable:0 });
  assert.deepEqual(partyMajorityChanges(councils,'1','9','district'), { gained:0, lost:0, comparable:0 });
});

test('district councils are discoverable without inventing results from their local councils', () => {
  const all=dashboardCouncils(new Map([['9909',councilSnapshot(records())!]]));
  assert.equal(all.filter(c=>c.kind==='metro').length,8);
  assert.equal(all.filter(c=>c.kind==='local').length,205);
  assert.equal(new Set(all.map(c=>c.id)).size,257);
  const districts=all.filter(c=>c.kind==='district');
  assert.equal(districts.length,44);
  for(const c of districts) {
    assert.equal(c.status,'unavailable');assert.equal(c.seats,null);assert.equal(c.snapshot,null);
    assert.equal(c.winnerId,'');assert.equal(c.comparable,false);assert.equal(c.changed,false);
    assert.equal(c.builderHref,undefined);assert.match(c.href,/^\/2026\/districts\//);assert.match(c.name,/ District$/);
  }
  const filter=(q:string)=>all.filter(c=>matchesCouncil(c,councilFilters(new URLSearchParams(q))));
  assert.equal(filter('type=district').length,44);
  assert.equal(filter('type=district&province=9').length,5);
  assert.equal(filter('q=Garden+Route').length,1);
  assert.equal(filter('q=DC4')[0]?.name,'Garden Route District');
  assert.equal(filter('q=DC4').length,1);assert.equal(filter('q=DC+04')[0]?.name,'Garden Route District');
  assert.equal(filter('type=district&status=pending').length,0);
  assert.equal(filter('type=district&party=1&status=majority').length,0);
  assert.equal(councilFilters(new URLSearchParams('type=unknown')).type,'');
  assert.equal(councilFilterUrl({province:'9',type:'district'}),'/councils?province=9&type=district#councils');
});

test('gains and losses compare complete combined shares, including parties absent from a complete current list', () => {
  const now=councilSnapshot(records())!, before=structuredClone(now);
  before.votes=[{id:'1',name:'Party 1',share:10},{id:'2',name:'Party 2',share:40},{id:'3',name:'Party 3',share:50}];
  const highlights=()=>dashboardHighlights(dashboardCouncils(new Map([['9909',now]]),new Map([['9909',before]])));
  assert.equal(highlights().gains[0]!.delta,50); assert.equal(highlights().losses[0]!.party.id,'3'); assert.equal(highlights().losses[0]!.delta,-50);
  now.progress!.completed=3;
  assert.equal(highlights().movementCoverage,0);assert.equal(highlights().gains.length,0);
  now.progress!.completed=4;before.votes=null;
  assert.equal(highlights().losses.length,0);
  const p=records()[0]!.payload;
  p.party_list_scope='leading_parties_only'; assert.equal(comparisonShares(p),null);
  p.party_list_scope='all_rows_in_source';p.parties[1]!.votes.source_total=null;assert.equal(comparisonShares(p),null);
});

test('close races require ward ballots, meaningful incomplete progress, and no explicit seat award', () => {
  const ward=records()[0]!;ward.level='ward';ward.id='10202001';
  ward.payload.progress.voting_districts={expected:4,completed:3};
  ward.payload.parties.forEach((p,i)=>{p.votes.ward=i?498:502;p.votes.pr=i?9000:1;p.seats.ward=0;});
  assert.equal(closeRace(ward)!.margin,4);assert.equal(closeRace(ward)!.marginPoints,0.4);
  ward.payload.parties[1]!.votes.ward=502;assert.equal(closeRace(ward)!.tied,true);
  ward.payload.parties[0]!.seats.ward=1;assert.equal(closeRace(ward),null);
  ward.payload.parties[0]!.seats.ward=0;
  for(const completed of [0,1,4]) {ward.payload.progress.voting_districts.completed=completed;assert.equal(closeRace(ward),null);}
  ward.payload.progress.voting_districts.completed=3;ward.payload.parties[0]!.votes.ward=null;assert.equal(closeRace(ward),null);
});

test('pending council races use PR votes and municipality progress without inventing ward progress', () => {
  const council=records()[0]!;
  council.payload.progress.voting_districts={expected:4,completed:3};
  assert.equal(closeCouncilRace(council),null,'a reported council allocation is excluded even if counting progress lags');
  council.payload.progress.seats!.completed=0;council.payload.progress.wards!.completed=0;
  council.payload.parties.forEach((p,i)=>{p.seats={ward:0,pr:0,total:0};p.votes.pr=i?498:502;p.votes.ward=i?9000:1;});
  assert.equal(closeCouncilRace(council)!.margin,4);assert.equal(closeCouncilRace(council)!.marginPoints,0.4);
  const snapshot=councilSnapshot([council])!;
  const highlights=dashboardHighlights(dashboardCouncils(new Map([[council.id,snapshot]])));
  assert.equal(highlights.races.length,0);assert.equal(highlights.councilRaces[0]!.margin,4);
  assert.equal(highlights.watch!.id,council.id);
  council.payload.parties[1]!.votes.pr=502;assert.equal(closeCouncilRace(council)!.tied,true);
  for(const completed of [0,1,4]) {council.payload.progress.voting_districts.completed=completed;assert.equal(closeCouncilRace(council),null);}
  council.payload.progress.voting_districts.completed=3;
  council.payload.parties[0]!.party_id='0';assert.equal(closeCouncilRace(council),null);
  council.payload.parties[0]!.party_id='1';council.payload.parties[0]!.votes.pr=null;assert.equal(closeCouncilRace(council),null);
});

test('a count to watch stays useful when no tight race qualifies', () => {
  const snapshot=councilSnapshot(records())!;
  snapshot.seats=null;snapshot.progress!.completed=3;snapshot.progress!.percent=75;
  const highlights=dashboardHighlights(dashboardCouncils(new Map([['9909',snapshot]])));
  assert.equal(highlights.councilRaces.length,0);assert.equal(highlights.watch!.id,'9909');
  snapshot.progress!.completed=4;snapshot.progress!.percent=100;
  assert.equal(dashboardHighlights(dashboardCouncils(new Map([['9909',snapshot]]))).watch,null);
});

test('status, party, province and change filters select the same councils; current national results use the homepage', () => {
  const now=councilSnapshot(records())!;
  const all=dashboardCouncils(new Map([['9909',now]]));
  let filters=councilFilters(new URLSearchParams('q=WC022&province=9&status=majority&party=1'));
  assert.deepEqual(all.filter(c=>matchesCouncil(c,filters)).map(c=>c.id),['9909']);
  filters.changed=true;assert.equal(all.filter(c=>matchesCouncil(c,filters)).length,0);
  filters=councilFilters(new URLSearchParams('province=evil&status=estimated&party=hello'));
  assert.equal(filters.province,'');assert.equal(filters.status,'');assert.equal(filters.party,'');
  assert.equal(councilFilterUrl({province:'9', status:'pending'}), '/councils?province=9&status=pending#councils');
  assert.equal(councilFilterUrl({}), '/councils#councils');
  assert.equal(nationalUrl(2026),'/');assert.equal(nationalUrl(2021),'/2021');
});
