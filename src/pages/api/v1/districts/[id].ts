import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createHash } from 'node:crypto';
import { findDistrict } from '../../../../lib/maps/districts.ts';
import { getDistrictResult } from '../../../../lib/districts/results.ts';

const cors = {'Access-Control-Allow-Origin':'*','Access-Control-Expose-Headers':'ETag',
  'Access-Control-Allow-Methods':'GET, HEAD, OPTIONS','Access-Control-Allow-Headers':'If-None-Match'};
export const OPTIONS: APIRoute = () => new Response(null,{status:204,headers:cors});
export const GET: APIRoute = async ({params,request}) => {
  const headers = {...cors,'Cache-Control':'no-store'};
  const district = findDistrict(params.id ?? '');
  if (!district) return Response.json({error:'District not found'},{status:404,headers});
  try {
    const data = await getDistrictResult(env.RESULTS_DB,district.id);
    if (!data) return Response.json({error:'District results unavailable'},{status:503,headers});
    const body = JSON.stringify({...data,district:{id:district.id,name:district.name,province:district.province},
      status:'provisional',scope:'directly_elected_40_percent',countingProgress:null,councilControl:null});
    const etag = `"${createHash('sha256').update(body).digest('hex')}"`;
    const responseHeaders = {...headers,'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=15, s-maxage=15',ETag:etag};
    if (request.headers.get('If-None-Match')?.split(',').some(tag => tag.trim().replace(/^W\//,'') === etag || tag.trim() === '*')) return new Response(null,{status:304,headers:responseHeaders});
    return new Response(body,{headers:responseHeaders});
  } catch (error) {
    console.error('District API unavailable',error);
    return Response.json({error:'District results unavailable'},{status:503,headers});
  }
};
