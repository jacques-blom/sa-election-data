import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { readGeometry,pointInGeometry,type GeometryRow } from '../../lib/maps/geometry.ts';
import { findMapWard } from '../../lib/maps/ward-catalogue.ts';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex'};
export const POST:APIRoute=async({request,url})=>{
  if(request.headers.get('Origin') && request.headers.get('Origin')!==url.origin)return Response.json({error:'Invalid origin'},{status:403,headers});
  if(Number(request.headers.get('Content-Length')??0)>1000)return Response.json({error:'Request too large'},{status:413,headers});
  try {
    const reader=request.body?.getReader();const chunks:Uint8Array[]=[];let length=0;
    if(reader)while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>1000){await reader.cancel();return Response.json({error:'Request too large'},{status:413,headers});}chunks.push(value);}
    const body=Buffer.concat(chunks).toString('utf8');
    const parsed=JSON.parse(body);const {lng,lat}=parsed??{};
    if(typeof lng!=='number'||typeof lat!=='number'||!Number.isFinite(lng)||!Number.isFinite(lat)||lng<16||lng>33||lat< -35||lat> -22)return Response.json({error:'Location is outside our South African coverage'},{status:400,headers});
    const rows=await (env.GEOGRAPHY_DB??env.RESULTS_DB).prepare("SELECT * FROM map_geometries WHERE level='ward' AND minx<=? AND maxx>=? AND miny<=? AND maxy>=? LIMIT 101").bind(lng,lng,lat,lat).all<GeometryRow>();
    if(rows.results.length>100)throw new Error("Candidate limit exceeded");
    const matches=[];
    for(const row of rows.results){const feature=await readGeometry(env.MAP_TILES,row);if(pointInGeometry([lng,lat],feature.geometry)){const ward=findMapWard(row.id);if(ward)matches.push({...ward,url:`/2026/wards/${ward.id}`,geometryUrl:`/api/v1/geometry/ward/${ward.id}`});}}
    return Response.json({wards:matches,scope:'geographic_location_not_voter_registration'}, {headers});
  }catch(error){if(error instanceof SyntaxError)return Response.json({error:'Invalid location'},{status:400,headers});console.error('Ward location lookup unavailable');return Response.json({error:'Ward lookup is temporarily unavailable'},{status:503,headers});}
};
