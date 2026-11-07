import { searchElectionAreas } from './election-search.ts';
import { searchDirectory } from '../places/directory.ts';
import { searchPlaces,placeUrl } from '../places/catalogue.ts';
import { rankPlaceSuggestions } from '../places/suggestions.ts';
import type { ResolvedArea } from './selection.ts';
const normal=(s:string)=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

/** Named places and electoral areas share one destination picker. No address is stored. */
export async function searchLocalAreas(db:D1Database,query:string,bbox?:[number,number,number,number]):Promise<ResolvedArea[]> {
  const areas=searchElectionAreas(query,bbox);
  if(/\bward\s*\d|^\d{8}$|\bdistrict\b|^dc\s*\d/i.test(query))return areas;
  const directory=await searchDirectory(db,query,60).catch(()=>({places:searchPlaces(query),total:0}));
  const named=rankPlaceSuggestions(query,directory.places).filter(p=>!bbox||p.bbox&&p.bbox[0]<=bbox[2]&&p.bbox[2]>=bbox[0]&&p.bbox[1]<=bbox[3]&&p.bbox[3]>=bbox[1]).map(p=>({
    id:p.id,name:p.name,kind:p.kind,url:placeUrl(p),description:`${p.kind==='town'?'Town':p.kind==='suburb'?'Suburb':p.kind==='metro'?'Metro':'Municipality'} · ${p.municipalityName&&p.municipalityName!==p.name?p.municipalityName:p.province}`,
    bbox:p.bbox,geometry:p.geometry,
  }));
  const q=normal(query),rank=(a:ResolvedArea)=>normal(a.name)===q?0:normal(a.name).startsWith(q)?1:2;
  return [...new Map([...areas,...named].map(area=>[area.url,area])).values()]
    .sort((a,b)=>rank(a)-rank(b)).slice(0,8);
}
