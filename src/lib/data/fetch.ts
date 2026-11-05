import type { Source } from './catalogue.ts';

export type Validators = { etag?: string | null; lastModified?: string | null };
export type FetchResult =
  | { unchanged: true; checkedAt: string }
  | { unchanged: false; checkedAt: string; body: string; etag: string | null; lastModified: string | null };

export class UpstreamError extends Error {
  status: number;
  retryAfterSeconds: number | null;
  constructor(status: number, url: string, retryAfter: string | null) {
    super(`IEC returned HTTP ${status} for ${url}`);
    this.status = status;
    const seconds = retryAfter === null ? NaN : /^\d+$/.test(retryAfter)
      ? Number(retryAfter) : (Date.parse(retryAfter) - Date.now()) / 1000;
    this.retryAfterSeconds = Number.isFinite(seconds) ? Math.max(1, Math.ceil(seconds)) : null;
  }
}

export async function fetchDocument(source: Source, validators: Validators = {}, options: { maxBytes?: number } = {}): Promise<FetchResult> {
  // IEC publishes JSON in .js files with an application/javascript content type.
  const headers = new Headers({ Accept: 'application/json, text/javascript, application/javascript, */*;q=0.1', 'User-Agent': 'SAElectionData/0.1 (public-results-research)' });
  if (validators.etag) headers.set('If-None-Match', validators.etag);
  else if (validators.lastModified) headers.set('If-Modified-Since', validators.lastModified);
  const response = await fetch(source.url, { headers, signal: AbortSignal.timeout(30_000) });
  const checkedAt = new Date().toISOString();
  if (response.status === 304) return { unchanged: true, checkedAt };
  if (!response.ok) {
    await response.body?.cancel();
    throw new UpstreamError(response.status, source.url, response.headers.get('retry-after'));
  }
  const limit = options.maxBytes ?? 64 * 1024 * 1024;
  if (Number(response.headers.get('content-length')) > limit) {
    await response.body?.cancel();
    throw new Error(`Source exceeds the ${limit} byte document limit`);
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Empty source response');
  const decoder = new TextDecoder();
  const chunks: string[] = [];
  let bytes = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > limit) {
      await reader.cancel();
      throw new Error(`Source exceeds the ${limit} byte document limit`);
    }
    chunks.push(decoder.decode(value, { stream: true }));
  }
  chunks.push(decoder.decode());
  return { unchanged: false, checkedAt, body: chunks.join(''),
    etag: response.headers.get('etag'), lastModified: response.headers.get('last-modified') };
}
