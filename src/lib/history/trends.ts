import { comparableParty as named } from './identity.ts';
import type { Result } from '../places/results.ts';
import { ELECTIONS } from '../data/catalogue.ts';
import { summaryVoteTotals } from '../data/summary-votes.ts';
import { partyStyle } from '../places/format.ts';
import { governmentPartyKey, partyShort } from '../governance/parties.ts';
import { electionCouncilSeats } from './seats.ts';
import { historicalResultNotes } from './corrections.ts';
import { latestYear, previousElection, type VoteBasis } from './comparison.ts';

const count = (n: number | null | undefined): n is number => Number.isSafeInteger(n) && n! >= 0;
export const trendBallotLabel = (basis: VoteBasis) => basis === 'source_total' ? 'Ward + municipal PR votes' : basis === 'pr' ? 'Municipal PR votes' : 'Ward votes';

export function trendElection(result: Result, basis: VoteBasis) {
  const rows=result.results.parties, summary=['national','province'].includes(result.level);
  const valid=rows.length>0 && new Set(rows.map(p=>p.source_entry_id)).size===rows.length && rows.every(p=>count(p.votes[basis]));
  const sum=valid?rows.reduce((n,p)=>n+p.votes[basis]!,0):null;
  const total=valid && (summary || result.results.party_list_scope==='all_rows_in_source')
    ? summary ? (basis==='source_total'?summaryVoteTotals(result.results,basis).total:null) : sum : null;
  const usable=total!==null && Number.isSafeInteger(total) && total>0 && sum!==null && rows.every(p=>p.votes[basis]!<=total);
  const ids=rows.filter(named).map(p=>p.party_id!);
  const parties=usable?rows.filter(p=>named(p)&&ids.filter(id=>id===p.party_id).length===1).map(p=>({
    id:p.party_id!,name:p.party_name,votes:p.votes[basis]!,share:p.votes[basis]!/total!*100,
  })).sort((a,b)=>b.share-a.share||a.id.localeCompare(b.id)):[];
  const progress=result.results.progress.voting_districts;
  const reporting=progress && count(progress.completed) && count(progress.expected) && progress.expected>0 && progress.completed<=progress.expected
    ? {completed:progress.completed,expected:progress.expected,percent:progress.completed/progress.expected*100}:null;
  const allocation=electionCouncilSeats(result);
  const winner=allocation.status==='reported'?allocation.parties.find(p=>named(p)&&p.count>=allocation.majority):null;
  const seats=allocation.status!=='reported'?null:{
    total:allocation.total,majority:allocation.majority,correction:allocation.correction??null,
    parties:allocation.parties.map(p=>({id:p.party_id,name:p.party_name,count:p.count,grouped:p.entry_type==='aggregate'||p.party_id==='0'})),
    winner:winner?{id:winner.party_id!,name:winner.party_name,count:winner.count}:null,
  };
  const leader=parties[0] && !rows.some(p=>p.party_id!==parties[0]!.id && p.votes[basis]!>=parties[0]!.votes)?parties[0]:null;
  return {year:result.year,name:result.name,basis,status:result.year===latestYear?'provisional' as const:'historical' as const,
    total:usable?total:null,parties,seats,leader,leaderScope:summary?'highest_shown_party':'published_vote_leader',reporting,source:result.source,quality:result.quality,
    partyListScope:result.results.party_list_scope,notes:historicalResultNotes(result),
    zeroForAbsent:usable && result.results.party_list_scope==='all_rows_in_source'
      && !rows.some(p=>p.entry_type==='aggregate'||p.party_name_source==='unavailable') && new Set(ids).size===ids.length,
    reason:usable?null:'Comparable votes are unavailable for this ballot.'};
}
export function electionTrends(results: Result[], options: { level:string; id:string; through:number; basis?:VoteBasis; warning?:string|null }) {
  const basis=options.basis??(['ward','voting-district'].includes(options.level)?'ward':'source_total');
  const candidates=results.filter(r=>r.level===options.level&&r.id===options.id&&r.year<=options.through&&ELECTIONS.some(e=>e.year===r.year));
  const counts=new Map<number,number>();for(const r of candidates)counts.set(r.year,(counts.get(r.year)??0)+1);
  const anchor=candidates.find(r=>r.year===options.through)??candidates.toSorted((a,b)=>b.year-a.year)[0];
  const elections=candidates.filter(r=>counts.get(r.year)===1 && (!anchor||r.municipalityId===anchor.municipalityId))
    .sort((a,b)=>a.year-b.year).map(r=>trendElection(r,basis));
  const first=elections[0]?.year??options.through;
  const years=ELECTIONS.filter(e=>e.year>=first&&e.year<=options.through).map(e=>e.year);
  const identities=new Map<string,string>();for(const e of elections)for(const p of e.parties)identities.set(p.id,p.name);
  const series=[...identities].map(([id,name])=>{
    const points=years.map(year=>{
      const election=elections.find(e=>e.year===year), party=election?.parties.find(p=>p.id===id);
      return {year,share:party?.share??(election?.zeroForAbsent?0:null),votes:party?.votes??(election?.zeroForAbsent?0:null),
        status:year===latestYear?'provisional' as const:'historical' as const,
        reason:party?null:election?.zeroForAbsent?'No votes recorded in the complete party list.':election?.total?'Not separately listed in this source.':'Comparable data unavailable.'};
    });
    const key=governmentPartyKey(name);
    return {id,name,short:key?partyShort(key):partyStyle(name)[0]!,color:partyStyle(name)[1]!,points,peak:Math.max(0,...points.map(p=>p.share??0))};
  }).sort((a,b)=>b.peak-a.peak||a.name.localeCompare(b.name));
  const latest=elections.at(-1), previous=elections.find(e=>e.year===previousElection(options.through))??null;
  const caveats=[
    'All points use the same ballot basis. Ballot totals are not counts of individual voters.',
    ...(options.through===latestYear?['2026 figures are provisional and reflect votes counted so far; reporting completion is not an official declaration.']:[]),
    'Missing or grouped party rows remain gaps unless a complete, ungrouped list establishes zero votes.',
    ...(options.level==='national'?[]:[options.level==='ward'
      ? 'Ward boundaries can change between elections. These are published results for the same ward ID, not the same voters.'
      : 'Municipal boundaries can change between elections. Published area results are not boundary-adjusted.']),
  ];
  return {level:options.level,id:options.id,through:options.through,basis,ballotLabel:trendBallotLabel(basis),
    years,elections,series,defaultPartyIds:series.filter(s=>s.peak>0).slice(0,5).map(s=>s.id),previous,
    reportedElections:elections.filter(e=>e.total!==null).length,latest,warning:options.warning??null,caveats};
}
export type ElectionTrends = ReturnType<typeof electionTrends>;
/** Individual segments avoid drawing through missing elections; live connections are dashed. */
export function trendSegments(points: ElectionTrends['series'][number]['points']) {
  return points.slice(1).flatMap((point,i)=>points[i]!.share!==null&&point.share!==null
    ? [{from:points[i]!,to:point,provisional:point.status==='provisional'||points[i]!.status==='provisional'}]:[]);
}

