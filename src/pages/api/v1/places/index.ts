import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { searchDirectory } from '../../../../lib/places/directory.ts';
import { placeUrl } from '../../../../lib/places/catalogue.ts';
export const GET:APIRoute=async({url})=>{
 const query=(url.searchParams.get('q')??'').slice(0,100);
 const page=Math.max(1,Math.min(334,Number.parseInt(url.searchParams.get('page')??'1',10)||1));
 try{const data=await searchDirectory(env.GEOGRAPHY_DB??env.RESULTS_DB,query,60,(page-1)*60);return Response.json({query,page,pageSize:60,total:data.total,places:data.places.map(p=>({id:p.id,slug:p.slug,name:p.name,kind:p.kind,province:p.province,municipality:p.municipalityName,bbox:p.bbox,url:placeUrl(p)}))},{headers:{'Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=300'}});}
 catch{return Response.json({error:'Area search is temporarily unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});}
};
