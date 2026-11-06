import { administrative } from '../maps/administrative.ts';
import { districts, districtSelection } from '../maps/districts.ts';
import { allMapWards } from '../maps/ward-catalogue.ts';
import { places, placeUrl } from '../places/catalogue.ts';
import type { ResolvedArea } from './selection.ts';

const normalize = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
type SearchArea = { area: ResolvedArea; names: string[]; search: string; order: number; wardNumber?: number };
const entries: SearchArea[] = [
  ...Object.values(administrative.provinces).map(province => ({
    area: { id: province.id, name: province.name, kind: 'province' as const, description: 'Province', url: province.url, bbox: province.bbox, geometry: { level: 'province' as const, id: province.id } },
    names: [province.name, province.code], search: `${province.name} ${province.code}`, order: 0,
  })),
  ...places.filter(p => p.kind === 'municipality' || p.kind === 'metro').map(place => {
    const code = administrative.municipalities[place.geometry?.id ?? '']?.code ?? '';
    return { area: { id: place.id, name: place.name, kind: place.kind, description: `${place.kind === 'metro' ? 'Metropolitan municipality' : 'Local municipality'} · ${code} · ${place.province}`,
      url: placeUrl(place), bbox: place.bbox, geometry: place.geometry }, names: [place.name, code, ...place.aliases],
      search: `${place.name} ${code} ${place.province} ${place.aliases.join(' ')}`, order: 1 };
  }),
  ...districts.map(district => ({ area: districtSelection(district), names: [district.name, district.code], search: `${district.name} ${district.code} ${district.province}`, order: 2 })),
  ...allMapWards().map(ward => ({
    area: { id: ward.id, name: `Ward ${ward.number}, ${ward.municipality}`, kind: 'ward' as const,
      description: `Ward · ${ward.code} · ${ward.province} · ${ward.id}`, url: `/2026/wards/${ward.id}`, bbox: ward.bbox, geometry: { level: 'ward' as const, id: ward.id } },
    names: [ward.id], search: `${ward.id} ${ward.municipality} ${ward.code} ${ward.province}`, wardNumber: ward.number, order: 3,
  })),
].map(entry => ({ ...entry, names: entry.names.map(normalize), search: normalize(entry.search) }));

/** Official election areas supplement Google addresses, with municipalities first. Server only. */
export function searchElectionAreas(query: string, bbox?: [number, number, number, number], limit = 8): ResolvedArea[] {
  const q = normalize(query).replace(/\bward(\d+)\b/g, 'ward $1').replace(/\bdc\s*0*(\d+)\b/g, (_, number: string) => `dc${Number(number)}`);
  if (q.length < 2) return [];
  const wardOnly = /\bwards?\b/.test(q) || /^\d{8}$/.test(q);
  const districtOnly = /\bdistrict\b/.test(q) || /^dc\s*\d+$/.test(q);
  const municipalityOnly = !districtOnly && /\bmunicipalit(?:y|ies)\b|\bmetro(?:politan)?\b/.test(q);
  const wardNumber = q.match(/\bwards?\s*(\d{1,3})\b/)?.[1] ?? (wardOnly ? q.match(/\b(\d{1,3})\b/)?.[1] : undefined);
  const words = q.replace(/\b(local|metropolitan|metro|municipality|municipalities|district|province|wards?)\b/g, ' ')
    .split(/\s+/).filter(Boolean).filter(word => word !== wardNumber);
  const name = words.join(' ');
  const rank = (entry: SearchArea) => (entry.names.includes(name) ? 0 : entry.names.some(n => n.startsWith(name)) ? 1 : 2) * 10 + entry.order;
  return entries.filter(entry => {
    const area = entry.area;
    if (wardOnly && area.kind !== 'ward') return false;
    if (districtOnly && area.kind !== 'district') return false;
    if (municipalityOnly && area.kind !== 'municipality' && area.kind !== 'metro') return false;
    if (wardNumber && entry.wardNumber !== Number(wardNumber)) return false;
    if (bbox && area.bbox && (area.bbox[0] > bbox[2] || area.bbox[2] < bbox[0] || area.bbox[1] > bbox[3] || area.bbox[3] < bbox[1])) return false;
    return words.every(word => entry.search.split(' ').some(token => token.startsWith(word)));
  }).sort((a, b) => rank(a) - rank(b) || a.area.name.localeCompare(b.area.name, 'en-ZA', { numeric: true }))
    .slice(0, Math.min(12, Math.max(1, limit))).map(entry => entry.area);
}
