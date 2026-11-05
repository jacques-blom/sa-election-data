import { partyStyle, formatTime } from '../places/format.ts';
import { estimateCaution, seatLabel, type AvailableSeats } from './allocation.ts';

export type CoalitionData = {
  name: string; status: AvailableSeats['status']; total: number; majority: number;
  source: { url: string; reportedAt: string; snapshotId: string };
  parties: { id: string; name: string; short: string; color: string; seats: number; selectable: boolean }[];
};
export function coalitionData(name: string, seats: AvailableSeats, source: CoalitionData['source']): CoalitionData {
  return { name, status: seats.status, total: seats.total, majority: seats.majority, source,
    parties: seats.parties.filter(p => p.count > 0).map(p => {
      const [short, color] = partyStyle(p.party_name);
      return { id: p.source_entry_id, name: p.party_name, short: short!, color: color!, seats: p.count,
        selectable: p.party_id !== '0' && p.entry_type !== 'aggregate' };
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
export function coalitionShareText(data: CoalitionData, ids: Iterable<string>, url: string) {
  const selection = coalitionSelection(data, ids);
  return [`HYPOTHETICAL COALITION · ${data.name}`, seatLabel(data),
    selection.parties.map(p => `${p.name}: ${p.seats}`).join('\n'),
    `${selection.total} of ${data.total} council seats. ${data.majority} needed for a majority.`,
    selection.status + '.',
    data.status === 'estimated' ? estimateCaution : 'IEC-reported seats; results remain provisional.',
    'This selection does not establish an agreement or who will govern.',
    `IEC result time: ${formatTime(data.source.reportedAt)}`, `Source: ${data.source.url}`,
    `Snapshot: ${data.source.snapshotId}`, 'This link opens the selection using the latest available seats:', url].join('\n');
}
