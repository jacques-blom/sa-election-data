import { z } from 'zod';
import { safeLink, userSummary, type WebResearch } from './contracts.ts';
import { sourceSite } from './source-sites.ts';

// Reading is limited to known public publishers, never arbitrary model-selected hosts.
const domains = ['businessday.co.za', 'businesslive.co.za', 'dailymaverick.co.za', 'timeslive.co.za',
  'sowetan.co.za', 'sowetanlive.co.za', 'news24.com', 'mg.co.za', 'moneyweb.co.za', 'citizen.co.za',
  'iol.co.za', 'ewn.co.za', 'sabcnews.com', 'enca.com', 'reuters.com', 'apnews.com', 'bbc.com',
  'bbc.co.uk', 'elections.org.za', 'gov.za'];

export function newsUrl(value: string): string | null {
  const safe = safeLink(value);
  if (!safe || !value.startsWith('https://')) return null;
  const url = new URL(safe);
  if (url.port || !domains.some(host => url.hostname === host || url.hostname === `www.${host}`)) return null;
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) if (/^(utm_|dm_)/.test(key)) url.searchParams.delete(key);
  return url.href;
}

function decode(text: string): string {
  const named: Record<string, string> = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ',
    rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—' };
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, key: string) => {
    if (!key.startsWith('#')) return named[key.toLowerCase()] ?? entity;
    const code = key[1]?.toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : Number(key.slice(1));
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ' ';
  });
}

/** Prefer the publisher's article body; never execute scripts or treat metadata as instructions. */
export function articleText(html: string): string {
  const bodies: string[] = [];
  const visit = (value: unknown, depth = 0) => {
    if (depth > 15 || !value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.slice(0, 100).forEach(item => visit(item, depth + 1)); return; }
    const item = value as Record<string, unknown>;
    if (typeof item.articleBody === 'string') bodies.push(item.articleBody);
    for (const [key, child] of Object.entries(item)) if (key !== 'articleBody') visit(child, depth + 1);
  };
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi)) {
    try { visit(JSON.parse(match[1]!)); } catch { /* Invalid publisher metadata is not evidence. */ }
  }
  let body = bodies.sort((a, b) => b.length - a.length)[0];
  if (!body) {
    const clean = html.replace(/<(script|style|nav|footer|header|aside)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ');
    body = clean.match(/<article\b[^>]*>([\s\S]*?)<\/article\s*>/i)?.[1]
      ?? clean.match(/<main\b[^>]*>([\s\S]*?)<\/main\s*>/i)?.[1] ?? clean;
  }
  return decode(body.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim().slice(0, 16_000);
}

export async function readNewsArticle(url: string, signal: AbortSignal, request: typeof fetch = fetch): Promise<string> {
  let current = newsUrl(url);
  const bounded = AbortSignal.any([signal, AbortSignal.timeout(10_000)]);
  for (let redirects = 0; current && redirects <= 3; redirects++) {
    const response = await request(current, { signal: bounded, redirect: 'manual',
      headers: { Accept: 'text/html', 'User-Agent': 'Counted/1.0 (+https://counted.co.za)' } });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      await response.body?.cancel();
      current = location ? newsUrl(new URL(location, current).href) : null;
      continue;
    }
    if (!response.ok || !response.headers.get('content-type')?.includes('text/html') || !response.body) {
      await response.body?.cancel(); throw new Error('Article could not be read.');
    }
    const reader = response.body.getReader(), decoder = new TextDecoder();
    let bytes = 0, html = '';
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if ((bytes += value.byteLength) > 1_500_000) throw new Error('Article exceeds the read limit.');
        html += decoder.decode(value, { stream: true });
      }
    } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
    const text = articleText(html + decoder.decode());
    if (text.length < 250) throw new Error('Article text is unavailable.');
    return text;
  }
  throw new Error('Article host or redirect is not supported.');
}

const normalise = (text: string) => text.normalize('NFKC').replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
  .replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
const words = (text: string) => text.trim().split(/\s+/).length;

export const readNewsInput = z.strictObject({ summary_for_user: userSummary,
  urls: z.array(z.url().max(4096)).min(1).max(3) });
export const groundedAnswerInput = z.strictObject({ summary_for_user: userSummary,
  paragraphs: z.array(z.strictObject({ kind: z.enum(['data', 'analysis', 'limitation', 'news']),
    text: z.string().min(1).max(1600),
    sources: z.array(z.strictObject({ source_id: z.string().max(30), quote: z.string().min(15).max(350) })).max(3),
  })).min(1).max(10) });

type Article = { id: string; url: string; title: string; text: string };

/** Per-turn evidence: only fetched article text can back a citation. */
export class NewsEvidence {
  private discovered = new Map<string, string>();
  private articles = new Map<string, Article>();
  private pending = new Map<string, Promise<Article>>();
  private searched = false;

  noteSearch() { this.searched = true; }

  discover(url: string, title = '') {
    const safe = newsUrl(url);
    if (safe && this.discovered.size < 80) this.discovered.set(safe, title.slice(0, 300));
  }

  async read(url: string, signal: AbortSignal, request?: typeof fetch) {
    const safe = newsUrl(url);
    // OpenRouter currently omits the full native source list. After a confirmed
    // search, a model-supplied publisher URL must still pass an actual bounded read.
    // It is not treated as provider-verified provenance merely because it was supplied.
    if (!safe || (!this.discovered.has(safe) && !this.searched)) throw new Error('Read a URL returned by this turn’s native search.');
    const existing = this.pending.get(safe);
    if (existing) return existing;
    if (this.pending.size >= 3) throw new Error('Three article reads allowed per answer. Use the available evidence.');
    const id = `news_${this.pending.size + 1}`;
    const pending = readNewsArticle(safe, signal, request).then(text => {
      const article = { id, url: safe, title: this.discovered.get(safe) || sourceSite(safe)!.name, text };
      this.articles.set(id, article);
      return article;
    });
    this.pending.set(safe, pending);
    return pending;
  }

  answer(input: z.infer<typeof groundedAnswerInput>): WebResearch {
    const result: WebResearch = { text: '', citations: [], fetchedAt: new Date().toISOString(), evidence: [] };
    const quotes = new Map<string, Set<string>>();
    for (const paragraph of input.paragraphs) {
      // Links are assembled from the evidence registry, never a model-invented URL.
      if (/https?:\/\/|\]\(||<[^>]+>/.test(paragraph.text)) throw new Error('Use source IDs, not links, HTML or citation markers in paragraph text.');
      if (paragraph.kind === 'news' && !paragraph.sources.length) throw new Error('Every news claim needs a read source and supporting quote. Otherwise omit it or describe the evidence gap.');
      const start = result.text.length;
      result.text += paragraph.text;
      const cited = new Set<string>();
      for (const reference of paragraph.sources) {
        const article = this.articles.get(reference.source_id);
        if (!article) throw new Error('Read the article before citing its source ID.');
        const quote = normalise(reference.quote);
        if (!normalise(article.text).includes(quote)) throw new Error(`The supporting quote is absent from ${reference.source_id}. Correct the claim/source or omit it.`);
        const used = quotes.get(article.url) ?? new Set<string>();
        used.add(quote); quotes.set(article.url, used);
        if ([...used].reduce((n, item) => n + words(item), 0) > 25) throw new Error('Use at most 25 words of supporting quotations per article in total.');
        result.evidence!.push({ sourceId: article.id, url: article.url, quote: reference.quote, claim: paragraph.text });
        if (cited.has(article.url)) continue;
        cited.add(article.url);
        const label = sourceSite(article.url)!.name;
        const href = article.url.replaceAll('(', '%28').replaceAll(')', '%29');
        result.text += ` [${label}](${href})`;
        result.citations.push({ url: article.url, title: article.title, start, end: result.text.length });
      }
      result.text += '\n\n';
    }
    result.text = result.text.trim();
    return result;
  }
}
