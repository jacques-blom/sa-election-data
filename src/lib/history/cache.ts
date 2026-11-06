export type HistoryPage = { html: string; live: boolean };
type Entry = HistoryPage & { expires: number };

/** Bounded, per-tab cache. In-flight reads are shared by prefetch and navigation. */
export class HistoryCache {
  private entries = new Map<string, Entry>();
  private pending = new Map<string, Promise<HistoryPage>>();
  private read: (url: string) => Promise<HistoryPage>;
  private now: () => number;
  private maxEntries: number;
  private maxBytes: number;
  constructor(read: (url: string) => Promise<HistoryPage>, now = Date.now,
    maxEntries = 12, maxBytes = 8_000_000) {
    this.read = read; this.now = now; this.maxEntries = maxEntries; this.maxBytes = maxBytes;
  }

  peek(url: string): HistoryPage | undefined {
    const entry = this.entries.get(url);
    if (!entry) return;
    if (entry.expires <= this.now()) { this.entries.delete(url); return; }
    this.entries.delete(url); this.entries.set(url, entry);
    return entry;
  }

  get(url: string): Promise<HistoryPage> {
    const cached = this.peek(url);
    if (cached) return Promise.resolve(cached);
    const pending = this.pending.get(url);
    if (pending) return pending;
    const request = this.read(url).then(page => {
      const entry = { ...page, expires: this.now() + (page.live ? 15_000 : 30 * 60_000) };
      this.entries.set(url, entry);
      while (this.entries.size > this.maxEntries || [...this.entries.values()].reduce((n, p) => n + p.html.length * 2, 0) > this.maxBytes) {
        this.entries.delete(this.entries.keys().next().value!);
      }
      return page;
    }).finally(() => { this.pending.delete(url); });
    this.pending.set(url, request);
    return request;
  }

  async warm(urls: string[]) {
    const queue = [...new Set(urls)];
    const worker = async () => {
      while (queue.length) { try { await this.get(queue.shift()!); } catch { /* A selected year can retry. */ } }
    };
    await Promise.all([worker(), worker()]);
  }
}
