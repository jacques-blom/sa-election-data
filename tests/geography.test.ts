import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { pointInGeometry } from '../src/lib/maps/geometry.ts';
import { placeSearchExpression,searchDirectory } from '../src/lib/places/directory.ts';
import type { Polygon,MultiPolygon } from 'geojson';
const polygon:Polygon={type:'Polygon',coordinates:[[[0,0],[5,0],[5,5],[0,5],[0,0]],[[1,1],[2,1],[2,2],[1,2],[1,1]]]};
test('ward containment excludes holes and exterior, includes edges and multipart areas',()=>{
 assert.equal(pointInGeometry([3,3],polygon),true);
 assert.equal(pointInGeometry([1.5,1.5],polygon),false);
 assert.equal(pointInGeometry([0,3],polygon),true);
 assert.equal(pointInGeometry([2,1.5],polygon),true);
 assert.equal(pointInGeometry([6,3],polygon),false);
 const multi:MultiPolygon={type:'MultiPolygon',coordinates:[polygon.coordinates,[[[10,10],[12,10],[12,12],[10,12],[10,10]]]]};
 assert.equal(pointInGeometry([11,11],multi),true);assert.equal(pointInGeometry([8,8],multi),false);
});
test('place search disambiguates province and treats FTS punctuation as text',async()=>{
 const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('../migrations/0004_geography.sql',import.meta.url),'utf8'));
 const rows=[{id:'1',name:'Springfield',province:'Gauteng',aliases:['Old Town']},{id:'2',name:'Springfield',province:'Western Cape',aliases:[]}];
 for(const p of rows)sql.prepare('INSERT INTO place_directory(id,slug,name,aliases,province,municipality,kind,indexable,payload) VALUES(?,?,?,?,?,?,?,?,?)').run(p.id,'place-'+p.id,p.name,p.aliases.join(' '),p.province,'','town',1,JSON.stringify(p));
 sql.exec("INSERT INTO place_search(place_search) VALUES('rebuild')");
 const db={prepare(q:string){return{bind(...args:(string|number)[]){return{async all(){return{results:sql.prepare(q).all(...args)};},async first(){return sql.prepare(q).get(...args);}};}};}} as unknown as D1Database;
 try{assert.equal((await searchDirectory(db,'Springfield')).total,2);assert.equal((await searchDirectory(db,'Springfield Gauteng')).places[0]?.id,'1');assert.equal((await searchDirectory(db,'Old Town')).places[0]?.id,'1');assert.equal((await searchDirectory(db,'" OR *')).total,0);assert.equal(placeSearchExpression('Kaápstad'),'"kaapstad"*');}finally{sql.close();}
});
