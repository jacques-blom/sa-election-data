import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { searchPlaces, findPlace } from '../src/lib/places/catalogue.ts';
import { getPlaceResults, ballotResults, freshness, reporting, placeMarkdown } from '../src/lib/places/results.ts';

function fixture() {
 const sql = new DatabaseSync(':memory:');
 sql.exec(readFileSync(new URL('../migrations/0001_results.sql',import.meta.url),'utf8'));
 sql.exec(readFileSync(new URL('../migrations/0003_compact_results.sql',import.meta.url),'utf8'));
 const db = {prepare(query:string){return {bind(...args:(string|number)[]){return {async all(){return {results:sql.prepare(query).all(...args)};}};}};}} as unknown as D1Database;
 const payload = {party_list_scope:'all_rows_in_source',parties:[{party_name:'Party A',candidate_name:null,votes:{pr:40,ward:10,source_total:50},seats:{},source_entry_id:'1'}, {party_name:'Party B',candidate_name:null,votes:{pr:10,ward:40,source_total:50},seats:{},source_entry_id:'2'}],reported_totals:{valid_ballot_papers:100},progress:{voting_districts:{expected:10,completed:4}}};
 for(const [source,id] of [['cpt','9006'],['han','6605']]) {
 sql.prepare('INSERT INTO source_documents(id,year,kind,area_id,url,active_snapshot_id,last_checked_at,last_success_at) VALUES(?,2026,\'municipality\',?,\'https://example.org/iec\',\'new\',\'2026-11-05T12:00:00Z\',\'2026-11-05T12:00:00Z\')').run(source!,id!);
 const ids=id==='6605'?['6605','30605001','30605002','30605003','30605006','30605007']:['9006','19100001','19100012'];
 for(const area of ids) for(const snapshot of ['new','old']) sql.prepare('INSERT INTO area_results(snapshot_id,source_id,year,level,area_id,municipality_id,name,reported_at,payload) VALUES(?,?,2026,?,?,?,?,\'2026-11-05T11:00:00Z\',?)').run(snapshot,source!,area===id?'municipality':'ward',area,id!,area,JSON.stringify({...payload,parties:snapshot==='new'?payload.parties:[]}));
 }
 return {sql,db};
}

test('aliases resolve to the same canonical place; unrelated names do not redirect',()=>{
 assert.equal(searchPlaces('  KAAPSTAD ')[0]?.slug,'cape-town');
 assert.equal(searchPlaces('City of Cape Town')[0]?.id,findPlace('cape-town')?.id);
 assert.deepEqual(searchPlaces('<script>'),[]);
 assert.equal(searchPlaces('calvinia')[0]?.slug,'calvinia');
});
test('place lookup uses the active snapshot and scopes wards without adding town vote totals',async()=>{
 const {sql,db}=fixture();try {
 const town=await getPlaceResults(db,findPlace('calvinia')!);
 assert.deepEqual(town.wards.map(w=>w.id),['30605001','30605002','30605006','30605007']);
 assert.ok(town.wards.every(w=>w.source.snapshotId==='new'));
 assert.equal(town.scope,'whole_overlapping_wards_not_town_only');
 assert.equal(town.place.indexable,false);
 const metro=await getPlaceResults(db,findPlace('cape-town')!);
 assert.deepEqual(metro.wards.map(w=>w.id),['19100001','19100012']);
 assert.equal(metro.scope,'whole_municipality');
 const pr=ballotResults(metro.municipality!,'pr'), ward=ballotResults(metro.municipality!,'ward');
 assert.equal(pr.total,50);assert.equal(pr.parties[0]?.party_name,'Party A');assert.equal(pr.parties[0]?.share,80);
 assert.equal(ward.total,50);assert.equal(ward.parties[0]?.party_name,'Party B');
 }finally{sql.close();}
});
test('missing ballot data is not zero and does not produce a misleading percentage',async()=>{
 const {sql,db}=fixture();try {const d=await getPlaceResults(db,findPlace('cape-town')!);d.municipality!.results.parties[0]!.votes.pr=null;
 const ballot=ballotResults(d.municipality!,'pr');assert.equal(ballot.total,null);assert.ok(ballot.parties.every(p=>p.share===null));
 }finally{sql.close();}
});
test('local result summaries handle leads, ties, aggregates and incomplete lists',async()=>{
 const {sql,db}=fixture();try {const d=await getPlaceResults(db,findPlace('cape-town')!);const r=d.municipality!;
 const b=ballotResults(r,'pr');assert.equal(b.leader?.party_name,'Party A');assert.equal(b.leadVotes,30);assert.equal(b.runnerUp?.party_name,'Party B');
 r.results.parties[1]!.votes.pr=40;assert.equal(ballotResults(r,'pr').tied,true);assert.equal(ballotResults(r,'pr').leader,null);
 r.results.parties[1]!.votes.pr=10;r.results.parties[0]!.entry_type='aggregate';assert.equal(ballotResults(r,'pr').leader,null);
 r.results.parties[0]!.entry_type='party_or_candidate';r.results.party_list_scope='leading_parties_only';assert.equal(ballotResults(r,'pr').total,null);assert.equal(ballotResults(r,'pr').leader,null);
 }finally{sql.close();}
});
test('impossible progress is hidden, complete reporting remains provisional and stale data is labelled',async()=>{
 const {sql,db}=fixture();try {const d=await getPlaceResults(db,findPlace('cape-town')!);const r=d.municipality!;
 assert.equal(reporting(r)?.percent,40);r.results.progress.voting_districts!.completed=11;assert.equal(reporting(r),null);
 r.results.progress.voting_districts!.completed=10;assert.equal(reporting(r)?.percent,100);assert.equal(d.status,'provisional');
 assert.equal(freshness(r,Date.parse('2026-11-05T12:01:00Z')),null);assert.match(freshness(r,Date.parse('2026-11-05T14:00:00Z'))!,/delayed/);
 r.source.error='network';assert.match(freshness(r)!,/failed/);
 }finally{sql.close();}
});
test('missing mapped wards are explicit; Markdown preserves source and whole-ward scope',async()=>{
 const {sql,db}=fixture();try {sql.prepare("DELETE FROM area_results WHERE area_id='30605007'").run();const d=await getPlaceResults(db,findPlace('calvinia')!);
 assert.deepEqual(d.missingWardIds,['30605007']);const md=placeMarkdown(d);assert.match(md,/whole_overlapping_wards_not_town_only/);assert.match(md,/Snapshot: new/);assert.match(md,/Results unavailable for wards: 30605007/);assert.match(md,/not an address lookup/);
 }finally{sql.close();}
});

test('a place crossing municipality boundaries includes every mapped ward and both parent councils',async()=>{
 const {sql,db}=fixture();try{
  const town=structuredClone(findPlace('calvinia')!);
  town.relationships.push({election:2026,level:'municipality',areaId:'9006',relation:'overlaps',boundaryVersion:'test',method:'test'},{election:2026,level:'ward',areaId:'19100012',relation:'overlaps',boundaryVersion:'test',method:'test'});
  const result=await getPlaceResults(db,town);
  assert.deepEqual(result.municipalities.map(m=>m.id).sort(),['6605','9006']);
  assert.deepEqual(result.wards.map(w=>w.id).sort(),['19100012','30605001','30605002','30605006','30605007']);
  assert.ok(!result.wards.some(w=>w.id==='19100001'));assert.equal(result.scope,'whole_overlapping_wards_not_town_only');
 }finally{sql.close();}
});
