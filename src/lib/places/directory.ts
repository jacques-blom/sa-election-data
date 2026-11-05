import { findPlace, searchPlaces, type Place } from './catalogue.ts';
export function placeSearchExpression(query: string) {
  const words = query.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean).slice(0,8);
  return words.map(word => `"${word}"*`).join(' AND ');
}
export async function findDirectoryPlace(db: D1Database, slug: string): Promise<Place | undefined> {
  const row = await db.prepare('SELECT payload FROM place_directory WHERE slug=?').bind(slug).first<{payload:string}>();
  return row ? JSON.parse(row.payload) as Place : findPlace(slug);
}
export async function searchDirectory(db: D1Database, query: string, limit=40, offset=0) {
  const expression = placeSearchExpression(query.slice(0,100));
  const pageSize = Math.min(60,Math.max(1,limit));
  if (!expression) {const metros=searchPlaces('').filter(p=>p.kind==='metro');return {places:metros.slice(offset,offset+pageSize),total:metros.length};}
  const [rows,count] = await Promise.all([
    db.prepare(`SELECT p.payload FROM place_search s JOIN place_directory p ON p.rowid=s.rowid
      WHERE place_search MATCH ? ORDER BY bm25(place_search,8,6,1,2),p.name,p.province LIMIT ? OFFSET ?`).bind(expression,pageSize,Math.max(0,Math.min(offset,20000))).all<{payload:string}>(),
    db.prepare('SELECT count(*) AS n FROM place_search WHERE place_search MATCH ?').bind(expression).first<{n:number}>(),
  ]);
  return { places: rows.results.map(r=>JSON.parse(r.payload) as Place), total: count?.n ?? 0 };
}
