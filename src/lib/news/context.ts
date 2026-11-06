import { findPlace } from '../places/catalogue.ts';
import { provinces } from '../overview/results.ts';

// Main polling day; the news window stays fixed as results and coalitions develop.
export const NEWS_START_DATE = '2026-11-04';
export const NEWS_PERIOD_LABEL = 'Since 4 November 2026';

export type NewsScope = 'national' | 'province' | 'municipality' | 'coalition';
export interface NewsContext {
  key: string;
  heading: string;
  query: string;
  endpoint: string;
  searchUrl: string;
}

/** Only known areas can create feeds; callers cannot supply arbitrary queries or URLs. */
export function newsContext(scope: string | null, area = ''): NewsContext | null {
  let name = 'South Africa';
  if (scope === 'province') {
    const province = provinces.find(p => p.slug === area);
    if (!province) return null;
    name = province.name;
  } else if (scope === 'municipality' || scope === 'coalition') {
    const place = findPlace(area);
    if (!place || !['metro', 'municipality'].includes(place.kind)) return null;
    name = place.name;
  } else if (scope !== 'national' || area) return null;
  const query = `"${name}" ${scope === 'coalition' ? 'coalition' : 'local elections'} after:${NEWS_START_DATE}`;
  const params = new URLSearchParams({ q: query, hl: 'en-ZA', gl: 'ZA', ceid: 'ZA:en' });
  // Date-version both browser and edge keys so the old rolling window cannot be reused.
  const context = new URLSearchParams({ scope, since: NEWS_START_DATE });
  if (area) context.set('area', area);
  return {
    key: `${scope}/${area || 'za'}/${NEWS_START_DATE}`,
    heading: scope === 'coalition' ? `Coalition news · ${name}` : `Election news · ${name}`,
    query,
    endpoint: `/api/news?${context}`,
    searchUrl: `https://news.google.com/search?${params}`,
  };
}
