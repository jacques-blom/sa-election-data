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
  const title = winner ? `${partyStyle(winner.party_name)[0]} has a majority${basis}` : `No party has a majority${basis}`;
  const target = `${seats.majority} seats needed in a ${seats.total}-seat council.`;
  const shortfall = largest ? seats.majority - largest.count : 0;
  const detail = winner ? `${partyStyle(winner.party_name)[0]} has ${winner.count}${basis ? ' estimated' : ''} seats. ${target}`
    : largest && !tied ? `${partyStyle(largest.party_name)[0]} is ${shortfall} ${shortfall === 1 ? 'seat' : 'seats'} short${basis}. ${target}` : target;
  return { title, detail };
}
