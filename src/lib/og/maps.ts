import type { Feature, FeatureCollection, Polygon, MultiPolygon } from 'geojson';
import provinceShapes from '../overview/province-shapes.json' with { type: 'json' };
import { findDistrict } from '../maps/districts.ts';
import { findMapWard } from '../maps/ward-catalogue.ts';
import { provinces } from '../overview/results.ts';
import { regions } from '../maps/config.ts';

export type OgMapTarget = { level: 'province' | 'district' | 'municipality' | 'town' | 'ward' | 'voting-district'; id: string };
export type Boundary = Feature<Polygon | MultiPolygon>;
export type Boundaries = Boundary | FeatureCollection<Polygon | MultiPolygon>;
export type OgMap = { viewBox: string; paths: { d: string; fill: string }[]; caption: string };
export type OgMapSources = {
  asset: (path: string) => Promise<Boundaries>;
  geometry: (target: OgMapTarget) => Promise<Boundary | null>;
};

// Decorative geographic colours, independent of parties, votes and reporting.
const palette = ['#7ebba5', '#96b8cc', '#e3c786', '#dca28d', '#b3afce'];
export const nationalOgMap = (): OgMap => ({
  viewBox: '28 8 545 465', caption: 'South Africa · provinces',
  paths: provinceShapes.map((shape, i) => ({ d: shape.path, fill: palette[i % palette.length]! })),
});

type Point = [number, number];
function simplify(points: Point[], tolerance = .65): Point[] {
  if (points.length < 5) return points;
  const keep = new Set([0, points.length - 1]);
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop()!;
    const [x, y] = points[start]!, [ex, ey] = points[end]!;
    const dx = ex - x, dy = ey - y, length = dx * dx + dy * dy;
    let max = tolerance * tolerance, farthest = -1;
    for (let i = start + 1; i < end; i++) {
      const [px, py] = points[i]!;
      const t = length ? Math.max(0, Math.min(1, ((px - x) * dx + (py - y) * dy) / length)) : 0;
      const distance = (px - x - t * dx) ** 2 + (py - y - t * dy) ** 2;
      if (distance > max) { max = distance; farthest = i; }
    }
    if (farthest >= 0) { keep.add(farthest); stack.push([start, farthest], [farthest, end]); }
  }
  const reduced = [...keep].sort((a, b) => a - b).map(i => points[i]!);
  return reduced.length >= 4 ? reduced : points;
}

/** Project the actual boundary; preserve holes, islands and relative area sizes. */
export function boundaryOgMap(data: Boundaries, caption: string): OgMap | null {
  const features = data.type === 'FeatureCollection' ? data.features : [data];
  const polygons = features.map(feature => {
    const geometry = feature.geometry;
    if (!geometry || !['Polygon', 'MultiPolygon'].includes(geometry.type)) return [];
    return (geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates).map(rings => rings.map(ring => ring.map(([lng, lat]) => {
      if (!Number.isFinite(lng) || !Number.isFinite(lat) || Math.abs(lat!) > 85) throw new Error('Invalid OG boundary coordinate');
      return [lng! * Math.PI / 180, -Math.log(Math.tan(Math.PI / 4 + lat! * Math.PI / 360))] as Point;
    })));
  });
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const group of polygons) for (const rings of group) for (const ring of rings) for (const [x, y] of ring) {
    minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  }
  if (!(maxX > minX) || !(maxY > minY)) return null;
  const scale = Math.min(376 / (maxX - minX), 306 / (maxY - minY));
  const offsetX = (400 - (maxX - minX) * scale) / 2, offsetY = (330 - (maxY - minY) * scale) / 2;
  const paths = polygons.map((group, i) => ({
    d: group.flatMap(rings => rings.map(ring => {
      if (ring.length < 4) return '';
      const points = simplify(ring.map(([x, y]) => [(x - minX) * scale + offsetX, (y - minY) * scale + offsetY]));
      return points.map(([x, y], j) => `${j ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('') + 'Z';
    })).join(''),
    fill: features.length === 1 ? 'url(#og-boundary-fill)' : palette[i % palette.length]!,
  })).filter(p => p.d);
  return paths.length ? { viewBox: '0 0 400 330', paths, caption } : null;
}

/** Geometry lookups never read election results. Missing boundaries keep the page identity. */
export async function loadOgMap(target: OgMapTarget | undefined, sources: OgMapSources): Promise<OgMap> {
  if (!target) return nationalOgMap();
  try {
    if (target.level === 'province') {
      const province = provinces.find(p => p.id === target.id);
      const shape = provinceShapes.find(s => s.code === province?.code);
      if (shape) return { viewBox: shape.viewBox, paths: [{ d: shape.path, fill: 'url(#og-boundary-fill)' }], caption: 'Provincial boundary' };
    }
    if (target.level === 'district') {
      const district = findDistrict(target.id);
      if (district) return boundaryOgMap(await sources.asset(`/maps/geometry/districts-2026/${district.id}.geojson`), 'District boundary') ?? nationalOgMap();
    }
    const region = Object.values(regions).find(r => target.level === 'municipality' && r.municipalityId === target.id
      || target.level === 'ward' && findMapWard(target.id)?.municipality.replace(/^City of /, '') === r.name);
    if (region) {
      const data = await sources.asset(region.geometry);
      if (data.type === 'FeatureCollection') {
        if (target.level === 'municipality') return boundaryOgMap(data, 'Municipal ward boundaries') ?? nationalOgMap();
        const ward = data.features.find(f => f.properties?.id === target.id);
        if (ward) return boundaryOgMap(ward, 'Ward boundary') ?? nationalOgMap();
      }
    }
    const boundary = await sources.geometry(target);
    const caption = { province: 'Provincial boundary', district: 'District boundary', municipality: 'Municipal boundary', town: 'Place boundary', ward: 'Ward boundary', 'voting-district': 'Voting district boundary' }[target.level];
    return boundary ? boundaryOgMap(boundary, caption) ?? nationalOgMap() : nationalOgMap();
  } catch (error) {
    console.error('OG boundary unavailable', error);
    return nationalOgMap();
  }
}
