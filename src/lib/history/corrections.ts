import type { Result } from '../places/results.ts';

/** A published correction to the election allocation, not a later by-election. */
export const capeTownRecount = {
  date: '2022-05-26',
  title: 'IEC Cape Town recount correction, 26 May 2022',
  url: 'https://www.gov.za/news/media-statements/electoral-commission-finalises-electoral-court-sanctioned-recounts-cape-town',
  note: 'The IEC corrected the 2021 Cape Town allocation in May 2022: one PR seat moved from the DA to Cape Independence Party. The corrected totals are DA 135 and Cape Independence Party 2. Archived vote shares shown here predate that recount; revised votes have not been substituted.',
};
export type HistoricalCorrection = typeof capeTownRecount;
export function historicalResultNotes(result: Pick<Result,'year'|'level'|'id'|'source'>) {
  return result.year === 2021 && result.level === 'municipality' && result.id === '9006'
    && result.source.reportedAt.slice(0,10) < capeTownRecount.date ? [capeTownRecount] : [];
}
