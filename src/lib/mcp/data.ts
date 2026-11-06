import { resultsApi } from '../api/results.ts';
import { findDirectoryPlace, searchDirectory } from '../places/directory.ts';
import { placeUrl } from '../places/catalogue.ts';
import { getUpdates, type FeedOptions } from '../updates/feed.ts';
import { publicUrl } from '../site.ts';

export type McpBindings = Pick<Env, 'RESULTS_DB' | 'RAW_RESULTS' | 'GEOGRAPHY_DB'>;
export type ReadCache = {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<unknown>;
};

export class DataError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

export function pageInfo(total: number, limit: number, offset: number) {
  return { total, limit, offset, next_offset: offset + limit < total ? offset + limit : null };
}

/** All reads stay in this Worker and use the same publication pointers as REST. */
export function createDataReader(bindings: McpBindings, origin: string, cache?: ReadCache) {
  async function cached(path: string, read: () => Promise<Response>) {
    const request = new Request(new URL(path, origin));
    // Cache errors must not make otherwise available election data unavailable.
    const hit = await cache?.match(request).catch(() => undefined);
    const response = hit ?? await read();
    if (!hit && response.ok && response.headers.get('Cache-Control')?.includes('public')) {
      await cache?.put(request, response.clone()).catch(() => undefined);
    }
    const data = await response.json() as Record<string, unknown>;
    if (!response.ok) throw new DataError(response.status,
      typeof data.error === 'string' ? data.error : 'Requested data is unavailable.');
    return data;
  }

  return {
    api(path: string) {
      return cached(path, () => resultsApi(new Request(new URL(path, origin)), bindings));
    },
    async search(query: string, limit: number, offset: number) {
      const { places, total } = await searchDirectory(bindings.GEOGRAPHY_DB ?? bindings.RESULTS_DB, query, limit, offset);
      return { query, mapping_year: 2026, ...pageInfo(total, limit, offset), places: places.map(p => ({
        slug: p.slug, name: p.name, kind: p.kind, province: p.province, municipality: p.municipalityName ?? null,
        url: publicUrl(placeUrl(p)),
      })) };
    },
    async place(slug: string, limit: number, offset: number) {
      const place = await findDirectoryPlace(bindings.GEOGRAPHY_DB ?? bindings.RESULTS_DB, slug);
      if (!place) throw new DataError(404, 'Place not found. Use search_places to find its slug.');
      const relationships = place.relationships.filter(r => r.election === 2026);
      const whole = relationships.some(r => r.level === 'municipality' && r.relation === 'equals');
      return { slug: place.slug, name: place.name, kind: place.kind, province: place.province,
        mapping_year: 2026, scope: whole ? 'whole_municipality' : 'whole_overlapping_wards_not_town_only',
        description: place.description, boundary_context: place.boundaryContext ?? null, sources: place.sources,
        url: publicUrl(placeUrl(place)),
        ...pageInfo(relationships.length, limit, offset),
        relationships: relationships.slice(offset, offset + limit).map(r => ({ ...r,
          results_url: publicUrl(`/api/v1/elections/${r.election}/areas/${r.level}/${r.areaId}`),
        })),
        caveat: 'Mappings use 2026 electoral boundaries. Do not apply them to historical elections or infer town-only vote totals.',
      };
    },
    async updates(options: FeedOptions) {
      const feed = await getUpdates(bindings.RESULTS_DB, options);
      if (options.event && !feed.updates.length) throw new DataError(404, 'Update not found.');
      return { year: 2026, result_status: 'provisional', ...feed,
        updates: feed.updates.map(update => ({ ...update, url: publicUrl(`/updates?event=${update.id}`) })),
        note: 'IEC-reported milestones remain provisional. Check corrections and superseded_by. Observation and publication times are not vote-counting times.',
      };
    },
  };
}

export type DataReader = ReturnType<typeof createDataReader>;
