import { parseArgs } from 'node:util';
import { getPlatformProxy } from 'wrangler';
import { backfillDashboard } from './lib/dashboard-backfill.ts';

const { values } = parseArgs({ options: { remote: { type: 'boolean' }, apply: { type: 'boolean' }, limit: { type: 'string' } } });
if (values.limit && !/^[1-9]\d{0,2}$/.test(values.limit)) throw new Error('--limit must be between 1 and 999');
console.log(JSON.stringify({ target: values.remote ? 'live' : 'local', mode: values.apply ? 'apply' : 'dry-run' }));
const proxy = await getPlatformProxy<Env>({ configPath: 'wrangler.jsonc', environment: values.remote ? 'live' : undefined,
  remoteBindings: !!values.remote });
try {
  const result = await backfillDashboard(proxy.env.RESULTS_DB, proxy.env.RAW_RESULTS, {
    apply: values.apply, limit: values.limit ? Number(values.limit) : undefined,
    progress: (completed, total) => { if (completed % 20 === 0 || completed === total) console.log(`${completed}/${total} councils checked`); },
  });
  console.log(JSON.stringify(result));
  if (result.failures.length || result.changedDuringRead) process.exitCode = 1;
} finally { await proxy.dispose(); }
