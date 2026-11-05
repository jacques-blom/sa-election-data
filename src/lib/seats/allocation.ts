import type { AreaRecord } from '../data/normalize.ts';

type Payload = AreaRecord['payload'];
type Party = Payload['parties'][number];
export type SeatParty = Party & { count: number };
export type CouncilSeats =
  | { status: 'unavailable'; reason: string }
  | { status: 'estimated' | 'reported'; total: number; majority: number; parties: SeatParty[];
      reportedWardSeats: number; expectedWardSeats: number };
export type AvailableSeats = Exclude<CouncilSeats, { status: 'unavailable' }>;
const count = (n: number | null | undefined): n is number => Number.isSafeInteger(n) && n! >= 0;
const unavailable = (reason: string): CouncilSeats => ({ status: 'unavailable', reason });

/** Schedule 1, items 12, 13 and 16. This is a current-count scenario, not a forecast:
 * reserve only reported independent wins and use only reported party ward wins as floors.
 * Unfinished wards, unopposed candidates and candidate-list capacity are not modelled.
 * Keep these assumptions visible wherever an estimate is shown or shared. */
export function councilSeats(level: string, results: Payload): CouncilSeats {
  if (level !== 'municipality') return unavailable('Council seats are available for whole municipalities only.');
  const progress = results.progress.seats, wards = results.progress.wards;
  if (!progress || !count(progress.expected) || progress.expected < 1 || progress.expected > 1000
    || !count(progress.completed) || progress.completed > progress.expected
    || !wards || !count(wards.expected) || wards.expected > progress.expected
    || !count(wards.completed) || wards.completed > wards.expected) {
    return unavailable('The council size or seat progress is not available yet.');
  }
  const total = progress.expected, parties = results.parties;
  if (results.party_list_scope !== 'all_rows_in_source' || !parties.length
    || new Set(parties.map(p => p.source_entry_id)).size !== parties.length
    || parties.some(p => p.entry_type === 'aggregate' || !p.party_id
      || p.party_id !== p.source_entry_id
      || !count(p.seats.ward) || !count(p.seats.pr) || !count(p.seats.total)
      || p.seats.ward + p.seats.pr !== p.seats.total)) {
    return unavailable('A complete, consistent breakdown of parties and reported seats is needed.');
  }
  const reportedWardSeats = parties.reduce((sum, p) => sum + p.seats.ward!, 0);
  if (reportedWardSeats !== wards.completed
    || parties.reduce((sum, p) => sum + p.seats.total!, 0) !== progress.completed
    || parties.some(p => p.party_id === '0' && p.seats.pr !== 0)) {
    return unavailable('The published seat totals do not yet reconcile.');
  }
  function available(status: AvailableSeats['status'], allocations: Map<string, number>): AvailableSeats {
    return { status, total, majority: Math.floor(total / 2) + 1, reportedWardSeats, expectedWardSeats: wards!.expected,
      parties: parties.map(p => ({ ...p, count: allocations.get(p.source_entry_id) ?? 0 }))
        .sort((a, b) => b.count - a.count || a.party_name.localeCompare(b.party_name, 'en-ZA')) };
  }
  if (progress.completed === total) {
    if (reportedWardSeats !== wards.expected) return unavailable('The published ward-seat allocation is incomplete.');
    return available('reported', new Map(parties.map(p => [p.source_entry_id, p.seats.total!])));
  }
  if (parties.some(p => !count(p.votes.pr) || !count(p.votes.ward)
    || !count(p.votes.source_total) || p.votes.pr + p.votes.ward !== p.votes.source_total
    || (p.party_id === '0' && p.votes.pr !== 0))) {
    return unavailable('Separate, consistent ward and PR votes are needed for an estimate.');
  }
  const allVotes = parties.reduce((sum, p) => sum + p.votes.source_total!, 0);
  if (!count(allVotes) || allVotes !== results.reported_totals.valid_ballot_papers) {
    return unavailable('The published vote totals do not yet reconcile.');
  }
  if (allVotes === 0) return unavailable('No votes have been published yet.');
  const independents = parties.find(p => p.party_id === '0');
  const allocations = new Map<string, number>();
  let remainingSeats = total - (independents?.seats.ward ?? 0);
  if (independents) allocations.set('0', independents.seats.ward!);
  let remaining = parties.filter(p => p.party_id !== '0');
  while (remaining.length && remainingSeats > 0) {
    const votes = remaining.reduce((sum, p) => sum + p.votes.source_total!, 0);
    if (!count(votes) || votes === 0) return unavailable('Not enough party votes have been published for an estimate.');
    // BigInt avoids a floating-point rounding error at the quota/remainder boundary.
    const quota = BigInt(votes) / BigInt(remainingSeats) + 1n;
    const ranked = remaining.map(p => ({ party: p,
      seats: Number(BigInt(p.votes.source_total!) / quota),
      remainder: Number(BigInt(p.votes.source_total!) % quota) }))
      .sort((a, b) => b.remainder - a.remainder || b.party.votes.source_total! - a.party.votes.source_total!);
    const extras = remainingSeats - ranked.reduce((sum, p) => sum + p.seats, 0);
    if (extras > ranked.length) return unavailable('More votes are needed to distribute all council seats.');
    if (extras > 0 && extras < ranked.length && ranked[extras - 1]!.remainder === ranked[extras]!.remainder
      && ranked[extras - 1]!.party.votes.source_total === ranked[extras]!.party.votes.source_total) {
      return unavailable('A tied remainder prevents a unique seat estimate.');
    }
    ranked.forEach((p, index) => { if (index < extras) p.seats++; });
    // An exact match already has zero PR top-up; only an excess changes the
    // number of seats available to others and requires a new quota.
    const fixed = ranked.filter(p => p.party.seats.ward! > p.seats);
    if (!fixed.length) {
      ranked.forEach(p => allocations.set(p.party.source_entry_id, p.seats));
      remainingSeats = 0;
      break;
    }
    // Ward seats cannot be taken away. Remove these parties and recalculate the
    // quota for the seats and votes left, repeating if another party hits its floor.
    for (const p of fixed) {
      allocations.set(p.party.source_entry_id, p.party.seats.ward!);
      remainingSeats -= p.party.seats.ward!;
    }
    const fixedIds = new Set(fixed.map(p => p.party.source_entry_id));
    remaining = remaining.filter(p => !fixedIds.has(p.source_entry_id));
  }
  if (remainingSeats !== 0 || [...allocations.values()].reduce((sum, n) => sum + n, 0) !== total) {
    return unavailable('The available figures cannot produce a full council estimate.');
  }
  return available('estimated', allocations);
}

export const seatLabel = (seats: Pick<AvailableSeats, 'status'>) => seats.status === 'estimated' ? 'Estimated council seats' : 'IEC-reported council seats';
export const estimateCaution = 'Based on combined ward and PR votes counted so far. Only reported ward wins and independent seats are fixed. Unfinished wards and candidate-list limits can change the allocation.';
export const canBuildCoalition = (seats: CouncilSeats): seats is AvailableSeats =>
  seats.status !== 'unavailable' && seats.parties.every(p => p.count < seats.majority);
