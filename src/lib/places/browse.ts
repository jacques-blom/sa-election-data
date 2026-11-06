import { latestYear } from '../history/comparison.ts';
import { joinedResults } from '../data/packed-results.ts';
import type { Place } from './types.ts';

export const directoryPageSize = 60;
export type DirectoryPlace = Pick<Place, 'slug' | 'name' | 'province' | 'kind'> & { municipalityName: string };
export type PlaceScope = { province?: string; municipalityId?: string; wardId?: string };

export function directoryPage(value: string | null) {
  if (value === null) return 1;
  const page = Number(value);
  return /^\d+$/.test(value) && Number.isSafeInteger(page) && page > 0 && page <= 1_000_000 ? page : null;
}

export function placeDirectoryUrl(scope: { province?: string; municipality?: string; ward?: string } = {}, page = 1) {
  const query = new URLSearchParams();
  for (const key of ['province', 'municipality', 'ward'] as const) if (scope[key]) query.set(key, scope[key]);
  if (page > 1) query.set('page', String(page));
  return '/places' + (query.size ? `?${query}` : '');
}

/** Read compact link rows, including noindex places and every matching parent. */
export async function browsePlaces(db: D1Database, scope: PlaceScope, page = 1, limit = directoryPageSize) {
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (scope.province) { where.push('p.province=?'); args.push(scope.province); }
  for (const [level, id] of [['municipality', scope.municipalityId], ['ward', scope.wardId]] as const) {
    if (!id) continue;
    where.push(`p.kind IN ('town','suburb') AND EXISTS (
      SELECT 1 FROM json_each(p.payload,'$.relationships') link
      WHERE json_extract(link.value,'$.election')=? AND json_extract(link.value,'$.level')=?
        AND json_extract(link.value,'$.areaId')=?)`);
    args.push(latestYear, level, id);
  }
  const size = Math.max(1, Math.min(directoryPageSize, Math.trunc(limit)));
  const rows = await db.prepare(`SELECT p.slug,p.name,p.province,p.kind,p.municipality AS municipalityName,
    count(*) OVER () AS total FROM place_directory p ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY p.name COLLATE NOCASE,p.slug LIMIT ? OFFSET ?`)
    .bind(...args, size, (page - 1) * size).all<DirectoryPlace & { total: number }>();
  return { places: rows.results, total: rows.results[0]?.total ?? 0 };
}

export type DirectoryWard = { area_id: string; name: string; municipality_id: string; municipalityName: string | null };
export function wardDirectoryUrl(year: number, province?: string, page = 1) {
  const query = new URLSearchParams();
  if (province) query.set('province', province);
  if (page > 1) query.set('page', String(page));
  return `/${year}/wards` + (query.size ? `?${query}` : '');
}

/** Historical wards must remain reachable even when their council no longer exists. */
export async function browseWards(db: D1Database, year: number, provinceId?: string, page = 1) {
  const rows = await db.prepare(`SELECT r.area_id,r.name,r.municipality_id,
    (SELECT m.name FROM area_results m WHERE m.source_id=r.source_id AND m.snapshot_id=r.snapshot_id
      AND m.year=r.year AND m.level='municipality' AND m.area_id=r.municipality_id LIMIT 1) AS municipalityName,
    count(*) OVER () AS total ${joinedResults}
    WHERE r.year=? AND r.level='ward' ${provinceId ? 'AND r.province_id=?' : ''}
    ORDER BY r.municipality_id,r.area_id LIMIT ? OFFSET ?`)
    .bind(year, ...(provinceId ? [provinceId] : []), directoryPageSize, (page - 1) * directoryPageSize)
    .all<DirectoryWard & { total: number }>();
  return { wards: rows.results, total: rows.results[0]?.total ?? 0 };
}
