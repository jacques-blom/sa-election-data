import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { resultFromRow, ballotResults, freshness, type Result } from '../src/lib/places/results.ts';
import { partyMovement, movementValue, previousElection, displayBallot } from '../src/lib/history/comparison.ts';
import { attachPrevious, availableYears } from '../src/lib/history/results.ts';
import { getNationalOverview, getProvinceOverview, provinces, resultDelay } from '../src/lib/overview/results.ts';

function result(year = 2026, votes = [60,40], combined = false): Result {
  return resultFromRow({year,level:'municipality',area_id:'9006',municipality_id:'9006',name:'CPT - Cape Town',snapshot_id:`${year}-active`,
    url:'https://example.org',reported_at:`${year}-11-01T00:00:00Z`,last_checked_at:'2026-11-01T00:00:00Z',last_success_at:'2026-11-01T00:00:00Z',last_error:null,
    payload:JSON.stringify({party_list_scope:'all_rows_in_source',ballot_scope:'source_combined',
      parties:votes.map((v,i)=>({source_entry_id:String(i+1),party_id:String(i+1),party_name:`Party ${i+1}`,entry_type:'party_or_candidate',candidate_name:null,
        votes:{pr:combined?null:v,ward:combined?null:100-v,source_total:combined?v:100},seats:{pr:null,ward:null,total:null}})),
      reported_totals:{valid_ballot_papers:combined?votes.reduce((a,b)=>a+b,0):200,registered_voters:null,ballot_papers_cast:null,spoilt_ballot_papers:null},
      progress:{voting_districts:null,municipalities:null,wards:null,seats:null}})});
}

test('movement measures percentage points on the same ballot with a signed zero',()=>{
  const r=result();r.previous=result(2021,[50,50]);
  assert.equal(partyMovement(r,r.results.parties[0]!,'pr')?.delta,10);
  assert.equal(partyMovement(r,r.results.parties[1]!,'pr')?.delta,-10);
  assert.equal(movementValue(-.001),'±0.0 pp');assert.equal(movementValue(2.36),'+2.4 pp');assert.equal(movementValue(-2.36),'−2.4 pp');
});
test('combined fallback compares combined with combined, never PR with combined',()=>{
  const r=result();r.previous=result(2021,[40,60],true);
  const m=partyMovement(r,r.results.parties[0]!,'pr')!;
  assert.equal(m.delta,10);assert.equal(m.currentShare,50);assert.equal(m.combinedFallback,true);assert.equal(m.basis,'source_total');
  assert.equal(displayBallot(r.previous,'pr'),'source_total');assert.equal(ballotResults(r.previous,'pr').parties[0]!.share,60);
});
test('only the immediately previous election is used, even if older data exists',()=>{
  assert.equal(previousElection(2026),2021);assert.equal(previousElection(2000),null);
  const r=result();r.previous=result(2016);assert.equal(partyMovement(r,r.results.parties[0]!,'pr')?.delta,null);
  assert.equal(partyMovement(result(2000),r.results.parties[0]!,'pr'),null);
});
test('partial summaries preserve their denominator and cannot treat unlisted parties as zero',()=>{
  const r=result();r.level='province';r.municipalityId=null;r.previous=result(2021);r.previous.level='province';r.previous.municipalityId=null;
  for(const row of [r,r.previous]){row.results.party_list_scope='leading_parties_only';row.results.reported_totals.valid_ballot_papers=1000;}
  r.results.parties[0]!.votes.source_total=200;
  assert.equal(partyMovement(r,r.results.parties[0]!,'source_total')?.delta,10);
  r.previous.results.parties.shift();assert.equal(partyMovement(r,r.results.parties[0]!,'source_total')?.delta,null);
});
test('complete lists can establish a zero baseline for a newly listed party',()=>{
  const r=result();r.previous=result(2021,[100]);r.results.parties[1]!.party_id='new';
  assert.equal(partyMovement(r,r.results.parties[1]!,'pr')?.delta,40);
});
test('a party named Independent is distinct from grouped or candidate entries, and OTHER prevents zero baselines',()=>{
  const r=result();r.previous=result(2021,[50,50]);
  for(const row of [r,r.previous]){row.results.parties[0]!.party_id='45';row.results.parties[0]!.party_name='INDEPENDENT CIVIC ORGANISATION OF SOUTH AFRICA';}
  assert.equal(partyMovement(r,r.results.parties[0]!,'pr')?.delta,10);
  r.results.parties[0]!.candidate_name='An individual';
  assert.equal(partyMovement(r,r.results.parties[0]!,'pr')?.delta,null);
  r.results.parties[0]!.candidate_name=null;
  r.previous.results.parties[0]!.party_id=null;r.previous.results.parties[0]!.entry_type='aggregate';
  assert.equal(partyMovement(r,r.results.parties[0]!,'pr')?.delta,null);
  assert.match(partyMovement(r,r.results.parties[0]!,'pr')?.reason??'',/aggregate/);
});
test('missing, zero, invalid, ambiguous and different-area results never invent swings',()=>{
  const r=result();const party=r.results.parties[0]!;
  assert.equal(partyMovement(r,party,'pr')?.delta,null);
  r.previous=result(2021,[0,0]);assert.equal(partyMovement(r,party,'pr')?.delta,null);
  r.previous=result(2021);r.previous.results.parties[0]!.votes.pr=null;assert.equal(partyMovement(r,party,'pr')?.delta,null);
  r.previous=result(2021);r.previous.results.parties.push(r.previous.results.parties[0]!);assert.equal(partyMovement(r,party,'pr')?.delta,null);
  r.previous=result(2021);r.previous.municipalityId='different';assert.equal(partyMovement(r,party,'pr')?.delta,null);
  r.previous=result(2021);party.entry_type='aggregate';assert.equal(partyMovement(r,party,'pr')?.delta,null);
  party.entry_type='party_or_candidate';party.party_name='Independent candidates';assert.equal(partyMovement(r,party,'pr')?.delta,null);
});
test('archived results do not appear delayed',()=>{
  const r=result(2021);r.source.error='old error';assert.equal(resultDelay(r),null);assert.equal(freshness(r),null);
});
test('year queries and comparisons read active historical snapshots and preserve historical links',async()=>{
  const sql=new DatabaseSync(':memory:');
  for(const file of ['0001_results.sql','0003_compact_results.sql'])sql.exec(readFileSync(new URL(`../migrations/${file}`,import.meta.url),'utf8'));
  const db={prepare(query:string){const statement=(args:unknown[]=[])=>({async all(){return{results:sql.prepare(query).all(...args as never[])};},async first(){return sql.prepare(query).get(...args as never[])??null;}});return{...statement(),bind(...args:unknown[]){return statement(args);}};}} as unknown as D1Database;
  try{
    for(const year of [2016,2021,2026]){
      const r=result(year,[60,40],year<2026),source=`${year}:summary:ZA`;
      sql.prepare("INSERT INTO source_documents(id,year,kind,area_id,url,active_snapshot_id,last_checked_at) VALUES(?,?,'summary','ZA','https://example.org',?,'2026-11-01T00:00:00Z')").run(source,year,r.source.snapshotId);
      for(const [level,id,parent,name] of [['national','ZA',null,'South Africa'],['province','9',null,'Western Cape'],['municipality','9006','9006','CPT - Cape Town']]){
        sql.prepare("INSERT INTO area_results(snapshot_id,source_id,year,level,area_id,province_id,municipality_id,name,reported_at,payload) VALUES(?,?,?,?,?,'9',?,?,?,?)")
          .run(r.source.snapshotId,source,year,level!,id!,parent!,name!,r.source.reportedAt,JSON.stringify(r.results));
      }
    }
    assert.deepEqual(await availableYears(db,'municipality','9006'),[2016,2021,2026]);
    const current=result();await attachPrevious(db,[current]);assert.equal(current.previous?.year,2021);
    const national=await getNationalOverview(db,undefined,2021);assert.equal(national.national.year,2021);assert.equal(national.national.previous?.year,2016);
    assert.equal(national.municipalities[0]!.placeHref,'/2021/places/cape-town');
    const province=await getProvinceOverview(db,provinces.find(p=>p.id==='9')!,undefined,2021);assert.equal(province.summary.year,2021);assert.equal(province.municipalities[0]!.result.previous?.year,2016);
    sql.exec('DELETE FROM area_results WHERE year=2021');const missing=result();await attachPrevious(db,[missing]);assert.equal(missing.previous,null);
  }finally{sql.close();}
});
