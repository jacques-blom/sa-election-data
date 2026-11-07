import { governmentBaseline, governmentComparison, governmentChange, governmentHistory, memberKeys, type GovernmentContext, type GovernmentRecord } from './index.ts';
import { partyName, partyShort } from './parties.ts';
import { partyStyle } from '../places/format.ts';

type History = GovernmentContext & { records?: GovernmentRecord[] };
type Arrangement = 'coalition' | 'minority government' | 'government';
function point(year: number, keys: string[], arrangement: Arrangement) {
  return { year, arrangement, parties: keys.map(key => ({
    key, name: partyName(key), short: partyShort(key), color: partyStyle(partyName(key))[1],
  })) };
}

/** Compare documented governments, independently of election seat arithmetic. */
export function governmentStory(history: History | null, year: number) {
  if (!history || ![2021, 2026].includes(year)) return null;
  if (year === 2026) {
    const comparison = governmentComparison(history);
    if (!comparison) return null;
    const before = preElectionGovernment(history, year);
    const confirmed = comparison.after;
    const after = confirmed ? { ...point(year, confirmed.members, arrangement(confirmed.arrangement)),
      label:'After election', date:confirmed.effectiveFrom,
      title:`In office from ${confirmed.effectiveFrom}; verified ${confirmed.verifiedAt}` } : null;
    if (!before && !after) return null;
    return { year, points:[before, after].filter((p): p is NonNullable<typeof p> => !!p),
      pending:!after, change:comparison.change };
  }
  // A government formed later in the term must not be presented as the 2021 government.
  const first = (history.records ?? []).filter(r => r.start >= '2021-11-01' && r.start < '2022-01-01')
    .toSorted((a, b) => a.start.localeCompare(b.start))[0];
  const members = first && !first.membershipDisputed && !first.parties.some(p => p.role === 'Unknown')
    ? memberKeys(first) : [];
  const prior = members.length ? point(2021, members,
    first!.sizeType === 'Minority' ? 'minority government' : members.length > 1 ? 'coalition' : 'government')
    : history.majorityAdministration ? point(2021, [history.majorityAdministration.partyKey], 'government') : null;
  if (!prior) return null;
  return { year, points:[{...prior, label:'After 2021', date:first?.start ?? null, title:'Government formed after the 2021 election'}],
    pending:false, change:governmentChange(null, null) };
}
export type GovernmentStory = NonNullable<ReturnType<typeof governmentStory>>;

const arrangement = (value: 'coalition' | 'minority' | 'single-party'): Arrangement =>
  value === 'coalition' ? 'coalition' : value === 'minority' ? 'minority government' : 'government';

export function municipalityGovernmentStory(id: string, year: number) {
  return governmentStory(governmentHistory(id), year);
}

/** Latest dated administration in the pre-2026 record, without promoting it to a verified election-eve government. */
export function preElectionGovernment(history: History | null, year: number) {
  if (!history || year !== 2026) return null;
  const baseline = governmentBaseline(history);
  if (!baseline) return null;
  const href = `/2026/places/${history.municipality.slug}#government`;
  return { ...point(2026, baseline.members, arrangement(baseline.arrangement)),
    label:baseline.label, date:baseline.date, href, title:baseline.title };
}
