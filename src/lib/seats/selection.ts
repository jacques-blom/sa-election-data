import { builderCouncils } from './directory.ts';
import { latestYear } from '../history/comparison.ts';
import { resolveArea, normalizeAreaName } from '../address/resolve-area.ts';
import { isWholeArea, type AreaSelection } from '../address/selection.ts';
import { administrative } from '../maps/administrative.ts';
import { findDistrict } from '../maps/districts.ts';
import { findMapWard } from '../maps/ward-catalogue.ts';
import type { Place } from '../places/types.ts';

export type CoalitionSelection = { url: string } | AreaSelection;
export type CouncilChoice = { id: string; name: string; href: string; province: string };
export type CoalitionDestination = { councils: CouncilChoice[]; browse?: string };
type Lookups = {
  findPlace: (slug: string) => Promise<Place | undefined>;
  searchPlaces: (query: string) => Promise<Place[]>;
  locate: (location: { lat: number; lng: number }) => Promise<string[]>;
};
const councils = builderCouncils();
const choices = (ids: string[]) => councils.filter(c => ids.includes(c.id)).map(({ id, name, href, province }) => ({ id, name, href, province }));

function placeCouncils(place: Place) {
  return place.relationships.filter(r => r.election === latestYear && r.level === 'municipality').map(r => r.areaId);
}

export async function resolveCoalitionSelection(selection: CoalitionSelection, lookups: Lookups): Promise<CoalitionDestination> {
  async function areaUrl(url: string): Promise<CoalitionDestination> {
    if (url === '/') return { councils: choices(councils.map(c => c.id)), browse: 'All provinces' };
    const route = url.match(/^\/2026\/(places|provinces|districts|wards)\/([a-z0-9-]+)$/i);
    if (!route) return { councils: [] };
    const [, kind, slug] = route;
    if (kind === 'places') {
      const place = await lookups.findPlace(slug!);
      return { councils: choices(place ? placeCouncils(place) : []) };
    }
    if (kind === 'provinces') {
      const province = Object.values(administrative.provinces).find(p => p.url === url);
      return { councils: choices(councils.filter(c => c.provinceId === province?.id).map(c => c.id)), browse: province?.name ?? 'Choose a province' };
    }
    if (kind === 'districts') {
      const district = findDistrict(slug!);
      return { councils: choices(councils.filter(c => district?.municipalitySlugs.includes(c.slug)).map(c => c.id)), browse: district?.name ?? 'Choose a council' };
    }
    const ward = findMapWard(slug!);
    return { councils: choices(councils.filter(c => administrative.municipalities[c.id]?.code === ward?.code).map(c => c.id)) };
  }

  if ('url' in selection) return areaUrl(selection.url);
  if (isWholeArea(selection.types)) {
    const broad = selection.types.some(t => t === 'country' || t === 'administrative_area_level_1');
    const candidates = broad ? [] : (await Promise.all([...new Set(selection.names.map(normalizeAreaName))].filter(Boolean).map(lookups.searchPlaces))).flat();
    // A single name match can still be a different town elsewhere in the country.
    // Reject contradictory extents before matching; an unlisted local place can
    // then use its Google location to find the actual municipal boundary.
    const nearby = selection.location ? candidates.filter(place => !place.bbox
      || selection.location!.lng >= place.bbox[0] && selection.location!.lng <= place.bbox[2]
        && selection.location!.lat >= place.bbox[1] && selection.location!.lat <= place.bbox[3]) : candidates;
    const result = resolveArea(selection, nearby);
    if (result.area) {
      const destination = await areaUrl(result.area.url);
      if (destination.browse || destination.councils.length) return destination;
    }
    if (result.alternatives.length) {
      const alternatives = await Promise.all(result.alternatives.map(area => areaUrl(area.url)));
      return { councils: choices(alternatives.flatMap(result => result.councils.map(c => c.id))) };
    }
    // A broad region must stay a council list, never become the council at its centre.
    if (broad || selection.types.includes('administrative_area_level_2')) return { councils: [] };
  }
  return { councils: selection.location ? choices(await lookups.locate(selection.location)) : [] };
}

export function validCoalitionSelection(value: unknown): value is CoalitionSelection {
  if (!value || typeof value !== 'object') return false;
  const body = value as Record<string, unknown>;
  if ('url' in body) return typeof body.url === 'string' && body.url.length <= 250 && /^\/(?:2026\/(?:places|provinces|districts|wards)\/[a-z0-9-]+)?$/i.test(body.url);
  const location = body.location as { lat?: unknown; lng?: unknown } | undefined;
  return Array.isArray(body.names) && body.names.length > 0 && body.names.length <= 5
    && body.names.every(n => typeof n === 'string' && n.trim().length > 0 && n.length <= 200)
    && Array.isArray(body.types) && body.types.length <= 30 && body.types.every(t => typeof t === 'string' && t.length <= 100)
    && (body.province === undefined || typeof body.province === 'string' && body.province.length <= 100)
    && (location === undefined || !!location && typeof location.lng === 'number' && Number.isFinite(location.lng) && location.lng >= 16 && location.lng <= 33
      && typeof location.lat === 'number' && Number.isFinite(location.lat) && location.lat >= -35 && location.lat <= -22);
}
