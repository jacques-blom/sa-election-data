import { joinedResults, hydrateResults, resultColumns } from '../data/packed-results.ts';
import { latestYear, previousElection } from '../history/comparison.ts';
import { electionCouncilSeats } from '../history/seats.ts';
import { places, placeUrl } from '../places/catalogue.ts';
import { majorityWinner } from '../seats/majority.ts';
import type { ResultRow } from '../places/results.ts';
import { readCouncilStates, summariseCouncils } from './councils.ts';
import { provinces } from './results.ts';

export type StoryCouncil = { id: string; provinceId: string; name: string; href: string;
  outcome: 'pending' | 'no-majority' | 'majority'; party: { id: string; name: string } | null };
export type StoryCouncilChange = { council: StoryCouncil; before: StoryCouncil | null; change: 'gained' | 'lost' | 'unchanged' | 'unknown' };
type Row = ResultRow & { year: number; province_id: string | null };
const councilPlaces = places.filter(p => p.kind === 'municipality' || p.kind === 'metro');
const placeById = new Map(councilPlaces.map(p => [p.relationships.find(r => r.election === latestYear && r.level === 'municipality' && r.relation === 'equals')!.areaId, p]));

/** Count each local/metro once. Changes use only matching, reported councils in both elections. */
export function councilOutcomeStory(current: StoryCouncil[], previous: StoryCouncil[], year: number) {
  const old = new Map(previous.map(c => [c.id, c]));
  const groups = new Map<string, { id: string; party: StoryCouncil['party']; councils: StoryCouncil[]; entries: StoryCouncilChange[]; delta: number | null }>();
  const key = (c: StoryCouncil) => c.outcome === 'majority' ? `party-${c.party!.id}` : c.outcome;
  const group = (c: StoryCouncil) => {
    const id = key(c);
    if (!groups.has(id)) groups.set(id, { id, party: c.party, councils: [], entries: [], delta: null });
    return groups.get(id)!;
  };
  const unique = [...new Map(current.map(c => [c.id, c])).values()];
  for (const c of unique) {
    const candidate = old.get(c.id);
    const before = candidate?.provinceId === c.provinceId ? candidate : null;
    group(c).councils.push(c);
    group(c).entries.push({ council:c, before, change:before && before.outcome !== 'pending' && c.outcome !== 'pending'
      ? key(before) === key(c) ? 'unchanged' : 'gained' : 'unknown' });
  }
  let comparable = 0;
  for (const c of unique) {
    const before = old.get(c.id);
    if (c.outcome === 'pending' || !before || before.outcome === 'pending' || before.provinceId !== c.provinceId) continue;
    comparable++;
    group(c).delta = (group(c).delta ?? 0) + 1;
    group(before).delta = (group(before).delta ?? 0) - 1;
    if (key(c) !== key(before)) group(before).entries.push({ council:c, before, change:'lost' });
  }
  return { year, previousYear: previousElection(year), total: unique.length, comparable,
    groups: [...groups.values()].map(g => ({ ...g, count: g.councils.length,
      delta: g.id === 'pending' || !comparable ? null : g.delta ?? 0,
      councils: g.councils.sort((a,b) => a.name.localeCompare(b.name, 'en-ZA')),
      entries: g.entries.sort((a,b) => Number(a.change==='unchanged'||a.change==='unknown')-Number(b.change==='unchanged'||b.change==='unknown')
        || a.council.name.localeCompare(b.council.name, 'en-ZA')) }))
      .sort((a,b) => Number(!a.party)-Number(!b.party) || (a.party && b.party ? b.count-a.count || a.party.name.localeCompare(b.party.name) : Number(a.id==='pending')-Number(b.id==='pending'))) };
}
export type CouncilOutcomeStory = ReturnType<typeof councilOutcomeStory>;

/** Current packed results use validated milestones; archived allocations use the historical validator. */
export async function readCouncilOutcomeStory(db: D1Database, bucket: R2Bucket | undefined, year: number, provinceId?: string): Promise<CouncilOutcomeStory | null> {
  const previousYear = previousElection(year);
  const [rows, states] = await Promise.all([
    db.prepare(`SELECT ${resultColumns} ${joinedResults} WHERE r.level='municipality' AND d.kind='municipality'
      AND r.year IN (?,?) ${provinceId ? 'AND r.province_id=?' : ''}`)
      .bind(year, previousYear ?? year, ...(provinceId ? [provinceId] : [])).all<Row>(),
    year === latestYear ? readCouncilStates(db, year) : Promise.resolve([]),
  ]);
  // Archives normally live in D1. Bound legacy pack reads, and leave failed allocations unknown.
  const archived = rows.results.filter(r => r.year !== latestYear && !r.payload && r.bundle_key);
  for (let i = 0; i < archived.length; i += 16) {
    try { await hydrateResults(db, bucket, archived.slice(i, i + 16)); }
    catch (error) { console.error('Council outcome archive unavailable', error); }
  }
  const live = new Map(summariseCouncils(rows.results.filter(r => r.year === latestYear), states, null).entries.map(c => [c.id, c]));
  const elections = new Map<number, StoryCouncil[]>();
  for (const row of rows.results) {
    const place = placeById.get(row.area_id);
    const c: StoryCouncil = { id:row.area_id, provinceId:row.province_id ?? '', name:row.name.replace(/^[A-Z0-9]+\s+-\s+/, ''),
      href:place ? placeUrl(place, row.year) : `/${row.year}/provinces/${provinces.find(p=>p.id===row.province_id)?.slug}#municipality-${row.area_id}`,
      outcome:'pending', party:null };
    if (row.year === latestYear) {
      const outcome = live.get(row.area_id);
      if (outcome?.status === 'reported') { c.party = outcome.winner; c.outcome = c.party ? 'majority' : 'no-majority'; }
    } else if (row.payload) try {
      const seats = electionCouncilSeats({ year:row.year, id:row.area_id, level:'municipality', results:JSON.parse(row.payload) });
      if (seats.status === 'reported') {
        const winner = majorityWinner(seats);
        c.party = winner ? { id:winner.party_id!, name:winner.party_name } : null;
        c.outcome = c.party ? 'majority' : 'no-majority';
      }
    } catch { /* Missing or malformed history never becomes a no-majority outcome. */ }
    const list = elections.get(row.year) ?? []; list.push(c); elections.set(row.year, list);
  }
  const current = elections.get(year) ?? [];
  // Include current councils whose first source report has not arrived yet.
  if (year === latestYear) for (const [id, place] of placeById) {
    const province = provinces.find(p=>p.name===place.province)?.id;
    if ((!provinceId || province === provinceId) && !current.some(c => c.id === id)) current.push({ id, provinceId:province!, name:place.name,
      href:placeUrl(place, year), outcome:'pending', party:null });
  }
  return current.length ? councilOutcomeStory(current, elections.get(previousYear ?? 0) ?? [], year) : null;
}
