import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';
import { resultFromRow } from '../src/lib/places/results.ts';
import { electionTrends } from '../src/lib/history/trends.ts';
import { setupVoteHistory } from '../src/lib/history/trend-client.ts';
import { historyShareCard, selectHistoryShareCard } from '../src/lib/sharing/history.ts';
import { imageDescription, publicShareUrl } from '../src/lib/sharing/model.ts';

const fixture=JSON.parse(readFileSync(new URL('./fixtures/buffalo-city-2021.json',import.meta.url),'utf8'));
function result(year:number) {
  return resultFromRow({year,level:'municipality',area_id:'1117',municipality_id:'1117',name:fixture.area.name,payload:JSON.stringify(fixture.results),snapshot_id:`${year}`,url:fixture.source.url,reported_at:fixture.source.area_reported_at,last_checked_at:fixture.source.last_checked_at,last_success_at:fixture.source.last_successful_check_at,last_error:null});
}

test('history exports preserve missing years, the whole council and the selected party without mutating the base',()=>{
  const old=result(2016);old.results.progress.seats=null;
  const history=electionTrends([old,result(2021),result(2026)],{level:'municipality',id:'1117',through:2026});
  const base=historyShareCard(history,'seats','Buffalo City');
  const card=selectHistoryShareCard(base,{year:2021,party:'52'});
  assert.equal(card.history!.year,2021);assert.equal(card.history!.party,'52');
  assert.equal(base.history!.year,2026);assert.equal(base.history!.party,null);
  assert.equal(card.history!.chart.columns[0]!.available,false);
  const column=card.history!.chart.columns.find(c=>c.year===2021)!;
  assert.equal(column.segments.reduce((sum,p)=>sum+(p.value??0),0),column.total);
  assert(column.segments.some(p=>p.id==='remainder'));
  assert.match(card.caption,/2021: DA: \d+ seats/);
  assert.match(card.note,/2026 provisional/);
  assert.match(imageDescription(card),/2016: Unavailable/);
  assert.doesNotMatch(imageDescription(card),/AFRICAN NATIONAL CONGRESS|valid ballots|districts reporting/);
  assert.match(imageDescription(card),/DEMOCRATIC ALLIANCE \d+ seats/);
  const invalid=selectHistoryShareCard(base,{year:2099,party:'unknown'});
  assert.equal(invalid.history!.year,2026);assert.equal(invalid.history!.party,null);
});

test('shared history links restore public choices and exclude addresses or invalid selections',()=>{
  const url=publicShareUrl('http://localhost:4321/2026/places/test?metric=seats&party=52&history-year=2021&ballot=ward&council=1117&q=private&address=private&lat=-33#private');
  const shared=new URL(url);
  assert.equal(shared.origin,'https://counted.co.za');
  assert.equal(shared.hash,'');
  assert.deepEqual(Object.fromEntries(shared.searchParams),{ballot:'ward',council:'1117',metric:'seats',party:'52','history-year':'2021'});
  assert.equal(publicShareUrl('https://counted.co.za/?metric=seats&party=private&history-year=2099'), 'https://counted.co.za/?metric=seats');
  assert.equal(publicShareUrl('https://counted.co.za/search?history-year=2021&metric=seats&party=52'), 'https://counted.co.za/search');
});

test('deep-linked inspection survives a refresh and follows the new election when switching years',()=>{
  const w=new Window({url:'https://counted.co.za/2026/places/test?metric=seats&history-year=2021&party=52'}), d=w.document as unknown as Document;
  d.body.innerHTML='<section data-vote-history data-default-year="2026" data-inspect-year="2021" data-default-metric="seats" data-default-party="52"><button data-trend-year="2021"></button><button data-trend-year="2026"></button><button data-trend-metric="votes"></button><button data-trend-metric="seats"></button><button data-trend-party="52"></button><div data-trend-panel="seats:2021"></div><div data-trend-panel="seats:2026"></div></section>';
  setupVoteHistory(d);
  const chart=d.querySelector<HTMLElement>('[data-vote-history]')!;
  assert.equal(chart.dataset.selectedYear,'2021');assert.equal(chart.dataset.selectedMetric,'seats');assert.equal(chart.dataset.selectedParty,'52');
  d.querySelector<HTMLButtonElement>('[data-trend-year="2026"]')!.click();
  setupVoteHistory(d);
  assert.equal(chart.dataset.selectedYear,'2026');assert.equal(new URL(w.location.href).searchParams.get('history-year'),null);
  chart.dataset.defaultYear='2021';setupVoteHistory(d);
  assert.equal(chart.dataset.selectedYear,'2021');assert.equal(chart.dataset.selectedMetric,'seats');
  assert.equal(d.querySelector<HTMLElement>('[data-trend-panel="seats:2021"]')!.hidden,false);
  w.close();
});
