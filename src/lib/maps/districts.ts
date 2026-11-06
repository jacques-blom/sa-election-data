import data from './district-index.json' with { type: 'json' };
import type { ResolvedArea } from '../address/selection.ts';

export type District = {
  id: string; code: string; name: string; slug: string; province: string; provinceId: string;
  bbox: [number, number, number, number]; municipalityCodes: string[]; municipalitySlugs: string[];
  source: string; membershipSource: string;
};
export const districts = data as District[];
export const districtUrl = (district: District) => `/2026/districts/${district.slug}`;
export const findDistrict = (idOrSlug: string) => districts.find(d => d.id.toLowerCase() === idOrSlug.toLowerCase() || d.slug === idOrSlug);
export const districtSelection = (district: District): ResolvedArea => ({
  id: district.id, name: `${district.name} District Municipality`, kind: 'district',
  description: `District municipality · ${district.code} · ${district.province}`,
  url: districtUrl(district), bbox: district.bbox, geometry: { level: 'district', id: district.id },
});
