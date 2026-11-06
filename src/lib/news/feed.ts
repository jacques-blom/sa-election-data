export interface NewsArticle { title: string; url: string; source: string; publishedAt: string | null }
export interface NewsData { articles: NewsArticle[]; fetchedAt: string; stale: boolean }
const MAX_BYTES = 1_048_576;

export class NewsProviderError extends Error {
  readonly retryMs: number;
  constructor(message: string, retryMs = 5 * 60_000) { super(message); this.retryMs = retryMs; }
}

function articleUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

/** Retain Google's order, including highlighted articles and grouped stories. */
export function parseNewsFeed(value: unknown): NewsArticle[] {
  const payload = object(value);
  if (!payload) throw new NewsProviderError('Invalid news response');
  const status = object(payload.search_metadata)?.status;
  // SerpAPI represents a valid search with no matches using this specific error.
  if (status === 'Success' && payload.error === "Google News hasn't returned any results for this query.") return [];
  if (payload.error || (status !== undefined && status !== 'Success') || !Array.isArray(payload.news_results)) {
    // Never log provider messages or metadata: they can contain the API key.
    throw new NewsProviderError('News provider returned an invalid or unsuccessful search');
  }
  const articles: NewsArticle[] = [];
  const seen = new Set<string>();
  const add = (value: unknown) => {
    const item = object(value);
    if (!item || typeof item.title !== 'string' || typeof item.link !== 'string') return;
    const title = item.title.trim(), url = articleUrl(item.link);
    if (!title || !url || seen.has(url)) return;
    const source = object(item.source)?.name;
    const date = typeof item.iso_date === 'string' ? Date.parse(item.iso_date) : NaN;
    articles.push({ title, url, source: typeof source === 'string' ? source : '',
      publishedAt: Number.isFinite(date) ? new Date(date).toISOString() : null });
    seen.add(url);
  };
  for (const value of payload.news_results) {
    const row = object(value);
    if (!row) continue;
    add(row.highlight);
    add(row);
    if (Array.isArray(row.stories)) row.stories.forEach(add);
  }
  return articles;
}

export async function fetchNewsFeed(query: string, apiKey: string | undefined, fetcher: typeof fetch = fetch): Promise<NewsArticle[]> {
  if (!apiKey?.trim()) throw new NewsProviderError('News provider is not configured');
  const params = new URLSearchParams({ engine: 'google_news', q: query, gl: 'za', hl: 'en', api_key: apiKey.trim() });
  // Keep parameters stable and no_cache unset: SerpAPI's one-hour cache is free.
  try {
    const response = await fetcher(`https://serpapi.com/search.json?${params}`, {
      headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15_000), redirect: 'manual',
    });
    if (!response.ok || !response.body) {
      await response.body?.cancel().catch(() => {});
      throw new NewsProviderError(`News provider unavailable (HTTP ${response.status})`,
        [401, 403, 429].includes(response.status) ? 60 * 60_000 : undefined);
    }
    const reader = response.body.getReader(), decoder = new TextDecoder();
    let bytes = 0, json = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_BYTES) throw new NewsProviderError('News response too large');
        json += decoder.decode(value, { stream: true });
      }
      json += decoder.decode();
    } finally {
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    }
    return parseNewsFeed(JSON.parse(json));
  } catch (error) {
    if (error instanceof NewsProviderError) throw error;
    // Network and JSON errors may echo the authenticated URL or response body.
    throw new NewsProviderError('News provider request failed');
  }
}
