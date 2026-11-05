import {readFile,open} from 'node:fs/promises';
import {getPlatformProxy} from 'wrangler';
import {ADMIN_KEY,VD_KEY} from '../../src/lib/maps/config.ts';
import type {Place} from '../../src/lib/places/types.ts';
const seed=JSON.parse(await readFile('.data/geography/directory-seed.json','utf8')) as {places:Place[];geometries:(string|number)[][]};
const proxy=await getPlatformProxy<Env>({configPath:'wrangler.jsonc',persist:{path:'.wrangler/state/v3'},remoteBindings:false});
try{
 // Upload immutable objects before any directory row starts referencing them.
 const keys=[...new Set(seed.geometries.map(row=>String(row[6]))),ADMIN_KEY,VD_KEY];
 for(const key of keys){
  const file=await open(`.data/maps/${key}`,'r');
  const upload=await proxy.env.MAP_TILES.createMultipartUpload(key,{httpMetadata:{contentType:'application/octet-stream'}});
  try{
   const {size}=await file.stat();const parts:R2UploadedPart[]=[];
   for(let offset=0;offset<size;offset+=8*1024*1024){const buffer=Buffer.alloc(Math.min(8*1024*1024,size-offset));let read=0;while(read<buffer.length){const r=await file.read(buffer,read,buffer.length-read,offset+read);if(!r.bytesRead)throw new Error('Unexpected end of file');read+=r.bytesRead;}parts.push(await upload.uploadPart(parts.length+1,buffer));}
   await upload.complete(parts);console.log('Loaded',key,size);
  }catch(error){await upload.abort();throw error;}finally{await file.close();}
 }
 const db=proxy.env.RESULTS_DB;
 const migration=await readFile('migrations/0004_geography.sql','utf8');
 for(const statement of migration.replace(/^--.*$/gm,'').split(';').map(s=>s.trim()).filter(Boolean))await db.prepare(statement).run();
 // Ten rows per statement stay below D1's 100-bind-variable limit.
 for(let start=0;start<seed.places.length;start+=250){
  const batch:D1PreparedStatement[]=[];
  for(let offset=start;offset<Math.min(start+250,seed.places.length);offset+=10){
   const rows=seed.places.slice(offset,Math.min(offset+10,start+250)).map(p=>[p.id,p.slug,p.name,p.aliases.join(' '),p.province,p.municipalityName??'',p.kind,p.indexable?1:0,JSON.stringify(p)]);
   batch.push(db.prepare(`INSERT INTO place_directory(id,slug,name,aliases,province,municipality,kind,indexable,payload) VALUES ${rows.map(()=>'(?,?,?,?,?,?,?,?,?)').join(',')}
    ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,name=excluded.name,aliases=excluded.aliases,province=excluded.province,municipality=excluded.municipality,kind=excluded.kind,indexable=excluded.indexable,payload=excluded.payload`).bind(...rows.flat()));
  }
  await db.batch(batch);if(start%1000===0)console.log('Places',start,'/',seed.places.length);
 }
 await db.prepare("INSERT INTO place_search(place_search) VALUES('rebuild')").run();
 for(let start=0;start<seed.geometries.length;start+=1000){
  const batch:D1PreparedStatement[]=[];
  for(let offset=start;offset<Math.min(start+1000,seed.geometries.length);offset+=10){const rows=seed.geometries.slice(offset,Math.min(offset+10,start+1000));batch.push(db.prepare(`INSERT OR REPLACE INTO map_geometries(level,id,minx,miny,maxx,maxy,object_key,byte_offset,byte_length) VALUES ${rows.map(()=>'(?,?,?,?,?,?,?,?,?)').join(',')}`).bind(...rows.flat()));}
  await db.batch(batch);if(start%2000===0)console.log('Geometries',start,'/',seed.geometries.length);
 }
 console.log('Loaded',seed.places.length,'places and',seed.geometries.length,'geometries');
}finally{await proxy.dispose();}
