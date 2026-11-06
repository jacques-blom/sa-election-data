import { ballotResults, type Result } from '../places/results.ts';
import { displayBallot, partyMovement as movement, previousElection, type VoteBasis } from '../history/comparison.ts';
import { progressOf, resultDelay, summaryBallot } from '../overview/results.ts';
import { councilSeats, estimateCaution } from '../seats/allocation.ts';
import { publicUrl } from '../site.ts';

export type RequestedBallot = VoteBasis | 'auto';
export const comparisonCaveat = 'Exploratory same-ID comparison, not boundary-adjusted. Matching IDs do not establish unchanged boundaries. Missing or grouped parties are not assumed to have zero votes.';

/** Compact page calculations, using the same ballot/progress/seat functions as UI. */
export function areaSummary(result: Result, requested: RequestedBallot = 'auto', partyLimit = 20, partyOffset = 0) {
  const summary = result.level === 'national' || result.level === 'province';
  const wanted: VoteBasis = requested === 'auto' ? summary ? 'source_total' : result.level === 'ward' ? 'ward' : 'pr' : requested;
  const basis = summary ? 'source_total' : displayBallot(result, wanted);
  const votes = summary ? summaryBallot(result) : ballotResults(result, basis);
  const leader = 'topShown' in votes ? votes.topShown : votes.leader;
  const seats = councilSeats(result.level, result.results);
  const page = result.results.parties.length;
  const seatMap = new Map(seats.status === 'unavailable' ? [] : seats.parties.map(p => [p.source_entry_id, p.count]));
  const parties = votes.parties.slice(partyOffset, partyOffset + partyLimit).map(p => ({
    source_entry_id: p.source_entry_id, entry_type: p.entry_type, party_id: p.party_id,
    party_name: p.party_name, candidate_name: p.candidate_name, votes: p.votesForBallot,
    share_percent: p.share, reported_seats: p.seats,
    council_allocation: seatMap.get(p.source_entry_id) ?? null,
    movement: movement(result, p, basis),
  }));
  const majorityParty = seats.status === 'unavailable' ? null
    : seats.parties.find(p => p.party_id !== '0' && p.count >= seats.majority) ?? null;
  return {
    year: result.year, level: result.level, area_id: result.id, name: result.name,
    municipality_id: result.municipalityId,
    result_status: result.year === 2026 ? 'provisional' : 'historical',
    ballot: { requested, basis, combined_fallback: basis === 'source_total' && wanted !== 'source_total',
      denominator: votes.total, denominator_basis: summary ? 'source_reported_valid_ballots' : 'sum_of_all_published_rows_for_ballot',
      party_list_scope: result.results.party_list_scope,
      unlisted_votes: 'unlisted' in votes ? votes.unlisted : null },
    leader: leader ? { party_id: leader.party_id, party_name: leader.party_name,
      candidate_name: leader.candidate_name, votes: leader.votesForBallot, share_percent: leader.share } : null,
    tied: votes.tied,
    leader_scope: summary ? 'highest_shown_vote_share_not_a_declared_winner' : 'published_vote_leader_not_council_control',
    progress: Object.fromEntries((['municipalities', 'wards', 'voting_districts', 'seats'] as const).map(key => [key, progressOf(result, key)])),
    council: seats.status === 'unavailable' ? { status: seats.status, reason: seats.reason } : {
      status: seats.status, total: seats.total, majority: seats.majority,
      majority_party: majorityParty ? { party_id: majorityParty.party_id, party_name: majorityParty.party_name, seats: majorityParty.count } : null,
      no_single_party_majority: !majorityParty,
      caveat: seats.status === 'estimated' ? estimateCaution : 'IEC-reported allocations; 2026 remains provisional. Coalition membership is not supplied.',
      allocations_in: 'parties[].council_allocation; follow party_page for all rows',
    },
    history: { previous_year: previousElection(result.year),
      previous_source: result.previous?.source ?? null,
      status: previousElection(result.year) === null ? 'no_previous_election' : result.previous ? 'available' : 'unavailable',
      caveat: comparisonCaveat },
    parties, party_page: { total: page, limit: partyLimit, offset: partyOffset,
      next_offset: partyOffset + partyLimit < page ? partyOffset + partyLimit : null,
      note: 'Denominators, leaders, quality and council status use all source rows, not this party page.' },
    source: result.source, freshness_warning: resultDelay(result), quality: result.quality,
    results_url: publicUrl(`/api/v1/elections/${result.year}/areas/${result.level}/${result.id}`),
  };
}

/** One row per area for lists; a specific party's values are optional, never a partial-area sum. */
export function areaCard(result: Result, ballot: RequestedBallot = 'auto', partyId?: string) {
  const full = areaSummary(result, ballot, 0);
  const { parties: _parties, party_page: _page, ...card } = full;
  const matches = partyId === undefined ? [] : result.results.parties.filter(p => p.party_id === partyId);
  const party = matches.length === 1 ? matches[0]! : null;
  return { ...card, council: { ...card.council, allocations_in: 'get_area_summary parties[].council_allocation' },
    ...(partyId === undefined ? {} : { selected_party: {
    party_id: partyId, status: matches.length > 1 ? 'ambiguous' : party ? 'listed' : 'not_listed',
    party_name: party?.party_name ?? null, votes: party?.votes[full.ballot.basis] ?? null,
    share_percent: party && full.ballot.denominator !== null && full.ballot.denominator > 0 && party.votes[full.ballot.basis] !== null
      ? party.votes[full.ballot.basis]! / full.ballot.denominator * 100 : null,
    movement: party ? movement(result, party, full.ballot.basis) : null,
  } }) };
}
