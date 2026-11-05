import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { getNationalOverview, getProvinceOverview, provinces, progressOf, progressLabel, resultDelay, municipalBallot, matchesMunicipality, summaryBallot, summaryShareText } from '../src/lib/overview/results.ts';
import { resultFromRow, type Result } from '../src/lib/places/results.ts';
import { provinceMapLabels } from '../src/lib/overview/province-map.ts';

function result(votes: (number|null)[] = [60,40]): Result {
  return resultFromRow({level:'municipality',area_id:'3003',name:'JHB - Johannesburg',municipality_id:'3003',
    snapshot_id:'active',url:'https://example.org/iec',reported_at:'2026-11-05T12:00:00Z',last_checked_at:'2026-11-05T12:01:00Z',last_success_at:'2026-11-05T12:01:00Z',last_error:null,
    payload:JSON.stringify({party_list_scope:'all_rows_in_source',ballot_scope:'source_combined',
      parties:votes.map((v,i)=>({source_entry_id:String(i+1),party_id:String(i+1),party_name:`Party ${i+1}`,entry_type:'party_or_candidate',party_name_source:'result_file',candidate_name:null,
        votes:{pr:v,ward:100-(v??0),source_total:100},source_share_percent:50,seats:{ward:null,pr:null,total:null}})),
      progress:{voting_districts:{expected:10000,completed:9999},municipalities:null,wards:null,seats:null},
      reported_totals:{registered_voters:1000,valid_ballot_papers:200,spoilt_ballot_papers:0,ballot_papers_cast:200}})});
}

test('PR shares use a complete municipality ballot, never combined votes or a truncated province list',()=>{
  const r=result();const b=municipalBallot(r);
  assert.equal(b.total,100);assert.equal(b.leader?.party_name,'Party 1');assert.equal(b.parties[0]?.share,60);
  r.results.party_list_scope='leading_parties_only';const limited=municipalBallot(r);
  assert.equal(limited.total,null);assert.equal(limited.leader,null);assert(limited.parties.every(p=>p.share===null));
});
test('unknown votes, zero totals, tied leaders and Other cannot create a false leader',()=>{
  for(const votes of [[null,40],[0,0],[50,50]]) assert.equal(municipalBallot(result(votes)).leader,null);
  assert.equal(municipalBallot(result([50,50])).tied,true);
  assert.equal(municipalBallot(result([0,0])).tied,false);
  const other=result();other.results.parties[0]!.entry_type='aggregate';other.results.parties[0]!.party_id=null;
  assert.equal(municipalBallot(other).leader,null);
  assert(municipalBallot(result([null,40])).parties.every(p=>p.share===null));
});
test('summary shares use reported valid ballots without inflating a partial party list',()=>{
  const r=result();r.level='province';r.results.party_list_scope='leading_parties_only';
  r.results.reported_totals.valid_ballot_papers=1000;
  r.results.parties[0]!.votes.source_total=300;r.results.parties[1]!.votes.source_total=200;
  const b=summaryBallot(r);assert.equal(b.total,1000);assert.equal(b.unlisted,500);
  assert.deepEqual(b.parties.map(p=>p.share),[30,20]);assert.equal(b.topShown?.party_name,'Party 1');
  const text=summaryShareText(r,'Example province');assert.match(text,/30.0%/);assert.match(text,/selected parties only/);assert.match(text,/combined ward \+ municipal PR/);
});
test('invalid, missing and conflicting summary counts never produce shares or a leader',()=>{
  const r=result();r.level='national';
  for(const value of [201,199,0,null,NaN]) {
    r.results.reported_totals.valid_ballot_papers=value;
    const b=summaryBallot(r);assert.equal(b.total,null);assert.equal(b.topShown,null);assert(b.parties.every(p=>p.share===null));
  }
  r.results.reported_totals.valid_ballot_papers=200;r.results.parties[0]!.votes.source_total=null;
  assert.equal(summaryBallot(r).total,null);
  const tied=summaryBallot(result());assert.equal(tied.tied,true);assert.equal(tied.topShown,null);
  r.results.parties[0]!.votes.source_total=120;r.results.parties[1]!.votes.source_total=80;r.results.parties[0]!.entry_type='aggregate';
  assert.equal(summaryBallot(r).topShown,null);
});
test('province map shares keep the published denominator, scope and province links',()=>{
  const r=result();r.level='province';r.results.party_list_scope='leading_parties_only';
  r.results.reported_totals.valid_ballot_papers=1000;
  r.results.parties[0]!.votes.source_total=300;r.results.parties[1]!.votes.source_total=200;
  r.results.parties[0]!.party_name='AFRICAN NATIONAL CONGRESS';
  const labels=provinceMapLabels(provinces.map(province=>({province,result:r})));
  assert.equal(labels.length,9);
  assert.equal(new Set(labels.map(label=>label.href)).size,9);
  for(const label of labels){
    assert.equal(label.result,'ANC 30.0%');
    assert.match(label.href,/^\/2026\/provinces\/[a-z-]+$/);
    assert.match(label.description,/Preliminary results/);
    assert.match(label.description,/selected parties only/);
    assert.match(label.description,/99.9% of voting districts reporting/);
  }
});
test('province map distinguishes ties, no votes, missing and inconsistent results',()=>{
  const label=(value:Result|null)=>provinceMapLabels([{province:provinces[0],result:value}])[0]!;
  assert.equal(label(result()).result,'Tied');
  assert.equal(label(null).result,'Unavailable');
  const empty=result([0,0]);empty.results.reported_totals.valid_ballot_papers=0;
  empty.results.parties.forEach(p=>{p.votes.source_total=0;});
  assert.equal(label(empty).result,'Awaiting votes');
  const invalid=result();invalid.results.reported_totals.valid_ballot_papers=100;
  assert.equal(label(invalid).result,'Unavailable');
  for(const value of [result(),null,empty,invalid])assert.equal(label(value).color,'#dce1d5');
});
test('progress does not round an incomplete count to 100% and invalid values stay unavailable',()=>{
  const r=result();assert.equal(progressLabel(progressOf(r)),'99.9%');
  r.results.progress.voting_districts!.completed=10000;assert.equal(progressLabel(progressOf(r)),'100.0%');
  for(const completed of [-1,10001,NaN,null,2.5]) {r.results.progress.voting_districts!.completed=completed;assert.equal(progressOf(r),null);}
  r.results.progress.voting_districts={expected:0,completed:0};assert.equal(progressOf(r),null);
});
test('summary freshness uses the three-minute limit and municipality freshness uses fifteen minutes',()=>{
  const r=result();const now=Date.parse('2026-11-05T12:05:00Z');
  assert.equal(resultDelay(r,now),null);r.level='province';assert.match(resultDelay(r,now)!,/delayed/);
  r.level='municipality';r.source.error='upstream unavailable';assert.match(resultDelay(r,now)!,/failed/);
  r.source.error=null;r.source.successfulAt=null;assert.match(resultDelay(r,now)!,/delayed/);
});

function fixture() {
  const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('../migrations/0001_results.sql',import.meta.url),'utf8'));
  sql.exec(readFileSync(new URL('../migrations/0003_compact_results.sql',import.meta.url),'utf8'));
  // Adapter exercises the production SQL against SQLite without a network or remote binding.
  const db={prepare(query:string){return {async all(){return {results:sql.prepare(query).all()};},bind(...args:(string|number)[]){return {async all(){return {results:sql.prepare(query).all(...args)};}};}};}} as unknown as D1Database;
  const payload=JSON.stringify(result().results);
  for(const [source,kind,area] of [['summary','summary','ZA'],['jhb','municipality','3003'],['cpt','municipality','9006']]) {
    sql.prepare('INSERT INTO source_documents(id,year,kind,area_id,url,active_snapshot_id,last_checked_at,last_success_at) VALUES(?,2026,?,?,\'https://example.org\',\'active\',\'2026-11-05T12:01:00Z\',\'2026-11-05T12:01:00Z\')').run(source!,kind!,area!);
  }
  for(const [source,level,id,province,municipality,name] of [
    ['summary','national','ZA',null,null,'South Africa'],['summary','province','3','3',null,'Gauteng'],['summary','province','9','9',null,'Western Cape'],
    ['jhb','municipality','3003','3','3003','JHB - Johannesburg'],['cpt','municipality','9006','9','9006','CPT - Cape Town'],
    ['jhb','ward','79900001','3','3003','Ward 1'],
  ]) for(const snapshot of ['active','obsolete']) {
    sql.prepare('INSERT INTO area_results(snapshot_id,source_id,year,level,area_id,province_id,municipality_id,name,reported_at,payload) VALUES(?,?,2026,?,?,?,?,?,\'2026-11-05T12:00:00Z\',?)').run(snapshot,source!,level!,id!,province!,municipality!,name!,snapshot==='active'?payload:'{}');
  }
  return {sql,db};
}
test('overview queries read active snapshots, retain unavailable provinces and scope municipality rows',async()=>{
  const {sql,db}=fixture();try {
    const national=await getNationalOverview(db);assert.equal(national.national.source.snapshotId,'active');assert.equal(national.provinces.length,9);
    assert.equal(national.provinces.filter(p=>p.result!==null).length,2);assert.equal(national.municipalities.length,2);
    assert.equal(national.metros.length,8);
    assert.equal(national.metros.filter(m=>m.result!==null).length,2);
    assert.equal(national.metros.find(m=>m.place.slug==='johannesburg')?.result?.source.snapshotId,'active');
    assert.equal(municipalBallot(national.metros.find(m=>m.place.slug==='johannesburg')!.result!).parties[0]?.share,60);
    assert.equal(national.metros.find(m=>m.place.slug==='tshwane')?.result,null);
    assert.equal(national.municipalities[0]!.name,'Cape Town');assert.equal(national.municipalities[0]!.placeHref,'/2026/places/cape-town');
    assert.equal(national.municipalities[1]!.href,'/2026/provinces/gauteng#municipality-3003');
    const province=await getProvinceOverview(db,provinces.find(p=>p.id==='3')!);assert.equal(province.municipalities.length,1);
    assert.equal(province.municipalities[0]!.result.id,'3003');assert.equal(province.municipalities[0]!.result.source.snapshotId,'active');
    assert(matchesMunicipality(national.municipalities[1]!,' JOHANNESBURG '));assert(matchesMunicipality(national.municipalities[1]!,'Gauteng JHB'));
    assert(!matchesMunicipality(national.municipalities[1]!,'Cape Town'));
    sql.exec("DELETE FROM area_results WHERE level='national'");await assert.rejects(getNationalOverview(db),/National result/);
  } finally {sql.close();}
});

test('an invalid metro result does not hide the national overview or other metros',async()=>{
  const {sql,db}=fixture();try {
    sql.exec("UPDATE area_results SET payload='{}' WHERE area_id='3003' AND snapshot_id='active'");
    const national=await getNationalOverview(db);
    assert.equal(national.national.source.snapshotId,'active');
    assert.equal(national.metros.find(m=>m.place.slug==='johannesburg')?.result,null);
    assert.equal(national.metros.find(m=>m.place.slug==='cape-town')?.result?.id,'9006');
  } finally {sql.close();}
});
