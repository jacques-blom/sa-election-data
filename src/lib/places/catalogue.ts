import type { Place } from './types.ts';
export type { Place } from './types.ts';
import municipalities from './municipalities.json' with { type: 'json' };
const curated: Place[] = [
  { id: 'za-metro-cpt', slug: 'cape-town', name: 'Cape Town', kind: 'metro', province: 'Western Cape',
    aliases: ['City of Cape Town', 'Kaapstad', 'iKapa', 'CPT'], indexable: true,
    description: 'Results for the whole City of Cape Town metropolitan municipality. Browse its wards to explore a smaller area.',
    relationships: [{ election: 2026, level: 'municipality', areaId: '9006', relation: 'equals', boundaryVersion: 'IEC 2026 CPT', method: 'IEC municipality identifier' }],
    sources: [{ label: 'IEC Cape Town results', url: 'https://results.elections.org.za/dashboards/lge/MapsJason/2026/EEID1887Munic9006.js' }] },
  { id: 'za-main-place-366005', slug: 'calvinia', name: 'Calvinia', kind: 'town', province: 'Northern Cape',
    aliases: ['Calvinia town'], indexable: false,
    boundaryContext: { notes: ['The 2016 statistical place boundary overlaps wards 1, 2, 6 and 7 in the 2026 ward map. This broader extent includes land beyond the commonly described town.', 'Hantam’s 2024/25 report associates Calvinia with wards 1, 2 and 6.'],
      method: 'We intersected the Stats SA main-place polygon (366005) with MDB’s 2026 ward polygons and matched their identifiers to IEC Hantam results. No votes are allocated by overlap size. The town extent needs review before this page is included in search-engine sitemaps.', map: '/maps/calvinia.svg' },
    description: 'Calvinia is in Hantam municipality. Its statistical place boundary crosses several wards; each ward’s results also include people outside the town.',
    relationships: [
      { election: 2026, level: 'municipality', areaId: '6605', relation: 'within', boundaryVersion: 'IEC 2026 NC065', method: 'Stats SA municipality code NC065 reconciled to IEC Hantam' },
      ...['30605001', '30605002', '30605006', '30605007'].map(areaId => ({ election: 2026, level: 'ward' as const, areaId, relation: 'overlaps' as const,
        boundaryVersion: 'Stats SA 2016 main place 366005 / MDBWards2026', method: 'Positive-area polygon intersection; statistical extent, not an address lookup' })),
    ],
    sources: [
      { label: 'Stats SA main places, hosted by DPME', url: 'https://dpmegis.dpme.gov.za/arcgis/rest/services/Adminboundaries/MapServer/7' },
      { label: 'MDB 2026 ward boundaries', url: 'https://services7.arcgis.com/oeoyTUJC8HEeYsRB/arcgis/rest/services/MDBWards2026/FeatureServer/0' },
      { label: 'Hantam annual report 2024/25', url: 'https://www.hantam.gov.za/wp-content/uploads/2026/04/HAN-Final-Full-APR-2024-2025.pdf' },
    ] },
  { id: 'za-municipality-nc065', slug: 'hantam', name: 'Hantam', kind: 'municipality', province: 'Northern Cape',
    aliases: ['Hantam Local Municipality', 'NC065'], indexable: true,
    description: 'Results for the whole Hantam local municipality, including Calvinia and surrounding communities.',
    relationships: [{ election: 2026, level: 'municipality', areaId: '6605', relation: 'equals', boundaryVersion: 'IEC 2026 NC065', method: 'IEC municipality identifier' }],
    sources: [{ label: 'IEC Hantam results', url: 'https://results.elections.org.za/dashboards/lge/MapsJason/2026/EEID1887Munic6605.js' }] },
];
export const places: Place[] = [...(municipalities as Place[]).map(p=>{const existing=curated.find(c=>c.slug===p.slug);return existing?{...p,...existing,bbox:p.bbox,geometry:p.geometry,municipalityName:p.municipalityName}:p;}),...curated.filter(p=>p.kind==='town')];
export const placeUrl = (p: Place) => `/2026/places/${p.slug}`;
export const wardUrl = (id: string) => `/2026/wards/${id}`;
export const wardNumber = (id: string) => Number(id.slice(-3));
const normal = (s: string) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export function searchPlaces(query: string) {
  const q = normal(query);
  if (!q) return places;
  return places.map(place => ({ place, rank: Math.min(...[place.name, ...place.aliases].map(name => normal(name) === q ? 0 : normal(name).startsWith(q) ? 1 : normal(name).includes(q) ? 2 : 3)) }))
    .filter(r => r.rank < 3).sort((a, b) => a.rank - b.rank).map(r => r.place);
}
export function findPlace(slug: string) { return places.find(p => p.slug === slug); }
