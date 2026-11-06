import type { Milestone, UpdateKind } from './milestones.ts';

export const updateTypes = [
  ['all', 'All updates'], ['wins', 'Ward wins'], ['councils', 'Council outcomes'],
  ['complete', 'Counts complete'], ['corrections', 'Corrections'],
] as const;
export type UpdateType = typeof updateTypes[number][0];
export type FeedOptions = { type: UpdateType; province: string; q: string; before: number | null;
  after: number | null; event: number | null; limit: number };
export type Update = {
  id: number; kind: UpdateKind; action: 'announced' | 'corrected' | 'withdrawn'; year: number;
  province_id: string; municipality_id: string; area_id: string; area_name: string; municipality_name: string;
  observed_at: string; published_at: string; reported_at: string; source_url: string;
  from_snapshot_id: string | null; to_snapshot_id: string; previous_event_id: number | null;
  superseded_by: number | null; before: Milestone | null; after: Milestone | null;
};
type UpdateRow = Omit<Update, 'before' | 'after'> & { before_json: string | null; after_json: string | null };

export function feedOptions(params: URLSearchParams): FeedOptions {
  const type = params.get('type') ?? 'all';
  if (!updateTypes.some(([value]) => value === type)) throw new Error('Unknown update type');
  const province = params.get('province') ?? '';
  if (province && !/^[1-9]$/.test(province)) throw new Error('Unknown province');
  const q = (params.get('q') ?? '').trim();
  if (q.length > 80) throw new Error('Search must be 80 characters or fewer');
  function integer(key: string, max = Number.MAX_SAFE_INTEGER) {
    const value = params.get(key);
    if (value === null) return null;
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) > max) throw new Error(`Invalid ${key}`);
    return Number(value);
  }
  const before = integer('before'), after = integer('after'), event = integer('event');
  if ([before, after, event].filter(v => v !== null).length > 1) throw new Error('Use only one of before, after or event');
  return { type: type as UpdateType, province, q, before, after, event, limit: integer('limit', 50) ?? 30 };
}

export function feedUrl(options: Partial<FeedOptions>, path = '/updates', simulationStep?: number) {
  const params = new URLSearchParams();
  if (simulationStep !== undefined) { params.set('demo', '1'); params.set('step', String(simulationStep)); }
  for (const key of ['type', 'province', 'q', 'before', 'after', 'event', 'limit'] as const) {
    const value = options[key];
    if (value != null && value !== '' && value !== 'all' && !(key === 'limit' && value === 30)) params.set(key, String(value));
  }
  return path + (params.size ? `?${params}` : '');
}

export async function getUpdates(db: D1Database, options: FeedOptions) {
  // Allow the page to ship before the additive migration and importer rollout.
  const schema = await db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name IN ('result_updates','result_update_state')").first<{ n: number }>();
  if (schema?.n !== 2) return { status: 'not_started' as const, updates: [] as Update[], next_before: null, latest_id: null, tracking_since: null };
  const where = ['e.year=2026'];
  const values: (string | number)[] = [];
  if (options.province) { where.push('e.province_id=?'); values.push(options.province); }
  if (options.type === 'corrections') where.push("e.action IN ('corrected','withdrawn')");
  else if (options.type !== 'all') {
    where.push('e.kind=?'); values.push({ wins: 'ward_won', councils: 'council_decided', complete: 'count_complete' }[options.type]);
  }
  // instr treats %, _ and quotes as literal input, not wildcard/SQL syntax.
  if (options.q) { where.push("instr(lower(e.municipality_name || ' ' || e.area_name),lower(?))>0"); values.push(options.q); }
  for (const [key, op] of [['before', '<'], ['after', '>'], ['event', '=']] as const) {
    if (options[key] !== null) { where.push(`e.id ${op} ?`); values.push(options[key]!); }
  }
  const [entries, state] = await db.batch([
    db.prepare(`SELECT e.*, (SELECT MIN(n.id) FROM result_updates n WHERE n.previous_event_id=e.id) AS superseded_by
      FROM result_updates e WHERE ${where.join(' AND ')} ORDER BY e.id DESC LIMIT ?`).bind(...values, options.limit + 1),
    db.prepare('SELECT MIN(started_at) AS tracking_since FROM result_update_state'),
  ]);
  const rows = entries!.results as unknown as UpdateRow[];
  const updates: Update[] = rows.slice(0, options.limit).map(row => {
    const { before_json, after_json, ...metadata } = row;
    return { ...metadata, before: before_json ? JSON.parse(before_json) : null, after: after_json ? JSON.parse(after_json) : null };
  });
  const trackingSince = (state!.results[0] as { tracking_since: string | null } | undefined)?.tracking_since ?? null;
  return { status: trackingSince ? 'tracking' as const : 'not_started' as const, updates,
    next_before: rows.length > options.limit ? updates.at(-1)!.id : null,
    latest_id: updates[0]?.id ?? null, tracking_since: trackingSince };
}
export type Feed = Awaited<ReturnType<typeof getUpdates>>;
