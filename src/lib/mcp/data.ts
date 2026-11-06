import { resultsApi } from '../api/results.ts';
import { findDirectoryPlace, searchDirectory } from '../places/directory.ts';
import { placeUrl } from '../places/catalogue.ts';
import { getUpdates, type FeedOptions } from '../updates/feed.ts';
import { publicUrl } from '../site.ts';
import { hydrateResults, joinedResults, resultColumns } from '../data/packed-results.ts';
import { resultFromRow, type ResultRow } from '../places/results.ts';
import { attachPrevious, availableYears } from '../history/results.ts';
import { getNationalOverview, getProvinceOverview, provinceById } from '../overview/results.ts';
import { summariseCouncils } from '../overview/councils.ts';
import { areaCard, areaSummary, type RequestedBallot } from './summaries.ts';
import type { Level } from '../data/normalize.ts';

export type SummaryFilters = { year: number; level: Level; province_id?: string; municipality_id?: string;
  ward_id?: string; query?: string; ballot: RequestedBallot; party_id?: string; limit: number; offset: number };

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
    async summary(year: number, level: Level, id: string, ballot: RequestedBallot, limit: number, offset: number) {
      const row = await bindings.RESULTS_DB.prepare(`SELECT ${resultColumns} ${joinedResults}
        WHERE r.year=? AND r.level=? AND r.area_id=?`).bind(year, level, id).first<ResultRow>();
      if (!row) throw new DataError(404, 'No imported result for this area.');
      const [result] = await attachPrevious(bindings.RESULTS_DB,
        (await hydrateResults(bindings.RESULTS_DB, bindings.RAW_RESULTS, [row])).map(resultFromRow), bindings.RAW_RESULTS);
      return { ...areaSummary(result!, ballot, limit, offset),
        available_years: await availableYears(bindings.RESULTS_DB, level, id) };
    },
    async summaries(filters: SummaryFilters) {
      const where = ['r.year=?', 'r.level=?'];
      const args: (string | number)[] = [filters.year, filters.level];
      for (const key of ['province_id', 'municipality_id', 'ward_id'] as const) {
        if (filters[key] !== undefined) { where.push(`r.${key}=?`); args.push(filters[key]!); }
      }
      if (filters.query) { where.push('instr(lower(r.name),lower(?))>0'); args.push(filters.query); }
      const clause = `WHERE ${where.join(' AND ')}`;
      const [count, page] = await bindings.RESULTS_DB.batch([
        bindings.RESULTS_DB.prepare(`SELECT COUNT(*) AS total ${joinedResults} ${clause}`).bind(...args),
        bindings.RESULTS_DB.prepare(`SELECT ${resultColumns} ${joinedResults} ${clause} ORDER BY r.area_id LIMIT ? OFFSET ?`)
          .bind(...args, filters.limit, filters.offset),
      ]);
      const results = await attachPrevious(bindings.RESULTS_DB,
        (await hydrateResults(bindings.RESULTS_DB, bindings.RAW_RESULTS, page!.results as unknown as ResultRow[])).map(resultFromRow), bindings.RAW_RESULTS);
      return { year: filters.year, level: filters.level, filters,
        ...pageInfo(Number((count!.results[0] as { total: number }).total), filters.limit, filters.offset),
        areas: results.map(result => areaCard(result, filters.ballot, filters.party_id)),
        scope: 'One row per imported area at exactly one geographic level; totals are not summed across parent and child areas.',
        snapshot_note: 'Each row carries its source snapshot. Separate pages may observe later publication; use the Python capture helper when a stable full dataset is needed.' };
    },
    async overview(year: number, provinceId: string | undefined, limit: number, offset: number) {
      if (provinceId) {
        const province = provinceById(provinceId);
        if (!province) throw new DataError(400, 'Unknown province ID.');
        const data = await getProvinceOverview(bindings.RESULTS_DB, province, bindings.RAW_RESULTS, year);
        const councils = summariseCouncils(data.municipalities.map(m => ({ area_id: m.id,
          snapshot_id: m.result.source.snapshotId, payload: JSON.stringify(m.result.results) })), [],
          data.summary.results.progress.municipalities?.expected ?? null);
        return { year, scope: 'province', province: { id: province.id, name: province.name },
          summary: areaSummary(data.summary, 'auto', 50),
          councils: { ...councils, entries: undefined,
            note: 'Only complete IEC-reported seat allocations enter majority counts. Estimates and unavailable councils remain pending. No majority does not identify a governing coalition.' },
          municipality_page: pageInfo(data.municipalities.length, limit, offset),
          municipalities: data.municipalities.slice(offset, offset + limit).map(m => areaCard(m.result)) };
      }
      const data = await getNationalOverview(bindings.RESULTS_DB, bindings.RAW_RESULTS, year);
      return { year, scope: 'national', summary: areaSummary(data.national, 'auto', 50),
        provinces: data.provinces.map(p => ({ id: p.province.id, name: p.province.name, summary: p.result ? areaCard(p.result) : null })),
        metros: data.metros.map(m => ({ slug: m.place.slug, name: m.place.name, summary: m.result ? areaCard(m.result) : null })),
        councils: data.councils ? { ...data.councils, entries: undefined,
          note: 'Only complete IEC-reported allocations enter majority counts. Estimates, missing imported councils and unavailable packed outcome state remain pending. Coalition membership is not supplied.' } : null,
        municipality_page: pageInfo(data.municipalities.length, limit, offset),
        municipalities: data.municipalities.slice(offset, offset + limit).map(m => ({ id: m.id, name: m.name,
          province_id: m.provinceId, url: publicUrl(m.placeHref ?? m.href) })),
        scope_note: 'The national and provincial summaries are their IEC source records, not sums of the displayed municipality or metro lists. Missing summaries are null.' };
    },
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
