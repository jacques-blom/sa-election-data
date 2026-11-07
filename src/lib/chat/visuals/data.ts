import { z } from 'zod';
import { createDataReader, type McpBindings } from '../../mcp/data.ts';
import { readElectionHistory } from '../../history/data.ts';
import { historyChart } from '../../history/chart.ts';
import { visualParty, type VisualColumn, type VisualDataset } from './model.ts';
import { readExtraData } from './extra-data.ts';

export const visualDataRequest = z.strictObject({
  view: z.enum(['council', 'party_support', 'parties', 'areas', 'summary', 'government']),
  year: z.union([z.literal(2000), z.literal(2006), z.literal(2011), z.literal(2016), z.literal(2021), z.literal(2026)]),
  level: z.enum(['national', 'province', 'municipality', 'ward', 'voting-district']),
  area_id: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/),
  metric: z.enum(['seats', 'percent']),
  party_id: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/).optional(),
});
export type VisualDataRequest = z.infer<typeof visualDataRequest>;

export async function readVisualData(bindings: McpBindings, origin: string, request: VisualDataRequest): Promise<VisualDataset> {
  const { year, level, area_id: id, metric } = visualDataRequest.parse(request);
  if (request.view !== 'council' && request.view !== 'party_support') return readExtraData(bindings, origin, request);
  if (request.view === 'council') {
    if (level !== 'municipality' || metric !== 'seats') throw new Error('Council diagrams require a municipality and metric seats.');
    const summary = await createDataReader(bindings, origin).summary(year, level, id, 'source_total', 1000, 0);
    if (summary.council.status === 'unavailable') throw new Error(summary.council.reason);
    if (summary.party_page.next_offset !== null) throw new Error('The council allocation is too large to display completely.');
    const parties = summary.parties.filter(p => p.council_allocation !== null).map(p => visualParty(
      p.party_id && p.party_id !== '0' && p.entry_type !== 'aggregate' ? p.party_id : `entry_${p.source_entry_id.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
      p.party_name, p.council_allocation, !!p.party_id && p.party_id !== '0' && p.entry_type !== 'aggregate'));
    return { columns: [{ id: String(year), label: String(year), scope: summary.name, scopeId: `${level}:${id}`, year,
      unit: 'seats', total: summary.council.total!, status: summary.council.status,
      provisional: summary.result_status === 'provisional', basis: 'Council seats', parties,
      notes: [summary.council.caveat!, summary.freshness_warning, ...summary.history.notes.map(n => n.note)].filter((n): n is string => !!n),
      sources: [{ title: `${year} council data`, url: summary.results_url }, { title: 'IEC source', url: summary.source.url }],
      provenance: { source: summary.source, quality: summary.quality, progress: summary.progress, correction: summary.council.correction },
    }] };
  }
  const history = await readElectionHistory(bindings.RESULTS_DB, bindings.RAW_RESULTS, { level, id, through: year });
  if (!history.elections.length) throw new Error('No election history is available for this area.');
  // Reuse the website's treatment of gaps, grouped rows and reported allocations.
  const chart = historyChart({ ...history, defaultPartyIds: history.series.map(p => p.id) }, metric === 'seats' ? 'seats' : 'votes');
  const columns: VisualColumn[] = chart.columns.map(column => {
    const election = history.elections.find(e => e.year === column.year);
    return { id: String(column.year), label: String(column.year), year: column.year, scope: election?.name ?? history.latest!.name,
      scopeId: `${level}:${id}`, unit: metric, total: column.available ? metric === 'percent' ? 100 : column.total : null,
      status: column.available ? 'reported' : 'unavailable', provisional: election?.status === 'provisional',
      basis: metric === 'percent' ? history.ballotLabel : 'Council seats',
      parties: column.values.map(p => visualParty(p.id, p.name, p.value)),
      notes: [...history.caveats, ...(history.warning ? [history.warning] : []), ...(election?.notes.map(n => n.note) ?? []),
        ...(!column.available ? [`${metric === 'seats' ? 'Reported seats' : 'Comparable votes'} unavailable for this election.`] : [])],
      sources: [{ title: 'History data', url: `https://counted.co.za/api/v1/history/${level}/${id}?through=${year}` },
        ...(election ? [{ title: `IEC ${column.year}`, url: election.source.url }] : [])],
      provenance: election ? { source: election.source, quality: election.quality, reporting: election.reporting, correction: election.seats?.correction } : null,
    };
  });
  return { columns };
}
