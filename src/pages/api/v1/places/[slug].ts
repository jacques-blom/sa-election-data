import { findDirectoryPlace } from '../../../../lib/places/directory.ts';
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

import { getPlaceResults } from '../../../../lib/places/results.ts';
export const GET: APIRoute = async ({params}) => {
 const headers = { 'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*' };
 try {const place = await findDirectoryPlace(env.GEOGRAPHY_DB??env.RESULTS_DB,params.slug ?? '');
 if(!place) return new Response(JSON.stringify({error:'Place not found'}),{status:404,headers});
 const data=await getPlaceResults(env.RESULTS_DB,place, env.RAW_RESULTS);return new Response(JSON.stringify(data),{status:data.municipality?200:503,headers:{...headers,'Cache-Control':data.municipality?'public, max-age=15, s-maxage=15':'no-store'}});}
 catch(e){console.error('Place API unavailable',e);return new Response(JSON.stringify({error:'Results temporarily unavailable'}),{status:503,headers:{...headers,'Cache-Control':'no-store'}});}
};
