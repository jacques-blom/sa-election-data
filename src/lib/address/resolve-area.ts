import { administrative } from '../maps/administrative.ts';
import { placeUrl, type Place } from '../places/catalogue.ts';
import type { AreaResolution, AreaSelection, ResolvedArea } from './selection.ts';
import { districts, districtSelection } from '../maps/districts.ts';

export const normalizeAreaName = (name: string) => name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/\b(local|metropolitan|district) municipality\b|\bmunicipality\b|\bprovince\b/g, '')
  .replace(/[^a-z0-9]+/g, ' ').trim();

/** Match the named area, never the electoral ward containing its representative pin. */
export function resolveArea(selection: AreaSelection, candidates: Place[]): AreaResolution {
  const names = selection.names.map(normalizeAreaName).filter(Boolean);
  if (selection.types.includes('country')) return { area: {
    id: 'south-africa', name: 'South Africa', kind: 'country', description: 'National results',
    url: '/national-results', bbox: [16.3, -34.9, 32.9, -22.1],
  }, alternatives: [] };
  if (selection.types.includes('administrative_area_level_1')) {
    const province = Object.values(administrative.provinces).find(p => names.includes(normalizeAreaName(p.name)) || names.includes(normalizeAreaName(p.code)));
    return { area: province ? { ...province, kind: 'province', description: 'Province', geometry: { level: 'province', id: province.id } } : undefined, alternatives: [] };
  }
  const province = selection.province && normalizeAreaName(selection.province);
  const district = districts.filter(d => (!province || normalizeAreaName(d.province) === province)
    && [d.name, d.code].some(name => names.includes(normalizeAreaName(name))));
  if (district.length === 1 && (selection.types.some(type => type.startsWith('administrative_area_level_')) || selection.names.some(name => /district/i.test(name)))) {
    return { area: districtSelection(district[0]!), alternatives: [] };
  }
  const exact = [...new Map(candidates.toReversed().map(p => [p.slug, p])).values()].filter(place =>
    (!province || normalizeAreaName(place.province) === province)
    && [place.name, ...place.aliases].some(name => names.includes(normalizeAreaName(name))));
  const municipal = selection.types.some(type => type.startsWith('administrative_area_level_'));
  const suburb = selection.types.some(type => type === 'neighborhood' || type.startsWith('sublocality'));
  const rank = (place: Place) => municipal ? (place.kind === 'municipality' || place.kind === 'metro' ? 0 : 2)
    : suburb ? (place.kind === 'suburb' ? 0 : 2) : place.kind === 'metro' || place.kind === 'municipality' ? 0 : 1;
  const bestRank = Math.min(...exact.map(rank));
  let best = exact.filter(p => rank(p) === bestRank);
  // Use the selected area pin only to disambiguate names, never to choose a ward.
  if (best.length > 1 && selection.location) {
    const { lat, lng } = selection.location;
    const containing = best.filter(p => p.bbox && lng >= p.bbox[0] && lat >= p.bbox[1] && lng <= p.bbox[2] && lat <= p.bbox[3]);
    if (containing.length) best = containing;
  }
  const areas: ResolvedArea[] = best.map(p => ({ id: p.id, name: p.name, kind: p.kind,
    description: `${p.kind === 'metro' ? 'Metro' : p.kind === 'municipality' ? 'Municipality' : p.kind === 'suburb' ? 'Suburb' : 'Town'} · ${p.province}`,
    url: placeUrl(p), bbox: p.bbox, geometry: p.geometry }));
  return areas.length === 1 ? { area: areas[0], alternatives: [] } : { alternatives: areas };
}
