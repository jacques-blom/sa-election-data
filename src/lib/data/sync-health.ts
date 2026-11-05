export async function syncHealth(db: D1Database) {
  const [status, coverage] = await db.batch([
    db.prepare("SELECT last_started_at,last_completed_at,last_error,enqueued_count,backoff_until FROM sync_status WHERE id='live'"),
    db.prepare(`SELECT COUNT(*) AS sources,SUM(d.active_snapshot_id IS NOT NULL) AS loaded_sources,
      SUM(d.last_error IS NOT NULL) AS failed_sources,
      SUM(d.last_success_at IS NULL OR d.last_success_at < ?) AS overdue_sources,
      MIN(d.last_success_at) AS oldest_successful_check,MAX(d.last_success_at) AS latest_successful_check,
      MAX(s.last_published_at) AS latest_result_publication,
      SUM(s.pending_token IS NOT NULL) AS pending_sources,MIN(s.pending_since) AS oldest_pending_since
      FROM source_documents d LEFT JOIN sync_state s ON s.source_id=d.id WHERE d.year=2026`)
      .bind(new Date(Date.now() - 15 * 60_000).toISOString()),
  ]);
  const scheduler = status!.results[0] as {
    last_started_at: string | null; last_completed_at: string | null; last_error: string | null;
    enqueued_count: number; backoff_until: string | null;
  } | undefined;
  const sources = coverage!.results[0] as {
    sources: number; loaded_sources: number; failed_sources: number; overdue_sources: number;
    oldest_successful_check: string | null; latest_successful_check: string | null;
    latest_result_publication: string | null; pending_sources: number; oldest_pending_since: string | null;
  };
  const schedulerOverdue = !scheduler?.last_completed_at || Date.now() - Date.parse(scheduler.last_completed_at) > 180_000;
  const backoff = scheduler?.backoff_until && Date.parse(scheduler.backoff_until) > Date.now();
  return {
    year: 2026,
    status: !scheduler ? 'not_started' : schedulerOverdue || scheduler.last_error || sources.failed_sources || sources.overdue_sources || backoff ? 'degraded' : 'healthy',
    refresh_mode: scheduler ? 'scheduled_polling' : 'manual_import',
    summary_poll_seconds: 60,
    municipality_reconciliation_seconds: 600,
    stale_after_seconds: 900,
    scheduler_overdue: schedulerOverdue,
    scheduler: scheduler ?? null,
    ...sources,
    caveat: 'A successful check means we fetched the IEC source; it does not mean new votes were counted or results declared.',
  };
}
