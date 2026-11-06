import { attachPrevious } from '../history/results.ts';
import { displayBallot, latestYear } from '../history/comparison.ts';
import type { AreaRecord, Level } from '../data/normalize.ts';
import { resultFromRow, partyStyle, type Result, type ResultRow } from '../places/results.ts';
import { places, placeUrl } from '../places/catalogue.ts';
import { hydrateResults, joinedResults } from '../data/packed-results.ts';
import { readCouncilStates, summariseCouncils, type CouncilOverview } from './councils.ts';

export const provinces = [
  { id: '1', slug: 'eastern-cape', name: 'Eastern Cape', code: 'EC', label: [368, 350] },
  { id: '2', slug: 'free-state', name: 'Free State', code: 'FS', label: [342, 238] },
  { id: '3', slug: 'gauteng', name: 'Gauteng', code: 'GT', label: [399, 161] },
  { id: '4', slug: 'kwazulu-natal', name: 'KwaZulu-Natal', code: 'KZN', label: [477, 258] },
  { id: '7', slug: 'limpopo', name: 'Limpopo', code: 'LIM', label: [444, 68] },
  { id: '5', slug: 'mpumalanga', name: 'Mpumalanga', code: 'MP', label: [467, 157] },
  { id: '6', slug: 'northern-cape', name: 'Northern Cape', code: 'NC', label: [208, 282] },
  { id: '8', slug: 'north-west', name: 'North West', code: 'NW', label: [320, 157] },
  { id: '9', slug: 'western-cape', name: 'Western Cape', code: 'WC', label: [190, 416] },
] as const;
export type Province = typeof provinces[number];
export const provinceUrl = (province: Province, year: number = latestYear) => `/${year}/provinces/${province.slug}`;
export const provinceById = (id: string | null) => provinces.find(p => p.id === id);
export const municipalityName = (name: string) => name.replace(/^[A-Z0-9]+\s+-\s+/, '');
export const apiResultUrl = (level: Level, id: string) => `/api/v1/elections/2026/areas/${level}/${encodeURIComponent(id)}`;
export function overviewPartyStyle(name: string): [string, string] {
  const additional: Record<string, [string,string]> = {
    'UMKHONTO WESIZWE PARTY': ['MK', '#54632c'], 'ACTIONSA': ['ActionSA', '#658247'],
    'SOUTH AFRICAN COMMUNIST PARTY': ['SACP', '#b64038'], 'INKATHA FREEDOM PARTY': ['IFP', '#b44b69'],
    'OTHER': ['Other', '#8b9998'], 'IND': ['Independent', '#627875'],
  };
  return additional[name.toUpperCase()] ?? partyStyle(name) as [string,string];
}

export type MunicipalityLink = { id: string; name: string; code: string; provinceId: string; href: string; placeHref?: string };
export const metroPlaces = places.filter(place => place.kind === 'metro');
const metroIds = metroPlaces.map(place => place.relationships.find(r => r.election === 2026 && r.level === 'municipality' && r.relation === 'equals')!.areaId);
type OverviewRow = Omit<ResultRow, 'payload'> & { province_id: string | null; payload: string | null };
function municipalityLink(row: OverviewRow): MunicipalityLink {
  const province = provinceById(row.province_id);
  if (!province) throw new Error('Municipality has no recognised province');
  const place = places.find(p => p.relationships.some(r => r.election === 2026 && r.level === 'municipality' && r.relation === 'equals' && r.areaId === row.area_id));
  return { id: row.area_id, name: municipalityName(row.name), code: row.name.split(' - ')[0]!,
    provinceId: province.id, href: `${provinceUrl(province, row.year)}#municipality-${row.area_id}`,
    ...(place ? { placeHref: placeUrl(place, row.year) } : {}) };
}
const selection = `SELECT r.year,r.level,r.area_id,r.province_id,r.municipality_id,r.name,r.reported_at,
  d.active_snapshot_id AS snapshot_id,r.source_id,b.object_key AS bundle_key,
  d.url,d.last_checked_at,d.last_success_at,d.last_error,`;
const active = `${joinedResults}
  WHERE r.year=?`;
function asResult(row: OverviewRow): Result {
  if (row.payload === null) throw new Error('Missing result payload');
  return resultFromRow({ ...row, payload: row.payload });
}

/** Read snapshot pointers together. Packed councils use the sync's compact outcome state. */
export async function getNationalOverview(db: D1Database, bucket?: R2Bucket, year: number = latestYear) {
  const { results } = await db.prepare(`${selection} CASE WHEN b.object_key IS NOT NULL
    OR (? <> ? AND r.level='municipality' AND r.area_id NOT IN (${metroIds.map(() => '?').join(',')})) THEN NULL ELSE r.payload END AS payload
    ${active} AND r.level IN ('national','province','municipality')`).bind(year, latestYear, ...metroIds, year).all<OverviewRow>();
  await hydrateResults(db, bucket, results.filter(r => r.level !== 'municipality'));
  const national = results.find(r => r.level === 'national');
  if (!national) throw new Error('National result is not available');
  const metros: { place: typeof metroPlaces[number]; result: Result | null }[] = [];
  // A failed metro file should not hide the national result or the other metros.
  for (let start = 0; start < metroPlaces.length; start += 4) {
    metros.push(...await Promise.all(metroPlaces.slice(start, start + 4).map(async place => {
      const id = place.relationships.find(r => r.election === 2026 && r.level === 'municipality' && r.relation === 'equals')!.areaId;
      const row = results.find(r => r.level === 'municipality' && r.area_id === id);
      let result: Result | null = null;
      if (row) try { await hydrateResults(db, bucket, [row]); result = asResult(row); }
      catch { console.error('Metro result unavailable', id); }
      return { place, result };
    })));
  }
  let councils: CouncilOverview | null = null;
  if (year === latestYear) try {
    councils = summariseCouncils(results.filter(r => r.level === 'municipality'), await readCouncilStates(db, year),
      asResult(national).results.progress.municipalities?.expected ?? null);
  } catch (error) { console.error('Council overview unavailable', error); }
  const data = { national: asResult(national), councils, provinces: provinces.map(province => {
    const row = results.find(r => r.level === 'province' && r.area_id === province.id);
    return { province, result: row ? asResult(row) : null };
  }), metros, municipalities: results.filter(r => r.level === 'municipality').map(municipalityLink).sort((a,b) => a.name.localeCompare(b.name, 'en-ZA')) };
  await attachPrevious(db, [data.national, ...data.provinces.flatMap(p => p.result ? [p.result] : []), ...data.metros.flatMap(m => m.result ? [m.result] : [])], bucket);
  return data;
}

/** Reading the province and its municipalities in one statement prevents pointer changes mid-render. */
export async function getProvinceOverview(db: D1Database, province: Province, bucket?: R2Bucket, year: number = latestYear) {
  const { results } = await db.prepare(`${selection} CASE WHEN b.object_key IS NULL THEN r.payload ELSE NULL END AS payload ${active}
    AND r.province_id=? AND r.level IN ('province','municipality')`).bind(year, province.id).all<OverviewRow>();
  await hydrateResults(db, bucket, results);
  const summary = results.find(r => r.level === 'province' && r.area_id === province.id);
  if (!summary) throw new Error('Province result is not available');
  const data = { province, summary: asResult(summary), municipalities: results.filter(r => r.level === 'municipality')
    .map(row => ({ ...municipalityLink(row), result: asResult(row) })).sort((a,b) => a.name.localeCompare(b.name, 'en-ZA')) };
  await attachPrevious(db, [data.summary, ...data.municipalities.map(m => m.result)], bucket);
  return data;
}

export function progressOf(result: Result, key: keyof AreaRecord['payload']['progress'] = 'voting_districts') {
  const p = result.results.progress[key];
  if (!p || !Number.isSafeInteger(p.expected) || p.expected <= 0 || p.completed === null
    || !Number.isSafeInteger(p.completed) || p.completed < 0 || p.completed > p.expected) return null;
  return { expected: p.expected, completed: p.completed, percent: p.completed / p.expected * 100 };
}
export const progressLabel = (p: ReturnType<typeof progressOf>) => p === null ? 'Unavailable'
  : (p.completed === p.expected ? 100 : Math.min(99.9, Math.round(p.percent * 10) / 10)).toFixed(1) + '%';
export function resultDelay(result: Result, now = Date.now()) {
  if (result.year !== latestYear) return null;
  if (result.source.error) return 'The latest refresh failed. These are the last available figures.';
  const age = now - Date.parse(result.source.successfulAt ?? '');
  const threshold = ['national', 'province'].includes(result.level) ? 180_000 : 900_000;
  return !Number.isFinite(age) || age > threshold ? 'Updates are delayed. These are the last available figures.' : null;
}

/** Only complete municipality PR rows can supply a denominator or an individual leading party. */
export function municipalBallot(result: Result) {
  const basis = displayBallot(result, 'pr');
  const rows = [...result.results.parties].sort((a,b) => (b.votes[basis] ?? -1) - (a.votes[basis] ?? -1));
  const complete = result.results.party_list_scope === 'all_rows_in_source' && rows.length > 0
    && rows.every(p => p.votes[basis] !== null && Number.isSafeInteger(p.votes[basis]) && p.votes[basis] >= 0);
  const total = complete ? rows.reduce((sum, p) => sum + p.votes[basis]!, 0) : null;
  const positive = total !== null && total > 0;
  const top = rows[0];
  const tied = positive && !!top && rows.filter(p => p.votes[basis] === top.votes[basis]).length > 1;
  const leader = positive && !tied && top?.entry_type !== 'aggregate' ? top : null;
  return { total, tied, leader, parties: rows.map(p => ({ ...p, share: positive ? p.votes[basis]! / total * 100 : null })) };
}

/** Province lists are truncated. Their denominator is the IEC's reported valid total,
 * never the sum of the few displayed parties. Combined ballots are not voters. */
export function summaryBallot(result: Result) {
  const reported = result.results.reported_totals.valid_ballot_papers;
  const rows = result.results.parties;
  const validRows = rows.length > 0 && rows.every(p => p.votes.source_total !== null
    && Number.isSafeInteger(p.votes.source_total) && p.votes.source_total >= 0);
  const rowTotal = validRows ? rows.reduce((sum,p) => sum + p.votes.source_total!, 0) : null;
  const validTotal = reported !== null && Number.isSafeInteger(reported) && reported >= 0;
  const partial = result.results.party_list_scope === 'leading_parties_only';
  const consistent = validTotal && rowTotal !== null && (partial ? rowTotal <= reported : rowTotal === reported);
  const total = consistent ? reported : null;
  const parties = rows.map(p => ({ ...p, votesForBallot: p.votes.source_total,
    share: total !== null && total > 0 ? p.votes.source_total! / total * 100 : null }))
    .sort((a,b) => (b.votesForBallot ?? -1) - (a.votesForBallot ?? -1));
  const highest = parties[0];
  const tied = total !== null && total > 0 && !!parties[1] && highest!.votesForBallot === parties[1].votesForBallot;
  // A truncated list can identify the highest *shown* share, not an election winner.
  const topShown = total !== null && total > 0 && !tied && highest?.entry_type !== 'aggregate' ? highest ?? null : null;
  return { total, parties, partial, tied, topShown, unlisted: consistent && partial ? reported - rowTotal! : null };
}

export function summaryShareText(result: Result, name: string) {
  const ballot = summaryBallot(result);
  const top = ballot.topShown;
  const update = ballot.total === 0 ? 'Awaiting the first votes.'
    : ballot.total === null ? 'The latest published votes.'
    : ballot.tied ? 'Level at the top.'
    : top ? `${partyStyle(top.party_name)[0]} ${top.share!.toFixed(1)}%.` : 'The count so far.';
  return `${name}: ${update} Provisional results · combined ward + municipal PR votes.${ballot.partial ? ' Selected parties only.' : ''}`;
}

const normal = (s: string) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('en-ZA').replace(/[^a-z0-9]+/g, ' ').trim();
export function matchesMunicipality(municipality: MunicipalityLink, query: string) {
  const words = normal(query).split(' ').filter(Boolean);
  const name = normal(`${municipality.name} ${municipality.code} ${provinceById(municipality.provinceId)?.name ?? ''}`);
  return words.every(word => name.includes(word));
}

// Summary-map colours encode reporting progress only. Unknown progress has a separate hatch.
export function reportingTone(progress: ReturnType<typeof progressOf>) {
  if (!progress) return '#dce1d5';
  const light = [221,228,228], dark = [55,85,116];
  return `rgb(${light.map((v,i) => Math.round(v + (dark[i]! - v) * progress.percent / 100)).join(',')})`;
}
export function reportingLabelColour(progress: ReturnType<typeof progressOf>) {
  if (!progress) return '#000';
  const rgb = reportingTone(progress).match(/\d+/g)!.map(Number);
  const channels = rgb.map(value => { const s=value/255; return s<=0.04045 ? s/12.92 : ((s+0.055)/1.055)**2.4; });
  const luminance = channels[0]!*0.2126 + channels[1]!*0.7152 + channels[2]!*0.0722;
  return (luminance+0.05)/0.05 >= 1.05/(luminance+0.05) ? '#000' : '#fff';
}
