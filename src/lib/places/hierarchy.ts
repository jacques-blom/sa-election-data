import { places, type Place } from './catalogue.ts';
import { districts, type District } from '../maps/districts.ts';
import { latestYear } from '../history/comparison.ts';

const municipalities = places.filter(p => p.kind === 'metro' || p.kind === 'municipality');
const districtByMunicipality = new Map(districts.flatMap(d => d.municipalitySlugs.map(slug => [slug, d] as const)));

export function districtMunicipalities(district: District) {
  return municipalities.filter(p => district.municipalitySlugs.includes(p.slug)).sort((a, b) => a.name.localeCompare(b.name, 'en-ZA'));
}

/** Follow every current relationship, including towns that cross council borders.
 * The 2026 district membership must not be applied to historical boundaries. */
export function placeCouncilParents(place: Place, year = latestYear) {
  if (year !== latestYear) return [];
  const ids = new Set(place.relationships.filter(r => r.election === year && r.level === 'municipality').map(r => r.areaId));
  return municipalities.filter(p => p.relationships.some(r => r.election === year && r.level === 'municipality' && r.relation === 'equals' && ids.has(r.areaId)))
    .sort((a, b) => a.name.localeCompare(b.name, 'en-ZA'))
    .map(municipality => ({ municipality, district: municipality.kind === 'metro' ? undefined : districtByMunicipality.get(municipality.slug) }));
}
