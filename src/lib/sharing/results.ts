import { latestYear } from '../history/comparison.ts';
import { summaryBallot, summaryShareText, progressOf, resultDelay } from '../overview/results.ts';
import { ballotResults, type Ballot, type Result } from '../places/results.ts';
import { partyStyle, formatNumber } from '../places/format.ts';
import type { ShareCard } from './model.ts';

export function resultShareCard(result: Result, name: string, ballot?: Ballot | 'source_total'): ShareCard {
  const summary = ballot === undefined;
  const data = summary ? summaryBallot(result) : ballotResults(result, ballot);
  const partial = summary && result.results.party_list_scope === 'leading_parties_only';
  const leader = 'topShown' in data ? data.topShown : data.leader;
  const top = data.parties[0];
  const topName = leader ? partyStyle(leader.party_name)[0]! : '';
  const ballotName = summary ? 'Ward + municipal PR votes' : ballot === 'source_total' ? 'Combined ballot votes' : ballot === 'ward' ? 'Ward ballot votes' : 'Municipal PR votes';
  const headline = data.total === 0 ? 'Awaiting the first votes.' : data.total === null ? 'The votes so far.'
    : data.tied ? 'Level at the top.' : leader && !partial && topName.length <= 22 ? `${topName} leads so far.` : 'The count so far.';
  const metric = top?.share !== null && top?.share !== undefined ? `${top.share.toFixed(1)}%` : data.total === 0 ? '—' : formatNumber(data.total);
  const metricLabel = data.total === 0 ? 'No votes published yet' : data.total === null ? 'Vote shares unavailable'
    : data.tied ? 'Joint highest vote share' : leader ? `${topName} · ${partial ? 'highest shown share' : 'vote share'}` : 'Highest shown share';
  const progress = progressOf(result);
  return {
    kind: 'result', year: result.year, area: name, headline, metric: data.total === null ? '—' : metric, metricLabel,
    ballot: ballotName, total: data.total,
    parties: data.parties.map(p => ({ name: p.party_name, short: partyStyle(p.party_name)[0]!, color: partyStyle(p.party_name)[1]!, value: p.votesForBallot, share: p.share })),
    progress, reportedAt: result.source.reportedAt,
    note: [result.year === latestYear ? 'Provisional results.' : 'Historical results.', partial ? 'Selected parties only.' : '',
      'discrepancy' in data && data.discrepancy !== null ? `Source totals differ by ${formatNumber(Math.abs(data.discrepancy))} votes.` : '',
      resultDelay(result) ? 'Updates delayed.' : ''].filter(Boolean).join(' '),
    caption: summary ? summaryShareText(result, name)
      : `${name}: ${headline} ${leader?.share !== null && leader?.share !== undefined ? `${leader.share.toFixed(1)}%. ` : ''}${ballotName}. ${result.year === latestYear ? 'Provisional' : 'Historical'} results.`,
  };
}
