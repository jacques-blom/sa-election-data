import type { NewsContext } from './context.ts';
import { fetchNewsFeed, type NewsData } from './feed.ts';

export const NEWS_FRESH_MS = 30 * 60_000;
const MAX_STALE_MS = 24 * 60 * 60_000;
interface StoredNews { data: NewsData | null; retryAt?: number }
interface NewsCache {
  match(key: Request): Promise<Response | undefined>;
  put(key: Request, value: Response): Promise<unknown>;
}

export async function newsResponse(context: NewsContext, origin: string, options: {
  cache?: NewsCache; fetcher?: typeof fetch; now?: number; waitUntil?: (promise: Promise<unknown>) => void;
} = {}): Promise<Response> {
  const now = options.now ?? Date.now();
  const key = new Request(new URL(`/api/news/cache-v1/${context.key}`, origin));
  let stored: StoredNews | undefined;
  try {
    const cached = await options.cache?.match(key);
    if (cached) stored = await cached.json() as StoredNews;
  } catch { /* News remains available if the edge cache is unavailable. */ }
  const age = stored?.data ? now - Date.parse(stored.data.fetchedAt) : Infinity;
  const existing = age >= 0 && age < MAX_STALE_MS ? stored?.data : null;
  const reply = (data?: NewsData | null) => data
    ? Response.json(data, { headers: { 'Cache-Control': `public, max-age=${data.stale ? 60 : Math.max(0, Math.floor((NEWS_FRESH_MS - (now - Date.parse(data.fetchedAt))) / 1000))}` } })
    : Response.json({ error: 'News is temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' } });
  if (existing && age < NEWS_FRESH_MS) return reply(existing);
  if (stored?.retryAt && now < stored.retryAt) return reply(existing ? { ...existing, stale: true } : null);
  const save = async (entry: StoredNews) => {
    const ttl = entry.data ? Math.max(1, Math.floor((MAX_STALE_MS - (now - Date.parse(entry.data.fetchedAt))) / 1000)) : 60;
    const write = options.cache?.put(key, Response.json(entry, { headers: { 'Cache-Control': `public, max-age=${ttl}` } })).catch(() => {});
    if (write) {
      if (options.waitUntil) options.waitUntil(write);
      else await write;
    }
  };
  try {
    const articles = await fetchNewsFeed(context.feedUrl, options.fetcher);
    const data: NewsData = { articles, fetchedAt: new Date(now).toISOString(), stale: false };
    await save({ data });
    return reply(data);
  } catch (error) {
    console.warn('Google News feed unavailable', context.key, error instanceof Error ? error.message : 'Unknown error');
    await save({ data: existing ?? null, retryAt: now + 60_000 });
    return reply(existing ? { ...existing, stale: true } : null);
  }
}
