import data from './data.json' with { type: 'json' };
import verifiedData from './verified.json' with { type: 'json' };
import majorityAdministrations from './majority-administrations.json' with { type: 'json' };
import type { ElectionMajorityBaseline } from '../history/seats.ts';
import municipalities from '../places/municipalities.json' with { type: 'json' };
import { governmentParties, governmentPartyKey, partyShort } from './parties.ts';
import type { GovernmentRecord, VerifiedGovernment, SeatSnapshot } from './types.ts';
export type { GovernmentRecord, VerifiedGovernment, SeatSnapshot } from './types.ts';
export const governmentSource = data.source;
export const governmentRecords = data.records as GovernmentRecord[];
export const documentedMajorities = majorityAdministrations;
const directory = new Map(municipalities.map(p => {
  const id = p.relationships.find(r => r.election === 2026 && r.level === 'municipality' && r.relation === 'equals')!.areaId;
  return [id, { id, code: p.id.replace('za-municipality-', '').toUpperCase(), slug: p.slug, name: p.name }];
}));
export function findGovernmentMunicipality(idOrCode: string) {
  return directory.get(idOrCode) ?? [...directory.values()].find(p => p.code === idOrCode.toUpperCase() || p.slug === idOrCode) ?? null;
}
export function validateVerifiedGovernments(records: VerifiedGovernment[]) {
  const seen = new Set<string>();
  for (const r of records) {
    const key = `${r.municipalityId}:${r.phase}`;
    if (!directory.has(r.municipalityId) || r.election !== 2026 || !['before-election', 'after-election'].includes(r.phase) || seen.has(key))
      throw new Error(`Invalid/duplicate verified government: ${key}`);
    seen.add(key);
    for (const date of [r.effectiveFrom, r.verifiedAt]) if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || new Date(date).toISOString().slice(0, 10) !== date) throw new Error('Invalid verification date');
    if (r.effectiveFrom > r.verifiedAt || !r.members.length || r.phase === 'after-election' && r.effectiveFrom < '2026-01-01') throw new Error('Invalid government period');
    if (!['coalition', 'single-party', 'minority'].includes(r.arrangement)) throw new Error('Invalid arrangement');
    if (new Set([...r.members, ...r.supporters]).size !== r.members.length + r.supporters.length
      || [...r.members, ...r.supporters].some(k => !governmentParties[k] || k === 'IND1')) throw new Error('Unknown, duplicate or grouped party');
    if (r.leadParty && !r.members.includes(r.leadParty)) throw new Error('Lead party must be an explicit member');
    if (!r.sources.length || r.sources.some(s => !s.title || !/^https:\/\//.test(s.url))) throw new Error('Confirmation requires named public evidence');
  }
  return records;
}
const verified = validateVerifiedGovernments(verifiedData as VerifiedGovernment[]);
export const governmentMunicipalityIds = [...new Set([...governmentRecords, ...documentedMajorities, ...verified].map(r => r.municipalityId))];
export const memberKeys = (record: GovernmentRecord) => record.parties.filter(p => p.role === 'Member').map(p => p.key);
export const supporterKeys = (record: GovernmentRecord) => record.parties.filter(p => p.role === 'Supporter').map(p => p.key);
export const membersLabel = (keys: string[]) => keys.map(partyShort).join(' + ') || 'Membership not established';
export function governmentChange(before: VerifiedGovernment | null, after: VerifiedGovernment | null) {
  if (!before || !after) return { status: 'unconfirmed' as const, label: 'Government change not confirmed' };
  const same = (a: string[], b: string[]) => a.length === b.length && a.every(k => b.includes(k));
  const label = `${membersLabel(before.members)} → ${membersLabel(after.members)}`;
  const leadChanged = !!before.leadParty && !!after.leadParty && before.leadParty !== after.leadParty;
  if (same(before.members, after.members) && same(before.supporters, after.supporters) && before.arrangement === after.arrangement && !leadChanged)
    return { status: 'retained' as const, label: `${membersLabel(after.members)} governing parties retained` };
  // A coalition partner winning alone is a change in arrangement, not automatically a takeover.
  if (before.members.length > 1 && after.members.length === 1 && before.members.includes(after.members[0]!))
    return { status: 'partner-governs-alone' as const, label: `${label} · former partner now governs alone` };
  if (leadChanged)
    return { status: 'lead-party-changed' as const, label: `${label} · lead party changed` };
  return { status: 'composition-changed' as const, label: `${label} · governing arrangement changed` };
}
/** A static source edition is never promoted to a verified pre-election/current government. */
export function governmentContext(id: string, year = 2026, baseline: ElectionMajorityBaseline | null = null) {
  if (year !== 2026) return null;
  const municipality = findGovernmentMunicipality(id);
  if (!municipality) return null;
  const history = governmentRecords.filter(r => r.municipalityId === municipality.id);
  const latest = history.at(-1) ?? null;
  const majorityAdministration = documentedMajorities.find(r => r.municipalityId === municipality.id) ?? null;
  const electionBaseline = baseline?.municipalityId === municipality.id && baseline.year === 2021 ? baseline : null;
  const before = verified.find(r => r.municipalityId === municipality.id && r.phase === 'before-election') ?? null;
  const after = verified.find(r => r.municipalityId === municipality.id && r.phase === 'after-election') ?? null;
  return { municipality, coverage: latest || majorityAdministration || before || after ? 'recorded' as const : 'not-covered' as const, latest, majorityAdministration, electionBaseline,
    label: after ? membersLabel(after.members) : before ? membersLabel(before.members) : latest ? membersLabel(memberKeys(latest)) : majorityAdministration ? partyShort(majorityAdministration.partyKey) : electionBaseline ? electionBaseline.party.name : 'Government not verified',
    currentStatus: after ? 'confirmed-after-election' as const : 'unverified' as const,
    beforeElection: before, afterElection: after, change: governmentChange(before, after),
    historyCount: history.length, historyUrl: `/api/v1/governments/${municipality.id}`,
    source: governmentSource };
}
export type GovernmentContext = NonNullable<ReturnType<typeof governmentContext>>;
export function governmentHistory(id: string, baseline: ElectionMajorityBaseline | null = null) {
  const context = governmentContext(id, 2026, baseline);
  return context ? { ...context, records: governmentRecords.filter(r => r.municipalityId === context.municipality.id) } : null;
}
/** The government baseline is independent of the previous election's seat allocation. */
export function governmentBaseline(context: GovernmentContext | null) {
  if (!context) return null;
  const before = context.beforeElection;
  if (before) return { members:before.members, arrangement:before.arrangement, label:'Before election',
    date:before.verifiedAt, basis:'verified-before-election' as const,
    title:`Verified before the 2026 election on ${before.verifiedAt}` };
  const latest = context.latest;
  if (latest) {
    const members = memberKeys(latest);
    if (latest.membershipDisputed || latest.parties.some(p=>p.role==='Unknown') || !members.length || members.includes('IND1')) return null;
    return { members, arrangement:latest.sizeType === 'Minority' ? 'minority' as const : members.length > 1 ? 'coalition' as const : 'single-party' as const,
      label:'Last recorded', date:latest.start, basis:'recorded' as const,
      title:`Members at formation, ${latest.start}${latest.end ? `; ended ${latest.end}` : ''}. ${context.source.title}; coverage through ${context.source.cutoff}.` };
  }
  const majority = context.majorityAdministration;
  return majority ? { members:[majority.partyKey], arrangement:'single-party' as const, label:'Last recorded',
    date:majority.evidenceThrough, basis:'recorded' as const,
    title:`${majority.evidencePeriod}; evidence through ${majority.evidenceThrough}.` } : null;
}
export function governmentComparison(context: GovernmentContext | null) {
  if (!context) return null;
  const before = governmentBaseline(context), after = context.afterElection;
  if (!before && !after) return null;
  return { before, after, change:governmentChange(context.beforeElection, after) };
}
export function governmentCaption(context: GovernmentContext | null) {
  if (!context) return null;
  const comparison = governmentComparison(context);
  if (comparison) {
    const {before, after, change} = comparison;
    const previous = before ? `${before.basis === 'verified-before-election' ? 'Before the 2026 election' : 'Last recorded government'} (${before.date}): ${membersLabel(before.members)}` : null;
    const current = after ? `After the 2026 election (${after.effectiveFrom}): ${membersLabel(after.members)}` : 'After the 2026 election: pending';
    return `${[previous,current].filter(Boolean).join(' → ')}.${change.status !== 'unconfirmed' ? ` ${change.label}.` : ''}`;
  }
  return context.electionBaseline ? `2021 council: ${context.electionBaseline.party.name} outright majority (${context.electionBaseline.seats}/${context.electionBaseline.total} seats). Election allocation, not a record of subsequent government changes.` : null;
}
/** Hypothetical arithmetic only. Outside supporters and grouped independents are never added. */
export function compareFormationMembers(record: GovernmentRecord | null, seats: SeatSnapshot | null) {
  const unavailable = (reason: string) => ({ status: 'unavailable' as const, reason, partyIds: [] as string[] });
  if (!record || !seats) return unavailable('A recorded administration and usable 2026 seats are needed.');
  if (record.membershipDisputed) return unavailable('The source flags disputed membership; no partner total is calculated.');
  const members = memberKeys(record);
  if (!members.length || members.includes('IND1') || record.parties.some(p => p.role === 'Unknown'))
    return unavailable('Unknown roles or grouped independents prevent a reliable partner match.');
  return compareMembers(members, seats);
}
function compareMembers(members: string[], seats: SeatSnapshot) {
  const unavailable = (reason: string) => ({ status: 'unavailable' as const, reason, partyIds: [] as string[] });
  const matched = members.map(key => seats.parties.filter(p => p.id !== '0' && governmentPartyKey(p.name) === key));
  if (matched.some(ps => ps.length !== 1)) return unavailable(`No unique 2026 seat match for ${members.filter((_, i) => matched[i]!.length !== 1).map(partyShort).join(', ')}. Their seats are unknown, so no combined total is shown.`);
  const parties = matched.map(ps => ps[0]!);
  const total = parties.reduce((sum, p) => sum + p.count, 0);
  if (!Number.isSafeInteger(total) || total < 0 || total > seats.total) return unavailable('The matched seat total is inconsistent.');
  return { status: seats.status, total, majority: seats.majority, councilSize: seats.total,
    shortfall: Math.max(0, seats.majority - total), partyIds: parties.map(p => p.id),
    label: `${membersLabel(members)}: ${total} of ${seats.total} ${seats.status === 'estimated' ? 'estimated ' : ''}seats in 2026; ${seats.majority} needed`,
    caveat: 'Hypothetical total for the recorded members at formation. Excludes outside supporters. It does not establish a current agreement, government retention, or a takeover.' };
}
/** Prefer a separately verified pre-election baseline when one exists. Never use the new government as the old baseline. */
export function compareGovernmentPartners(context: GovernmentContext, seats: SeatSnapshot | null) {
  if (!context.beforeElection) return { ...compareFormationMembers(context.latest, seats), basis: 'members-at-formation' as const };
  if (!seats) return { status: 'unavailable' as const, reason: 'Usable 2026 seats are needed.', partyIds: [] as string[], basis: 'verified-before-election' as const };
  return { ...compareMembers(context.beforeElection.members, seats), basis: 'verified-before-election' as const,
    caveat: 'Hypothetical total for the verified pre-election members. Outside supporters are excluded. Seats alone do not establish a post-election government or takeover.' };
}
export function seatSnapshot(seats: import('../seats/allocation.ts').CouncilSeats | null): SeatSnapshot | null {
  return !seats || seats.status === 'unavailable' ? null : { status: seats.status, total: seats.total, majority: seats.majority,
    parties: seats.parties.map(p => ({ id: p.party_id!, name: p.party_name, count: p.count })) };
}

