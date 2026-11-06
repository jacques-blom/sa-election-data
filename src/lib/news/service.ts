import type { NewsContext } from './context.ts';
import { fetchNewsFeed, NewsProviderError, type NewsData } from './feed.ts';
import type { NewsStore, StoredNews } from './store.ts';

export const NEWS_FRESH_MS = 60 * 60_000;
const MAX_STALE_MS = 24 * 60 * 60_000;
const REFRESH_LEASE_MS = 20_000;
interface NewsCache {
  match(key: Request): Promise<Response | undefined>;
  put(key: Request, value: Response): Promise<unknown>;
}

export async function newsResponse(context: NewsContext, origin: string, options: {
  apiKey?: string; cache?: NewsCache; store?: NewsStore; fetcher?: typeof fetch;
  now?: number; waitUntil?: (promise: Promise<unknown>) => void;
} = {}): Promise<Response> {
  const now = options.now ?? Date.now();
  const key = new Request(new URL(`/api/news/serpapi-v1/${context.key}`, origin));
  let stored: StoredNews | undefined;
  let version: string | null = null;
  const age = (data: NewsData) => now - Date.parse(data.fetchedAt);
  const usable = (entry?: StoredNews) => entry?.data && age(entry.data) >= 0 && age(entry.data) < MAX_STALE_MS ? entry.data : null;
  const fresh = (entry?: StoredNews) => { const data = usable(entry); return data && age(data) < NEWS_FRESH_MS ? data : null; };
  const reply = (data?: NewsData | null, retry = 300) => data
    ? Response.json(data, { headers: { 'Cache-Control': `public, max-age=${data.stale ? 60 : Math.max(0, Math.floor((NEWS_FRESH_MS - age(data)) / 1000))}` } })
    : Response.json({ error: 'News is temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': String(retry) } });
  const waiting = (entry?: StoredNews) => {
    const data = usable(entry);
    return fresh(entry) ? reply(data) : reply(data ? { ...data, stale: true } : null,
      entry?.refreshUntil && entry.refreshUntil > now ? 2 : Math.max(1, Math.ceil(((entry?.retryAt ?? now + 300_000) - now) / 1000)));
  };
  try {
    const cached = await options.cache?.match(key);
    if (cached) stored = await cached.json() as StoredNews;
  } catch { /* R2 remains authoritative if the edge cache is unavailable. */ }
  if (fresh(stored)) return reply(stored!.data);

  if (options.store) {
    try {
      const shared = await options.store.read(context.key);
      if (shared) { stored = shared.entry; version = shared.version; }
    } catch {
      // Do not spend credits when shared caching/coordination is unavailable.
      return waiting(stored);
    }
  }
  const saveEdge = async (entry: StoredNews) => {
    const ttl = entry.data ? Math.max(1, Math.floor((MAX_STALE_MS - age(entry.data)) / 1000)) : Math.max(1, Math.ceil(((entry.retryAt ?? now + 300_000) - now) / 1000));
    const write = options.cache?.put(key, Response.json(entry, { headers: { 'Cache-Control': `public, max-age=${ttl}` } })).catch(() => {});
    if (write) {
      if (options.waitUntil) options.waitUntil(write);
      else await write;
    }
  };
  if (fresh(stored)) { await saveEdge(stored!); return reply(stored!.data); }
  if ((stored?.retryAt ?? 0) > now || (stored?.refreshUntil ?? 0) > now) return waiting(stored);
  const existing = usable(stored);

  if (options.store) {
    try {
      const lease = await options.store.write(context.key, { data: existing, refreshUntil: now + REFRESH_LEASE_MS }, version);
      if (!lease) return waiting((await options.store.read(context.key))?.entry);
      version = lease;
    } catch { return waiting(stored); }
  }

  let entry: StoredNews;
  try {
    const articles = await fetchNewsFeed(context.query, options.apiKey, options.fetcher);
    entry = { data: { articles, fetchedAt: new Date(now).toISOString(), stale: false } };
  } catch (error) {
    console.warn('News feed unavailable', context.key, error instanceof NewsProviderError ? error.message : 'Unknown provider failure');
    entry = { data: existing, retryAt: now + (error instanceof NewsProviderError ? error.retryMs : 300_000) };
  }
  try { await options.store?.write(context.key, entry, version); }
  catch { console.warn('News shared cache write failed', context.key); }
  await saveEdge(entry);
  return entry.retryAt ? waiting(entry) : reply(entry.data);
}
