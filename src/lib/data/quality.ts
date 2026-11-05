import type { AreaRecord } from './normalize.ts';

export function resultQuality(results: AreaRecord['payload']) {
  const totals = results.parties.map((party) => party.votes.source_total);
  const sum = totals.length > 0 && totals.every((value) => value !== null)
    ? totals.reduce<number>((total, value) => total + (value ?? 0), 0) : null;
  const reported = results.reported_totals.valid_ballot_papers;
  return {
    source_anomalies: results.parties.flatMap((party) => (party.source_anomalies ?? []).map((anomaly) => ({
      source_entry_id: party.source_entry_id, ...anomaly,
    }))),
    vote_total_reconciliation: {
      status: sum === null || reported === null ? 'not_available'
        : sum === reported ? 'matches_reported_total' : 'differs_from_reported_total',
      sum_of_published_rows: sum,
      source_reported_valid_ballots: reported,
      difference: sum === null || reported === null ? null : reported - sum,
    },
  };
}
