import type { AreaRecord } from '../data/normalize.ts';
import { joinedResults, resultColumns, hydrateResults } from '../data/packed-results.ts';
import { latestYear, previousElection } from '../history/comparison.ts';
import { places, placeUrl } from '../places/catalogue.ts';
import type { ResultRow } from '../places/results.ts';
import { normaliseCouncilSearch } from '../seats/directory-filter.ts';
import { readCouncilStates, summariseCouncils, type CouncilOutcome } from './councils.ts';
import { provinces } from './results.ts';
import { councilSnapshot, majorityParty, COUNCIL_SNAPSHOT_VERSION, type CouncilSnapshot } from './snapshot.ts';
import type { CouncilStatus } from './dashboard-filter.ts';

type Row = ResultRow & { province_id: string | null; ward_id: string | null };
type StoredSummary = { source_id: string; snapshot_id: string; summary_json: string };
const councilPlaces = places.filter(p => p.kind === 'metro' || p.kind === 'municipality');
const record = (row: Row): AreaRecord => ({ level: row.level, id: row.area_id, name: row.name,
  provinceId: row.province_id, municipalityId: row.municipality_id, wardId: row.ward_id,
  reportedAt: row.reported_at, payload: JSON.parse(row.payload) });

export function dashboardCouncils(current = new Map<string, CouncilSnapshot>(), previous = new Map<string, CouncilSnapshot>(),
  outcomes: CouncilOutcome[] = [], unavailable = new Set<string>()) {
  const byId = new Map(outcomes.map(o => [o.id, o]));
  return councilPlaces.map(place => {
    const id = place.relationships.find(r => r.level === 'municipality' && r.relation === 'equals' && r.election === latestYear)!.areaId;
    const snapshot = current.get(id) ?? null, before = previous.get(id) ?? null, outcome = byId.get(id);
    const seats = snapshot?.seats ?? (outcome && outcome.status !== 'pending' ? outcome : null);
    const winner = majorityParty(seats), largest = seats?.parties[0] ?? null;
    const uniqueLargest = largest && largest.id !== '0' && !seats!.parties.some(p => p.id !== largest.id && p.count === largest.count) ? largest : null;
    const status: CouncilStatus = seats?.status === 'reported' ? winner ? 'majority' : 'no-majority'
      : unavailable.has(id) ? 'unavailable' : 'pending';
    const comparable = seats?.status === 'reported' && before?.seats?.status === 'reported';
    const previousWinner = before?.seats?.status === 'reported' ? majorityParty(before.seats) : null;
    return { id, name: place.name, province: place.province, provinceId: provinces.find(p => p.name === place.province)?.id ?? '',
      metro: place.kind === 'metro', href: placeUrl(place), builderHref: `${placeUrl(place)}/coalition`,
      search: normaliseCouncilSearch([place.name, ...place.aliases, place.province, id].join(' ')),
      status, seats, winner, largest: uniqueLargest, winnerId: status === 'majority' ? winner!.id : '',
      comparable, changed: !!comparable && (winner?.id ?? null) !== (previousWinner?.id ?? null), previousWinner, previousWinnerId: previousWinner?.id ?? '',
      snapshot, previous: before, progress: snapshot?.progress ?? null };
  }).sort((a, b) => Number(b.metro) - Number(a.metro) || resultOrder(a) - resultOrder(b)
    || a.name.localeCompare(b.name, 'en-ZA'));
}
// Within metros and local councils: reported allocations, then counts in progress,
// then councils still awaiting data.
function resultOrder(council: { status: CouncilStatus; seats: CouncilSnapshot['seats']; progress: CouncilSnapshot['progress']; snapshot: CouncilSnapshot | null }) {
  if (council.status === 'majority' || council.status === 'no-majority') return 0;
  if (council.status === 'unavailable') return 3;
  return council.seats || (council.progress?.completed ?? 0) > 0 || council.snapshot?.votes ? 1 : 2;
}
export type DashboardCouncil = ReturnType<typeof dashboardCouncils>[number];

export function dashboardHighlights(councils: DashboardCouncil[]) {
  const changes = councils.filter(c => c.changed);
  const movements = councils.flatMap(c => {
    const now = c.snapshot, before = c.previous;
    // Completed current counts only; partial reporting is geographically selective.
    if (!now?.votes || !before?.votes || !now.progress || now.progress.completed !== now.progress.expected) return [];
    const current = new Map(now.votes.map(p => [p.id, p])), previous = new Map(before.votes.map(p => [p.id, p]));
    return [...new Set([...current.keys(), ...previous.keys()])].map(id => {
      const a = current.get(id), b = previous.get(id);
      return { council: c, party: (a ?? b)!, previousShare: b?.share ?? 0, currentShare: a?.share ?? 0, delta: (a?.share ?? 0) - (b?.share ?? 0) };
    });
  });
  const races = councils.flatMap(c => (c.snapshot?.races ?? []).map(race => ({ council: c, ...race })))
    .sort((a, b) => a.marginPoints - b.marginPoints || a.margin - b.margin || a.id.localeCompare(b.id)).slice(0, 6);
  const councilRaces = councils.flatMap(c => c.status === 'pending' && c.snapshot?.pendingRace ? [{ council: c, ...c.snapshot.pendingRace }] : [])
    .sort((a, b) => a.marginPoints - b.marginPoints || a.margin - b.margin || a.id.localeCompare(b.id)).slice(0, 6);
  const watch = councils.filter(c => c.status === 'pending' && c.progress && c.progress.percent > 0 && c.progress.percent < 100)
    .sort((a, b) => Number(b.metro) - Number(a.metro) || b.progress!.percent - a.progress!.percent || a.name.localeCompare(b.name))[0] ?? null;
  return { changes, comparable: councils.filter(c => c.comparable).length,
    gains: movements.filter(m => m.delta >= 0.05).sort((a, b) => b.delta - a.delta || a.council.id.localeCompare(b.council.id)).slice(0, 6),
    losses: movements.filter(m => m.delta <= -0.05).sort((a, b) => a.delta - b.delta || a.council.id.localeCompare(b.council.id)).slice(0, 6),
    movementCoverage: new Set(movements.map(m => m.council.id)).size, races, councilRaces, watch,
    wardCoverage: councils.reduce((n, c) => n + (c.snapshot?.wardsCovered ?? 0), 0) };
}

/** Reads compact source summaries; never downloads all municipality/ward packs for the council dashboard.
 * Existing local imports are derived from D1. During rollout, only metros need fallback pack reads. */
export async function getCouncilDashboard(db: D1Database, bucket?: R2Bucket) {
  const previousYear = previousElection(latestYear)!;
  const [currentRows, oldRows, states, stored] = await Promise.all([
    db.prepare(`SELECT ${resultColumns} ${joinedResults} WHERE r.year=? AND r.level='municipality'`).bind(latestYear).all<Row>(),
    db.prepare(`SELECT ${resultColumns} ${joinedResults} WHERE r.year=? AND r.level='municipality'`).bind(previousYear).all<Row>().catch(error => {
      console.error('Council history unavailable', error); return { results: [] as Row[] };
    }),
    readCouncilStates(db, latestYear),
    db.prepare('SELECT source_id,snapshot_id,summary_json FROM council_dashboard').all<StoredSummary>().catch(error => {
      if (/no such table: (?:main\.)?council_dashboard/i.test(String(error))) return { results: [] as StoredSummary[] };
      throw error;
    }),
  ]);
  const summaries = new Map(stored.results.map(s => [s.source_id, s]));
  const current = new Map<string, CouncilSnapshot>(), previous = new Map<string, CouncilSnapshot>(), unavailable = new Set<string>();
  // Local imports don't have a sync projection. Select only unfinished ward counts with meaningful coverage.
  const localWards = await db.prepare(`SELECT ${resultColumns} ${joinedResults} WHERE r.year=? AND r.level='ward' AND b.object_key IS NULL
    AND json_extract(r.payload,'$.progress.voting_districts.completed') * 2 >= json_extract(r.payload,'$.progress.voting_districts.expected')
    AND json_extract(r.payload,'$.progress.voting_districts.completed') < json_extract(r.payload,'$.progress.voting_districts.expected')`)
    .bind(latestYear).all<Row>();
  const wards = new Map<string, AreaRecord[]>();
  for (const row of localWards.results) try {
    if (!currentRows.results.some(c => c.area_id === row.municipality_id && c.source_id === row.source_id && c.snapshot_id === row.snapshot_id)) continue;
    const r = record(row); const list = wards.get(row.municipality_id!) ?? []; list.push(r); wards.set(row.municipality_id!, list);
  } catch { /* An invalid ward cannot enter a ranking. */ }
  for (const row of currentRows.results) {
    const stored = summaries.get(row.source_id!);
    if (stored?.snapshot_id === row.snapshot_id) try {
      const summary = JSON.parse(stored.summary_json) as CouncilSnapshot;
      if (summary.version === COUNCIL_SNAPSHOT_VERSION && summary.id === row.area_id) { current.set(row.area_id, summary); continue; }
    } catch { /* Retain the source-derived fallback. */ }
    if (row.payload) try {
      const summary = councilSnapshot([record(row), ...(wards.get(row.area_id) ?? [])]);
      if (summary) current.set(row.area_id, summary);
    } catch { unavailable.add(row.area_id); }
  }
  const metros = new Set(councilPlaces.filter(p => p.kind === 'metro').map(p => p.relationships.find(r => r.level === 'municipality' && r.relation === 'equals')!.areaId));
  const missing = currentRows.results.filter(r => metros.has(r.area_id) && !current.has(r.area_id) && !r.payload);
  for (let i = 0; i < missing.length; i += 4) await Promise.all(missing.slice(i, i + 4).map(async row => {
    try { await hydrateResults(db, bucket, [row]); const summary = councilSnapshot([record(row)]); if (summary) current.set(row.area_id, summary); }
    catch { unavailable.add(row.area_id); }
  }));
  // Historical municipal results normally live in D1; bound any legacy pack fallback.
  for (let i = 0; i < oldRows.results.length; i += 32) {
    const rows = oldRows.results.slice(i, i + 32);
    try { await hydrateResults(db, bucket, rows); } catch { /* Missing history never hides current outcomes. */ }
    for (const row of rows) if (row.payload) try {
      const summary = councilSnapshot([record(row)]); if (summary) previous.set(row.area_id, summary);
    } catch { /* Exclude invalid history from comparisons. */ }
  }
  const outcomes = summariseCouncils(currentRows.results, states, null).entries;
  for (const row of currentRows.results) if (!current.has(row.area_id) && !row.payload
    && !states.some(s => s.source_id === row.source_id && s.snapshot_id === row.snapshot_id)) unavailable.add(row.area_id);
  const councils = dashboardCouncils(current, previous, outcomes, unavailable);
  return { councils, highlights: dashboardHighlights(councils), previousYear,
    summaryCoverage: current.size, total: councils.length,
    delayedCouncils: currentRows.results.filter(r => r.last_error || !Number.isFinite(Date.parse(r.last_success_at ?? ''))
      || Date.now() - Date.parse(r.last_success_at!) > 900_000).length };
}
export type CouncilDashboard = Awaited<ReturnType<typeof getCouncilDashboard>>;
