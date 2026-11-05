import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { readGeometry,type GeometryRow } from '../../../../../lib/maps/geometry.ts';
export const GET:APIRoute=async({params})=>{
  if(!['town','municipality','province','ward','voting-district'].includes(params.level??'')||!/^\d+$/.test(params.id??''))return new Response('Unknown geometry',{status:404});
  try {
    const row=await (env.GEOGRAPHY_DB??env.RESULTS_DB).prepare('SELECT * FROM map_geometries WHERE level=? AND id=?').bind(params.level,params.id).first<GeometryRow>();
    if(!row)return new Response('Unknown geometry',{status:404});
    return Response.json(await readGeometry(env.MAP_TILES,row),{headers:{'Content-Type':'application/geo+json','Cache-Control':'public, max-age=86400','ETag':`"${row.object_key}:${row.byte_offset}:${row.byte_length}"`,'Access-Control-Allow-Origin':'*'}});
  }catch(error){console.error('Geometry unavailable',error);return new Response('Geometry temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store'}});}
};
