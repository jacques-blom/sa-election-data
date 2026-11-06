import { councilSeats } from '../seats/allocation.ts';
import type { AreaRecord } from '../data/normalize.ts';
import type { Milestone } from '../updates/milestones.ts';

type CouncilRow = { area_id: string; source_id?: string; snapshot_id: string; payload: string | null };
type CouncilState = { source_id: string; snapshot_id: string; council_json: string | null };
type Party = { id: string; name: string; count: number };
export type CouncilOutcome = { id: string; status: 'pending' }
  | { id: string; status: 'reported' | 'estimated'; total: number; majority: number; winner: Party | null; parties: Party[] };
export type CouncilOverview = ReturnType<typeof summariseCouncils>;

/** The sync publishes these validated milestones atomically with its result pointer.
 * Read just the council milestone, not every ward or every R2 result pack. */
export async function readCouncilStates(db: D1Database, year: number): Promise<CouncilState[]> {
  try {
    const { results } = await db.prepare(`SELECT s.source_id,s.snapshot_id,
      json_extract(s.milestones_json, '$."council:' || d.area_id || '"') AS council_json
      FROM result_update_state s JOIN source_documents d ON d.id=s.source_id
      WHERE d.year=? AND d.kind='municipality' AND s.snapshot_id=d.active_snapshot_id`)
      .bind(year).all<CouncilState>();
    return results;
  } catch (error) {
    // Older local imports predate the feed; their complete D1 payloads still work.
    if (error instanceof Error && /no such table: (?:main\.)?result_update_state/i.test(error.message)) return [];
    throw error;
  }
}

function allocationOutcome(id: string, total: number, majority: number, parties: Party[], status: 'reported' | 'estimated' = 'reported'): CouncilOutcome {
  if (!Number.isSafeInteger(total) || total < 1 || total > 1000 || majority !== Math.floor(total / 2) + 1
    || !parties.length || new Set(parties.map(p => p.id)).size !== parties.length
    || parties.some(p => !p.id || p.id === '-2' || !p.name || !Number.isSafeInteger(p.count) || p.count < 0)
    || parties.reduce((sum, p) => sum + p.count, 0) !== total) return { id, status: 'pending' };
  // ID 0 is a collection of independent councillors, not a single party.
  const winner = parties.find(p => p.id !== '0' && p.count >= majority) ?? null;
  return { id, status, total, majority, winner, parties: [...parties].sort((a, b) => b.count - a.count || a.id.localeCompare(b.id)) };
}

export function summariseCouncils(rows: CouncilRow[], states: CouncilState[], expected: number | null) {
  const current = new Map(states.map(state => [state.source_id, state]));
  const entries = rows.map((row): CouncilOutcome => {
    try {
      // Prefer a hydrated payload when available, including historical/local D1 imports.
      if (row.payload) {
        const seats = councilSeats('municipality', JSON.parse(row.payload) as AreaRecord['payload']);
        if (seats.status === 'unavailable') return { id: row.area_id, status: 'pending' };
        return allocationOutcome(row.area_id, seats.total, seats.majority,
          seats.parties.map(p => ({ id: p.party_id!, name: p.party_name, count: p.count })), seats.status);
      }
      const state = row.source_id ? current.get(row.source_id) : null;
      // A newer or older state must never be mixed with this page's snapshot pointers.
      if (state?.snapshot_id !== row.snapshot_id || !state.council_json) return { id: row.area_id, status: 'pending' };
      const milestone = JSON.parse(state.council_json) as Milestone;
      if (milestone.kind !== 'council_decided' || milestone.areaId !== row.area_id) return { id: row.area_id, status: 'pending' };
      return allocationOutcome(row.area_id, milestone.totalSeats!, milestone.majority!, milestone.seats!);
    } catch {
      return { id: row.area_id, status: 'pending' };
    }
  });
  const hasExpectedTotal = expected !== null && Number.isSafeInteger(expected) && expected > 0 && expected >= entries.length;
  const total = hasExpectedTotal ? expected : entries.length;
  const parties = new Map<string, { id: string; name: string; councils: number }>();
  let singleParty = 0, noMajority = 0;
  for (const entry of entries) {
    if (entry.status !== 'reported') continue;
    if (!entry.winner) { noMajority++; continue; }
    singleParty++;
    const party = parties.get(entry.winner.id) ?? { id: entry.winner.id, name: entry.winner.name, councils: 0 };
    party.councils++;
    parties.set(party.id, party);
  }
  return { total, hasExpectedTotal, singleParty, noMajority, pending: total - singleParty - noMajority, entries,
    parties: [...parties.values()].sort((a, b) => b.councils - a.councils || a.name.localeCompare(b.name, 'en-ZA')) };
}
