import type { AreaRecord } from '../data/normalize.ts';
import { councilSeats } from '../seats/allocation.ts';

export type UpdateKind = 'ward_won' | 'council_decided' | 'count_complete';
export type Winner = { id: string; name: string; candidate: string | null };
export type Milestone = {
  key: string; kind: UpdateKind; areaId: string; areaName: string;
  provinceId: string; municipalityId: string; municipalityName: string; reportedAt: string;
  winner?: Winner; marginVotes?: number | null; winnerVotes?: number | null;
  districts?: number; totalSeats?: number; majority?: number;
  seats?: { id: string; name: string; count: number }[];
};
export type Milestones = Record<string, Milestone>;
const count = (n: unknown): n is number => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0;

/** A vote leader, a forecast or a placeholder progress field is never a milestone. */
export function milestones(records: readonly AreaRecord[]): Milestones {
  const municipality = records.find(r => r.level === 'municipality');
  if (!municipality?.provinceId || !municipality.municipalityId) return {};
  const found: Milestones = {};
  for (const record of records) {
    if (record.municipalityId !== municipality.id || !['ward', 'municipality'].includes(record.level)) continue;
    const common = { areaId: record.id, areaName: record.level === 'ward' ? `Ward ${Number(record.id.slice(-3))}` : record.name, provinceId: municipality.provinceId,
      municipalityId: municipality.id, municipalityName: municipality.name, reportedAt: record.reportedAt };
    const { payload } = record;
    const parties = payload.parties;
    if (record.level === 'ward') {
      // WardSeatsWon is an explicit seat result. Do not use combined vote shares.
      if (payload.party_list_scope !== 'all_rows_in_source' || !parties.length
        || new Set(parties.map(p => p.source_entry_id)).size !== parties.length
        || parties.some(p => p.entry_type !== 'party_or_candidate' || !p.party_id
          || p.party_id !== p.source_entry_id || !count(p.seats.ward) || p.seats.ward > 1)
        || parties.reduce((sum, p) => sum + p.seats.ward!, 0) !== 1) continue;
      const winner = parties.find(p => p.seats.ward === 1)!;
      const votesKnown = parties.every(p => count(p.votes.ward));
      const others = parties.filter(p => p !== winner);
      const margin = votesKnown && others.length ? winner.votes.ward! - Math.max(...others.map(p => p.votes.ward!)) : null;
      // A contradictory vote/seat document needs investigation, not a winner card.
      if (margin !== null && margin < 0) continue;
      const key = `ward:${record.id}`;
      found[key] = { ...common, key, kind: 'ward_won',
        winner: { id: winner.party_id!, name: winner.party_name, candidate: winner.candidate_name },
        marginVotes: margin, winnerVotes: votesKnown ? winner.votes.ward : null };
      continue;
    }
    const progress = payload.progress.voting_districts;
    const complete = progress && count(progress.expected) && progress.expected > 0
      && progress.completed === progress.expected;
    if (complete) {
      const key = `count:${record.id}`;
      found[key] = { ...common, key, kind: 'count_complete', districts: progress.expected };
    }
    // Only use the reported allocation branch; estimates never enter the feed.
    if (payload.progress.seats?.completed !== payload.progress.seats?.expected) continue;
    const allocation = councilSeats('municipality', payload);
    if (allocation.status !== 'reported') continue;
    // ID 0 combines independent candidates and cannot be treated as one party.
    const winner = allocation.parties.find(p => p.party_id !== '0' && p.count >= allocation.majority);
    const key = `council:${record.id}`;
    found[key] = { ...common, key, kind: 'council_decided', totalSeats: allocation.total, majority: allocation.majority,
      ...(winner ? { winner: { id: winner.party_id!, name: winner.party_name, candidate: null } } : {}),
      seats: allocation.parties.filter(p => p.count > 0).map(p => ({ id: p.party_id!, name: p.party_name, count: p.count })),
      ...(complete ? { districts: progress.expected } : {}) };
  }
  return found;
}

/** Names, report clocks and routine vote increments do not make new milestones. */
export function milestoneIdentity(milestone: Milestone | undefined): string {
  if (!milestone) return 'absent';
  if (milestone.kind === 'ward_won') return JSON.stringify([milestone.winner!.id, milestone.winner!.candidate]);
  if (milestone.kind === 'count_complete') return JSON.stringify(milestone.districts);
  return JSON.stringify([milestone.totalSeats, [...milestone.seats!].sort((a, b) => a.id.localeCompare(b.id)).map(p => [p.id, p.count])]);
}

export function milestoneChanges(before: Milestones, after: Milestones) {
  const changes = [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter(key => milestoneIdentity(before[key]) !== milestoneIdentity(after[key]))
    .map(key => ({ key, before: before[key] ?? null, after: after[key] ?? null }));
  // A completed council allocation can carry its count-complete fact in one card.
  return changes.filter(change => !(change.after?.kind === 'count_complete'
    && !change.before && changes.some(c => c.after?.kind === 'council_decided'
      && c.after.municipalityId === change.after!.municipalityId)));
}
