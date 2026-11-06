import { findDirectoryPlace } from '../../../lib/places/directory.ts';
import type { APIRoute } from 'astro';
import { publicUrl } from '../../../lib/site.ts';
import { env } from 'cloudflare:workers';
import { placeUrl } from '../../../lib/places/catalogue.ts';
import { getPlaceResults, placeMarkdown } from '../../../lib/places/results.ts';
export const GET: APIRoute = async ({params}) => {
 try {const p=await findDirectoryPlace(env.GEOGRAPHY_DB??env.RESULTS_DB,params.slug??'');if(!p)return new Response('Place not found',{status:404});
 const data=await getPlaceResults(env.RESULTS_DB,p, env.RAW_RESULTS);return new Response(placeMarkdown(data),{status:data.municipality?200:503,headers:{'Content-Type':'text/markdown; charset=utf-8','Cache-Control':data.municipality?'public, max-age=15, s-maxage=15':'no-store','Access-Control-Allow-Origin':'*','X-Robots-Tag':'noindex',Link:`<${publicUrl(placeUrl(p))}>; rel="canonical"`}});}
 catch(e){console.error('Place Markdown unavailable',e);return new Response('Results temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store'}});}
};
