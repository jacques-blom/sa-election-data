import type { District } from '../maps/districts.ts';

export const DISTRICT_POLL_MS = 5 * 60_000;
export const DISTRICT_STALE_MS = 15 * 60_000;
const provinceCodes: Record<string, string> = { '1':'EC', '2':'FS', '3':'GP', '4':'KN', '5':'MP', '6':'NC', '7':'NP', '8':'NW', '9':'WP' };
export function districtSourceUrl(district: District) {
  const province = provinceCodes[district.provinceId];
  if (!province || !/^DC\d+$/.test(district.id)) throw new Error('Unknown district source');
  return `https://results.elections.org.za/home/LGEPublicReports/1887/Detailed%20Results/${province}/${district.id}.xls`;
}
export type DistrictParty = { name: string; abbreviation: string | null; votes: number; share: number | null };
export type DistrictResult = {
  version: 1; year: 2026; districtId: string; ballot: 'district'; reportedAt: string;
  validVotes: number; spoiltVotes: number; parties: DistrictParty[];
};
export type DistrictRow = {
  id: string; source_url: string; payload: string | null; reported_at: string | null;
  checked_at: string | null; successful_at: string | null; published_at: string | null;
  etag: string | null; last_modified: string | null; raw_hash: string | null; content_hash: string | null;
  raw_key: string | null; previous_raw_key: string | null; last_error: string | null;
  pending_token: string | null; pending_since: string | null; retry_after: string | null; failures: number;
};
export type DistrictView = { result: DistrictResult; sourceUrl: string; checkedAt: string | null; lastError: string | null; stale: boolean };
export function districtView(row: DistrictRow, now = Date.now()): DistrictView | null {
  if (!row.payload) return null;
  const result = JSON.parse(row.payload) as DistrictResult;
  if (result.version !== 1 || result.year !== 2026 || result.districtId !== row.id || result.ballot !== 'district') throw new Error('Invalid stored district result');
  return { result, sourceUrl: row.source_url, checkedAt: row.successful_at, lastError: row.last_error,
    stale: !!row.last_error || !row.successful_at || now - Date.parse(row.successful_at) > DISTRICT_STALE_MS };
}
export async function getDistrictResults(db: D1Database): Promise<Map<string, DistrictView>> {
  try {
    const rows = await db.prepare('SELECT * FROM district_results WHERE payload IS NOT NULL').all<DistrictRow>();
    return new Map(rows.results.flatMap(row => { const view = districtView(row); return view ? [[row.id, view] as const] : []; }));
  } catch (error) {
    // Allow the UI to roll out before the additive data migration.
    if (/no such table: (?:main\.)?district_results/i.test(String(error))) return new Map();
    throw error;
  }
}
export async function getDistrictResult(db: D1Database, id: string): Promise<DistrictView | null> {
  try {
    const row = await db.prepare('SELECT * FROM district_results WHERE id=?').bind(id).first<DistrictRow>();
    return row ? districtView(row) : null;
  } catch (error) {
    if (/no such table: (?:main\.)?district_results/i.test(String(error))) return null;
    throw error;
  }
}
