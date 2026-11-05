import { budgetPeriod } from '../sync/budget.ts';

export async function recordImporterCpu(db: D1Database, events: readonly { scriptName: string | null; cpuTime: number }[]) {
  const relevant = events.filter(event => event.scriptName === 'sa-election-data-sync');
  if (!relevant.length) return;
  if (relevant.some(event => !Number.isFinite(event.cpuTime) || event.cpuTime < 0)) throw new Error('Invalid CPU telemetry');
  // Duplicate telemetry is conservatively counted twice. No logs, addresses or
  // result data are retained by this Worker, only a daily CPU counter.
  const cpu = relevant.reduce((sum, event) => sum + Math.ceil(event.cpuTime), 0);
  await db.prepare(`INSERT INTO sync_budget(period,cpu_ms,cpu_meter_seen_at) VALUES (?,?,?)
    ON CONFLICT(period) DO UPDATE SET cpu_ms=cpu_ms+excluded.cpu_ms,cpu_meter_seen_at=excluded.cpu_meter_seen_at`)
    .bind(budgetPeriod(), cpu, new Date().toISOString()).run();
}

export default {
  async tail(events, env) { await recordImporterCpu(env.RESULTS_DB, events); },
} satisfies ExportedHandler<UsageEnv>;
