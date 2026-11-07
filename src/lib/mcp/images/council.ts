import { DataError } from '../data.ts';
import { governmentCaption } from '../../governance/index.ts';
import { partyStyle, formatTime } from '../../places/format.ts';
import type { ResultImage, Summary } from './model.ts';

export function councilImage(s: Summary, selectedIds: string[]): ResultImage {
  if (s.level !== 'municipality') throw new DataError(400, 'Council charts require a whole municipality.');
  if (s.party_page.next_offset !== null) throw new DataError(422, 'The complete seat allocation is required.');
  if (s.council.status === 'unavailable') throw new DataError(422, s.council.reason ?? 'Council seats are unavailable.');
  const council = s.council;
  const total = council.total!, majority = council.majority!;
  if (s.parties.some(p => p.council_allocation === null) || s.parties.reduce((n,p) => n + (p.council_allocation ?? 0), 0) !== total)
    throw new DataError(422, 'The complete seat allocation does not reconcile.');
  const selected = new Set(selectedIds);
  if (selected.size !== selectedIds.length || selected.has('0')) throw new DataError(400, 'Select distinct named parties; grouped independents cannot be selected as a coalition party.');
  for (const id of selected) {
    const matches = s.parties.filter(p => p.party_id === id && p.entry_type !== 'aggregate' && !p.candidate_name);
    if (matches.length !== 1) throw new DataError(422, `Selected party ${id} is not uniquely listed in this council.`);
  }
  const parties = s.parties.filter(p => p.council_allocation! > 0).sort((a,b) => b.council_allocation! - a.council_allocation!);
  const selectedSeats = selected.size ? parties.filter(p => selected.has(p.party_id!)).reduce((n,p) => n+p.council_allocation!,0) : null;
  const selectedParties = s.parties.filter(p => selected.has(p.party_id!)).sort((a,b) => b.council_allocation! - a.council_allocation!);
  const shown = [...selectedParties, ...parties.filter(p => !selected.has(p.party_id!))].slice(0, Math.max(15, selectedParties.length));
  const omitted = parties.filter(p => !shown.includes(p));
  const rows = shown.map(p => ({ id: p.source_entry_id, label: p.party_id === '0' ? 'Independent candidates (grouped)' : p.party_name,
    color: partyStyle(p.party_name)[1]!, value: p.council_allocation,
    detail: selected.size ? selected.has(p.party_id!) ? 'Selected for hypothetical coalition' : 'Not selected' : 'Council seats',
    highlighted: selected.has(p.party_id!) }));
  if (omitted.length) rows.push({ id: 'remaining', label: `${omitted.length} more entries`, color: '#627875',
    value: omitted.reduce((n,p)=>n+p.council_allocation!,0), detail: 'Combined seats; full allocations in chart data', highlighted: false });
  const estimated = council.status === 'estimated';
  const status = selected.size ? `HYPOTHETICAL · ${estimated ? 'ESTIMATED' : 'REPORTED'}` : estimated ? 'ESTIMATED SEATS' : s.year === 2026 ? 'PROVISIONAL · REPORTED' : 'HISTORICAL · REPORTED';
  const model: ResultImage = { version: 2, kind: 'council', title: s.name,
    subtitle: `Local elections ${s.year} · ${selected.size ? 'Hypothetical coalition' : 'Council composition'} · ${majority} seats for a majority`,
    status, metric: selectedSeats === null ? String(total) : `${selectedSeats} / ${total}`,
    metric_label: selectedSeats === null ? 'council seats' : selectedSeats >= majority
      ? selectedSeats === majority ? 'exactly at the majority threshold' : `${selectedSeats-majority} ${selectedSeats-majority === 1 ? 'seat' : 'seats'} above the majority threshold`
      : `${majority-selectedSeats} ${majority-selectedSeats === 1 ? 'seat' : 'seats'} short of a majority`,
    unit: 'seats', rows,
    council: { total, majority, selected: selectedSeats, groups: parties.map(p => ({ seats: p.council_allocation!, color: partyStyle(p.party_name)[1]!, selected: selected.size === 0 || selected.has(p.party_id!) })) },
    notes: [
      ...(s.government && governmentCaption(s.government) ? [governmentCaption(s.government)!] : []),
      ...(selected.size ? ['Hypothetical arithmetic only. No coalition agreement or governing arrangement is implied.'] : ['Seat distribution does not identify governing coalition membership.']),
      ...(estimated ? ['ESTIMATED from the current count; not an IEC-reported final allocation.'] : ['IEC-reported allocation; reporting completion is not an official declaration.']),
      ...(s.year === 2026 ? ['2026 results remain provisional.'] : []),
      council.caveat!,
      ...(s.freshness_warning ? [s.freshness_warning] : []),
      `Source: IEC · reported ${formatTime(s.source.reportedAt)}`,
    ], sources: [s.source], data: { year: s.year, level: s.level, area_id: s.area_id, council,
      government: s.government, recorded_partner_comparison: s.recorded_partner_comparison,
      selected_party_ids: selectedIds, selected_seats: selectedSeats, parties: s.parties,
      progress: s.progress, quality: s.quality, results_url: s.results_url }, alt: '' };
  model.alt = [model.title, model.subtitle, status, model.metric + ' ' + model.metric_label,
    ...rows.map(r=>`${r.label}: ${r.value} seats. ${r.detail}`), ...model.notes].join('. ');
  return model;
}
