import { ELECTIONS } from '../data/catalogue.ts';
import { governmentContext, governmentHistory, governmentMunicipalityIds, governmentSource } from '../governance/index.ts';
import { readElectionHistory } from '../history/data.ts';
import { latestYear, type VoteBasis } from '../history/comparison.ts';
import { attachPrevious } from '../history/results.ts';
import { electionMajorityBaseline } from '../history/seats.ts';
import { resultFromRow } from '../places/results.ts';
import { historicalResultNotes } from '../history/corrections.ts';
import type { AreaRecord, Level } from '../data/normalize.ts';
import { resultQuality } from '../data/quality.ts';
import { syncHealth } from '../data/sync-health.ts';
import { matchesIfNoneMatch } from '../data/http-cache.ts';
import { hydrateResults, joinedResults, resultColumns } from '../data/packed-results.ts';

const levels: Level[] = ['national', 'province', 'municipality', 'ward', 'voting-district'];
const joined = joinedResults;
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'If-None-Match', 'Access-Control-Expose-Headers': 'ETag' };
const caveats = [
  'Vote totals may combine multiple ballot types; they are not counts of individual voters.',
  'National and provincial party lists contain leading parties and may include an OTHER aggregate.',
  '100% reporting does not by itself establish an officially declared result.',
  'Area IDs and boundaries are specific to each election; matching IDs do not establish comparable boundaries.',
  'These dashboard feeds do not provide a complete separate district-council ballot dataset.',
];

type Row = {
  level: Level; area_id: string; province_id: string | null; municipality_id: string | null;
  ward_id: string | null; name: string; reported_at: string; payload: string;
  snapshot_id: string; url: string; last_checked_at: string; last_success_at: string;
  last_error: string | null; last_modified: string | null;
  sha256: string; fetched_at: string;
  latest_document_reported_at: string | null; latest_document_sha256: string | null; published_at: string | null;
  source_id: string; bundle_key: string | null;
};

function area(row: Row) {
  return { level: row.level, id: row.area_id, name: row.name, province_id: row.province_id,
    municipality_id: row.municipality_id, ward_id: row.ward_id };
}

function source(row: Row, live: boolean) {
  const successfulAge = Math.max(0, Date.now() - Date.parse(row.last_success_at));
  return { url: row.url, snapshot_id: row.snapshot_id, area_reported_at: row.reported_at,
    sha256: row.sha256, snapshot_fetched_at: row.fetched_at,
    http_last_modified: row.last_modified, last_checked_at: row.last_checked_at,
    latest_document_reported_at: row.latest_document_reported_at,
    latest_document_sha256: row.latest_document_sha256, published_at: row.published_at,
    last_successful_check_at: row.last_success_at, last_error: row.last_error,
    stale_after_seconds: live ? (row.level === 'national' || row.level === 'province' ? 180 : 900) : null,
    freshness: !live ? 'historical' : row.last_error ? 'refresh_failed'
      : !Number.isFinite(successfulAge) || successfulAge > (row.level === 'national' || row.level === 'province' ? 180_000 : 900_000) ? 'stale' : 'checked_recently' };
}

async function respond(request: Request, value: unknown, status = 200) {
  const body = JSON.stringify(value);
  const path = new URL(request.url).pathname;
  const historical = ELECTIONS.some(e => e.status === 'historical' && path.startsWith(`/api/v1/elections/${e.year}`));
  const ttl = historical ? 86400 : 15;
  const headers = new Headers({ ...cors, 'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': status === 200 ? `public, max-age=${ttl}, s-maxage=${ttl}` : 'no-store' });
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
  const etag = `"${Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('')}"`;
  headers.set('ETag', etag);
  if (status === 200 && matchesIfNoneMatch(request.headers.get('If-None-Match'), etag)) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(request.method === 'HEAD' ? null : body, { status, headers });
}

function pagination(url: URL) {
  const limit = url.searchParams.get('limit') ?? '50';
  const offset = url.searchParams.get('offset') ?? '0';
  if (!/^\d+$/.test(limit) || !/^\d+$/.test(offset) || Number(limit) < 1 || Number(limit) > 200 || !Number.isSafeInteger(Number(offset))) {
    throw new Error('limit must be 1–200 and offset a non-negative safe integer');
  }
  return { limit: Number(limit), offset: Number(offset) };
}

export async function resultsApi(request: Request, env: Pick<Env, 'RESULTS_DB' | 'RAW_RESULTS'>) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response(null, { status: 405, headers: { ...cors, Allow: 'GET, HEAD, OPTIONS' } });
  }
  const parts = url.pathname.slice('/api/v1'.length).split('/').filter(Boolean);
  try {
    const db = env.RESULTS_DB;
    if (parts[0] === 'governments') {
      if (parts.length === 2) {
        const history = governmentHistory(parts[1]!);
        return respond(request, history ?? { error: 'Municipality not found. Use a 2026 municipal ID, code or slug.' }, history ? 200 : 404);
      }
      if (parts.length !== 1) return respond(request, { error: 'Not found' }, 404);
      let page;
      try { page = pagination(url); } catch { return respond(request, { error: 'limit must be 1–200 and offset a non-negative safe integer' }, 400); }
      const ids = governmentMunicipalityIds;
      return respond(request, { source: governmentSource, ...page, total: ids.length,
        municipalities: ids.slice(page.offset, page.offset + page.limit).map(id => governmentContext(id)) });
    }
    if (parts[0] === 'history') {
      if (parts.length !== 3 || !levels.includes(parts[1] as Level)) return respond(request, { error: 'Use /api/v1/history/{level}/{area_id}' }, 404);
      const throughText = url.searchParams.get('through') ?? String(latestYear);
      const through = ELECTIONS.find(e => String(e.year) === throughText)?.year;
      const basis = url.searchParams.get('ballot') ?? (['ward','voting-district'].includes(parts[1]!) ? 'ward' : 'source_total');
      if (!through || !['pr','ward','source_total'].includes(basis)) return respond(request, { error: 'Use a supported election year and ballot=pr, ward or source_total.' }, 400);
      if (['national','province'].includes(parts[1]!) && basis !== 'source_total') return respond(request, { error: 'Summary history supports source_total only.' }, 400);
      const history = await readElectionHistory(db, env.RAW_RESULTS, { level:parts[1] as Level,id:parts[2]!,through,basis:basis as VoteBasis });
      if (!history.elections.length) return respond(request, { error: history.warning ?? 'No imported history for this area.' }, history.warning ? 503 : 404);
      return respond(request, history);
    }
    if (!parts.length) {
      const health = await syncHealth(db);
      return respond(request, { version: 'v1', documentation: '/api.md', documentation_html: '/api', elections: '/api/v1/elections',
        sync: '/api/v1/sync', governments: '/api/v1/governments', history: '/api/v1/history/{level}/{area_id}?through=2026', refresh_mode: health.refresh_mode, sync_status: health.status, caveats });
    }
    if (parts[0] === 'sync' && parts.length === 1) return respond(request, await syncHealth(db));
    if (parts[0] !== 'elections') return respond(request, { error: 'Not found' }, 404);
    if (parts.length === 1) {
      const result = await db.prepare(`SELECT e.year, e.iec_event_id, e.status,
        COUNT(d.id) AS source_documents, SUM(d.active_snapshot_id IS NOT NULL) AS loaded_sources,
        SUM(d.last_error IS NOT NULL) AS failed_sources, MAX(d.last_success_at) AS most_recent_successful_check,
        MIN(d.last_success_at) AS oldest_successful_check
        FROM elections e LEFT JOIN source_documents d ON e.year = d.year GROUP BY e.year ORDER BY e.year DESC`).all();
      const health = await syncHealth(db);
      return respond(request, { elections: result.results, refresh_mode: health.refresh_mode, sync_status: health.status, sync: '/api/v1/sync' });
    }
    const election = ELECTIONS.find((entry) => String(entry.year) === parts[1]);
    if (!election) return respond(request, { error: 'Unknown election year' }, 404);
    const year = election.year;
    if (parts.length === 2) {
      const coverage = await db.prepare(`SELECT r.level, COUNT(*) AS areas ${joined} WHERE r.year = ? GROUP BY r.level`).bind(year).all();
      const errors = await db.prepare('SELECT COUNT(*) AS count FROM source_documents WHERE year = ? AND last_error IS NOT NULL').bind(year).first<{ count: number }>();
      const nationalRow = await db.prepare(`SELECT ${resultColumns} ${joined} WHERE r.year = ? AND r.level = 'national'`).bind(year).first<Row>();
      const national = nationalRow ? (await hydrateResults(db, env.RAW_RESULTS, [nationalRow]))[0] : null;
      const expected = national ? (JSON.parse(national.payload) as AreaRecord['payload']).progress : null;
      return respond(request, { election, coverage: coverage.results, failed_sources: errors?.count ?? 0,
        expected_by_iec_summary: expected,
        areas: `/api/v1/elections/${year}/areas`, sources: `/api/v1/elections/${year}/sources`, caveats });
    }
    if (parts[2] === 'sources' && parts.length === 3) {
      let page;
      try { page = pagination(url); } catch (error) { return respond(request, { error: String(error) }, 400); }
      const sources = await db.prepare(`SELECT id, kind, area_id, url, active_snapshot_id,
        last_checked_at, last_success_at, last_error FROM source_documents WHERE year = ? ORDER BY id LIMIT ? OFFSET ?`)
        .bind(year, page.limit, page.offset).all();
      const total = await db.prepare('SELECT COUNT(*) AS count FROM source_documents WHERE year = ?').bind(year).first<{ count: number }>();
      return respond(request, { year, ...page, total: total?.count ?? 0, sources: sources.results });
    }
    if (parts[2] !== 'areas') return respond(request, { error: 'Not found' }, 404);
    if (parts.length === 3) {
      const level = url.searchParams.get('level') ?? 'municipality';
      if (!levels.includes(level as Level)) return respond(request, { error: 'Invalid area level', levels }, 400);
      let page;
      try { page = pagination(url); } catch (error) { return respond(request, { error: String(error) }, 400); }
      const filters = ['r.year = ?', 'r.level = ?'];
      const bindings: (number | string)[] = [year, level];
      const query = (url.searchParams.get('q') ?? '').trim();
      if (query.length > 80) return respond(request, { error: 'q must be 80 characters or fewer' }, 400);
      if (query) {
        filters.push('instr(lower(r.name), lower(?)) > 0');
        bindings.push(query);
      }
      for (const field of ['province_id', 'municipality_id', 'ward_id'] as const) {
        const value = url.searchParams.get(field);
        if (value === null) continue;
        if (!/^\d+$/.test(value)) return respond(request, { error: `Invalid ${field}` }, 400);
        filters.push(`r.${field} = ?`);
        bindings.push(value);
      }
      const where = `WHERE ${filters.join(' AND ')}`;
      const result = await db.prepare(`SELECT r.level, r.area_id, r.province_id, r.municipality_id,
        r.ward_id, r.name ${joined} ${where} ORDER BY r.area_id LIMIT ? OFFSET ?`)
        .bind(...bindings, page.limit, page.offset).all<Row>();
      const total = await db.prepare(`SELECT COUNT(*) AS count ${joined} ${where}`).bind(...bindings).first<{ count: number }>();
      return respond(request, { year, level, ...page, total: total?.count ?? 0,
        areas: result.results.map((row) => ({ ...area(row), results_url: `/api/v1/elections/${year}/areas/${row.level}/${row.area_id}` })) });
    }
    if (parts.length === 5 && levels.includes(parts[3] as Level)) {
      let row = await db.prepare(`SELECT ${resultColumns}, s.sha256, s.fetched_at,
        t.last_reported_at AS latest_document_reported_at,t.last_sha256 AS latest_document_sha256,t.last_published_at AS published_at
        ${joined} JOIN snapshots s ON s.id = d.active_snapshot_id LEFT JOIN sync_state t ON t.source_id=d.id
        WHERE r.year = ? AND r.level = ? AND r.area_id = ?`).bind(year, parts[3]!, parts[4]!).first<Row>();
      if (!row) return respond(request, { error: 'No imported result for this area', year }, 404);
      row = (await hydrateResults(db, env.RAW_RESULTS, [row]))[0]!;
      const results = JSON.parse(row.payload) as AreaRecord['payload'];
      const provenance = { ...source(row, election.status === 'provisional'),
        ...(results.parties.some((party) => party.party_name_source === 'iec_party_directory') ? {
          party_directory_url: 'https://results.elections.org.za/dashboards/lge/MapsJason/2016/PartyList.js',
        } : {}),
      };
      const [withHistory] = year === latestYear && row.level === 'municipality'
        ? await attachPrevious(db, [resultFromRow({...row,year})], env.RAW_RESULTS) : [];
      const government = governmentContext(row.level === 'municipality' ? row.area_id : row.municipality_id ?? '', year, electionMajorityBaseline(withHistory?.previous));
      return respond(request, { election, area: area(row), source: provenance, results, government,
        historical_notes: historicalResultNotes(resultFromRow({...row,year})), quality: resultQuality(results), caveats });
    }
    return respond(request, { error: 'Not found' }, 404);
  } catch (error) {
    console.error('Results API query failed', error);
    return respond(request, { error: 'Results data is temporarily unavailable.' }, 503);
  }
}
