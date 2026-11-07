import { electionCouncilSeats, type ElectionSeats } from '../history/seats.ts';
import { latestYear } from '../history/comparison.ts';
import { COUNCIL_DECLARATION_NOTICE, majorityWinner } from '../seats/majority.ts';
import { partyStyle, type Result } from '../places/results.ts';
import { progressOf } from '../overview/results.ts';
import type { ShareCard } from './model.ts';

/** Actual council composition, distinct from a hypothetical coalition selection. */
export function councilShareCard(result: Result, name: string, seats: ElectionSeats = electionCouncilSeats(result)): ShareCard | null {
  if (seats.status === 'unavailable') return null;
  const winner=majorityWinner(seats);
  const parties=seats.parties.filter(p=>p.count>0).map(p=>({name:p.party_name,short:partyStyle(p.party_name)[0]!,color:partyStyle(p.party_name)[1]!,value:p.count,share:null}));
  const estimated=seats.status==='estimated';
  const headline=winner?`${partyStyle(winner.party_name)[0]} ${estimated?'estimated majority':'has a majority'}`:estimated?'No majority on current estimates':'No party has a majority';
  const note=estimated?'Estimated seats · final allocation pending.':result.year===latestYear?`${COUNCIL_DECLARATION_NOTICE}.`:'Historical council seats.';
  return {kind:'result',year:result.year,area:name,headline,metric:String(seats.majority),metricLabel:'seats for a majority',
    ballot:`${seats.total} council seats${estimated?' · estimated':''}`,parties,total:seats.total,progress:progressOf(result),reportedAt:result.source.reportedAt,
    note,caption:`${name} · ${result.year}: ${headline}.\n${parties.map(p=>`${p.short}: ${p.value} ${p.value===1?'seat':'seats'}`).join(' · ')}\n${seats.majority} seats for a majority out of ${seats.total}. ${note}\nA seat majority does not confirm a governing agreement.`,
    council:{majority:seats.majority,selected:seats.total,groups:parties.map(p=>({seats:p.value,color:p.color,selected:true}))}};
}
