import { places, placeUrl, wardNumber, wardUrl } from '../places/catalogue.ts';
import { partyStyle } from '../places/format.ts';
import type { Milestone } from './milestones.ts';
import type { Update } from './feed.ts';

export const cleanName = (name: string) => name.replace(/^[A-Z0-9]+\s+-\s+/, '');
export const winnerName = (m: Milestone) => m.winner?.id === '0'
  ? m.winner.candidate ?? 'An independent candidate'
  : m.winner?.name === 'Unnamed party' ? `Party ${m.winner.id}` : partyStyle(m.winner?.name ?? '')[0];
export function milestoneTitle(m: Milestone) {
  if (m.kind === 'ward_won') return `${winnerName(m)} wins Ward ${wardNumber(m.areaId)}`;
  if (m.kind === 'count_complete') return `Counting complete in ${cleanName(m.areaName)}`;
  return m.winner ? `${winnerName(m)} has an outright majority in ${cleanName(m.areaName)}` : `Hung council in ${cleanName(m.areaName)}`;
}
export function updateTitle(update: Update) {
  if (update.action === 'withdrawn') return update.kind === 'ward_won' ? `Ward ${wardNumber(update.area_id)} result under revision`
    : `${cleanName(update.area_name)} ${update.kind === 'count_complete' ? 'count status' : 'seat allocation'} under revision`;
  return (update.action === 'corrected' ? 'Correction: ' : '') + milestoneTitle(update.after!);
}
export function resultHref(update: Update) {
  if (update.kind === 'ward_won') return wardUrl(update.area_id);
  const place = places.find(p => p.relationships.some(r => r.election === 2026 && r.level === 'municipality' && r.relation === 'equals' && r.areaId === update.municipality_id));
  return place ? placeUrl(place) : `/api/v1/elections/2026/areas/municipality/${update.municipality_id}`;
}
export function coalitionHref(update: Update) {
  if (update.kind !== 'council_decided' || update.action === 'withdrawn' || update.superseded_by
    || update.after?.kind !== 'council_decided' || update.after.winner) return null;
  const result = resultHref(update);
  return result.startsWith('/2026/places/') ? `${result}/coalition`
    : `/majority-builder?q=${encodeURIComponent(cleanName(update.municipality_name))}`;
}
export const updateLabel = (update: Update) => update.action !== 'announced' ? 'Correction' : {
  ward_won: 'Ward result', council_decided: 'Council outcome', count_complete: 'Count complete',
}[update.kind];
export const sastDay = (time: string) => new Intl.DateTimeFormat('en-ZA', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Johannesburg',
}).format(new Date(time));
export const sastTime = (time: string) => new Intl.DateTimeFormat('en-ZA', {
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Africa/Johannesburg',
}).format(new Date(time));
