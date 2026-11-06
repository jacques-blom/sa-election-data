import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { provinces,provinceUrl } from '../lib/overview/results.ts';
import { joinedResults } from '../lib/data/packed-results.ts';
import { districts,districtUrl } from '../lib/maps/districts.ts';
const escape=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export const GET:APIRoute=async({url})=>{
 try{
 const [places,wards]=await Promise.all([
 (env.GEOGRAPHY_DB??env.RESULTS_DB).prepare('SELECT slug FROM place_directory WHERE indexable=1 ORDER BY slug').all<{slug:string}>(),
 env.RESULTS_DB.prepare(`SELECT r.area_id ${joinedResults} WHERE r.year=2026 AND r.level='ward' ORDER BY r.area_id`).all<{area_id:string}>(),
 ]);
 const paths=['/','/updates','/api','/map','/find-address',...provinces.map(p => provinceUrl(p)),...districts.map(districtUrl),...places.results.map(p=>'/2026/places/'+p.slug),...wards.results.map(w=>'/2026/wards/'+w.area_id)];
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(paths)].map(path=>`<url><loc>${escape(new URL(path,url.origin).href)}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=300, s-maxage=300'}});
 }catch{return new Response('Sitemap temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store','Retry-After':'60'}});}
};
