/** Read-only link health report. A successful request is not an editorial review:
 * it must never automatically renew checkedAt or mark a consultation as open.
 * node scripts/check-civic-links.ts [--local-only] > /tmp/civic-links.json
 */
import directory from '../src/lib/civic/municipal-directory.json' with { type: 'json' };
import { localCivicResources, councillorDirectory } from '../src/lib/civic/resources.ts';

const sources = [
  ...Object.entries(localCivicResources).flatMap(([slug, resources]) => Object.values(resources).map(resource => ({ slug, url: resource.url }))),
  { slug: 'iec-councillors', url: councillorDirectory.url }, { slug: 'national-directory', url: directory.sourceUrl },
  ...(process.argv.includes('--local-only') ? [] : Object.entries(directory.records).map(([slug, record]) => ({ slug, url: record.url }))),
];
const queue = [...new Map(sources.map(source => [source.url, source])).values()];
const results: { slug: string; url: string; status?: number; finalUrl?: string; title?: string; error?: string }[] = [];
async function worker() {
  for (let source; (source = queue.shift());) {
    try {
      const response = await fetch(source.url, { signal: AbortSignal.timeout(20_000), headers: { 'User-Agent': 'Counted civic resource link check' } });
      const body = await response.text();
      const title = (body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      results.push({ ...source, status: response.status, finalUrl: response.url, title });
    } catch (error) { results.push({ ...source, error: error instanceof Error ? error.message : String(error) }); }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), results: results.sort((a, b) => a.slug.localeCompare(b.slug)) }, null, 2));
if (results.some(result => result.error || !result.status || result.status >= 400)) process.exitCode = 1;
