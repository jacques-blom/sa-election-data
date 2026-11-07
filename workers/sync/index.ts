import { sourceFor } from '../../src/lib/data/catalogue.ts';
import { refreshJobs } from './helpers.ts';
import { election, partyNames, refreshSource } from './publish.ts';
import { scheduledSync } from './schedule.ts';
import { backoffSeconds, clearPending, readState, recordFailure } from './state.ts';
import { cpuBudgetReady } from './budget.ts';
import { districtJobs, runDistrictJobs } from './districts.ts';

export default {
  async scheduled(_controller, env) {
    if (!await cpuBudgetReady(env.RESULTS_DB)) return;
    await scheduledSync(env);
  },
  async queue(batch, env) {
    if (!await cpuBudgetReady(env.RESULTS_DB)) { batch.retryAll({ delaySeconds: 300 }); return; }
    for (const message of batch.messages) {
      const districts = districtJobs(message.body);
      if (districts) {
        const retry = await runDistrictJobs(env,districts,message.attempts);
        if (retry) message.retry({delaySeconds:retry}); else message.ack();
        continue;
      }
      const jobs = refreshJobs(message.body);
      if (!jobs) {
        console.error(JSON.stringify({ event: 'invalid_refresh_job', message_id: message.id }));
        message.retry();
        continue;
      }
      let retryDelay = 0;
      let names: ReadonlyMap<string, string> | null = null;
      // Coalescing eight jobs in one message reduces Queue operations by up to
      // eight times. Completed sources are skipped when another source retries.
      for (const job of jobs) {
        const source = sourceFor(election, job.municipalityId);
        try {
          const state = await readState(env.RESULTS_DB, source);
          if (state.pending_token !== job.token) continue;
          const backoff = await backoffSeconds(env.RESULTS_DB);
          if (backoff) {
            if (message.attempts >= 6) await clearPending(env.RESULTS_DB, source.id, job.token);
            retryDelay = Math.max(retryDelay, Math.min(86_400, backoff));
            continue;
          }
          // Publication is locked per source; a shared D1 slot limits IEC requests
          // across all three consumers and the independent summary scheduler.
          names ??= await partyNames(env);
          const result = await refreshSource(env, source, names);
          await clearPending(env.RESULTS_DB, source.id, job.token, job.hint);
          console.log(JSON.stringify({ event: 'refresh_job_completed', source: source.id, outcome: result.outcome,
            queue_age_seconds: Math.round((Date.now() - Date.parse(job.enqueuedAt)) / 1000) }));
        } catch (error) {
          const delay = await recordFailure(env.RESULTS_DB, source, error, message.attempts);
          // Cloudflare moves the sixth failed delivery to the configured DLQ.
          // Release the source so the reconciliation loop can recover it later.
          if (message.attempts >= 6) await clearPending(env.RESULTS_DB, source.id, job.token);
          retryDelay = Math.max(retryDelay, delay);
        }
      }
      if (retryDelay) message.retry({ delaySeconds: retryDelay });
      else message.ack();
    }
  },
} satisfies ExportedHandler<SyncEnv, unknown>;
