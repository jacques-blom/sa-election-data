import { dashboardHighlights, type DashboardCouncil } from './dashboard.ts';
import { provinces } from './results.ts';

/** Raw seat changes across exactly the same councils, including unchanged and hung outcomes. */
export function councilSeatChanges(councils: DashboardCouncil[]) {
  const parties = new Map<string, { id: string; name: string; previous: number; current: number }>();
  let comparable = 0, previousTotal = 0, currentTotal = 0;
  for (const council of councils) {
    const now = council.seats, before = council.previous?.seats;
    if (now?.status !== 'reported' || before?.status !== 'reported') continue;
    comparable++;
    previousTotal += before.total;
    currentTotal += now.total;
    // Reported allocations contain the complete seat breakdown. An absent party has no seats.
    for (const [allocation, election] of [[before, 'previous'], [now, 'current']] as const) {
      for (const party of allocation.parties) {
        const row = parties.get(party.id) ?? { id: party.id, name: party.name, previous: 0, current: 0 };
        row[election] += party.count;
        // Independent totals are comparable as a group, never as the same candidate or party.
        row.name = party.id === '0' ? 'Independents (combined)' : party.name;
        parties.set(party.id, row);
      }
    }
  }
  return { comparable, previousTotal, currentTotal,
    parties: [...parties.values()].filter(p => p.previous > 0 || p.current > 0)
      .map(p => ({ ...p, delta: p.current - p.previous }))
      .sort((a, b) => b.delta - a.delta || a.name.localeCompare(b.name) || a.id.localeCompare(b.id)) };
}

/** Editorial views of the same published council summaries used by the homepage. */
export function electionHighlights(councils: DashboardCouncil[]) {
  const highlights = dashboardHighlights(councils);
  const reported = councils.filter(c => c.seats?.status === 'reported');
  const hung = reported.filter(c => c.status === 'no-majority');
  const balance = new Map<string, { id: string; name: string; gained: number; lost: number; net: number }>();
  for (const c of highlights.changes) {
    for (const [party, direction] of [[c.previousWinner, 'lost'], [c.winner, 'gained']] as const) {
      if (!party) continue;
      const row = balance.get(party.id) ?? { id: party.id, name: party.name, gained: 0, lost: 0, net: 0 };
      row[direction]++;
      row.net = row.gained - row.lost;
      balance.set(party.id, row);
    }
  }
  const nearMajorities = hung.flatMap(c => c.largest && c.seats
    ? [{ council: c, party: c.largest, short: c.seats.majority - c.largest.count }] : [])
    .filter(r => r.short > 0)
    .sort((a, b) => a.short - b.short || Number(b.council.metro) - Number(a.council.metro) || a.council.name.localeCompare(b.council.name));
  // Compare shares, not raw shortfalls: a large council should not rank as more divided just for its size.
  const fragmentedCouncils = hung.flatMap(c => {
    const named = c.seats!.parties.filter(p => p.id !== '0' && p.count > 0);
    if (!named.length) return [];
    const count = Math.max(...named.map(p => p.count));
    return [{ council: c, leaders: named.filter(p => p.count === count), count,
      share: count / c.seats!.total * 100, short: c.seats!.majority - count }];
  }).sort((a, b) => a.share - b.share || Number(b.council.metro) - Number(a.council.metro) || a.council.name.localeCompare(b.council.name));
  const provinceOutcomes = provinces.map(province => {
    const rows = councils.filter(c => c.provinceId === province.id);
    const majority = rows.filter(c => c.status === 'majority').length;
    const noMajority = rows.filter(c => c.status === 'no-majority').length;
    const pending = rows.filter(c => c.status === 'pending').length;
    const unavailable = rows.filter(c => c.status === 'unavailable').length;
    return { ...province, total: rows.length, majority, noMajority, pending, unavailable,
      reported: majority + noMajority };
  });
  const counting = councils.filter(c => c.status === 'pending' && c.progress && c.progress.percent > 0 && c.progress.percent < 100)
    .sort((a, b) => Number(b.metro) - Number(a.metro) || b.progress!.percent - a.progress!.percent || a.name.localeCompare(b.name));
  return { ...highlights, reported: reported.length, hung: hung.length,
    pending: councils.filter(c => c.status === 'pending').length,
    changesToHung: highlights.changes.filter(c => !c.winner).length,
    changesFromHung: highlights.changes.filter(c => !c.previousWinner).length,
    changesBetweenParties: highlights.changes.filter(c => c.previousWinner && c.winner).length,
    balance: [...balance.values()].sort((a, b) => (b.gained + b.lost) - (a.gained + a.lost) || a.name.localeCompare(b.name)),
    seatChanges: councilSeatChanges(councils),
    nearMajorities, fragmentedCouncils, provinceOutcomes, counting };
}
export type ElectionHighlights = ReturnType<typeof electionHighlights>;
