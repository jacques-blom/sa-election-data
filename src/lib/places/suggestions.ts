import type { Place } from './types.ts';

const normalize = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Prefer exact names/aliases; an identically named metro precedes its statistical town. */
export function rankPlaceSuggestions(query: string, candidates: Place[]) {
  const q = normalize(query);
  const rank = (place: Place) => {
    const names = [place.name, ...place.aliases].map(normalize);
    const match = names.includes(q) ? 0 : names.some(name => name.startsWith(q)) ? 1 : 2;
    return match * 3 + (place.kind === 'metro' ? 0 : place.kind === 'municipality' ? 1 : 2);
  };
  return [...new Map(candidates.map(place => [place.slug, place])).values()]
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, 'en-ZA'));
}
