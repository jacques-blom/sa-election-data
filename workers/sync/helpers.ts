import { createHash } from 'node:crypto';
import type { AreaRecord } from '../../src/lib/data/normalize.ts';
import { UpstreamError } from '../../src/lib/data/fetch.ts';

export const LIVE_YEAR = 2026;
export const RECHECK_MS = 10 * 60_000;
export const PENDING_TIMEOUT_MS = 60 * 60_000;
export const SOURCE_LIMIT = 24 * 1024 * 1024;
export const PARTY_DIRECTORY_URL = 'https://results.elections.org.za/dashboards/lge/MapsJason/2016/PartyList.js';

export function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

// Use only after JSON parsing/validation. Preserve every byte except valid
// ReportDate string values. Invalid dates, votes, names and all other fields
// change this hash and must pass the full normalizer before being accepted.
export function sourceContentHash(body: string) {
  return sha256(body.replace(/("ReportDate"\s*:\s*)"([^"\\]*)"/g,
    (match, key: string, value: string) => Number.isFinite(Date.parse(value)) ? `${key}""` : match));
}

export function recordHash({ reportedAt: _reportedAt, ...record }: AreaRecord) {
  const payload = { ...record.payload, parties: [...record.payload.parties].sort((a, b) =>
    a.source_entry_id.localeCompare(b.source_entry_id)) };
  return sha256(JSON.stringify({ ...record, payload }));
}

// Normalize one row at a time. Metro documents are too large to keep a second
// complete normalized copy in a 128 MiB Worker isolate.
export function fingerprint(records: Iterable<AreaRecord>) {
  const hashes = new Map<string, string>();
  for (const record of records) {
    const key = `${record.level}:${record.id}`;
    if (hashes.has(key)) throw new Error(`Duplicate area in source: ${key}`);
    hashes.set(key, recordHash(record));
  }
  if (!hashes.size) throw new Error('Source contains no area results');
  return { hash: sha256(JSON.stringify([...hashes].sort(([a], [b]) => a.localeCompare(b)))), count: hashes.size };
}

// The index is only a hint. Exclude report generation dates, and reconcile all
// detail sources independently even when this fingerprint does not change.
export function hintHash(value: unknown): string {
  return sha256(JSON.stringify(value, (key, entry) => key === 'ReportDate' ? undefined : entry));
}

export function retrySeconds(error: unknown, attempt: number) {
  const upstream = error instanceof UpstreamError ? error.retryAfterSeconds ?? 0 : 0;
  return Math.min(86_400, Math.max(upstream, Math.min(900, 30 * 2 ** Math.min(attempt, 5))));
}

export function parsePartyNames(body: string) {
  const data: unknown = JSON.parse(body);
  if (!Array.isArray(data) || !data.length) throw new Error('Invalid party directory');
  const names = new Map<string, string>();
  for (const item of data) {
    if (!item || !/^-?\d+$/.test(String(item.ID)) || typeof item.PartyFullName !== 'string') {
      throw new Error('Invalid party directory entry');
    }
    names.set(String(item.ID), item.PartyFullName);
  }
  return names;
}

export type RefreshJob = { municipalityId: string; token: string; hint: string | null; enqueuedAt: string };
export type RefreshBatch = { version: 1; jobs: RefreshJob[] };
export const JOBS_PER_MESSAGE = 8;

// Accept old individual jobs while the existing queue drains during rollout.
export function refreshJobs(value: unknown): RefreshJob[] | null {
  if (isRefreshJob(value)) return [value];
  const batch = value as Partial<RefreshBatch> | null;
  return batch?.version === 1 && Array.isArray(batch.jobs) && batch.jobs.length > 0
    && batch.jobs.length <= JOBS_PER_MESSAGE && batch.jobs.every(isRefreshJob) ? batch.jobs : null;
}

export function isRefreshJob(value: unknown): value is RefreshJob {
  if (!value || typeof value !== 'object') return false;
  const job = value as Partial<RefreshJob>;
  return typeof job.municipalityId === 'string' && /^\d+$/.test(job.municipalityId)
    && typeof job.token === 'string' && job.token.length > 0
    && (job.hint === null || typeof job.hint === 'string')
    && typeof job.enqueuedAt === 'string' && Number.isFinite(Date.parse(job.enqueuedAt));
}
