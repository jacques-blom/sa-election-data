import type { CouncilSeats } from './allocation.ts';
import { partyStyle } from '../places/format.ts';

export function majorityWinner(seats: CouncilSeats | null | undefined) {
  return seats && seats.status !== 'unavailable'
    ? seats.parties.find(p => p.party_id !== '0' && p.entry_type !== 'aggregate' && p.count >= seats.majority) ?? null
    : null;
}

export function majorityHeadline(seats: CouncilSeats, historical = false) {
  if (seats.status === 'unavailable') return {
    title: historical ? 'Council seats unavailable' : 'Council seats pending', detail: seats.reason,
  };
  const parties = seats.parties.filter(p => p.party_id !== '0' && p.entry_type !== 'aggregate');
  const winner = majorityWinner(seats);
  const largest = [...parties].sort((a, b) => b.count - a.count)[0];
  const tied = largest && parties.filter(p => p.count === largest.count).length > 1;
  const basis = seats.status === 'estimated' ? historical ? ' on historical estimates' : ' on current estimates' : '';
  const title = winner ? `${partyStyle(winner.party_name)[0]} has an outright majority${basis}`
    : seats.status === 'estimated' ? `No party has a majority${basis}` : 'Hung council';
  const target = `${seats.majority} seats needed in a ${seats.total}-seat council.`;
  const shortfall = largest ? seats.majority - largest.count : 0;
  const detail = winner ? `${partyStyle(winner.party_name)[0]} has ${winner.count}${basis ? ' estimated' : ''} seats. ${target}`
    : largest && !tied ? `${partyStyle(largest.party_name)[0]} is ${shortfall} ${shortfall === 1 ? 'seat' : 'seats'} short${basis}. ${target}` : target;
  return { title, detail };
}

/** A vote leader or an estimated allocation must never become a reported outcome. */
export function councilOutcome(seats: CouncilSeats, historical = false) {
  const headline = majorityHeadline(seats, historical);
  if (seats.status === 'unavailable') return {
    ...headline, state: 'pending', label: historical ? 'Seats unavailable' : 'Seats pending',
    meaning: 'A vote lead alone cannot tell us whether a party has a council majority.',
  };
  if (seats.status === 'estimated') return {
    ...headline, state: 'estimated', label: 'Seats pending · estimate available',
    meaning: 'This is a seat estimate from votes counted so far. The council outcome is still pending.',
  };
  const winner = majorityWinner(seats);
  return winner ? {
    ...headline, state: 'majority', label: `${partyStyle(winner.party_name)[0]} outright majority`,
    meaning: 'One party has more than half the seats. It can reach a majority without another party’s support.',
  } : {
    ...headline, state: 'hung', label: 'Hung council',
    meaning: 'No party has more than half the seats. Parties may form a coalition or agree to support each other.',
  };
}
