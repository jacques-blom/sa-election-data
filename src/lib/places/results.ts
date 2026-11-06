import { attachPrevious } from '../history/results.ts';
import { displayBallot, latestYear } from '../history/comparison.ts';
import { formatNumber, formatTime } from './format.ts';
export { formatNumber, formatTime, partyStyle } from './format.ts';
import type { AreaRecord, Level } from '../data/normalize.ts';
import { resultQuality } from '../data/quality.ts';
import { wardNumber, type Place } from './catalogue.ts';
import { hydrateResults, joinedResults, resultColumns } from '../data/packed-results.ts';

export type ResultRow = { year?: number; level: Level; area_id: string; name: string; municipality_id: string | null;
  payload: string; snapshot_id: string; reported_at: string; url: string; last_checked_at: string;
  last_success_at: string | null; last_error: string | null; source_id?: string; bundle_key?: string | null };
export type Result = ReturnType<typeof resultFromRow> & { previous?: ReturnType<typeof resultFromRow> | null };
export function resultFromRow(row: ResultRow) {
  const results = JSON.parse(row.payload) as AreaRecord['payload'];
  return { year: row.year ?? latestYear, level: row.level, id: row.area_id, name: row.name, municipalityId: row.municipality_id, results,
    source: { url: row.url, snapshotId: row.snapshot_id, reportedAt: row.reported_at,
      checkedAt: row.last_checked_at, successfulAt: row.last_success_at, error: row.last_error }, quality: resultQuality(results) };
}
const selection = `SELECT ${resultColumns} ${joinedResults}`;
/** One statement keeps municipality + ward rows on the same published source snapshot. */
export async function municipalityResults(db: D1Database, id: string, bucket?: R2Bucket, year = latestYear): Promise<Result[]> {
  const rows = await db.prepare(`${selection} WHERE r.year=? AND r.municipality_id=? AND r.level IN ('municipality','ward')`).bind(year, id).all<ResultRow>();
  return attachPrevious(db, (await hydrateResults(db, bucket, rows.results)).map(resultFromRow), bucket);
}
export async function getPlaceResults(db: D1Database, place: Place, bucket?: R2Bucket, year = latestYear) {
  const mappedYear = place.relationships.some(r => r.election === year) ? year : latestYear;
  const links = place.relationships.filter(r => r.election === mappedYear && r.level === 'municipality');
  if (!links.length) throw new Error('Place has no municipality mapping for this election');
  const wardIds = place.relationships.filter(r => r.election === mappedYear && r.level === 'ward').map(r => r.areaId);
  const whole = links.some(r => r.relation === 'equals');
  if (!whole && year !== mappedYear) throw new Error('Historical town boundaries are unavailable');
  const records = await db.prepare(`${selection} WHERE r.year=? AND (
    (r.level='municipality' AND r.area_id IN (SELECT value FROM json_each(?))) OR
    (r.level='ward' AND ${whole ? 'r.municipality_id' : 'r.area_id'} IN (SELECT value FROM json_each(?))))`)
    .bind(year, JSON.stringify(links.map(r=>r.areaId)), JSON.stringify(whole ? links.map(r=>r.areaId) : wardIds)).all<ResultRow>();
  const rows = await attachPrevious(db, (await hydrateResults(db,bucket,records.results)).map(resultFromRow), bucket);
  const municipalities = rows.filter(r=>r.level==='municipality');
  const municipality = municipalities[0] ?? null;
  const wards = rows.filter(r=>r.level==='ward').sort((a,b)=>a.municipalityId?.localeCompare(b.municipalityId??'') || wardNumber(a.id)-wardNumber(b.id));
  return { election:year, status:year === latestYear ? 'provisional' : 'historical', place, municipality, municipalities, wards,
    missingWardIds:wardIds.filter(id=>!wards.some(w=>w.id===id)),
    scope:whole ? 'whole_municipality' : 'whole_overlapping_wards_not_town_only' };
}
export async function getWardResults(db: D1Database, id: string, bucket?: R2Bucket, year = latestYear) {
  const row = await db.prepare(`${selection} WHERE r.year=? AND r.level='ward' AND r.area_id=?`).bind(year, id).first<ResultRow>();
  return row ? (await attachPrevious(db, [resultFromRow((await hydrateResults(db, bucket, [row]))[0]!)], bucket))[0]! : null;
}
export async function getVotingDistrictResults(db:D1Database,id:string,bucket?:R2Bucket,year=latestYear){
  const row=await db.prepare(`${selection} WHERE r.year=? AND r.level='voting-district' AND r.area_id=?`).bind(year, id).first<ResultRow>();
  return row ? (await attachPrevious(db, [resultFromRow((await hydrateResults(db,bucket,[row]))[0]!)], bucket))[0]! : null;
}
export type Ballot = 'pr' | 'ward';
/** Never mix ballots or treat a missing vote field as zero. */
export function ballotResults(result: Result, ballot: Ballot | 'source_total') {
  ballot = displayBallot(result, ballot);
  const parties = result.results.parties;
  const complete = result.results.party_list_scope === 'all_rows_in_source' && parties.length > 0
    && parties.every(p => p.votes[ballot] !== null && Number.isSafeInteger(p.votes[ballot]) && p.votes[ballot]! >= 0);
  const total = complete ? parties.reduce((s, p) => s + p.votes[ballot]!, 0) : null;
  const rows = parties.map(p => ({ ...p, votesForBallot: p.votes[ballot],
    share: total !== null && total > 0 && p.votes[ballot] !== null ? p.votes[ballot]! / total * 100 : null }))
    .sort((a, b) => (b.votesForBallot ?? -1) - (a.votesForBallot ?? -1));
  const top = rows[0], second = rows[1];
  const tied = total !== null && total > 0 && !!second && top!.votesForBallot === second.votesForBallot;
  const leader = total !== null && total > 0 && !tied && top?.entry_type !== 'aggregate' ? top ?? null : null;
  const runnerUp = leader && second?.entry_type !== 'aggregate' ? second ?? null : null;
  const leadVotes = leader && runnerUp ? leader.votesForBallot! - runnerUp.votesForBallot! : null;
  return { total, parties: rows, leader, runnerUp, leadVotes, tied };
}
export function reporting(result: Result) {
  const p = result.results.progress.voting_districts;
  if (!p || p.completed === null || p.expected <= 0 || p.completed > p.expected) return null;
  return { ...p, completed: p.completed, percent: p.completed / p.expected * 100 };
}
export function freshness(result: Result, now = Date.now()) {
  if (result.year !== latestYear) return null;
  if (result.source.error) return 'The latest refresh failed. Showing the last available results.';
  const age = now - Date.parse(result.source.successfulAt ?? '');
  return !Number.isFinite(age) || age > 900_000 ? 'Updates are delayed. Showing the last available results.' : null;
}
export type PlaceResults = Awaited<ReturnType<typeof getPlaceResults>>;
export function placeMarkdown(data: PlaceResults) {
  const p = data.place;
  const lines = [`# ${p.name} election results — 2026`, '', p.description, '', 'Status: provisional. Reporting completion is not an official declaration.', '', `Scope: ${data.scope}`, ''];
  if (p.boundaryContext) lines.push(...p.boundaryContext.notes, p.boundaryContext.method, 'This is not an address lookup or a town-only vote total.', '');
  for (const result of (p.kind === 'town' || p.kind === 'suburb') ? data.wards : data.municipality ? [data.municipality] : []) {
    const ballot = result.level === 'ward' ? 'ward' : 'pr';
    lines.push(`## ${result.level === 'ward' ? `Ward ${wardNumber(result.id)}` : p.name} — ${ballot === 'pr' ? 'municipal PR' : 'ward ballot'}`, '',
      `Source: ${result.source.url}`, `IEC reported: ${formatTime(result.source.reportedAt)}`, `Last checked: ${formatTime(result.source.checkedAt)}`, `Snapshot: ${result.source.snapshotId}`, freshness(result) ?? '', '', '| Party / candidate | Share of published ballot votes | Votes |', '| --- | ---: | ---: |');
    for (const party of ballotResults(result, ballot).parties) lines.push(`| ${party.party_name.replace(/[|\n\r]/g, ' ')} | ${party.share === null ? 'Unavailable' : party.share.toFixed(2)+'%'} | ${formatNumber(party.votesForBallot)} |`);
    lines.push('');
  }
  if (data.missingWardIds.length) lines.push(`Results unavailable for wards: ${data.missingWardIds.join(', ')}`);
  lines.push('## Wards', ...data.wards.map(w => `- [Ward ${wardNumber(w.id)}](/2026/wards/${w.id})`));
  return lines.join('\n');
}
