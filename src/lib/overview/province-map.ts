import { partyMovement, movementDescription, latestYear } from '../history/comparison.ts';
import { overviewPartyStyle, progressLabel, progressOf, provinceUrl, summaryBallot, type getNationalOverview } from './results.ts';

/** Use the same validated, partial-list denominator as the province cards. */
export function provinceMapLabels(entries: Awaited<ReturnType<typeof getNationalOverview>>['provinces'], year: number = latestYear) {
  return entries.map(({ province, result }) => {
    const ballot = result ? summaryBallot(result) : null;
    const top = ballot?.topShown;
    const [party, color] = top ? overviewPartyStyle(top.party_name) : ['', '#dce1d5'];
    const label = top ? `${party} ${top.share!.toFixed(1)}%`
      : ballot?.tied ? 'Tied' : ballot?.total === 0 ? 'Awaiting votes' : 'Unavailable';
    const detail = top ? `${party}: ${top.share!.toFixed(1)}%.`
      : ballot?.tied ? 'Tied.'
      : ballot?.total === 0 ? 'No votes have been published yet.' : 'Vote shares are unavailable.';
    const movement = top && result ? partyMovement(result,top,'source_total') : null;
    const progress = result ? progressOf(result) : null;
    return {
      id: province.id, name: province.name, code: province.code,
      position: province.label,
      href: provinceUrl(province,year), result: label, color,
      party: top ? party : null, partyName: top?.party_name ?? null, partyId: top?.party_id ?? null, share: top?.share ?? null,
      movement,
      description: `${year === latestYear ? 'Preliminary' : 'Historical'} results. ${detail} ${movement ? movementDescription(movement) : ''} Combined ward + municipal PR ballots. Selected parties only. ${progress ? `${progressLabel(progress)} of voting districts reporting.` : 'Reporting progress unavailable.'}`,
    };
  });
}
