import type { Feed, FeedOptions, Update } from './feed.ts';
import type { Milestone, Winner } from './milestones.ts';

// Fictional places and results. This module is imported only in Astro DEV mode.
const parties = {
  da: { id: '52', name: 'DEMOCRATIC ALLIANCE', candidate: null },
  anc: { id: '7', name: 'AFRICAN NATIONAL CONGRESS', candidate: null },
  eff: { id: '945', name: 'ECONOMIC FREEDOM FIGHTERS', candidate: null },
  action: { id: '1511', name: 'ACTIONSA', candidate: null },
} satisfies Record<string, Winner>;

export function simulationEvents(): Update[] {
  const area = (id: string, name: string, provinceId: string) => ({
    areaId: id, areaName: name, provinceId, municipalityId: id, municipalityName: name,
    reportedAt: '2026-11-06T08:30:00.000Z',
  });
  const bay = area('demo-bay', 'Demo Bay', '9');
  const metro = area('demo-metro', 'Demo Metro', '3');
  const river = area('demo-river', 'Demo River', '1');
  const karoo = area('demo-karoo', 'Demo Karoo', '6');
  const count: Milestone = { ...bay, key: 'count:demo-bay', kind: 'count_complete', districts: 24 };
  const win: Milestone = { ...bay, key: 'ward:demo-bay-012', kind: 'ward_won',
    areaId: 'demo-bay-012', areaName: 'Ward 12', winner: { ...parties.da, candidate: 'Example candidate A' },
    marginVotes: 326, winnerVotes: 2418 };
  const independent: Milestone = { ...karoo, key: 'ward:demo-karoo-004', kind: 'ward_won',
    areaId: 'demo-karoo-004', areaName: 'Ward 4', winner: { id: '0', name: 'IND', candidate: 'Example independent' },
    marginVotes: 87, winnerVotes: 1203 };
  const seat = (party: Winner, count: number) => ({ id: party.id, name: party.name, count });
  const hung: Milestone = { ...metro, key: 'council:demo-metro', kind: 'council_decided', totalSeats: 100, majority: 51,
    districts: 180, seats: [seat(parties.anc, 40), seat(parties.da, 35), seat(parties.eff, 15), seat(parties.action, 10)] };
  const majority: Milestone = { ...river, key: 'council:demo-river', kind: 'council_decided', totalSeats: 30, majority: 16,
    districts: 42, winner: parties.anc, seats: [seat(parties.anc, 18), seat(parties.da, 9), seat(parties.eff, 3)] };
  const revisedWin: Milestone = { ...win, winner: { ...parties.anc, candidate: 'Example candidate B' }, marginVotes: 14, winnerVotes: 2432 };
  const revisedSeats: Milestone = { ...hung, seats: [seat(parties.anc, 39), seat(parties.da, 36), seat(parties.eff, 15), seat(parties.action, 10)] };
  const events: Update[] = [];
  function add(after: Milestone | null, before: Milestone | null = null, previous: number | null = null) {
    const id = events.length + 1, milestone = (after ?? before)!;
    const reportTime = Date.parse('2026-11-06T08:30:00Z') + (id - 1) * 5 * 60_000;
    const reportedAt = new Date(reportTime).toISOString();
    events.push({ id, kind: milestone.kind, action: previous ? after ? 'corrected' : 'withdrawn' : 'announced', year: 2026,
      province_id: milestone.provinceId, municipality_id: milestone.municipalityId, area_id: milestone.areaId,
      area_name: milestone.areaName, municipality_name: milestone.municipalityName,
      reported_at: reportedAt, observed_at: new Date(reportTime + 30_000).toISOString(),
      published_at: new Date(reportTime + 60_000).toISOString(), source_url: 'urn:counted:local-simulation',
      from_snapshot_id: `simulation-before-${id}`, to_snapshot_id: `simulation-after-${id}`,
      previous_event_id: previous, superseded_by: null,
      before: before ? structuredClone(before) : null, after: after ? { ...structuredClone(after), reportedAt } : null });
  }
  add(count);
  add(win);
  add(independent);
  add(hung);
  add(majority);
  add(revisedWin, events[1]!.after, 2);
  add(null, events[0]!.after, 1);
  add(revisedSeats, events[3]!.after, 4);
  return events;
}

export function simulationStep(params: URLSearchParams) {
  if (params.get('demo') !== '1') throw new Error('Use demo=1 for the local simulation');
  const total = simulationEvents().length;
  const value = params.get('step') ?? String(total);
  if (!/^(0|[1-9]\d*)$/.test(value) || Number(value) > total) throw new Error(`Simulation step must be between 0 and ${total}`);
  return { step: Number(value), total };
}

export function simulatedFeed(options: FeedOptions, step: number): Feed {
  const visible = simulationEvents().slice(0, step);
  // An earlier stage must not reveal corrections that have not happened yet.
  for (const event of visible) event.superseded_by = visible.find(next => next.previous_event_id === event.id)?.id ?? null;
  const filtered = visible.filter(event => {
    if (options.province && options.province !== event.province_id) return false;
    if (options.type === 'corrections' && event.action === 'announced') return false;
    if (options.type === 'wins' && event.kind !== 'ward_won') return false;
    if (options.type === 'councils' && event.kind !== 'council_decided') return false;
    if (options.type === 'complete' && event.kind !== 'count_complete') return false;
    if (options.q && !`${event.municipality_name} ${event.area_name}`.toLowerCase().includes(options.q.toLowerCase())) return false;
    if (options.before !== null && event.id >= options.before) return false;
    if (options.after !== null && event.id <= options.after) return false;
    if (options.event !== null && event.id !== options.event) return false;
    return true;
  }).reverse();
  const updates = filtered.slice(0, options.limit);
  return { status: 'tracking', updates, latest_id: updates[0]?.id ?? null,
    next_before: filtered.length > options.limit ? updates.at(-1)!.id : null,
    tracking_since: '2026-11-06T08:00:00.000Z' };
}
