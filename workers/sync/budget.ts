// Account-wide plan allowances are shared with other projects. These ingestion
// ceilings deliberately leave room for the public service and retries. Input
// bytes bound transform work; they are NOT a measurement of billed CPU time.
export const SYNC_LIMITS = {
  checks: 1_000_000,
  queue_messages: 90_000,
  r2_writes: 500_000,
  decoded_bytes: 256 * 1024 ** 3,
  cpu_ms: 15_000_000,
} as const;
export type BudgetResource = keyof typeof SYNC_LIMITS;
export class BudgetExhausted extends Error {
  resource: BudgetResource;
  constructor(resource: BudgetResource) {
    super(`Ingestion budget exhausted: ${resource}; retaining last published results`);
    this.resource = resource;
  }
}
export const BUDGET_WINDOW_DAYS = 32;
export function budgetPeriod(now = new Date()) { return now.toISOString().slice(0, 10); }
export function budgetWindowStart(now = new Date()) {
  return new Date(now.getTime() - (BUDGET_WINDOW_DAYS - 1) * 86400_000).toISOString().slice(0, 10);
}
export function nextBudgetCheck(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString();
}
export async function reserveBudget(db: D1Database, resource: BudgetResource, amount: number) {
  if (!Number.isSafeInteger(amount) || amount <= 0 || !(resource in SYNC_LIMITS)) throw new Error('Invalid budget reservation');
  const period = budgetPeriod();
  // One atomic counter update; concurrent consumers cannot spend the same space.
  const result = await db.prepare(`INSERT INTO sync_budget(period,${resource}) SELECT ?,?
    WHERE COALESCE((SELECT SUM(${resource}) FROM sync_budget WHERE period>=?),0)+?<=?
    ON CONFLICT(period) DO UPDATE SET ${resource}=${resource}+excluded.${resource}
    `).bind(period, amount, budgetWindowStart(), amount, SYNC_LIMITS[resource]).run();
  if (result.meta.changes !== 1) {
    await db.batch([
      db.prepare(`INSERT INTO sync_budget(period,exhausted_resource) VALUES (?,?)
        ON CONFLICT(period) DO UPDATE SET exhausted_resource=excluded.exhausted_resource`).bind(period, resource),
      db.prepare(`INSERT INTO sync_status(id,backoff_until) VALUES ('live',?)
        ON CONFLICT(id) DO UPDATE SET backoff_until=MAX(COALESCE(backoff_until,''),excluded.backoff_until)`).bind(nextBudgetCheck()),
    ]);
    throw new BudgetExhausted(resource);
  }
}

/** Tail telemetry measures importer CPU after each invocation. Leave half of
 * Workers' included CPU for the website, this tiny meter and in-flight work. */
export async function cpuBudgetReady(db: D1Database) {
  const usage = await db.prepare(`SELECT COALESCE(SUM(cpu_ms),0) AS cpu_ms,MAX(cpu_meter_seen_at) AS last_seen
    FROM sync_budget WHERE period>=?`).bind(budgetWindowStart()).first<{ cpu_ms: number; last_seen: string | null }>();
  if ((usage?.cpu_ms ?? 0) >= SYNC_LIMITS.cpu_ms) {
    await db.batch([
      db.prepare(`INSERT INTO sync_budget(period,exhausted_resource) VALUES (?,'cpu_ms')
        ON CONFLICT(period) DO UPDATE SET exhausted_resource='cpu_ms'`).bind(budgetPeriod()),
      db.prepare(`INSERT INTO sync_status(id,backoff_until) VALUES ('live',?)
        ON CONFLICT(id) DO UPDATE SET backoff_until=MAX(COALESCE(backoff_until,''),excluded.backoff_until)`).bind(nextBudgetCheck()),
    ]);
    return false;
  }
  // Fail closed if the telemetry Worker stops. An inexpensive cron invocation
  // still produces a tail event, so telemetry can recover without an import.
  const ready = !!usage?.last_seen && Date.now() - Date.parse(usage.last_seen) <= 180_000;
  if (!ready) console.warn(JSON.stringify({ event: 'cpu_meter_unavailable', last_seen: usage?.last_seen ?? null }));
  return ready;
}
