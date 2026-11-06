import type { AreaRecord } from './normalize.ts';

/** Keep the published denominator, including parties omitted from summary feeds. */
export function summaryVoteTotals(results: AreaRecord['payload'], basis: keyof AreaRecord['payload']['parties'][number]['votes'] = 'source_total') {
  const rows = results.parties;
  const reported = results.reported_totals.valid_ballot_papers;
  const partial = results.party_list_scope === 'leading_parties_only';
  const validRows = rows.length > 0 && rows.every(p => p.votes[basis] !== null
    && Number.isSafeInteger(p.votes[basis]) && p.votes[basis]! >= 0);
  const sum = validRows ? rows.reduce((n, p) => n + p.votes[basis]!, 0) : null;
  const rowTotal = Number.isSafeInteger(sum) ? sum : null;
  const unavailable = { total: null, rowTotal, partial, discrepancy: null };
  if (reported === null || !Number.isSafeInteger(reported) || reported < 0 || rowTotal === null) return unavailable;
  if (partial ? rowTotal <= reported : rowTotal === reported) return { ...unavailable, total: reported };

  // A minor source mismatch must be <= one ballot in 10,000 AND leave every
  // one-decimal share unchanged under either denominator. Never repair counts,
  // infer a new total, accept duplicate rows, or display a share above 100%.
  const discrepancy = rowTotal - reported;
  const minor = reported > 0 && rowTotal > 0 && Math.abs(discrepancy) / reported <= 0.0001
    && new Set(rows.map(p => p.source_entry_id)).size === rows.length
    && rows.every(p => p.votes[basis]! <= reported
      && (p.votes[basis]! / reported * 100).toFixed(1) === (p.votes[basis]! / rowTotal * 100).toFixed(1));
  return minor ? { total: reported, rowTotal, partial, discrepancy } : unavailable;
}
