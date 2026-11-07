import { partyLogo } from '../parties/logos.ts';
import { partyStyle } from '../places/format.ts';
import { type AvailableSeats } from './allocation.ts';

export type CoalitionData = {
  name: string; status: AvailableSeats['status']; total: number; majority: number;
  municipalityId?: string;
  province?: string;
  progress?: { completed: number; expected: number } | null;
  governmentContext?: string | null;
  source: { url: string; reportedAt: string; snapshotId: string };
  parties: { id: string; name: string; short: string; color: string; seats: number; selectable: boolean; logo?: string | null }[];
};
export function coalitionData(name: string, seats: AvailableSeats, source: CoalitionData['source']): CoalitionData {
  return { name, status: seats.status, total: seats.total, majority: seats.majority, source,
    parties: seats.parties.filter(p => p.count > 0).map(p => {
      const [short, color] = partyStyle(p.party_name);
      return { id: p.source_entry_id, name: p.party_name, short: short!, color: color!, seats: p.count,
        logo: partyLogo(p), selectable: p.party_id !== '0' && p.entry_type !== 'aggregate' };
    }) };
}
export function coalitionSelection(data: CoalitionData, ids: Iterable<string>) {
  const selected = new Set(ids);
  const parties = data.parties.filter(p => p.selectable && selected.has(p.id));
  const total = parties.reduce((sum, p) => sum + p.seats, 0);
  const shortfall = Math.max(0, data.majority - total);
  const status = !parties.length ? 'Choose parties to combine their seats'
    : shortfall ? `${shortfall} more ${shortfall === 1 ? 'seat' : 'seats'} needed`
    : `Majority reached${total === data.majority ? ': exactly ' + data.majority + ' seats' : ': ' + (total - data.majority) + ' above the threshold'}`;
  return { parties, total, shortfall, status };
}
export function coalitionShareText(data: CoalitionData, ids: Iterable<string>, url?: string) {
  const selection = coalitionSelection(data, ids);
  const parties = selection.parties.slice(0, 3).map(p => p.short).join(' + ') + (selection.parties.length > 3 ? ` + ${selection.parties.length - 3} more` : '');
  const caption = `Fictional scenario · Coalition Chaos. ${data.name}: ${parties || 'No parties selected'} — ${selection.total} of ${data.total} seats. ${selection.shortfall ? `${selection.shortfall} more needed for a majority.` : 'A possible majority.'} Hypothetical${data.status === 'estimated' ? ', estimated seats' : ', provisional seats'}.`;
  const context = data.governmentContext ? `${caption}\n\n${data.governmentContext}` : caption;
  return url ? `${context}\n\n${url}` : context;
}
