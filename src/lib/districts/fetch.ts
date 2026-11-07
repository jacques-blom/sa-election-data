import { UpstreamError, type Validators } from '../data/fetch.ts';
import { DISTRICT_MAX_BYTES } from './parse.ts';

export async function fetchDistrictReport(url: string, validators: Validators = {}) {
  const headers = new Headers({ Accept: 'application/vnd.ms-excel', 'User-Agent': 'SAElectionData/0.1 (public-results-research)' });
  if (validators.etag) headers.set('If-None-Match', validators.etag);
  else if (validators.lastModified) headers.set('If-Modified-Since', validators.lastModified);
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(30_000) });
  const checkedAt = new Date().toISOString();
  if (response.status === 304) return { unchanged: true as const, checkedAt };
  if (!response.ok) { await response.body?.cancel(); throw new UpstreamError(response.status, url, response.headers.get('retry-after')); }
  if (Number(response.headers.get('content-length')) > DISTRICT_MAX_BYTES) { await response.body?.cancel(); throw new Error('District report exceeds size limit'); }
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Empty district report');
  const chunks: Uint8Array[] = []; let length = 0;
  while (true) {
    const {done,value} = await reader.read(); if (done) break;
    length += value.byteLength;
    if (length > DISTRICT_MAX_BYTES) { await reader.cancel(); throw new Error('District report exceeds size limit'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk,offset); offset += chunk.byteLength; }
  return { unchanged: false as const, bytes, checkedAt, etag: response.headers.get('etag'), lastModified: response.headers.get('last-modified') };
}
