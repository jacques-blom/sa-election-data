import test from 'node:test';
import assert from 'node:assert/strict';
import { searchLocalAreas } from '../src/lib/address/local-search.ts';
import { findPlace } from '../src/lib/places/catalogue.ts';
const unavailable={prepare(){throw new Error('Directory unavailable');}} as unknown as D1Database;
const directory=(places:unknown[])=>({prepare(){return{bind(){return{async all(){return{results:places.map(p=>({payload:JSON.stringify(p)}))};},async first(){return{n:places.length};}};}};}}) as unknown as D1Database;
test('town search resolves Calvinia directly to its municipality-led place story',async()=>{
 const results=await searchLocalAreas(directory([findPlace('calvinia')!]),'Calvinia');
 assert.equal(results[0]?.url,'/2026/places/calvinia');assert.equal(results[0]?.kind,'town');
});
test('search retains curated towns and official wards when the directory is unavailable',async()=>{
 assert.equal((await searchLocalAreas(unavailable,'Calvinia'))[0]?.url,'/2026/places/calvinia');
 assert((await searchLocalAreas(unavailable,'Ward 1 Hantam')).every(r=>r.kind==='ward'));
});
test('named places respect the current map scope and duplicate councils appear once',async()=>{
 const town={...findPlace('calvinia')!,bbox:[19,-32,20,-31]};
 assert.equal((await searchLocalAreas(directory([town]),'Calvinia',[25,-30,27,-28])).length,0);
 const council=findPlace('hantam')!;
 const matches=await searchLocalAreas(directory([council]),'Hantam');
 assert.equal(matches.filter(r=>r.url==='/2026/places/hantam').length,1);
});
