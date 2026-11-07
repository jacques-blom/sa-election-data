import { createDataReader, type McpBindings } from '../../mcp/data.ts';
import { governmentHistory, governmentSource, memberKeys, supporterKeys } from '../../governance/index.ts';
import { partyShort } from '../../governance/parties.ts';
import { areaHref } from './extra-model.ts';
import { visualParty, type VisualDataset, type VisualMeta, type VisualTable } from './model.ts';
import type { VisualDataRequest } from './data.ts';
import type { TimelineEvent } from './extra-schema.ts';
import { provinceById } from '../../overview/results.ts';

export async function readExtraData(bindings: McpBindings, origin: string, request: VisualDataRequest): Promise<VisualDataset> {
  const { year, level, area_id: id } = request;
  if (request.view === 'government') {
    if (level !== 'municipality') throw new Error('Government timelines require a municipality.');
    if (year !== 2026) throw new Error('Use year=2026 for the dated government-history edition.');
    const history = governmentHistory(id);
    if (!history) throw new Error('No government history is available for this municipality.');
    const sources = [{ title: governmentSource.title, url: governmentSource.url }, { title: 'Counted government records', url: `https://counted.co.za${history.historyUrl}` }];
    const events: TimelineEvent[] = history.records.map(r => ({ id: r.id, start: r.start, end: r.end, approximate: r.approximateStart,
      title: r.coalitionType || 'Recorded administration', members: memberKeys(r).map(partyShort), supporters: supporterKeys(r).map(partyShort),
      note: [r.notes, r.membershipDisputed ? 'Membership is disputed in the source.' : '', ...r.issues].filter(Boolean).join(' '), sources: [sources[0]!] }));
    for (const record of [history.beforeElection, history.afterElection]) if (record) events.push({ id: record.phase, start: record.effectiveFrom, end: null,
      title: record.phase === 'after-election' ? 'Verified after election' : 'Verified before election', members: record.members.map(partyShort), supporters: record.supporters.map(partyShort),
      note: `Verified ${record.verifiedAt}. ${record.notes}`, sources: record.sources });
    // A majority administration report without an inauguration date is evidence,
    // not an invented point on a dated timeline.
    const majority = history.majorityAdministration;
    return { columns: [], timeline: { scope: history.municipality.name, label: 'Government history', status: 'reported', provisional: false,
      basis: 'Dated government records · members at formation', cutoff: governmentSource.cutoff, events,
      notes: [governmentSource.basis, governmentSource.coverage, ...(majority ? [majority.notes] : []),
        ...(!events.length ? ['No dated administrations in this dataset. Missing coverage does not mean no government.'] : [])],
      sources: [...sources, ...(majority?.sources ?? [])], provenance: governmentSource } };
  }
  const reader = createDataReader(bindings, origin);
  if (request.view === 'areas') {
    if (level !== 'province' && level !== 'municipality') throw new Error('Area visuals currently support provinces and municipalities.');
    if (level === 'province' && id !== 'all') throw new Error('Use area_id=all for provinces; use level=municipality and area_id=<province ID> for its councils.');
    const data = await reader.summaries({ year, level, ballot: 'auto', limit: 300, offset: 0,
      ...(level === 'municipality' && id !== 'all' ? { province_id: id } : {}), ...(request.party_id ? { party_id: request.party_id } : {}) });
    if (data.next_offset !== null) throw new Error('Too many areas. Narrow this request to one province.');
    if (!data.areas.length) throw new Error('No imported areas match this request.');
    const bases = [...new Set(data.areas.map(a => a.ballot.basis))];
    if (bases.length !== 1) throw new Error('These areas have different ballot bases. Narrow the selection before comparing them.');
    const selected = !!request.party_id;
    const table: VisualTable = { label: `${year} ${level} results`, scope: id === 'all' ? 'South Africa' : provinceById(id)?.name ?? `Province ${id}`,
      year, geography: level, status: 'reported', provisional: year === 2026, basis: `${bases[0]} ballots · ${selected ? 'Selected party' : 'Highest shown party (ties labelled)'}`,
      columns: [{ id: 'party', label: selected ? 'Selected party' : 'Highest shown', unit: 'text' }, { id: 'share', label: 'Vote share', unit: 'percent' },
        { id: 'votes', label: 'Votes', unit: 'number' }, { id: 'reporting', label: 'Voting districts reporting', unit: 'percent' }],
      rows: data.areas.map(a => {
        const party = selected ? a.selected_party : a.leader;
        return { id: a.area_id, label: a.name.replace(/^[A-Z0-9]+\s+-\s+/, ''), href: areaHref(level, a.area_id, year),
          values: { party: party?.party_name ? `${party.party_name}${!selected && a.tied ? ' (tied)' : ''}` : null,
            share: party?.share_percent ?? null, votes: party?.votes ?? null, reporting: a.progress.voting_districts?.percent ?? null } };
      }),
      notes: [data.scope, data.snapshot_note, 'Coverage is imported areas only. Unlisted parties and missing results are unavailable, not zero. Vote leaders are not council control.',
        ...new Set(data.areas.map(a => a.freshness_warning).filter((s): s is string => !!s))],
      sources: data.areas.map(a => ({ title: a.name, url: a.results_url })),
      provenance: data.areas.map(a => ({ id: a.area_id, snapshotId: a.source.snapshotId, reportedAt: a.source.reportedAt, checkedAt: a.source.checkedAt })),
    };
    return { columns: [], table };
  }
  const a = await reader.summary(year, level, id, 'auto', 1000, 0);
  const meta: VisualMeta = { label: String(year), scope: a.name, status: 'reported', provisional: year === 2026, basis: `${a.ballot.basis} ballots`,
    notes: [a.freshness_warning, ...a.history.notes.map(n => n.note), a.council.status === 'unavailable' ? a.council.reason : a.council.caveat].filter((s): s is string => !!s),
    sources: [{ title: `${year} result data`, url: a.results_url }, { title: 'IEC source', url: a.source.url }],
    provenance: { source: a.source, quality: a.quality, ballot: a.ballot, progress: a.progress, council: a.council } };
  if (request.view === 'summary') {
    return { columns: [], table: { ...meta, year, geography: 'none',
      status: a.council.status === 'estimated' ? 'estimated' : 'reported',
      columns: [{ id: 'ballots', label: 'Valid ballots', unit: 'number' }, { id: 'seats', label: 'Council seats', unit: 'seats' },
        { id: 'majority', label: 'Majority needed', unit: 'seats' }, { id: 'reporting', label: 'Voting districts reporting', unit: 'percent' }],
      rows: [{ id: 'summary', label: a.name, values: { ballots: a.ballot.denominator, seats: a.council.total ?? null,
        majority: a.council.majority ?? null, reporting: a.progress.voting_districts?.percent ?? null } }],
      notes: [...meta.notes, 'Valid ballots are not a count of unique voters. Reporting is not voter turnout.'] } };
  }
  if (a.party_page.next_offset !== null) throw new Error('The party table is incomplete.');
  return { columns: [], table: { ...meta, year, geography: 'none',
    status: a.council.status === 'estimated' ? 'estimated' : 'reported',
    columns: [{ id: 'share', label: 'Vote share', unit: 'percent' }, { id: 'votes', label: 'Votes', unit: 'number' },
      { id: 'seats', label: a.council.status === 'estimated' ? 'Estimated seats' : 'Reported seats', unit: 'seats' }],
    rows: a.parties.map(p => ({ id: p.party_id && p.party_id !== '0' && p.entry_type !== 'aggregate' && a.parties.filter(row => row.party_id === p.party_id).length === 1 ? p.party_id : `entry_${p.source_entry_id.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
      label: p.candidate_name ? `${p.party_name} · ${p.candidate_name}` : p.party_name, color: visualParty('p', p.party_name, 0).color,
      values: { share: p.share_percent, votes: p.votes, seats: p.council_allocation } })),
    notes: [...meta.notes, 'Shares use the full source denominator; unlisted votes are not redistributed.'] } };
}
