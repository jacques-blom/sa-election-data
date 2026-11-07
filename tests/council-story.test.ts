import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { councilOutcomeStory, readCouncilOutcomeStory, type StoryCouncil } from '../src/lib/overview/council-story.ts';
import { places } from '../src/lib/places/catalogue.ts';

const council = (id:string, winner:string|null, provinceId='1'):StoryCouncil => ({id, provinceId, name:id, href:`/2026/places/${id}`,
  outcome:winner==='pending'?'pending':winner?'majority':'no-majority', party:winner && winner!=='pending'?{id:winner,name:`Party ${winner}`}:null});

test('outcome counts and net changes exclude pending and unmatched councils from comparisons',()=>{
  const current=[council('a','7'),council('b',null),council('c','pending'),council('new','52')];
  const previous=[council('a',null),council('b','52'),council('c','7'),council('old','7')];
  const story=councilOutcomeStory(current,previous,2026);
  assert.equal(story.total,4);assert.equal(story.comparable,2);assert.equal(story.previousYear,2021);
  const groups=new Map(story.groups.map(g=>[g.id,g]));
  assert.equal(groups.get('party-7')!.count,1);assert.equal(groups.get('party-7')!.delta,1);
  assert.equal(groups.get('party-52')!.count,1);assert.equal(groups.get('party-52')!.delta,-1,'A new unmatched council is not an invented gain');
  assert.equal(groups.get('no-majority')!.delta,0);
  assert.deepEqual(groups.get('party-52')!.entries.map(e=>e.change).sort(),['lost','unknown']);
  assert.equal(groups.get('party-7')!.entries[0]!.change,'gained');
  assert.equal(groups.get('pending')!.entries[0]!.before?.party?.id,'7');
  assert.equal(groups.get('pending')!.delta,null);
  assert.equal(story.groups.reduce((n,g)=>n+g.count,0),4);
});

test('zero remaining majorities retain a loss, repeated councils count once, and province changes are not compared',()=>{
  const c=council('a',null), moved=council('moved','52','2');
  const story=councilOutcomeStory([c,c,moved],[council('a','7'),council('moved',null)],2021);
  assert.equal(story.total,2);assert.equal(story.previousYear,2016);assert.equal(story.comparable,1);
  const lost=story.groups.find(g=>g.id==='party-7')!;
  assert.equal(lost.count,0);assert.equal(lost.delta,-1);assert.deepEqual(lost.councils,[]);
  assert.equal(lost.entries[0]!.change,'lost');assert.equal(lost.entries[0]!.before?.party?.id,'7');assert.equal(lost.entries[0]!.council.outcome,'no-majority');
  assert.equal(councilOutcomeStory([c],[],2000).groups[0]!.delta,null);
});

function database() {
  const sql=new DatabaseSync(':memory:');
  for(const file of ['0001_results.sql','0003_compact_results.sql','0006_result_updates.sql']) sql.exec(readFileSync(new URL(`../migrations/${file}`,import.meta.url),'utf8'));
  const db={prepare(query:string){return{bind(...args:(number|string)[]){return{async all(){return{results:sql.prepare(query).all(...args)};}};}};}} as unknown as D1Database;
  const fixture=JSON.parse(readFileSync(new URL('./fixtures/buffalo-city-2021.json',import.meta.url),'utf8'));
  const add=(year:number,id='1117',province='1',kind='municipality')=>{
    const source=`${year}:${id}`, payload=structuredClone(fixture.results);
    if(year===2026)payload.parties=payload.parties.filter((p:{entry_type:string})=>p.entry_type!=='aggregate');
    sql.prepare("INSERT INTO source_documents(id,year,kind,area_id,url,active_snapshot_id,last_checked_at) VALUES(?,?,?,?,'https://example.org',?,'2026-11-07')").run(source,year,kind,id,`${year}:active`);
    for(const snapshot of ['active','stale']) sql.prepare("INSERT INTO area_results(snapshot_id,source_id,year,level,area_id,province_id,municipality_id,name,reported_at,payload) VALUES(?,?,?,'municipality',?,?,?,'BUF - Buffalo City','2026-11-07',?)").run(`${year}:${snapshot}`,source,year,id,province,id,snapshot==='active'?JSON.stringify(payload):'{}');
  };
  return {sql,db,add};
}

test('active historic allocations and source scope drive counts and year-correct drill-down links',async()=>{
  const {sql,db,add}=database();try {
    add(2021);add(2026);add(2026,'not-a-council','1','summary');add(2026,'9006','9');
    const story=(await readCouncilOutcomeStory(db,undefined,2026,'1'))!;
    assert.equal(story.total,places.filter(p=>(p.kind==='metro'||p.kind==='municipality')&&p.province==='Eastern Cape').length);
    assert.equal(story.comparable,1);
    const anc=story.groups.find(g=>g.id==='party-7')!;
    assert.equal(anc.count,1);assert.equal(anc.delta,0);assert.equal(anc.councils[0]!.href,'/2026/places/buffalo-city');
    assert(!story.groups.flatMap(g=>g.councils).some(c=>c.id==='9006'||c.id==='not-a-council'));
    const historic=(await readCouncilOutcomeStory(db,undefined,2021,'1'))!;
    assert.equal(historic.total,1,'Current council roster must not be imposed on an older election');
    assert.equal(historic.groups[0]!.count,1,'Archived OTHER rows do not hide a valid reported majority');
    assert.equal(historic.groups[0]!.councils[0]!.href,'/2021/places/buffalo-city');
    assert.equal(historic.groups[0]!.delta,null);
  } finally {sql.close();}
});

test('packed outcomes require the active snapshot and missing allocations remain pending',async()=>{
  const {sql,db,add}=database();try {
    add(2026);
    sql.prepare("INSERT INTO result_bundles VALUES('2026:1117','2026:active','packed',NULL,NULL,100,1,'hash','{}')").run();
    const milestone={kind:'council_decided',areaId:'1117',totalSeats:4,majority:3,seats:[{id:'7',name:'ANC',count:3},{id:'52',name:'DA',count:1}]};
    sql.prepare("INSERT INTO result_update_state VALUES('2026:1117','2026:active',?,'2026-11-07','2026-11-07')").run(JSON.stringify({'council:1117':milestone}));
    const story=(await readCouncilOutcomeStory(db,undefined,2026,'1'))!;
    assert.equal(story.groups.find(g=>g.id==='party-7')!.count,1);
    sql.exec("UPDATE result_update_state SET snapshot_id='stale'");
    const missing=(await readCouncilOutcomeStory(db,undefined,2026,'1'))!;
    assert.equal(missing.groups.length,1);assert.equal(missing.groups[0]!.id,'pending');assert.equal(missing.groups[0]!.count,missing.total);
  } finally {sql.close();}
});
