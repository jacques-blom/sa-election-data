import { coalitionSelection, coalitionShareText, type CoalitionData } from './coalition.ts';
import type { ShareCard } from '../sharing/model.ts';

export function coalitionShareCard(data: CoalitionData, ids: Iterable<string>): ShareCard {
  const selected = [...ids];
  const selection = coalitionSelection(data, selected);
  const chosen = new Set(selection.parties.map(p => p.id));
  return {
    kind: 'coalition', year: 2026, area: data.name,
    headline: !selection.parties.length ? 'Build a majority.' : selection.shortfall ? `${selection.shortfall} ${selection.shortfall === 1 ? 'seat' : 'seats'} short.` : 'A possible majority.',
    metric: String(selection.total), metricLabel: `of ${data.total} council seats`,
    ballot: data.status === 'estimated' ? 'Hypothetical · estimated seats' : 'Hypothetical · IEC-reported seats',
    parties: selection.parties.map(p => ({ name: p.name, short: p.short, color: p.color, value: p.seats, share: null })),
    total: data.total, progress: data.progress ?? null, reportedAt: data.source.reportedAt,
    note: data.status === 'estimated' ? 'Seats may change. No agreement implied.' : 'Provisional seats. No agreement implied.',
    caption: coalitionShareText(data, selected),
    council: { majority: data.majority, selected: selection.total,
      groups: data.parties.map(p => ({ seats: p.seats, color: p.color, selected: chosen.has(p.id) })) },
  };
}
