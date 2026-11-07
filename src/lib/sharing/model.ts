import { formatTime } from '../places/format.ts';
import { publicUrl } from '../site.ts';
import type { historyChart, HistoryMetric } from '../history/chart.ts';

export type ShareFormat = 'portrait' | 'square' | 'status';
export type ShareParty = { name: string; short: string; color: string; value: number | null; share: number | null };
export type ShareCard = {
  kind: 'result' | 'coalition' | 'history';
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
  sourceLabel?: string;
  note: string;
  caption: string;
  // Council and coalition diagrams include every seat, including independent seats.
  council?: { majority: number; selected: number; groups: { seats: number; color: string; selected: boolean }[] };
  history?: { chart: ReturnType<typeof historyChart>; metric: HistoryMetric; year: number; party: string | null };
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
  if (/^\/(?:20(?:00|06|11|16|21|26)(?:\/(?:places|provinces|districts|wards|voting-districts)\/[\w-]+)?\/?)?$/.test(url.pathname)) {
    if (!ballot) keep('ballot', /^(pr|ward)$/);
    keep('council', /^\d+$/);
    keep('metric', /^(votes|seats)$/);
    keep('party', /^\d+$/);
    keep('history-year', /^20(?:00|06|11|16|21|26)$/);
  }
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
  if (card.history) {
    const { chart, metric, year, party } = card.history;
    return [`${card.area}: ${card.headline}. ${card.ballot}. Selected year ${year}.`,
      ...chart.columns.map(column => `${column.year}: ${column.available ? (party?column.values.filter(p=>p.id===party):column.segments).map(p=>`${p.name} ${p.value===null?'unavailable':metric==='seats'?`${p.value} seats`:`${p.value.toFixed(1)}%`}`).join(', ') || 'Selected party unavailable' : 'Unavailable'}`),
      `Source: IEC. ${card.note}`].join(' ');
  }
  return [`${card.area} · ${card.year}`, card.headline, `${card.metric} ${card.metricLabel}`, card.ballot,
    ...card.parties.map(p => `${p.name}: ${p.share === null ? p.value === null ? 'unavailable' : `${p.value} ${card.council ? p.value===1?'seat':'seats' : p.value===1?'vote':'votes'}` : `${p.share.toFixed(1)}%`}`),
    card.total === null ? 'Total unavailable' : `${card.total} ${card.council ? 'council seats' : 'valid ballots'}`,
    card.progress ? `${card.progress.completed} of ${card.progress.expected} districts reporting` : 'Reporting progress unavailable',
    `Source: ${card.sourceLabel ?? 'IEC'}, ${formatTime(card.reportedAt)}`, card.note].join('. ');
}
