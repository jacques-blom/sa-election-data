import { places, placeUrl } from '../places/catalogue.ts';
import { hydrateResults, joinedResults, resultColumns } from '../data/packed-results.ts';
import { resultFromRow, type ResultRow } from '../places/results.ts';
import { latestYear } from '../history/comparison.ts';
import { provinces } from '../overview/results.ts';
import { readCouncilStates, summariseCouncils, type CouncilOutcome } from '../overview/councils.ts';
import { partyStyle } from '../places/format.ts';
import { normaliseCouncilSearch } from './directory-filter.ts';
import { councilSeats } from './allocation.ts';
export { matchesBuilderCouncil, normaliseCouncilSearch } from './directory-filter.ts';

export const builderPath = '/majority-builder';
const councilPlaces = places.filter(p => p.kind === 'metro' || p.kind === 'municipality');
export function builderCouncils(outcomes: CouncilOutcome[] = [], loadedIds: ReadonlySet<string> = new Set()) {
  const byId = new Map(outcomes.map(outcome => [outcome.id, outcome]));
  return councilPlaces.map(place => {
    const id = place.relationships.find(r => r.election === latestYear && r.level === 'municipality' && r.relation === 'equals')!.areaId;
    const outcome = byId.get(id);
    const seats = outcome && outcome.status !== 'pending' ? outcome : null;
    return { id, slug: place.slug, name: place.name, province: place.province,
      provinceId: provinces.find(p => p.name === place.province)?.id ?? '', metro: place.kind === 'metro',
      href: `${placeUrl(place)}/coalition`, resultHref: placeUrl(place),
      status: seats?.status ?? 'pending', total: seats?.total ?? null, majority: seats?.majority ?? null,
      loaded: !!seats || loadedIds.has(id),
      winner: seats?.winner ? partyStyle(seats.winner.name)[0] : null,
      search: normaliseCouncilSearch([place.name, ...place.aliases, place.province, id].join(' ')) };
  }).sort((a, b) => Number(b.metro) - Number(a.metro) || a.name.localeCompare(b.name, 'en-ZA'));
}
export type BuilderCouncil = ReturnType<typeof builderCouncils>[number];

/** Include the complete place catalogue, even councils without a result yet.
 * Only metros need pack reads here; pending councils load their latest seats when opened. */
export async function getBuilderCouncils(db: D1Database, bucket?: R2Bucket) {
  const [rows, states] = await Promise.all([
    db.prepare(`SELECT ${resultColumns} ${joinedResults} WHERE r.year=? AND r.level='municipality'`)
      .bind(latestYear).all<ResultRow>(), readCouncilStates(db, latestYear),
  ]);
  const metros = new Set(councilPlaces.filter(p => p.kind === 'metro').map(p => p.relationships.find(r => r.level === 'municipality' && r.relation === 'equals')!.areaId));
  const metroRows = rows.results.filter(row => metros.has(row.area_id));
  for (let start = 0; start < metroRows.length; start += 4) {
    await Promise.all(metroRows.slice(start, start + 4).map(async row => {
      try { await hydrateResults(db, bucket, [row]); } catch { /* The council remains searchable while its data is unavailable. */ }
    }));
  }
  const rowIds = new Set(rows.results.map(row => row.area_id));
  const loadedIds = new Set(rows.results.filter(row => row.payload).map(row => row.area_id));
  for (const council of builderCouncils()) if (!rowIds.has(council.id)) loadedIds.add(council.id);
  return builderCouncils(summariseCouncils(rows.results, states, null).entries, loadedIds);
}

const councilIds = new Set(builderCouncils().map(c => c.id));
export function builderSeatIds(value: string | null) {
  const ids = [...new Set((value ?? '').split(','))];
  if (!ids.length || ids.length > 8 || ids.some(id => !councilIds.has(id))) throw new Error('Choose between 1 and 8 council IDs');
  return ids.sort();
}
export type BuilderSeatSummary = { id: string; status: 'reported' | 'estimated' | 'pending'; total: number | null; majority: number | null };

/** Small viewport batches use the same full seat calculation as the playground. */
export async function getBuilderSeatSummaries(db: D1Database, ids: string[], bucket?: R2Bucket) {
  const selected = builderSeatIds(ids.join(','));
  const { results: rows } = await db.prepare(`SELECT ${resultColumns} ${joinedResults}
    WHERE r.year=? AND r.level='municipality' AND r.area_id IN (${selected.map(() => '?').join(',')})`)
    .bind(latestYear, ...selected).all<ResultRow>();
  const councils: BuilderSeatSummary[] = [];
  const failed: string[] = [];
  for (let start = 0; start < selected.length; start += 4) {
    await Promise.all(selected.slice(start, start + 4).map(async id => {
      const row = rows.find(row => row.area_id === id);
      if (!row) { councils.push({ id, status: 'pending', total: null, majority: null }); return; }
      try {
        await hydrateResults(db, bucket, [row]);
        const seats = councilSeats('municipality', JSON.parse(row.payload));
        councils.push(seats.status === 'unavailable' ? { id, status: 'pending', total: null, majority: null }
          : { id, status: seats.status, total: seats.total, majority: seats.majority });
      } catch { failed.push(id); }
    }));
  }
  // A read failure is not evidence that a council has no usable seats.
  return { councils: councils.sort((a, b) => a.id.localeCompare(b.id)), failed: failed.sort() };
}

/** A playground only needs the council record, not all its wards or historical votes. */
export async function getBuilderResult(db: D1Database, id: string, bucket?: R2Bucket) {
  const row = await db.prepare(`SELECT ${resultColumns} ${joinedResults} WHERE r.year=? AND r.level='municipality' AND r.area_id=?`)
    .bind(latestYear, id).first<ResultRow>();
  return row ? resultFromRow((await hydrateResults(db, bucket, [row]))[0]!) : null;
}
