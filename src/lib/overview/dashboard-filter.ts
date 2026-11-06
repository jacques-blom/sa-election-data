import { normaliseCouncilSearch } from '../seats/directory-filter.ts';

export const councilStatuses = ['majority', 'no-majority', 'pending'] as const;
export type CouncilStatus = typeof councilStatuses[number] | 'unavailable';
export type CouncilFilters = { q: string; province: string; status: string; party: string; changed: boolean };
export type FilterableCouncil = { search: string; provinceId: string; status: string; winnerId: string; changed: boolean };
type MajorityComparison = { provinceId: string; comparable: boolean; winnerId: string; previousWinnerId: string };

/** Compare every reported council in the province, including majorities the party lost. */
export function partyMajorityChanges(councils: readonly MajorityComparison[], party: string, province = '') {
  let gained = 0, lost = 0, comparable = 0;
  if (party) for (const council of councils) {
    if (!council.comparable || province && council.provinceId !== province) continue;
    comparable++;
    if (council.winnerId === council.previousWinnerId) continue;
    if (council.winnerId === party) gained++;
    if (council.previousWinnerId === party) lost++;
  }
  return { gained, lost, comparable };
}

export function councilFilters(params: URLSearchParams): CouncilFilters {
  return { q: (params.get('q') ?? '').trim().slice(0, 100), province: /^[1-9]$/.test(params.get('province') ?? '') ? params.get('province')! : '',
    status: councilStatuses.some(s => s === params.get('status')) ? params.get('status')! : '',
    party: /^\d+$/.test(params.get('party') ?? '') ? params.get('party')! : '', changed: params.get('changed') === '1' };
}
export function matchesCouncil(council: FilterableCouncil, filters: CouncilFilters, includeStatus = true) {
  return normaliseCouncilSearch(filters.q).split(' ').filter(Boolean).every(word => council.search.includes(word))
    && (!filters.province || council.provinceId === filters.province)
    && (!includeStatus || !filters.status || council.status === filters.status)
    && (!filters.party || council.winnerId === filters.party) && (!filters.changed || council.changed);
}
export function councilFilterUrl(filters: Partial<CouncilFilters>, anchor = 'councils') {
  const params = new URLSearchParams();
  for (const key of ['q', 'province', 'status', 'party'] as const) if (filters[key]) params.set(key, filters[key]!);
  if (filters.changed) params.set('changed', '1');
  return '/councils' + (params.size ? `?${params}` : '') + (anchor ? `#${anchor}` : '');
}
