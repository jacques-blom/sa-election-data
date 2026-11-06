import { DataError } from '../data.ts';
import { comparisonCaveat } from '../summaries.ts';
import { partyStyle, formatTime, formatNumber } from '../../places/format.ts';
import { ballotLabel, type ResultImage, type Summary } from './model.ts';

function complete(s: Summary) {
  if (s.party_page.next_offset !== null) throw new DataError(422, 'The complete party list is required for comparisons.');
}
function finish(model: ResultImage) {
  model.alt = [model.title, model.subtitle, model.status,
    ...model.rows.map(r => `${r.label}: ${r.value === null ? 'unavailable' : (model.unit === 'pp' && r.value > 0 ? '+' : '') + r.value.toFixed(2) + (model.unit === 'pp' ? ' pp' : '%')}. ${r.detail}`), ...model.notes].join('. ');
  return model;
}

/** Compare published named parties only; unknown historical baselines stay unknown. */
export function changeImage(s: Summary, top: number, partyId?: string): ResultImage {
  complete(s);
  if (s.history.status !== 'available' || !s.history.previous_source) throw new DataError(422, 'The previous election is unavailable for this area.');
  const candidates = partyId === undefined ? s.parties : s.parties.filter(p => p.party_id === partyId);
  if (partyId !== undefined && candidates.length !== 1) throw new DataError(422, 'The selected party must have exactly one published entry.');
  const valid = candidates.filter(p => p.movement?.delta !== null && p.movement?.delta !== undefined)
    .sort((a, b) => b.movement!.delta! - a.movement!.delta!);
  if (!valid.length) throw new DataError(422, candidates[0]?.movement?.reason ?? 'No comparable named-party vote shares are available.');
  const shown = valid.length <= top ? valid : [...valid.slice(0, Math.ceil(top / 2)), ...valid.slice(-Math.floor(top / 2))];
  const basis = shown[0]!.movement!.basis;
  if (valid.some(p => p.movement!.basis !== basis)) throw new DataError(422, 'The available comparisons use different ballots.');
  return finish({ version: 2, kind: 'comparison', title: s.name,
    subtitle: `${s.history.previous_year} → ${s.year} · ${ballotLabel(basis)} · change in vote share`,
    status: s.result_status === 'provisional' ? 'PROVISIONAL COMPARISON' : 'HISTORICAL COMPARISON',
    metric: `${valid.length}`, metric_label: 'comparable named parties', unit: 'pp',
    rows: shown.map(p => ({ id: p.source_entry_id, label: p.party_name, color: partyStyle(p.party_name)[1]!, value: p.movement!.delta,
      detail: `${p.movement!.previousShare!.toFixed(2)}% → ${p.movement!.currentShare!.toFixed(2)}%` })),
    notes: [
      `Percentage points (pp). ${shown.length} of ${valid.length} comparable parties shown${shown.length < valid.length ? '; highest and lowest changes' : ''}.`,
      `${candidates.length - valid.length} published entries excluded from comparison; missing baselines are not zero.`,
      'Only parties in the current published list are compared; this is not an exhaustive ranking of exits.',
      s.progress.voting_districts ? `Current reporting: ${s.progress.voting_districts.completed}/${s.progress.voting_districts.expected} voting districts.` : 'Current reporting progress unavailable.',
      comparisonCaveat,
      ...(shown.some(p => p.movement!.combinedFallback) ? ['Combined ballots used for both elections because separate historical ballots are unavailable.'] : []),
      ...(s.freshness_warning ? [s.freshness_warning] : []),
      `Source: IEC · ${s.year} reported ${formatTime(s.source.reportedAt)}`,
      `Previous source: ${s.history.previous_year} · reported ${formatTime(s.history.previous_source.reportedAt)}`,
    ], sources: [s.source, s.history.previous_source], data: { year: s.year, level: s.level, area_id: s.area_id,
      previous_year: s.history.previous_year, basis, comparisons: shown, excluded_entries: candidates.length - valid.length,
      omitted_comparable_entries: valid.length - shown.length, current_quality: s.quality,
      results_url: s.results_url, comparison_caveat: comparisonCaveat }, alt: '' });
}

export function areaComparisonImage(summaries: Summary[], partyId: string): ResultImage {
  summaries.forEach(complete);
  const first = summaries[0]!;
  if (summaries.some(s => s.year !== first.year || s.level !== first.level || s.ballot.basis !== first.ballot.basis))
    throw new DataError(422, 'Area comparisons require one election, one geographic level and the same ballot. Try source_total when separate ballots are unavailable.');
  const entries = summaries.map(s => {
    const matches = s.parties.filter(p => p.party_id === partyId && p.entry_type !== 'aggregate' && !p.candidate_name);
    if (matches.length > 1) throw new DataError(422, `Party identity is ambiguous in ${s.name}.`);
    return { area_id: s.area_id, name: s.name, party: matches[0] ?? null, ballot: s.ballot,
      source: s.source, progress: s.progress, quality: s.quality, results_url: s.results_url };
  });
  const party = entries.find(e => e.party)?.party;
  if (!party || partyId === '0') throw new DataError(422, 'Choose a named party listed in at least one selected area.');
  entries.sort((a, b) => (b.party?.share_percent ?? -1) - (a.party?.share_percent ?? -1));
  return finish({ version: 2, kind: 'comparison', title: party.party_name,
    subtitle: `Local elections ${first.year} · ${first.level} comparison · ${ballotLabel(first.ballot.basis)}`,
    status: first.result_status === 'provisional' ? 'PROVISIONAL RESULTS' : 'HISTORICAL RESULTS',
    metric: String(entries.length), metric_label: 'selected areas · ranked by vote share', unit: 'percent',
    rows: entries.map(e => ({ id: e.area_id, label: e.name, color: partyStyle(party.party_name)[1]!,
      value: e.party?.share_percent ?? null,
      detail: e.party ? `${formatNumber(e.party.votes)} votes` : 'Not separately listed · unavailable' })),
    notes: [
      'Each percentage uses that area’s complete ballot denominator. Missing entries are unavailable, not zero.',
      'Selected areas only; this is not a nationwide ranking. Reporting completeness can differ between areas.',
      'Area totals are not added together. Vote shares do not establish council control.',
      ...(summaries.some(s => s.freshness_warning) ? ['One or more selected areas have delayed updates.'] : []),
      ...summaries.map(s => `${s.name}: IEC reported ${formatTime(s.source.reportedAt)}${s.progress.voting_districts ? ` · ${s.progress.voting_districts.completed}/${s.progress.voting_districts.expected} districts` : ' · progress unavailable'}`),
    ], sources: summaries.map(s => s.source), data: { year: first.year, level: first.level,
      party_id: partyId, party_name: party.party_name, basis: first.ballot.basis, areas: entries }, alt: '' });
}
