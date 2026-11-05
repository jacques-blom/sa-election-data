import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// Read-only account analytics. Never print credentials or copy them to Workers.
// Use an existing personal Wrangler session, or a scoped API token in the shell.
const account = '1644a80d2d9ee897e4a990ce1e8100ee';
const days = Number(process.argv[2] ?? 1);
if (!Number.isFinite(days) || days <= 0 || days > 31) throw new Error('Usage: node scripts/usage.ts [days, 0 < days <= 31]');
let token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  const profile = readFileSync(join(homedir(), '.config/.wrangler/config/personal.toml'), 'utf8');
  token = profile.match(/^\s*oauth_token\s*=\s*"([^"\r\n]+)"/m)?.[1];
}
if (!token) throw new Error('Log into the personal Wrangler profile or set a scoped CLOUDFLARE_API_TOKEN');
const end = new Date();
const start = new Date(end.getTime() - days * 86400_000);
const query = `query Usage($account: string, $start: string, $end: string) {
  viewer { accounts(filter: {accountTag: $account}) {
    workersInvocationsAdaptive(limit: 100, filter: {datetime_geq: $start, datetime_lt: $end}) {
      dimensions {scriptName} sum {requests errors cpuTimeUs}
    }
  } }
}`;
const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
  method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables: { account, start: start.toISOString(), end: end.toISOString() } }),
});
if (!response.ok) throw new Error(`Cloudflare analytics returned HTTP ${response.status}; refresh the personal Wrangler login if needed`);
type Usage = { dimensions: { scriptName: string }; sum: { requests: number; errors: number; cpuTimeUs: number } };
const result = await response.json() as { errors?: { message: string }[] | null;
  data?: { viewer: { accounts: { workersInvocationsAdaptive: Usage[] }[] } } };
if (result.errors?.length) throw new Error(result.errors.map(e => e.message).join('; '));
const rows = result.data?.viewer.accounts[0]?.workersInvocationsAdaptive;
if (!rows) throw new Error('Cloudflare did not return usage metrics');
const totals = rows.reduce((a, r) => ({ requests: a.requests + r.sum.requests,
  cpu_ms: a.cpu_ms + r.sum.cpuTimeUs / 1000, errors: a.errors + r.sum.errors }), { requests: 0, cpu_ms: 0, errors: 0 });
console.log(JSON.stringify({ start: start.toISOString(), end: end.toISOString(), account,
  note: 'Analytics may be sampled/delayed; compare your actual billing period. This is not a billing invoice.',
  totals, included_per_billing_month: { requests: 10_000_000, cpu_ms: 30_000_000 },
  workers: rows.map(r => ({ name: r.dimensions.scriptName, requests: r.sum.requests,
    cpu_ms: r.sum.cpuTimeUs / 1000, errors: r.sum.errors })) }, null, 2));
