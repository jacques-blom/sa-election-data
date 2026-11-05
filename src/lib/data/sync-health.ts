import { budgetPeriod, budgetWindowStart, BUDGET_WINDOW_DAYS, SYNC_LIMITS } from '../../../workers/sync/budget.ts';

export async function syncHealth(db: D1Database) {
  const [status, coverage, budget] = await db.batch([
    db.prepare("SELECT last_started_at,last_completed_at,last_error,enqueued_count,backoff_until FROM sync_status WHERE id='live'"),
    db.prepare(`SELECT COUNT(*) AS sources,SUM(d.active_snapshot_id IS NOT NULL) AS loaded_sources,
      SUM(d.last_error IS NOT NULL) AS failed_sources,
      SUM(d.last_success_at IS NULL OR d.last_success_at < ?) AS overdue_sources,
      MIN(d.last_success_at) AS oldest_successful_check,MAX(d.last_success_at) AS latest_successful_check,
      MAX(s.last_published_at) AS latest_result_publication,
      SUM(EXISTS(SELECT 1 FROM result_bundles b WHERE b.source_id=d.id)) AS packed_sources,
      SUM(s.pending_token IS NOT NULL) AS pending_sources,MIN(s.pending_since) AS oldest_pending_since
      FROM source_documents d LEFT JOIN sync_state s ON s.source_id=d.id WHERE d.year=2026`)
      .bind(new Date(Date.now() - 15 * 60_000).toISOString()),
    db.prepare(`SELECT COALESCE(SUM(checks),0) AS checks,COALESCE(SUM(queue_messages),0) AS queue_messages,
      COALESCE(SUM(r2_writes),0) AS r2_writes,COALESCE(SUM(decoded_bytes),0) AS decoded_bytes,
      COALESCE(SUM(cpu_ms),0) AS cpu_ms,MAX(cpu_meter_seen_at) AS cpu_meter_seen_at,
      MAX(CASE WHEN period=? THEN exhausted_resource END) AS exhausted_resource
      FROM sync_budget WHERE period>=?`).bind(budgetPeriod(), budgetWindowStart()),
  ]);
  const scheduler = status!.results[0] as {
    last_started_at: string | null; last_completed_at: string | null; last_error: string | null;
    enqueued_count: number; backoff_until: string | null;
  } | undefined;
  const sources = coverage!.results[0] as {
    sources: number; loaded_sources: number; failed_sources: number; overdue_sources: number;
    oldest_successful_check: string | null; latest_successful_check: string | null;
    latest_result_publication: string | null; pending_sources: number; oldest_pending_since: string | null;
    packed_sources: number;
  };
  const schedulerOverdue = !scheduler?.last_completed_at || Date.now() - Date.parse(scheduler.last_completed_at) > 180_000;
  const backoff = scheduler?.backoff_until && Date.parse(scheduler.backoff_until) > Date.now();
  const usage = budget!.results[0] as Record<string, number | string | null> | undefined;
  const cpuMeterOverdue = !usage?.cpu_meter_seen_at || Date.now() - Date.parse(String(usage.cpu_meter_seen_at)) > 180_000;
  return {
    year: 2026,
    status: usage?.exhausted_resource ? 'budget_paused' : !scheduler ? 'not_started' : cpuMeterOverdue || schedulerOverdue || scheduler.last_error || sources.failed_sources || sources.overdue_sources || backoff ? 'degraded' : 'healthy',
    refresh_mode: scheduler ? 'scheduled_polling' : 'manual_import',
    summary_poll_seconds: 60,
    municipality_reconciliation_seconds: 600,
    stale_after_seconds: 900,
    scheduler_overdue: schedulerOverdue,
    scheduler: scheduler ?? null,
    storage: sources.packed_sources === sources.sources ? 'packed_r2' : 'migrating_to_packed_r2',
    ingestion_budget: { window_start: budgetWindowStart(), window_days: BUDGET_WINDOW_DAYS, limits: SYNC_LIMITS, usage: usage ?? null,
      cpu_meter_overdue: cpuMeterOverdue,
      note: 'CPU telemetry and operation ceilings cover ingestion; public traffic and other projects share account allowances.' },
    ...sources,
    caveat: 'A successful check means we fetched the IEC source; it does not mean new votes were counted or results declared.',
  };
}
