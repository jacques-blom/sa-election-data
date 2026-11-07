import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resultFromRow, type Result } from '../src/lib/places/results.ts';
import { electionTrends } from '../src/lib/history/trends.ts';
import { historyChart } from '../src/lib/history/chart.ts';
import { historyShareCard, selectHistoryShareCard } from '../src/lib/sharing/history.ts';

const fixture=JSON.parse(readFileSync(new URL('./fixtures/buffalo-city-2021.json',import.meta.url),'utf8'));
const before=[40,25,12,8,7,1,3,2,2];
const after=[36,25,12,8,7,3,0.5,3.5,5];
function result(year:number,shares:number[],level:Result['level']='municipality'):Result {
  const r=resultFromRow({year,level,area_id:'1117',municipality_id:'1117',name:fixture.area.name,
    payload:JSON.stringify(fixture.results),snapshot_id:String(year),url:fixture.source.url,
    reported_at:fixture.source.area_reported_at,last_checked_at:fixture.source.last_checked_at,
    last_success_at:fixture.source.last_successful_check_at,last_error:null});
  const seed=r.results.parties[0]!;
  r.results.parties=shares.map((share,index)=>({...structuredClone(seed),source_entry_id:String(index+1),
    party_id:String(index+1),party_name:`Party ${index+1}`,votes:{source_total:share*100,ward:share*100,pr:0}}));
  const remaining=100-shares.reduce((sum,value)=>sum+value,0);
  if(remaining>0) r.results.parties.push({...structuredClone(seed),source_entry_id:'other',party_id:'-2',
    party_name:'OTHER',entry_type:'aggregate',votes:{source_total:remaining*100,ward:remaining*100,pr:0}});
  r.results.reported_totals.valid_ballot_papers=10000;
  r.results.progress.seats=null;
  return r;
}
function history(results:Result[]) {
  return electionTrends(results,{level:results[0]!.level,id:'1117',through:results.at(-1)!.year});
}

test('every vote history names additional big gainers and coalesces smaller gains and losses',()=>{
  for(const level of ['national','province','municipality','ward','voting-district'] as const) {
    const h=history([result(2021,before,level),result(2026,after,level)]);
    const chart=historyChart(h,'votes'),rows=chart.readouts[1]!.values;
    assert.deepEqual(h.defaultPartyIds,['1','2','3','4','5']);
    assert.deepEqual(rows.map(p=>p.id),['1','2','3','4','5','9','6','remainder']);
    assert.equal(rows.find(p=>p.id==='6')!.delta,2,'Exactly 2 pp qualifies');
    assert.equal(rows.find(p=>p.id==='9')!.delta,3);
    assert.equal(rows.at(-1)!.value,4);
    assert.equal(rows.at(-1)!.delta,-1);
    assert.equal(rows.reduce((sum,p)=>sum+p.value,0),100);
    assert.equal(rows.reduce((sum,p)=>sum+p.delta!,0),0);
    assert.deepEqual(chart.series.map(p=>p.id),h.defaultPartyIds,'The chart retains its stable party legend');
  }
});

test('gainers are selected for the inspected election and never compared across missing years',()=>{
  const chart=historyChart(history([result(2016,before),result(2021,after),result(2026,after)]),'votes');
  assert.equal(chart.readouts[0]!.values.some(p=>p.id==='6'),false);
  assert.equal(chart.readouts[1]!.values.some(p=>p.id==='6'),true);
  assert.equal(chart.readouts[2]!.values.some(p=>p.id==='6'),false);
  const gap=historyChart(history([result(2016,before),result(2026,after)]),'votes');
  assert.deepEqual(gap.readouts[1]!.values,[]);
  assert.equal(gap.readouts[2]!.values.some(p=>p.id==='6'),false);
  assert(gap.readouts[2]!.values.every(p=>p.delta===null));
});

test('unknown baselines remain grouped while a complete party list can establish a new gain',()=>{
  const old=result(2021,before),current=result(2026,after);
  const omitted=old.results.parties.splice(5,1)[0]!;
  old.results.parties[0]!.votes.source_total!+=omitted.votes.source_total!;
  let chart=historyChart(history([old,current]),'votes');
  assert.equal(chart.readouts[1]!.values.find(p=>p.id==='6')?.delta,3);
  old.results.parties[0]!.votes.source_total!-=omitted.votes.source_total!;
  old.results.parties.push({...omitted,party_id:'-2',party_name:'OTHER',entry_type:'aggregate'});
  chart=historyChart(history([old,current]),'votes');
  assert.equal(chart.readouts[1]!.values.some(p=>p.id==='6'),false);
  assert.equal(chart.readouts[1]!.values.at(-1)!.value,7);
});

test('Other compares the same remaining parties when a source stops listing historical leaders',()=>{
  const chart=historyChart(history([result(2021,[50,20,5,10,5]),result(2026,[42,22])]),'votes');
  const rows=chart.readouts[1]!.values;
  assert.deepEqual(rows.map(p=>p.id),['1','2','remainder']);
  assert.equal(rows.at(-1)!.value,36);
  assert.equal(rows.at(-1)!.delta,6,'Compare against 30% for everyone except parties 1 and 2');
});

test('Other has no invented delta when a named party has an unknown baseline',()=>{
  const chart=historyChart(history([result(2021,[60,20]),result(2026,[50,20,10])]),'votes');
  assert.equal(chart.readouts[1]!.values.at(-1)!.id,'remainder');
  assert.equal(chart.readouts[1]!.values.at(-1)!.delta,null);
});

test('a remainder falling to zero is still listed with its loss',()=>{
  const chart=historyChart(history([result(2021,[60,20]),result(2026,[70,30])]),'votes');
  assert.equal(chart.readouts[1]!.values.at(-1)!.value,0);
  assert.equal(chart.readouts[1]!.values.at(-1)!.delta,-20);
});

test('shared captions include the selected year’s gainers and remaining Other total',()=>{
  const card=historyShareCard(history([result(2021,before),result(2026,after)]),'votes','Test');
  assert.match(card.caption,/Party 9: 5.0% · Party 6: 3.0% · Other: 4.0%/);
  const old=selectHistoryShareCard(card,{year:2021,party:null});
  assert.doesNotMatch(old.caption,/Party 6:/);
  assert.match(old.caption,/Other: 8.0%/);
});
