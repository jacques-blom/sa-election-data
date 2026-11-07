import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';
import { resultFromRow } from '../src/lib/places/results.ts';
import { electionCouncilSeats } from '../src/lib/history/seats.ts';
import { initialHistoryMetric } from '../src/lib/history/chart.ts';
import { setupVoteHistory } from '../src/lib/history/trend-client.ts';
import { councilShareCard } from '../src/lib/sharing/council.ts';
import { imageDescription } from '../src/lib/sharing/model.ts';

const fixture=JSON.parse(readFileSync(new URL('./fixtures/buffalo-city-2021.json',import.meta.url),'utf8'));
function result(year=2021){
  return resultFromRow({year,level:'municipality',area_id:'1117',municipality_id:'1117',name:fixture.area.name,payload:JSON.stringify(fixture.results),snapshot_id:String(year),url:fixture.source.url,reported_at:fixture.source.area_reported_at,last_checked_at:fixture.source.last_checked_at,last_success_at:fixture.source.last_successful_check_at,last_error:null});
}

test('municipal history starts on available seats, respects vote links and falls back for other scopes',()=>{
  assert.equal(initialHistoryMetric('municipality',true,null),'seats');
  assert.equal(initialHistoryMetric('municipality',true,'votes'),'votes');
  assert.equal(initialHistoryMetric('municipality',false,'seats'),'votes');
  assert.equal(initialHistoryMetric('municipality',true,'invalid'),'seats');
  for(const level of ['ward','voting-district','province','national'])assert.equal(initialHistoryMetric(level,true,null),'votes');
});

test('council shares include every seat, label seats instead of votes and do not claim a government agreement',()=>{
  const card=councilShareCard(result(),'Buffalo City')!;
  assert.equal(card.kind,'result');assert.equal(card.total,100);assert.equal(card.metric,'51');
  assert.equal(card.parties.reduce((sum,p)=>sum+p.value!,0),100);
  assert.equal(card.council!.groups.reduce((sum,p)=>sum+p.seats,0),100);
  assert(card.council!.groups.every(p=>p.selected));
  assert(card.parties.every(p=>p.share===null));
  assert.match(card.caption,/does not confirm a governing agreement/);
  assert.match(imageDescription(card),/100 council seats/);
  assert.doesNotMatch(imageDescription(card),/valid ballots|hypothetical|\d+ votes/i);
  assert.match(card.note,/Historical/);
  assert.match(councilShareCard(result(2026),'Buffalo City',electionCouncilSeats(result()))!.note,/Provisional/);
});

test('missing seats produce no invented graphic; estimates remain labelled estimates',()=>{
  const r=result();r.results.progress.seats=null;
  assert.equal(councilShareCard(r,'Buffalo City'),null);
  const seats=electionCouncilSeats(result());assert.notEqual(seats.status,'unavailable');
  if(seats.status==='unavailable')return;
  const card=councilShareCard(result(2026),'Buffalo City',{...seats,status:'estimated'})!;
  assert.match(card.headline,/estimated/);assert.match(card.note,/Estimated seats/);assert.match(card.ballot,/estimated/);
});

test('history controls update the title and recover when a new election has no seat panel',()=>{
  const w=new Window({url:'https://counted.co.za/2026/places/test'}),d=w.document as unknown as Document;
  d.body.innerHTML='<section data-vote-history data-default-year="2026" data-default-metric="seats"><h2 data-trend-title></h2><button data-share-history></button><span data-trend-seat-key></span><button data-trend-year="2026"></button><button data-trend-metric="seats"></button><button data-trend-metric="votes"></button><div data-trend-metric-panel="seats"></div><div data-trend-metric-panel="votes"></div></section>';
  const chart=d.querySelector<HTMLElement>('[data-vote-history]')!;
  setupVoteHistory(d);
  assert.equal(d.querySelector('[data-trend-title]')!.textContent,'How the council changed');
  assert.equal(d.querySelector('[data-share-history]')!.getAttribute('aria-label'),'Share how the council changed');
  d.querySelector<HTMLButtonElement>('[data-trend-metric="votes"]')!.click();
  assert.equal(d.querySelector('[data-trend-title]')!.textContent,'How the vote changed');
  assert.equal(d.querySelector<HTMLElement>('[data-trend-seat-key]')!.hidden,true);
  setupVoteHistory(d);assert.equal(chart.dataset.selectedMetric,'votes');
  d.querySelector<HTMLButtonElement>('[data-trend-metric="seats"]')!.click();
  chart.dataset.defaultMetric='votes';d.querySelector('[data-trend-metric-panel="seats"]')!.remove();
  d.querySelectorAll('[data-trend-metric]').forEach(b=>b.remove());
  setupVoteHistory(d);assert.equal(chart.dataset.selectedMetric,'votes');
  assert.equal(d.querySelector<HTMLElement>('[data-trend-metric-panel="votes"]')!.hidden,false);
  w.close();
});
