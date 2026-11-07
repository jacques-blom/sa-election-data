import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { getPlatformProxy } from 'wrangler';
import { districts } from '../src/lib/maps/districts.ts';
import { migrateD1 } from './lib/migrations.ts';
import { ensureDistrictSources, refreshDistrict, failDistrict } from '../workers/sync/districts.ts';

const {values} = parseArgs({options:{district:{type:'string'}}});
const selected = values.district ? districts.filter(d => values.district!.split(',').includes(d.id)) : districts;
if (!selected.length || (values.district && selected.length !== new Set(values.district.split(',')).size)) throw new Error('Unknown district code');
// Development/backfill writes only to the local bindings. Production is owned by the scheduled Worker.
const proxy = await getPlatformProxy<SyncEnv>({configPath:'workers/sync/wrangler.jsonc',persist:{path:resolve('.wrangler/state/v3')},remoteBindings:false});
let failed = 0;
try {
  await migrateD1(proxy.env.RESULTS_DB);
  await ensureDistrictSources(proxy.env.RESULTS_DB);
  for (const district of selected) {
    try { console.log(JSON.stringify({district:district.id,status:await refreshDistrict(proxy.env,district),remote:false})); }
    catch (error) { failed++; await failDistrict(proxy.env.RESULTS_DB,district.id,error); }
  }
} finally { await proxy.dispose(); }
if (failed) process.exitCode = 1;
