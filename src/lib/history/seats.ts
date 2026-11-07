import { councilSeats, type CouncilSeats } from '../seats/allocation.ts';
import { latestYear } from './comparison.ts';
import type { AreaRecord } from '../data/normalize.ts';
import type { Result } from '../places/results.ts';
import { capeTownRecount, type HistoricalCorrection } from './corrections.ts';
export type ElectionSeats = CouncilSeats & { correction?: HistoricalCorrection };

/** Archived allocations may contain an OTHER seat group. Preserve it; never treat it as a party.
 * This reader only accepts complete reported totals and never estimates historical seats. */
export function historicalCouncilSeats(level: string, payload: AreaRecord['payload'], context?: {year:number;id:string}): ElectionSeats {
  const unavailable = (reason: string): CouncilSeats => ({ status: 'unavailable', reason });
  const count = (n: number | null | undefined): n is number => Number.isSafeInteger(n) && n! >= 0;
  const progress = payload.progress.seats, wards = payload.progress.wards, parties = payload.parties;
  if (level !== 'municipality' || !progress || !count(progress.expected) || progress.expected < 1 || progress.expected > 1000
    || progress.completed !== progress.expected || payload.party_list_scope !== 'all_rows_in_source' || !parties.length)
    return unavailable('A complete archived council allocation is needed.');
  if (!wards || !count(wards.expected) || !count(wards.completed) || wards.completed !== wards.expected
    || wards.expected > progress.expected || new Set(parties.map(p => p.source_entry_id)).size !== parties.length
    || parties.some(p => !count(p.seats.total) || !count(p.seats.ward) || !count(p.seats.pr)
      || p.seats.ward + p.seats.pr !== p.seats.total
      || p.entry_type !== 'aggregate' && (!p.party_id || p.party_id !== p.source_entry_id)
      || p.party_id === '0' && p.seats.pr !== 0))
    return unavailable('The archived seat breakdown is incomplete or inconsistent.');
  if (parties.reduce((n,p)=>n+p.seats.total!,0) !== progress.expected
    || parties.reduce((n,p)=>n+p.seats.ward!,0) !== wards.expected)
    return unavailable('Archived seat totals do not reconcile.');
  const majority = Math.floor(progress.expected / 2) + 1;
  if (parties.reduce((total,p) => total + (p.entry_type === 'aggregate' || p.party_name_source === 'unavailable' || p.candidate_name ? p.seats.total! : 0), 0) >= majority)
    return unavailable('Grouped or unidentified seats prevent a named council outcome.');
  let allocation = parties.map(p=>({...p,seats:{...p.seats},count:p.seats.total!}));
  let correction: HistoricalCorrection | undefined;
  if (context?.year === 2021 && context.id === '9006' && progress.expected === 231) {
    const da = allocation.find(p=>p.party_id==='52'), cape = allocation.find(p=>p.party_id==='467');
    if (da?.seats.ward === 83 && da.seats.pr === 53 && da.count === 136
      && cape?.seats.ward === 0 && cape.seats.pr === 1 && cape.count === 1) {
      da.seats.pr = 52; da.seats.total = da.count = 135;
      cape.seats.pr = 2; cape.seats.total = cape.count = 2;
      correction = capeTownRecount;
    }
  }
  return { status:'reported', total:progress.expected, majority, reportedWardSeats:wards.completed, expectedWardSeats:wards.expected,
    parties:allocation.sort((a,b)=>b.count-a.count||a.party_name.localeCompare(b.party_name)), ...(correction ? {correction} : {}) };
}
export function electionCouncilSeats(result: Pick<Result,'year'|'id'|'level'|'results'>): ElectionSeats {
  return result.year === latestYear ? councilSeats(result.level,result.results) : historicalCouncilSeats(result.level,result.results,result);
}
export type ElectionMajorityBaseline = {
  municipalityId: string; year: number; party: { id: string; name: string }; seats: number; total: number;
  source: { url: string; reportedAt: string; snapshotId?: string };
  correction?: HistoricalCorrection;
};
export function electionMajorityBaseline(result: Result | null | undefined): ElectionMajorityBaseline | null {
  if (!result || result.year !== 2021 || result.level !== 'municipality') return null;
  const seats = electionCouncilSeats(result);
  if (seats.status !== 'reported') return null;
  const winner = seats.parties.find(p => p.entry_type !== 'aggregate' && p.party_id && p.party_id !== '0'
    && p.party_name_source !== 'unavailable' && !p.candidate_name && p.count >= seats.majority);
  return winner ? { municipalityId:result.id, year:result.year, party:{id:winner.party_id!,name:winner.party_name},
    seats:winner.count, total:seats.total, source:result.source, ...(seats.correction ? {correction:seats.correction} : {}) } : null;
}

