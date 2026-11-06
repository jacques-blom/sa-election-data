import { ELECTIONS } from '../data/catalogue.ts';
import { latestYear } from '../history/comparison.ts';
import { findDistrict } from '../maps/districts.ts';
import { findMapWard } from '../maps/ward-catalogue.ts';
import { provinces } from '../overview/results.ts';
import { findPlace, wardNumber } from '../places/catalogue.ts';
import type { Place } from '../places/types.ts';
import type { OgMapTarget } from './maps.ts';
import { publicUrl } from '../site.ts';

/**
 * Deliberately contains no result fields. The source has no verified declaration
 * signal, so even complete counts, historical imports and allocated seats must
 * not introduce results into link previews. Add result support only alongside
 * verified, area-specific IEC declaration evidence, never reporting progress.
 */
export type OgPage = { title: string; label: string; subtitle: string; year?: number; map?: OgMapTarget };
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_IMAGE_VERSION = 'v3';

const pages: Record<string, OgPage> = {
  '/map': { title: 'Explore the map', label: `Local elections ${latestYear}`, subtitle: 'Find your province, municipality and ward.', year: latestYear },
  '/find-address': { title: 'Find your ward', label: 'Start with your community', subtitle: 'Explore local elections near you.' },
  '/search': { title: 'Find local results', label: 'Start with your community', subtitle: 'Search by municipality, ward, town or address.' },
  '/updates': { title: 'Latest election updates', label: `Follow the count · ${latestYear}`, subtitle: 'Ward and council updates from across South Africa.', year: latestYear },
  '/api': { title: 'Election data, open to everyone.', label: 'API & data documentation', subtitle: 'Build, explore and research with public election data.' },
  '/privacy': { title: 'Your privacy', label: 'About Counted', subtitle: 'How Counted handles your information.' },
  '/terms': { title: 'Terms of use', label: 'About Counted', subtitle: 'Using Counted’s election results and tools.' },
  '/disclaimer': { title: 'Independent. Open. For everyone.', label: 'About Counted', subtitle: 'About Counted’s election information.' },
};

export const nationalOgPage = (year: number = latestYear): OgPage => ({
  title: 'South Africa', label: `Local elections ${year}`, subtitle: 'Every vote. Every community.', year,
});

/** Build from the public path alone; never forward query strings or fragments. */
export function ogImageUrl(canonical: string) {
  const url = new URL(canonical);
  const path = url.pathname.replace(/\/+$/, '');
  return publicUrl(`/og/${OG_IMAGE_VERSION}/${path.slice(1) || 'index'}.png`);
}

export async function ogPageForPath(pathname: string, lookupPlace?: (slug: string) => Promise<Place | undefined>): Promise<OgPage | null> {
  const path = pathname.split(/[?#]/, 1)[0]!.replace(/\/+$/, '') || '/';
  if (path === '/') return nationalOgPage();
  if (Object.hasOwn(pages, path)) return pages[path]!;
  const match = /^\/(\d{4})(?:\/(provinces|districts|places|wards|voting-districts)\/([a-zA-Z0-9-]+)(\/coalition)?)?$/.exec(path);
  if (!match) return null;
  const year = Number(match[1]);
  if (!ELECTIONS.some(e => e.year === year)) return null;
  const [, , kind, id, coalition] = match;
  if (!kind) return nationalOgPage(year);
  if (coalition && (kind !== 'places' || year !== latestYear)) return null;
  const label = `Local elections ${year}`;
  if (kind === 'provinces') {
    const province = provinces.find(p => p.slug === id);
    return province ? { title: province.name, label, subtitle: 'Explore municipalities and wards across the province.', year,
      ...(year === latestYear ? { map: { level: 'province' as const, id: province.id } } : {}) } : null;
  }
  if (kind === 'districts') {
    const district = year === latestYear ? findDistrict(id!) : undefined;
    return district ? { title: district.name, label, subtitle: `District municipality · ${district.province}`, year, map: { level: 'district', id: district.id } } : null;
  }
  if (kind === 'places') {
    const place = findPlace(id!) ?? await lookupPlace?.(id!);
    if (!place) return null;
    const map = year === latestYear ? place.geometry : undefined;
    if (coalition) return { title: place.name, label: `Coalition playground · ${year}`, subtitle: 'Coalition playground · Hypothetical combinations', year, ...(map ? { map } : {}) };
    const scope = place.kind === 'metro' ? 'Metropolitan municipality' : place.kind === 'municipality' ? 'Local municipality' : place.kind === 'town' ? 'Town' : 'Suburb';
    return { title: place.name, label, subtitle: `${scope} · ${place.province}`, year, ...(map ? { map } : {}) };
  }
  if (kind === 'wards' && /^\d{8}$/.test(id!)) {
    // Current boundaries cannot establish a historical ward’s municipality.
    const ward = year === latestYear ? findMapWard(id!) : undefined;
    return { title: `Ward ${wardNumber(id!)}`,
      label, subtitle: ward ? `${ward.municipality} · ${ward.province}` : `South Africa · Ward ${id}`, year,
      ...(year === latestYear ? { map: { level: 'ward' as const, id: id! } } : {}) };
  }
  if (kind === 'voting-districts' && /^\d{8,10}$/.test(id!)) {
    return { title: `Voting district ${id}`, label, subtitle: 'Explore your local voting district.', year,
      ...(year === latestYear ? { map: { level: 'voting-district' as const, id: id! } } : {}) };
  }
  return null;
}
