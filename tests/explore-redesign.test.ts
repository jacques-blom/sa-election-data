import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';
import { resultFromRow, type Result } from '../src/lib/places/results.ts';
import { electionTrends,trendElection } from '../src/lib/history/trends.ts';
import { readElectionHistory } from '../src/lib/history/data.ts';
import { historyChart } from '../src/lib/history/chart.ts';
import { resultStory } from '../src/lib/history/story.ts';
import { selectionUrl,searchResultUrl } from '../src/lib/history/navigation.ts';
import { setupVoteHistory } from '../src/lib/history/trend-client.ts';
const fixture=JSON.parse(readFileSync(new URL('./fixtures/buffalo-city-2021.json',import.meta.url),'utf8'));
function result(year=2021):Result {
 return resultFromRow({year,level:'municipality',area_id:'1117',municipality_id:'1117',name:fixture.area.name,payload:JSON.stringify(fixture.results),snapshot_id:`${year}-page`,url:fixture.source.url,reported_at:fixture.source.area_reported_at,last_checked_at:fixture.source.last_checked_at,last_success_at:fixture.source.last_successful_check_at,last_error:null});
}
test('election bars include the full denominator and preserve unavailable seat years',()=>{
 const old=result(2016),current=result(); old.results.progress.seats=null;
 const h=electionTrends([old,current],{level:'municipality',id:'1117',through:2021});
 const votes=historyChart(h,'votes');
 for(const c of votes.columns)assert(Math.abs(c.segments.reduce((n,p)=>n+(p.value??0),0)-100)<1e-8);
 assert(votes.columns.at(-1)!.segments.some(s=>s.id==='remainder'));
 const seats=historyChart(h,'seats');assert.equal(seats.columns[0]!.available,false);assert.equal(seats.columns[0]!.segments.length,0);
 const latest=seats.columns.at(-1)!;assert.equal(latest.segments.reduce((n,p)=>n+(p.value??0),0),100);assert.equal(latest.majority,51);
});
test('outcome stories distinguish a gained majority, no majority and missing allocations',()=>{
 const r=result(); r.previous=result(2016);
 assert.equal(resultStory(r).title,'ANC retains its majority');
 const p=r.results.parties; const anc=p.find(p=>p.party_id==='7')!,da=p.find(p=>p.party_id==='52')!;
 // Move 12 PR seats while retaining a valid 100-seat allocation.
 anc.seats.pr!-=12;anc.seats.total!-=12;da.seats.pr!+=12;da.seats.total!+=12;
 assert.equal(resultStory(r).title,'ANC loses its majority');
 const gained=result();gained.previous=r;gained.previous.year=2016;
 assert.equal(resultStory(gained).title,'ANC gains an outright majority');
 r.results.progress.seats=null;assert.equal(resultStory(r).title,'ANC leads the vote');assert.equal(resultStory(r).after,null);
 r.results.parties=[];assert.equal(resultStory(r).title,'Council seats pending');
});
test('2026 seat headlines describe the allocation without claiming a new loss or retention of government',()=>{
 const current=result(2026);current.previous=result(2021);
 // The archive includes a zero-seat aggregate; live allocations require named rows.
 assert(current.results.parties.filter(p=>p.entry_type==='aggregate').every(p=>p.seats.total===0));
 current.results.parties=current.results.parties.filter(p=>p.entry_type!=='aggregate');
 assert.equal(resultStory(current).title,'ANC has an outright majority');
 const anc=current.results.parties.find(p=>p.party_id==='7')!,da=current.results.parties.find(p=>p.party_id==='52')!;
 anc.seats.pr!-=12;anc.seats.total!-=12;da.seats.pr!+=12;da.seats.total!+=12;
 const story=resultStory(current);
 assert.equal(story.title,'No party has a majority');
 assert.deepEqual(story.before,{year:2021,label:'ANC majority'});
 assert.deepEqual(story.after,{year:2026,label:'No majority'});
});
test('ward history uses a consistent combined ballot when archived ward ballots are absent',async()=>{
 const old=result(),current=result(2026);for(const r of [old,current]){r.level='ward';r.id='30605001';}
 current.previous=old;current.results.parties[0]!.candidate_name='A ward candidate';
 for(const p of current.results.parties){p.votes.ward=p.votes.source_total;p.votes.pr=0;}
 const db={prepare(){return{bind(){return{async all(){return{results:[]};}};}};}} as unknown as D1Database;
 const h=await readElectionHistory(db,undefined,{level:'ward',id:current.id,through:2026,current});
 assert.equal(h.basis,'source_total');assert.equal(h.reportedElections,2);
 assert.equal(h.series.find(p=>p.id==='7')?.points[1]?.share,h.series.find(p=>p.id==='7')?.points[0]?.share);
 current.results.parties[0]!.party_id='unknown-person';assert(!trendElection(current,'source_total').parties.some(p=>p.id==='unknown-person'));
});
test('exploration retains public choices and years without passing address text',()=>{
 const url=new URL('https://counted.co.za/2026/places/calvinia?party=7&metric=seats&q=private+address&lat=-33&council=6605');
 assert.equal(selectionUrl('/2021/wards/30605001',url),'/2021/wards/30605001?party=7&metric=seats');
 assert.equal(searchResultUrl('/2026/places/calvinia',2021,url),'/2021/places/calvinia?party=7&metric=seats');
 assert.equal(searchResultUrl('/',2016,url),'/2016?party=7&metric=seats');
 assert.equal(selectionUrl('https://external.example/hello',url),'https://external.example/hello');
});
test('history controls preserve measure across refreshes and inspect the new election after a year switch',()=>{
 const w=new Window({url:'https://counted.co.za/2026/places/calvinia'}),d=w.document as unknown as Document;
 d.body.innerHTML='<section data-vote-history data-default-year="2026"><button data-trend-year="2021"></button><button data-trend-year="2026"></button><button data-trend-metric="votes"></button><button data-trend-metric="seats"></button><div data-trend-metric-panel="votes"><div data-trend-panel="votes:2026"></div></div><div data-trend-metric-panel="seats"><div data-trend-panel="seats:2021"></div><div data-trend-panel="seats:2026"></div></div></section>';
 setupVoteHistory(d as unknown as Document);d.querySelector<HTMLButtonElement>('[data-trend-metric="seats"]')!.click();
 assert.equal(w.location.search,'?metric=seats');assert.equal(d.querySelector<HTMLElement>('[data-trend-panel="seats:2026"]')!.hidden,false);
 d.querySelector<HTMLElement>('[data-vote-history]')!.dataset.defaultYear='2021';setupVoteHistory(d as unknown as Document);
 assert.equal(d.querySelector<HTMLElement>('[data-trend-panel="seats:2021"]')!.hidden,false);assert.equal(d.querySelector<HTMLElement>('[data-trend-panel="seats:2026"]')!.hidden,true);
 w.close();
});
