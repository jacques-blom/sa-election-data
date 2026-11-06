import { SaxesParser } from 'saxes';

export interface NewsArticle { title: string; url: string; source: string; publishedAt: string | null }
export interface NewsData { articles: NewsArticle[]; fetchedAt: string; stale: boolean }
const MAX_BYTES = 1_048_576;

function articleUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function parseNewsFeed(xml: string): NewsArticle[] {
  if (new TextEncoder().encode(xml).length > MAX_BYTES) throw new Error('News feed too large');
  const parser = new SaxesParser({ xmlns: false });
  const stack: string[] = [], articles: NewsArticle[] = [];
  const seen = new Set<string>();
  let channel = false;
  let item: Record<string, string> | null = null;
  parser.on('doctype', () => { throw new Error('Unexpected RSS doctype'); });
  parser.on('opentag', tag => {
    stack.push(tag.name);
    if (stack.length > 32) throw new Error('News feed too deeply nested');
    if (stack.join('/') === 'rss/channel') channel = true;
    if (stack.join('/') === 'rss/channel/item') item = {};
  });
  const text = (value: string) => {
    if (item && stack.length === 4) {
      const field = stack[3]!;
      if (['title', 'link', 'source', 'pubDate'].includes(field)) item[field] = (item[field] ?? '') + value;
    }
  };
  parser.on('text', text);
  parser.on('cdata', text);
  parser.on('closetag', () => {
    if (stack.join('/') === 'rss/channel/item' && item) {
      let title = item.title?.trim() ?? '';
      const url = articleUrl(item.link?.trim() ?? '');
      const source = item.source?.trim() ?? '';
      const suffix = ` - ${source}`;
      if (source && title.endsWith(suffix)) title = title.slice(0, -suffix.length);
      const date = Date.parse(item.pubDate ?? '');
      // No relevance, publisher, date or ranking filters. Only discard unusable/duplicate links.
      if (title && url && !seen.has(url)) {
        articles.push({ title, url, source, publishedAt: Number.isFinite(date) ? new Date(date).toISOString() : null });
        seen.add(url);
      }
      item = null;
    }
    stack.pop();
  });
  parser.write(xml).close();
  if (!channel) throw new Error('Expected an RSS channel');
  return articles;
}

export async function fetchNewsFeed(url: string, fetcher: typeof fetch = fetch): Promise<NewsArticle[]> {
  const response = await fetcher(url, {
    headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
    signal: AbortSignal.timeout(8_000),
    redirect: 'manual',
  });
  if (!response.ok || !response.body) throw new Error(`News feed unavailable (HTTP ${response.status})`);
  const reader = response.body.getReader(), decoder = new TextDecoder();
  let bytes = 0, xml = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) throw new Error('News feed too large');
      xml += decoder.decode(value, { stream: true });
    }
    xml += decoder.decode();
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  return parseNewsFeed(xml);
}
