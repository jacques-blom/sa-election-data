# Operating within the $5 Workers plan

Jacques's budget is the existing $5/month Workers subscription, with no usage
charges. This is the Paid plan's included usage, not the Free plan's smaller
daily allowances. Prices checked on 2026-11-05:

| Resource | Monthly included usage |
| --- | --- |
| Workers | 10 million requests; 30 million CPU milliseconds |
| D1 | 25 billion row reads; 50 million row writes; 5 GB storage |
| Queues | 1 million operations |
| R2 Standard | 1 million writes/list operations; 10 million reads; 10 GB-month storage |
| Workers Logs | 20 million events (pricing changes in December 2026) |

Sources: [Workers](https://developers.cloudflare.com/workers/platform/pricing/),
[D1](https://developers.cloudflare.com/d1/platform/pricing/),
[Queues](https://developers.cloudflare.com/queues/platform/pricing/),
[R2](https://developers.cloudflare.com/r2/pricing/).

## Remove amplification

Previously a changed municipality inserted every normalized area row, updated
four indexes, then deleted the previous rows. Johannesburg's 998 rows meant
about 5,988 billed writes per publication, before coordination metadata.

The compact publisher uploads one R2 pack and changes one D1 pointer/index. A
normal publication now costs **6 D1 writes**, independent of the municipality's
area count; polling, locking, budget and queue state incur additional small
writes. The area directory changes only when areas or their names/relationships
change. Migration creates each source's pack once and reuses its existing
directory rows. No public response schema is removed.

The pack contains exact source bytes plus separately compressed area records.
Its index lets a ward request read only a small byte range. Municipality pages
coalesce nearby ranges. Pack creation normalizes once, uses fast compression,
and discards the large source object before awaiting publication. Conditional
requests and identical-body hashes bypass transforms. Parser and party-directory
versions invalidate that shortcut when required.

A second source fingerprint excludes valid `ReportDate` values after JSON and
source-identity validation. Files that only regenerate those clocks skip result
normalization too. Invalid dates and all other fields still change the
fingerprint; older root reports are rejected before this shortcut. The input-byte
budget counts bodies that actually enter normalization.

Up to eight municipality jobs share a Queue message. Retries skip completed jobs.
The three concurrent consumers and shared upstream request throttle remain.

The public Worker caches successful API responses at the edge. Live responses
have a 15-second TTL; historical responses have a 24-hour TTL. Public election
HTML responses also use the short edge cache. Public invocation logs sample 1%
of requests. Cache hits still count as Worker requests; they avoid
the database reads, R2 reads, JSON reconstruction and hashing on a cache miss.

## Retention

Keep only each source's current and previous compact pack. Both include the exact
original IEC bytes. Old compact packs are removed after a successful publication,
while failed publication keeps the existing pointers and removes its orphan pack.
Existing `raw/` archives are not deleted. Snapshot metadata and checksums remain
even after a compact raw file expires; this is not an indefinite raw-history archive.

A pack is limited to 8 MiB. At the current 214 sources, two packs per source have
a ceiling of approximately 3.6 GB, leaving room within R2's allowance for earlier
archives and other objects. Actual pack sizes are much smaller for most sources.
The D1 backfill remains around 1 GB; live data does not append normalized copies.

## Ingestion ceilings

Atomic D1 counters in `sync_budget` reserve capacity before work:

| Counter | Rolling 32-day ceiling |
| --- | ---: |
| Source checks | 1,000,000 |
| Queue messages sent | 90,000 |
| R2 writes | 500,000 |
| Changed response bytes sent through normalization | 256 GiB |
| Measured importer CPU (rounded up) | 15 million ms |

Reservations are not refunded after failure, so retries cannot spend the same
allowance twice. Queue message size and retry count bound its operations: even
six deliveries plus dead-letter handling stay under roughly 810,000 operations
for 90,000 messages. Existing messages during migration are additional.

Exhaustion pauses ingestion and exposes
`budget_paused` at `/api/v1/sync`. Published data stays available with its real
timestamps. Capacity is rechecked after the next UTC midnight; syncing resumes
when old reservations leave the rolling window. Do not clear counters to conceal consumption or automatically raise
the ceilings. The 32-day rolling window covers any monthly renewal date, avoiding a burst
on either side of a calendar-month reset. Allowances are shared with other
projects; operational ceilings are not a substitute for account-level usage
measurements.

A private Tail Worker (`sa-election-data-usage`) records the sync Worker’s actual
CPU after each invocation. The importer stops at 15 million CPU milliseconds per
rolling 32 days, leaving half the account allowance for the public Worker, the
meter and in-flight work. It also pauses if CPU telemetry is more than three
minutes old; cheap cron events allow the meter to recover. A conservative 500,000
ms reservation covers activity before the meter was enabled. Duplicate telemetry
is counted conservatively. The meter does not retain requests or log payloads.

Input-byte limits separately bound transform work. Public traffic and shared
account usage must still be measured against the actual billing period. **These controls are not a guaranteed $5 spending cap:** sufficiently
large public traffic, other projects, or higher CPU cost can exhaust shared
allowances. Ten million browser/API requests is the plan ceiling even if every
response is cached. Avoid per-visitor upstream fetching or frequent polling of
large result payloads; poll a small version indicator only while visible.

Before broad promotion, measure representative Worker CPU, request counts, R2
reads and D1 usage, and set account usage notifications. If the serving workload
cannot fit, change its delivery/caching or traffic policy before increasing it.


Run `pnpm usage:report` for the previous day’s account-wide Worker request and CPU
metrics; `node scripts/usage.ts 31` reads up to 31 days. It uses the personal
Wrangler login locally (or a scoped token from the environment) and never prints
or deploys credentials. Analytics can be delayed/sampled. `/api/v1/sync` exposes
the rolling ingestion counters and CPU-meter heartbeat without billing credentials.

## Deployment verification — 2026-11-05

At 17:55 UTC all 214 current-election sources were using compact packs, with zero
failed, overdue or pending sources and a current CPU-meter heartbeat. All six
election-year API summaries, representative live municipality/ward/district
results, historical results, ETags and cache headers passed public smoke checks.
The isolated backend release passed 28 tests and Astro type checking.

The latest 214 publications had a median fetch-to-publication delay of 2.1 seconds;
Johannesburg was 7.1 seconds. These are observations from this run, not an
end-to-end latency guarantee: summary polling remains every minute, municipality
fallback reconciliation every ten minutes, plus queue time and the 15-second
live response cache. Page-triggered priority refresh is not implemented yet.

A local Workers-runtime replay of Johannesburg's 998 records confirmed a normal
changed publication costs six D1 row writes, and a timestamp-only regeneration
keeps the same published pack. CPU and operation ceilings pause ingestion before
its reserved allowance runs out; these checks do not cap arbitrary public traffic.
