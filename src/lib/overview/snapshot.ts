import type { AreaRecord } from '../data/normalize.ts';
import { councilSeats } from '../seats/allocation.ts';
import { historicalCouncilSeats } from '../history/seats.ts';
import { latestYear } from '../history/comparison.ts';
import type { HistoricalCorrection } from '../history/corrections.ts';

type Payload = AreaRecord['payload'];
export type CouncilParty = { id: string; name: string; count: number };
export type SeatSummary = { status: 'reported' | 'estimated'; total: number; majority: number; parties: CouncilParty[]; correction?: HistoricalCorrection };
export type VoteShare = { id: string; name: string; share: number };
export type CountProgress = { completed: number; expected: number; percent: number };
export type CloseRace = { id: string; margin: number; marginPoints: number; progress: CountProgress;
  leaders: { name: string; votes: number }[]; tied: boolean };
export const COUNCIL_SNAPSHOT_VERSION = 2;
export type CouncilSnapshot = { version: typeof COUNCIL_SNAPSHOT_VERSION; id: string; reportedAt: string; progress: CountProgress | null;
  seats: SeatSummary | null; votes: VoteShare[] | null; races: CloseRace[]; pendingRace: CloseRace | null; wardsCovered: number };
const count = (n: unknown): n is number => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0;

export function countProgress(payload: Payload): CountProgress | null {
  const p = payload.progress.voting_districts;
  return p && count(p.completed) && count(p.expected) && p.expected > 0 && p.completed <= p.expected
    ? { completed: p.completed, expected: p.expected, percent: p.completed / p.expected * 100 } : null;
}

/** Complete combined-ballot shares, with the full denominator including independents. */
export function comparisonShares(payload: Payload): VoteShare[] | null {
  const rows = payload.parties;
  if (payload.party_list_scope !== 'all_rows_in_source' || !rows.length
    || rows.some(p => p.entry_type === 'aggregate' || !count(p.votes.source_total) || !p.party_id)
    || new Set(rows.map(p => p.party_id)).size !== rows.length) return null;
  // Unknown identities cannot be mistaken for a party absent from a complete list.
  if (rows.some(p => p.party_id !== '0' && (p.candidate_name || p.party_name_source === 'unavailable'
    || /^(ind|independents?|independent candidates?|unnamed(?: party)?)$/i.test(p.party_name.trim())))) return null;
  const total = rows.reduce((n, p) => n + p.votes.source_total!, 0);
  if (!Number.isSafeInteger(total) || total <= 0) return null;
  return rows.filter(p => p.party_id !== '0' && !p.candidate_name && p.party_name_source !== 'unavailable'
    && !/^(ind|independents?|independent candidates?|unnamed(?: party)?)$/i.test(p.party_name.trim()))
    .map(p => ({ id: p.party_id!, name: p.party_name, share: p.votes.source_total! / total * 100 }));
}

/** Close means <= 2 pp, with at least half the districts reporting and counting unfinished.
 * Ward ballots only. Explicit ward-seat awards exclude a race even if progress lags. */
export function closeRace(record: AreaRecord): CloseRace | null {
  const p = record.payload, progress = countProgress(p), rows = p.parties;
  if (record.level !== 'ward' || !progress || progress.percent < 50 || progress.percent >= 100
    || p.party_list_scope !== 'all_rows_in_source' || rows.length < 2
    || new Set(rows.map(r => r.source_entry_id)).size !== rows.length
    || rows.some(r => r.entry_type === 'aggregate' || !count(r.votes.ward)
      || r.seats.ward !== 0 || r.party_name_source === 'unavailable')) return null;
  const ranked = [...rows].sort((a, b) => b.votes.ward! - a.votes.ward! || a.source_entry_id.localeCompare(b.source_entry_id));
  const total = ranked.reduce((n, r) => n + r.votes.ward!, 0);
  if (!Number.isSafeInteger(total) || total <= 0) return null;
  const margin = ranked[0]!.votes.ward! - ranked[1]!.votes.ward!, marginPoints = margin / total * 100;
  if (marginPoints > 2) return null;
  const tied = margin === 0;
  return { id: record.id, margin, marginPoints, progress, tied,
    leaders: (tied ? ranked.filter(p => p.votes.ward === ranked[0]!.votes.ward) : ranked.slice(0, 2))
      .map(p => ({ name: p.candidate_name ?? p.party_name, votes: p.votes.ward! })) };
}

/** A pending council's close PR vote count, never a call of council control.
 * Municipality progress is published even when ward-level progress is absent. */
export function closeCouncilRace(record: AreaRecord): CloseRace | null {
  const p = record.payload, progress = countProgress(p), rows = p.parties;
  if (record.level !== 'municipality' || !progress || progress.percent < 50 || progress.percent >= 100
    || councilSeats('municipality', p).status === 'reported' || p.party_list_scope !== 'all_rows_in_source'
    || rows.length < 2 || new Set(rows.map(r => r.party_id)).size !== rows.length
    || rows.some(r => !r.party_id || r.entry_type === 'aggregate' || !count(r.votes.pr)
      || r.candidate_name || r.party_name_source === 'unavailable')) return null;
  const ranked = [...rows].sort((a, b) => b.votes.pr! - a.votes.pr! || a.party_id!.localeCompare(b.party_id!));
  const total = ranked.reduce((n, r) => n + r.votes.pr!, 0);
  if (!Number.isSafeInteger(total) || total <= 0) return null;
  const margin = ranked[0]!.votes.pr! - ranked[1]!.votes.pr!, marginPoints = margin / total * 100;
  if (marginPoints > 2) return null;
  const tied = margin === 0, leaders = tied ? ranked.filter(r => r.votes.pr === ranked[0]!.votes.pr) : ranked.slice(0, 2);
  // A grouped independent row cannot be represented as a single contender.
  if (leaders.some(r => r.party_id === '0' || /^(ind|independents?|independent candidates?|unnamed(?: party)?)$/i.test(r.party_name.trim()))) return null;
  return { id: record.id, margin, marginPoints, progress, tied,
    leaders: leaders.map(r => ({ name: r.party_name, votes: r.votes.pr! })) };
}

/** Small derived read model; source results remain untouched. Published atomically with the source. */
export function councilSnapshot(records: readonly AreaRecord[], year = latestYear): CouncilSnapshot | null {
  const council = records.find(r => r.level === 'municipality');
  if (!council) return null;
  const allocation = year === latestYear ? councilSeats('municipality', council.payload) : historicalCouncilSeats('municipality', council.payload,{year,id:council.id});
  const wards = records.filter(r => r.level === 'ward' && r.municipalityId === council.id);
  return { version: COUNCIL_SNAPSHOT_VERSION, id: council.id, reportedAt: council.reportedAt, progress: countProgress(council.payload),
    seats: allocation.status === 'unavailable' ? null : { status: allocation.status, total: allocation.total,
      majority: allocation.majority, parties: allocation.parties.map(p => ({ id: p.party_id ?? p.source_entry_id, name: p.party_name, count: p.count })),
      ...('correction' in allocation && allocation.correction ? {correction:allocation.correction as HistoricalCorrection} : {}) },
    votes: comparisonShares(council.payload), pendingRace: closeCouncilRace(council), wardsCovered: wards.length,
    // Each council's closest six suffice for the nationwide closest six (same ordering).
    races: wards.flatMap(w => { const race = closeRace(w); return race ? [race] : []; })
      .sort((a, b) => a.marginPoints - b.marginPoints || a.margin - b.margin || a.id.localeCompare(b.id)).slice(0, 6) };
}

export const majorityParty = (seats: SeatSummary | null) => seats?.parties.find(p => p.id !== '0' && p.id !== '-2' && p.count >= seats.majority) ?? null;
