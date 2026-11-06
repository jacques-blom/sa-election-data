import { formatTime } from '../places/format.ts';
import { publicUrl } from '../site.ts';

export type ShareFormat = 'portrait' | 'square' | 'status';
export type ShareParty = { name: string; short: string; color: string; value: number | null; share: number | null };
export type ShareCard = {
  kind: 'result' | 'coalition';
  year: number;
  area: string;
  headline: string;
  metric: string;
  metricLabel: string;
  ballot: string;
  parties: ShareParty[];
  total: number | null;
  progress: { completed: number; expected: number } | null;
  reportedAt: string;
  note: string;
  caption: string;
  // Coalition diagrams include every seat, including unselected independent seats.
  council?: { majority: number; selected: number; groups: { seats: number; color: string; selected: boolean }[] };
};

/** Keep public view selections, never search text, addresses or Google place IDs. */
export function publicShareUrl(href: string, ballot?: 'pr' | 'ward') {
  const url = new URL(href);
  const params = new URLSearchParams(url.search);
  const parties = url.pathname.endsWith('/coalition') ? url.searchParams.get('parties') : null;
  url.search = ''; url.hash = '';
  if (ballot) url.searchParams.set('ballot', ballot);
  if (parties && /^[\w,-]+$/.test(parties)) url.searchParams.set('parties', parties);
  const keep = (key: string, pattern: RegExp) => {
    const value = params.get(key);
    if (value && pattern.test(value)) url.searchParams.set(key, value);
  };
  if (url.pathname === '/map') {
    for (const key of ['place', 'province', 'district']) keep(key, /^[a-z0-9-]+$/i);
    keep('ward', /^\d{8}$/);
    keep('view', /^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?,\d+(?:\.\d+)?$/);
  }
  if (url.pathname === '/updates') {
    keep('event', /^[1-9]\d*$/);
    keep('province', /^[1-9]$/);
    keep('type', /^(all|wins|councils|complete|corrections)$/);
  }
  if (url.pathname === '/councils') {
    keep('province', /^[1-9]$/);
    keep('status', /^(majority|no-majority|pending)$/);
    keep('party', /^\d+$/);
    keep('changed', /^1$/);
  }
  return publicUrl(url);
}

export function shareCaption(card: ShareCard, url: string) {
  return `${card.caption}\n\n${url}`;
}

export function imageDescription(card: ShareCard) {
  return [`${card.area} · ${card.year}`, card.headline, `${card.metric} ${card.metricLabel}`, card.ballot,
    ...card.parties.map(p => `${p.name}: ${p.share === null ? p.value === null ? 'unavailable' : `${p.value} ${card.kind === 'coalition' ? 'seats' : 'votes'}` : `${p.share.toFixed(1)}%`}`),
    card.total === null ? 'Total unavailable' : `${card.total} ${card.kind === 'coalition' ? 'council seats' : 'valid ballots'}`,
    card.progress ? `${card.progress.completed} of ${card.progress.expected} districts reporting` : 'Reporting progress unavailable',
    `Source: IEC, ${formatTime(card.reportedAt)}`, card.note].join('. ');
}
