import type { NewsData } from './feed.ts';

export interface StoredNews { data: NewsData | null; retryAt?: number; refreshUntil?: number }
export interface NewsStore {
  read(key: string): Promise<{ entry: StoredNews; version: string } | null>;
  write(key: string, entry: StoredNews, version: string | null): Promise<string | null>;
}

/** A shared cache and short refresh lease, isolated from election result objects. */
export function newsStore(bucket: Pick<R2Bucket, 'get' | 'put'>): NewsStore {
  const path = (key: string) => `news/serpapi-v1/${key}.json`;
  return {
    async read(key) {
      const object = await bucket.get(path(key));
      if (!object) return null;
      if (object.size > 1_048_576) throw new Error('Invalid news cache size');
      return { entry: await object.json<StoredNews>(), version: object.httpEtag };
    },
    async write(key, entry, version) {
      const object = await bucket.put(path(key), JSON.stringify(entry), {
        onlyIf: new Headers(version ? { 'If-Match': version } : { 'If-None-Match': '*' }),
        httpMetadata: { contentType: 'application/json' },
      });
      return object?.httpEtag ?? null;
    },
  };
}
