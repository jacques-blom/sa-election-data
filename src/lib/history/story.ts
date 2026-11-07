import { ballotResults, partyStyle, reporting, type Result } from '../places/results.ts';
import { summaryBallot } from '../overview/results.ts';
import { displayBallot, latestYear, partyMovement, previousElection, type VoteBasis } from './comparison.ts';
import { electionCouncilSeats } from './seats.ts';
import { majorityWinner } from '../seats/majority.ts';

/** Election outcomes only. A seat majority never asserts that a government took office. */
export function resultStory(result: Result) {
  const basis: VoteBasis = ['national', 'province', 'municipality'].includes(result.level) ? 'source_total' : displayBallot(result, 'ward');
  const ballot = ['national', 'province'].includes(result.level) ? summaryBallot(result) : ballotResults(result, basis);
  const leader = 'topShown' in ballot ? ballot.topShown : ballot.leader;
  const movement = leader ? partyMovement(result, leader, basis) : null;
  const progress = reporting(result);
  const before = result.previous?.year === previousElection(result.year) && result.previous.id === result.id
    && result.previous.level === result.level && result.previous.municipalityId === result.municipalityId ? result.previous : null;
  if (result.level === 'municipality') {
    const seats = electionCouncilSeats(result), old = before ? electionCouncilSeats(before) : null;
    const winner = majorityWinner(seats), previous = old?.status === 'reported' ? majorityWinner(old) : null;
    const label = (party: typeof winner) => party ? `${partyStyle(party.party_name)[0]} majority` : 'No majority';
    if (seats.status === 'reported') {
      const party = winner ? partyStyle(winner.party_name)[0] : null;
      const title = result.year === latestYear ? winner ? `${party} has an outright majority` : 'No party has a majority'
        : winner ? old?.status === 'reported'
        ? previous?.party_id === winner.party_id ? `${party} retains its majority` : `${party} gains an outright majority`
        : `${party} has an outright majority`
        : previous ? `${partyStyle(previous.party_name)[0]} loses its majority` : 'No party has a majority';
      return { title, basis, progress, before: old?.status === 'reported' ? {year:before!.year,label:label(previous)} : null,
        after:{year:result.year,label:label(winner)}, value:winner?.count ?? seats.majority,
        unit:winner ? `of ${seats.total} seats` : `seats needed · ${seats.total} total`, movement:null, leader:null };
    }
    // Estimates are useful in the seat explorer, but never become a reported change headline.
    return {title: leader ? `${partyStyle(leader.party_name)[0]} leads the vote` : 'Council seats pending',basis,progress,before:null,
      after:null,value:leader?.share??null,unit:leader?'vote share':null,movement,leader};
  }
  const knownLead = !('partial' in ballot) || !ballot.partial || (ballot.unlisted !== null && leader && leader.votes.source_total! > ballot.unlisted);
  const name = leader ? partyStyle(leader.party_name)[0] : null;
  const awarded = result.level === 'ward' && leader && result.results.parties.find(p=>p.source_entry_id===leader.source_entry_id)?.seats.ward === 1;
  const complete = result.year !== latestYear || (progress && progress.completed === progress.expected);
  const title = leader ? `${name} ${awarded && complete ? 'wins this ward' : result.level === 'voting-district' ? 'leads here' : knownLead ? 'leads the vote' : 'has the largest listed share'}`
    : ballot.tied ? 'The leading parties are tied' : ballot.total === 0 ? 'Waiting for the first votes' : 'Results unavailable';
  return {title,basis,progress,before:null,after:null,value:leader?.share??null,unit:leader?'vote share':null,movement,leader};
}
