import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { Window } from 'happy-dom';
import { resultFromRow, type Result } from '../src/lib/places/results.ts';
import { electionCouncilSeats, electionMajorityBaseline } from '../src/lib/history/seats.ts';
import { electionTrends, trendElection, trendSegments } from '../src/lib/history/trends.ts';
import { readElectionHistory } from '../src/lib/history/data.ts';
import { setupVoteHistory } from '../src/lib/history/trend-client.ts';
import { governmentContext, governmentCaption, governmentHistory } from '../src/lib/governance/index.ts';
import { councilSnapshot, majorityParty } from '../src/lib/overview/snapshot.ts';
import { areaSummary } from '../src/lib/mcp/summaries.ts';
import { resultsApi } from '../src/lib/api/results.ts';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/buffalo-city-2021.json', import.meta.url), 'utf8'));
function buffalo(year=2021): Result {
  return resultFromRow({year,level:'municipality',area_id:'1117',municipality_id:'1117',name:fixture.area.name,
    payload:JSON.stringify(fixture.results),snapshot_id:`${year}-page`,url:fixture.source.url,
    reported_at:fixture.source.area_reported_at,last_checked_at:fixture.source.last_checked_at,
    last_success_at:fixture.source.last_successful_check_at,last_error:null});
}
const options={level:'municipality',id:'1117',through:2026};

test('Cape Town applies the published recount once, retains raw figures and exposes correction evidence',()=>{
  const cpt=JSON.parse(readFileSync(new URL('./fixtures/cape-town-2021.json',import.meta.url),'utf8'));
  const r=buffalo();r.id=r.municipalityId='9006';r.results=structuredClone(cpt.results);r.source.reportedAt=cpt.source.area_reported_at;
  const allocation=electionCouncilSeats(r);assert(allocation.status==='reported');
  assert.equal(allocation.parties.find(p=>p.party_id==='52')?.count,135);
  assert.equal(allocation.parties.find(p=>p.party_id==='467')?.count,2);
  assert.equal(allocation.parties.reduce((n,p)=>n+p.count,0),231);
  assert.equal(r.results.parties.find(p=>p.party_id==='52')?.seats.total,136,'Raw archive is unchanged');
  assert.equal(allocation.correction?.date,'2022-05-26');
  assert.equal(electionMajorityBaseline(r)?.seats,135);
  assert.match(trendElection(r,'source_total').notes[0]!.note,/predate that recount/);
  assert.equal(areaSummary(r).council.correction?.date,'2022-05-26');
  r.results.parties=allocation.parties;
  const again=electionCouncilSeats(r);assert(again.status==='reported');
  assert.equal(again.parties.find(p=>p.party_id==='52')?.count,135);assert.equal(again.correction,undefined);
  const other={...r,id:'1117',results:cpt.results};
  const original=electionCouncilSeats(other);assert(original.status==='reported');
  assert.equal(original.parties.find(p=>p.party_id==='52')?.count,136,'Correction is specific to this municipality and election');
});

test('complete Buffalo City archive preserves OTHER while recovering the 61/100 ANC allocation',()=>{
  const r=buffalo(), allocation=electionCouncilSeats(r);
  assert.equal(allocation.status,'reported');
  assert(allocation.status==='reported');
  assert.equal(allocation.total,100); assert.equal(allocation.majority,51);
  assert.equal(allocation.parties.find(p=>p.party_id==='7')?.count,61);
  assert.equal(allocation.parties.find(p=>p.entry_type==='aggregate')?.count,0);
  assert.equal(electionMajorityBaseline(r)?.seats,61);
  assert.notEqual(electionCouncilSeats({...r,year:2026}).status,'reported','The historical exception never loosens live validation');
  assert.equal(electionMajorityBaseline({...r,year:2026}),null);
  assert.equal(areaSummary(r).council.majority_party?.party_id,'7');
  const snapshot=councilSnapshot([{level:'municipality',id:r.id,name:r.name,provinceId:'1',municipalityId:r.id,wardId:null,reportedAt:r.source.reportedAt,payload:r.results}],2021)!;
  assert.equal(majorityParty(snapshot.seats)?.count,61);
  assert.equal(snapshot.seats?.parties.find(p=>p.id==='-2')?.count,0);
});

test('historical seats reject incomplete allocations, duplicates and a possible majority hidden in OTHER',()=>{
  for(const mutate of [
    (r:Result)=>r.results.progress.seats!.completed=99,
    (r:Result)=>r.results.parties[0]!.seats.pr=17,
    (r:Result)=>r.results.parties.push({...r.results.parties[0]!}),
    (r:Result)=>{const anc=r.results.parties[0]!,other=r.results.parties.find(p=>p.entry_type==='aggregate')!;other.seats={...anc.seats};anc.seats={total:0,pr:0,ward:0};},
  ]) {const r=buffalo();mutate(r);assert.equal(electionCouncilSeats(r).status,'unavailable');}
});

test('documented majority government is dated separately from MISTRA and never verifies a 2026 administration',()=>{
  const g=governmentHistory('BUF')!;
  assert.equal(g.latest,null);assert.equal(g.records.length,0);
  assert.equal(g.majorityAdministration?.partyKey,'ANC');
  assert.equal(g.majorityAdministration?.evidenceThrough,'2025-06-30');
  assert.equal(g.majorityAdministration?.sources.length,2);
  assert.equal(g.beforeElection,null);assert.equal(g.afterElection,null);assert.equal(g.change.status,'unconfirmed');
  assert.match(governmentCaption(g)!,/Last recorded government \(2025-06-30\): ANC/);assert.doesNotMatch(governmentCaption(g)!,/MISTRA/);
  const baseline={...electionMajorityBaseline(buffalo())!,municipalityId:'9006'};
  const electoral=governmentContext('CPT',2026,baseline)!;
  assert.equal(electoral.majorityAdministration,null);assert.equal(electoral.beforeElection,null);
  assert.match(governmentCaption(electoral)!,/Election allocation, not a record/);
  assert.equal(governmentContext('CPT',2026,electionMajorityBaseline(buffalo()))?.electionBaseline,null,'Wrong municipality baseline is ignored');
});

test('vote histories use a consistent denominator and never substitute PR for combined ballots',()=>{
  const old=buffalo(), current=buffalo(2026);
  current.results.parties.forEach(p=>{p.votes.pr=p.votes.source_total;p.votes.ward=0;});
  const h=electionTrends([old,current],options);
  assert.equal(h.basis,'source_total');assert.equal(h.previous?.total,360294);
  assert.equal(h.series.find(s=>s.id==='7')!.points[0]!.share!.toFixed(2),'59.43');
  assert.equal(h.elections[1]!.status,'provisional');
  assert.equal(electionTrends([old,current],{...options,basis:'pr'}).elections[0]!.total,null);
  const summary=buffalo();summary.level='province';summary.municipalityId=null;
  summary.results.party_list_scope='leading_parties_only';summary.results.reported_totals.valid_ballot_papers=1_000_000;
  assert.equal(trendElection(summary,'source_total').parties.find(p=>p.id==='7')?.share,21.4118);
  assert.equal(trendElection(summary,'source_total').zeroForAbsent,false);
  summary.results.reported_totals.valid_ballot_papers=1;
  assert.equal(trendElection(summary,'source_total').total,null);
});

test('missing and ambiguous parties remain gaps, and only complete ungrouped lists establish zero',()=>{
  const old=buffalo(), current=buffalo(2026);
  current.results.parties.push({...structuredClone(current.results.parties[0]!),source_entry_id:'new',party_id:'new',party_name:'New party',votes:{source_total:100,pr:50,ward:50}});
  let h=electionTrends([old,current],options);
  assert.equal(h.series.find(s=>s.id==='new')!.points[0]!.share,null,'OTHER could contain unlisted parties');
  old.results.parties=old.results.parties.filter(p=>p.entry_type!=='aggregate');
  h=electionTrends([old,current],options);
  assert.equal(h.series.find(s=>s.id==='new')!.points[0]!.share,0);
  old.results.parties.push({...old.results.parties[0]!,source_entry_id:'duplicate'});
  h=electionTrends([old,current],options);
  assert.equal(h.series.find(s=>s.id==='7')!.points[0]!.share,null);
  assert.equal(h.series.find(s=>s.id==='new')!.points[0]!.share,null);
});

test('missing elections break lines, historical views exclude 2026, and a changed parent blocks comparison',()=>{
  const h=electionTrends([buffalo(2011),buffalo(),buffalo(2026)],options);
  assert.deepEqual(h.years,[2011,2016,2021,2026]);
  const segments=trendSegments(h.series.find(s=>s.id==='7')!.points);
  assert.equal(segments.length,1);assert.equal(segments[0]!.from.year,2021);assert.equal(segments[0]!.provisional,true);
  const old=electionTrends([buffalo(2011),buffalo(),buffalo(2026)],{...options,through:2021});
  assert.equal(old.previous,null,'Missing 2016 is not replaced with 2011');
  assert(!old.years.includes(2026));assert(old.elections.every(e=>e.status==='historical'));
  const moved=buffalo();moved.municipalityId='different';
  assert.deepEqual(electionTrends([moved,buffalo(2026)],options).elections.map(e=>e.year),[2026]);
  assert.deepEqual(electionTrends([buffalo(),buffalo(),buffalo(2026)],options).elections.map(e=>e.year),[2026],'Duplicate years cannot choose an arbitrary snapshot');
});

test('history reads active snapshots, reuses page snapshots and exposes validated REST requests',async()=>{
  const sql=new DatabaseSync(':memory:');
  for(const file of ['0001_results.sql','0003_compact_results.sql'])sql.exec(readFileSync(new URL(`../migrations/${file}`,import.meta.url),'utf8'));
  const db={prepare(query:string){const statement=(args:unknown[]=[])=>({async all(){return{results:sql.prepare(query).all(...args as never[])};}});return{...statement(),bind(...args:unknown[]){return statement(args);}};}} as unknown as D1Database;
  try {
    for(const year of [2016,2021,2026]){
      const r=buffalo(year),source=`${year}:municipality:1117`;
      sql.prepare("INSERT INTO source_documents(id,year,kind,area_id,url,active_snapshot_id,last_checked_at) VALUES(?,?,'municipality','1117',?,?,'2026-11-01T00:00:00Z')").run(source,year,r.source.url,`${year}-stored`);
      for(const snapshot of [`${year}-stored`,`${year}-inactive`]) sql.prepare("INSERT INTO area_results(snapshot_id,source_id,year,level,area_id,province_id,municipality_id,name,reported_at,payload) VALUES(?,?,?,'municipality','1117','1','1117',?,?,?)").run(snapshot,source,year,r.name,r.source.reportedAt,JSON.stringify(r.results));
    }
    const current=buffalo(2026);current.previous=buffalo();
    const h=await readElectionHistory(db,undefined,{...options,level:'municipality',current});
    assert.deepEqual(h.elections.map(e=>e.source.snapshotId),['2016-stored','2021-page','2026-page']);
    const env={RESULTS_DB:db,RAW_RESULTS:undefined!};
    const get=(suffix:string,init?:RequestInit)=>resultsApi(new Request(`https://counted.co.za/api/v1/history/municipality/1117${suffix}`,init),env);
    const response=await get('?through=2021');assert.equal(response.status,200);
    const body=await response.json() as typeof h;assert.deepEqual(body.elections.map(e=>e.year),[2016,2021]);
    assert.equal((await get('?through=2021',{headers:{'If-None-Match':response.headers.get('ETag')!}})).status,304);
    assert.equal((await get('?through=2025')).status,400);assert.equal((await get('?ballot=invalid')).status,400);
    assert.equal((await resultsApi(new Request('https://counted.co.za/api/v1/history/province/1?ballot=pr'),env)).status,400);
    assert.equal((await resultsApi(new Request('https://counted.co.za/api/v1/history/municipality/unknown'),env)).status,404);
    const fallback=await readElectionHistory(null!,undefined,{...options,level:'municipality',current});
    assert(fallback.warning);assert.equal(fallback.elections.length,2);
  } finally {sql.close();}
});

test('chart controls inspect years and highlight parties without losing state during live updates',()=>{
  const window=new Window(),d=window.document as unknown as Document;
  d.body.innerHTML='<section data-vote-history data-default-year="2026"><button data-trend-year="2021">2021</button><button data-trend-year="2026">2026</button><button data-trend-party="7">ANC</button><div data-trend-panel="2021"></div><div data-trend-panel="2026"></div><svg><g data-trend-line="7"></g><g data-trend-line="52"></g><g data-trend-year-marker="2021"></g></svg></section>';
  setupVoteHistory(d as unknown as Document);
  const before=d.querySelector<HTMLElement>('[data-trend-panel="2021"]')!;
  assert.equal(before.hidden,true);
  d.querySelector<HTMLButtonElement>('[data-trend-year="2021"]')!.click();assert.equal(before.hidden,false);
  d.querySelector<HTMLButtonElement>('[data-trend-party="7"]')!.click();
  assert.equal(d.querySelector<SVGElement>('[data-trend-line="52"]')!.style.opacity,'.14');
  setupVoteHistory(d as unknown as Document);assert.equal(before.hidden,false);
  d.querySelector<HTMLButtonElement>('[data-trend-party="7"]')!.click();
  assert.equal(d.querySelector<SVGElement>('[data-trend-line="52"]')!.style.opacity,'1');
  window.close();
});
