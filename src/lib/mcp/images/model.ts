import type { DataReader } from '../data.ts';
import { DataError } from '../data.ts';
import { partyStyle, formatTime, formatNumber } from '../../places/format.ts';

export type Summary = Awaited<ReturnType<DataReader['summary']>>;
export type ImageRow = { id: string; label: string; color: string; value: number | null; detail: string; highlighted?: boolean };
export type ResultImage = {
  version: 2; kind: 'results' | 'comparison' | 'council'; title: string; subtitle: string; status: string;
  metric: string; metric_label: string; unit: 'percent' | 'pp' | 'seats'; rows: ImageRow[];
  notes: string[]; sources: Summary['source'][]; data: Record<string, unknown>; alt: string;
  council?: { total: number; majority: number; selected: number | null; groups: { seats: number; color: string; selected: boolean }[] };
};

export function ballotLabel(basis: string) {
  return basis === 'pr' ? 'Municipal PR ballot' : basis === 'ward' ? 'Ward ballot' : 'Combined ballot votes';
}

export function resultImage(summary: Summary, top: number, partyId?: string): ResultImage {
  if (summary.party_page.next_offset !== null) throw new DataError(422, 'The complete party list is required to draw this image.');
  if (partyId !== undefined && summary.parties.filter(p => p.party_id === partyId).length !== 1)
    throw new DataError(422, 'The selected party must have exactly one published entry in this area.');
  const shown = summary.parties.slice(0, top);
  const focus = partyId === undefined ? null : summary.parties.find(p => p.party_id === partyId)!;
  if (focus && !shown.includes(focus)) shown[shown.length - 1] = focus;
  const rows = shown.map(p => ({ id: p.source_entry_id, label: p.candidate_name ? `${p.party_name} · ${p.candidate_name}` : p.party_name,
    color: partyStyle(p.party_name)[1]!, value: p.share_percent,
    detail: `${formatNumber(p.votes)} votes`, highlighted: p.party_id === partyId }));
  const progress = summary.progress.voting_districts;
  const notes = [
    progress ? `${formatNumber(progress.completed)} / ${formatNumber(progress.expected)} voting districts reporting` : 'Reporting progress unavailable',
    `${shown.length} of ${summary.parties.length} published entries shown${focus ? ' · selected party included' : ''}. Shares use the full denominator.`,
    ...(summary.ballot.party_list_scope === 'leading_parties_only' ? ['Source lists selected parties only; unlisted votes remain in the denominator.'] : []),
    ...(summary.ballot.combined_fallback ? ['Separate requested ballot unavailable; combined ballots shown.'] : []),
    ...(summary.freshness_warning ? [summary.freshness_warning] : []),
    ...(summary.quality.vote_total_reconciliation.status === 'differs_from_reported_total' ? ['Published party votes differ from the source-reported total.'] : []),
    'Vote shares do not establish council control or an official declaration.',
    `Source: IEC · reported ${formatTime(summary.source.reportedAt)}`,
  ];
  const title = summary.name;
  const model: ResultImage = { version: 2, kind: 'results', title,
    subtitle: `Local elections ${summary.year} · ${summary.level} · ${ballotLabel(summary.ballot.basis)}`,
    status: summary.result_status === 'provisional' ? 'PROVISIONAL RESULTS' : 'HISTORICAL RESULTS',
    metric: formatNumber(summary.ballot.denominator), metric_label: 'valid ballots in the share denominator', unit: 'percent', rows, notes,
    sources: [summary.source], data: { year: summary.year, level: summary.level, area_id: summary.area_id,
      ballot: summary.ballot, progress: summary.progress, quality: summary.quality,
      parties: shown, omitted_entries: summary.parties.length - shown.length, results_url: summary.results_url }, alt: '' };
  model.alt = [title, model.subtitle, model.status, ...rows.map(r => `${r.label}: ${r.value === null ? 'share unavailable' : r.value.toFixed(2) + '%'}, ${r.detail}`), ...notes].join('. ');
  return model;
}
