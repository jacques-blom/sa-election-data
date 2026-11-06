import { ELECTIONS } from '../data/catalogue.ts';
import type { Result } from '../places/results.ts';

export const latestYear = ELECTIONS[ELECTIONS.length - 1]!.year;
export const previousElection = (year: number) => ELECTIONS[ELECTIONS.findIndex(e => e.year === year) - 1]?.year ?? null;
export const electionYear = (value?: string) => ELECTIONS.find(e => String(e.year) === value)?.year;
export const nationalUrl = (year: number) => year === latestYear ? '/national-results' : `/${year}`;
export type VoteBasis = 'pr' | 'ward' | 'source_total';
export type Movement = { delta: number | null; previousYear: number; basis: VoteBasis; combinedFallback: boolean; previousShare: number | null; currentShare: number | null; reason?: string };
type Party = Result['results']['parties'][number];

export const combinedOnly = (result: Result) => result.results.parties.length > 0
  && result.results.parties.every(p => p.votes.pr === null && p.votes.ward === null);
export const displayBallot = (result: Result, ballot: VoteBasis): VoteBasis => combinedOnly(result) ? 'source_total' : ballot;

/** Summary denominators must include unlisted parties. Detail rows must be complete. */
function shares(result: Result, basis: VoteBasis) {
  const rows = result.results.parties;
  if (!rows.length || rows.some(p => p.votes[basis] === null || !Number.isSafeInteger(p.votes[basis]) || p.votes[basis]! < 0)) return null;
  const sum = rows.reduce((n, p) => n + p.votes[basis]!, 0);
  const summary = result.level === 'national' || result.level === 'province';
  const total = summary ? result.results.reported_totals.valid_ballot_papers : sum;
  const partial = result.results.party_list_scope === 'leading_parties_only';
  if ((!summary && partial) || total === null || !Number.isSafeInteger(total) || total <= 0
    || (partial ? sum > total : sum !== total)) return null;
  return { total, rows, partial };
}

/** Compare party identity and the same ballot, never a PR share with a combined share. */
export function partyMovement(result: Result, party: Party, requested: VoteBasis): Movement | null {
  const previousYear = previousElection(result.year);
  if (previousYear === null) return null;
  const before = result.previous;
  const basis = before && combinedOnly(before) ? 'source_total' : requested;
  const base: Movement = { previousYear, basis, combinedFallback: basis !== requested, delta: null, previousShare: null, currentShare: null };
  if (party.entry_type === 'aggregate' || !party.party_id || party.party_id === '0' || party.candidate_name
    || party.party_name_source === 'unavailable'
    || /^(ind|independents?|independent candidates?|unnamed(?: party)?)$/i.test(party.party_name.trim()))
    return { ...base, reason: 'Grouped or independent entries are not matched across elections.' };
  if (!before || before.year !== previousYear || before.level !== result.level || before.id !== result.id || before.municipalityId !== result.municipalityId)
    return { ...base, reason: `No matching result is available for ${previousYear}.` };
  const current = shares(result, basis), previous = shares(before, basis);
  if (!current || !previous) return { ...base, reason: 'Comparable vote shares are unavailable.' };
  const matches = previous.rows.filter(p => p.party_id === party.party_id && p.entry_type !== 'aggregate');
  if (matches.length > 1 || current.rows.filter(p => p.party_id === party.party_id).length !== 1)
    return { ...base, reason: 'This party has multiple entries; a direct comparison is unavailable.' };
  if (!matches.length && previous.partial) return { ...base, reason: `This party is not listed in the partial ${previousYear} summary.` };
  if (!matches.length && previous.rows.some(p => p.entry_type === 'aggregate'))
    return { ...base, reason: 'The previous source has an aggregate row and no separate row for this party.' };
  const previousShare = (matches[0]?.votes[basis] ?? 0) / previous.total * 100;
  const currentShare = party.votes[basis]! / current.total * 100;
  return { ...base, previousShare, currentShare, delta: currentShare - previousShare,
    ...(!matches.length ? { reason: `No votes for this party are recorded in the complete ${previousYear} party list.` } : {}) };
}

export function movementValue(delta: number) {
  const rounded = Math.round(Math.abs(delta) * 10) / 10;
  return `${rounded === 0 ? '±' : delta > 0 ? '+' : '−'}${rounded.toFixed(1)} pp`;
}
export function movementText(movement: Movement) {
  if (movement.delta === null) return '—';
  const value = Math.round(Math.abs(movement.delta) * 10) / 10;
  return `${value === 0 ? '↔' : movement.delta > 0 ? '↑' : '↓'} ${value.toFixed(1)}`;
}
export function movementDescription(m: Movement) {
  if (m.delta === null) return m.reason ?? 'Comparison unavailable.';
  return `${m.basis === 'source_total' ? 'Combined ballot' : m.basis === 'pr' ? 'Municipal PR' : 'Ward ballot'} vote share: ${m.previousShare!.toFixed(1)}% in ${m.previousYear} → ${m.currentShare!.toFixed(1)}%. Change of ${movementValue(m.delta)} since ${m.previousYear}.${m.reason ? ` ${m.reason}` : ''}`;
}
