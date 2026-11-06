# Ingestion and live updates

## Working locally

```sh
pnpm data:ingest --years all
pnpm data:load
pnpm dev:local
```

The importer handles the IEC's public local-government dashboard files for 2000,
2006, 2011, 2016, 2021, and provisional 2026 results. `--years` also accepts one
year or a comma-separated list; its default is 2026. `--municipality 9909` limits
a run to that municipality plus the national/provincial summary. The default
request interval is 500 ms, with one request in flight. It stops after five
consecutive failures and can be rerun to resume using HTTP validators and hashes.

The IEC's party directory is cached and archived locally to resolve names omitted
by historical files. After changing normalization rules, bump `NORMALIZER_VERSION`
and run `pnpm data:reprocess` to reinterpret the archived election files, followed
by `pnpm data:load`. Reprocessing preserves the actual successful-fetch timestamps;
it does not make old data appear freshly fetched.

Exact fetched JSON is gzip-archived by SHA-256 under `.data/raw/`. The local
SQLite database `.data/elections.sqlite` records provenance, import failures,
snapshot history and current results. It is excluded from Git, as is the raw
archive. Back up `.data/` if the devbox is ephemeral.

`data:load` uses Wrangler's local binding proxy to copy new snapshots into the
local D1 emulator. Remote bindings are disabled. Rows are staged in bounded
batches before a single source-pointer update publishes them. Unchanged
snapshots only refresh source metadata. The same D1 schema serves the Astro
REST API; the Node/SQLite importer itself is a development/backfill tool, not
code deployed to Workers.

To refresh the local API with a new live snapshot:

```sh
pnpm data:ingest --years 2026
pnpm data:load
```

Run one local loader at a time. These commands do not refresh the remote D1
database. The separate production ingestion Worker owns updates to the current
election there; do not run a second remote publisher against it.

## Moving the backfill to Cloudflare D1

`pnpm data:export` writes `.data/exports/bootstrap.sql` locally. It includes the
schema and a consistent snapshot of the processed data, with result rows before
the pointers that publish them. It does not upload anything. The export is safe
to rerun and contains no SQLite transaction wrappers or internal Wrangler tables.

For your own deployment, first configure your own account and database as described
in the [README](../README.md#deploy-your-own-instance). The maintainer imported the
initial bootstrap on 2026-11-05 with the command below. It targets the database in
your Wrangler configuration and requires an authenticated `personal` profile:

```sh
pnpm exec wrangler d1 execute RESULTS_DB --remote --profile personal --file .data/exports/bootstrap.sql
```

At bootstrap, the remote database contained 150,566 current area-result rows across
six elections, 1,353 active source documents, and 2,912 snapshot metadata records.
All coverage counts and active source snapshot IDs matched the local database. The imported
database was about 989 MB. These counts describe the bootstrap, before automated
sync; current snapshot IDs and metadata counts will change. The initial 2026 fetch
window was 16:10–16:13 SAST on 2026-11-05.

Use this bootstrap flow for initial loading, not to overwrite an actively updating
database with an old export. Historical raw gzip snapshots remain in the devbox
archive; the SQL file contains their provenance and relative paths, not their raw
documents. Changed live results are packed with their exact source bytes in R2 before publication. Compact retention keeps the current and previous source versions. Subsequent
live updates are written by the ingestion Worker,
not by repeatedly importing this bootstrap file. Cloudflare documents the SQL
import flow and its 5 GiB file limit in its
[D1 import guide](https://developers.cloudflare.com/d1/best-practices/import-export-data/).

## Source coverage and validation

The dashboard declares election event IDs 2, 95, 197, 402, 1091, and 1887 for
the six supported years. Never reuse one election's file under another year.
The IEC's 2016 municipal elections handbook states that it does not have reliable
1995/1996 municipal election data because the commission was established in 1997.
Those earlier years are not represented as missing zero results.

`LiteMapsNational` is a discovery/progress source with limited party lists.
Municipality files contain all the party rows the dashboard publishes, plus
ward and voting-district results. On 2026-11-05 the live lightweight index omitted
uMvoti (4430) and Inkosi uMtubatuba (4446) despite valid 2026 detail files existing.
The catalogue includes these verified supplemental IDs and the importer retains
previously discovered IDs when a summary temporarily omits them.

The importer validates the event ID, municipality ID, structure, dates, and
numeric values. Negative historical progress placeholders become unknown;
negative seat counts become null with the original value retained as an anomaly.
Invalid vote counts and structural errors reject the snapshot. Failures preserve the previous
active snapshot. An older report cannot replace a newer one. A newer report may
reduce votes: corrections are legitimate and are not discarded as non-monotonic
counts. All upstream errors remain visible in `/api/v1/elections/{year}/sources`.

The API also reports arithmetic discrepancies in the source rather than fixing
votes to make totals match. Ballot papers are not unique voters. Progress zeros
at ward/VD level are often placeholders. Boundaries change between elections.
See [the API contract](api.md) for field semantics and limitations, also available
on the site at `/api` (HTML) and `/api.md` (Markdown).

## Production update pipeline

1. A Workers Cron Trigger checks the small current-election index every minute.
   It rediscovers areas and compares municipality result/progress fingerprints,
   excluding generated report timestamps.
2. Changed municipalities become idempotent Queue jobs, with bounded concurrency,
   conditional GETs, timeouts and exponential backoff respecting Retry-After.
   Each municipality becomes due for an independent check after ten minutes,
   catching detail changes the index did not reveal, including corrections to
   completed municipalities. A failed summary fetch does not prevent these checks.
3. Validate with the shared parser and compare normalized results separately from
   generation timestamps. Pack changed results and exact source bytes into one R2
   object with an index for individual-area range reads. Identical files and
   clock-only rebuilds skip publication; they update freshness metadata.
4. Serialize publication per source and use a compare-and-swap on its active
   version. A D1 lease prevents concurrent publication of the same source;
   the complete R2 object is uploaded before a transactional D1 pointer/index switch.
   Existing directory rows are reused. A normal publication writes six D1 rows;
   the number of wards and voting districts does not multiply that cost.
   Retried jobs are harmless. Reject reports older than the last validated
   document, including timestamp-only rebuilds; allow newer downward corrections.
5. Serve live results using D1 directory/pointer lookups and small R2 range reads.
   Historical results continue to use D1. The Worker caches successful API responses
   for 15 seconds for live data and 24 hours for historical data.
   `/api/v1/sync` exposes the heartbeat and latest publication. Result pages poll
   this lightweight endpoint every 30 seconds while visible, and on return to the
   tab, fetching updated HTML when publication/health changes. Source timestamps
   and age-based warnings also refresh every three minutes. Client traffic never
   increases requests to the IEC. SSE can follow later.
6. Track successful-fetch age, source-report age, queue lag, validation failures,
   and reconciliation gaps in structured logs and `/api/v1/sync`. Keep the last good
   data with a stale/error label. Exhausted jobs go to a dead-letter queue and
   become eligible for later reconciliation. External alert delivery is not configured.

This provides near-real-time publication, not a direct count-room stream. The
IEC describes its dashboard updates as every 5–10 minutes. Our initial target is
roughly one to two additional minutes after a normal upstream publication, to
be measured under load rather than promised as an SLA. Updates found only by a
reconciliation sweep can take longer. National/provincial and municipality files
can have different source timestamps; expose that rather than imply a single
simultaneous national snapshot.

### Resources and operations

All resources belong to the personal Blom Media LLC account:

- `sa-election-data`: Astro SSR Worker, public read-only API and results site.
- `sa-election-data-sync`: scheduled/queue Worker with public HTTP routes disabled.
- `sa-election-data-usage`: private Tail Worker recording importer CPU for budget enforcement.
- `sa-election-data`: the existing D1 database, shared by both Workers.
- `sa-election-data-raw`: private R2 bucket for indexed result packs, exact source bytes and the party directory.
- `sa-election-data-refresh`: three concurrent consumers; up to eight source jobs per message, processed sequentially.
- `sa-election-data-failed`: dead-letter queue after five retries.

The public service is at <https://counted.co.za>.
Live health is at <https://counted.co.za/api/v1/sync>.
The account needs Workers Paid for this importer; the Free plan's 10 ms Cron
CPU limit is insufficient for parsing and validating the result documents.

Apply additive schema changes before deploying code that reads them:

```sh
pnpm exec wrangler d1 execute RESULTS_DB --remote --profile personal --config wrangler.jsonc --file migrations/0002_sync.sql --yes
pnpm exec wrangler d1 execute RESULTS_DB --remote --profile personal --config wrangler.jsonc --file migrations/0003_compact_results.sql --yes
pnpm exec wrangler d1 execute RESULTS_DB --remote --profile personal --config wrangler.jsonc --file migrations/0004_cpu_budget.sql --yes
pnpm exec wrangler d1 execute RESULTS_DB --remote --profile personal --config wrangler.jsonc --file migrations/0005_source_fingerprint.sql --yes
pnpm check
pnpm test
pnpm sync:dry-run
pnpm deploy:dry-run
pnpm usage:deploy
pnpm deploy
pnpm sync:deploy
```

Deploy the compatible public reader before the compact publisher. Once sources
have migrated, do not roll back to the old D1-only reader/publisher. Keep the new
reader and fix or roll forward the publisher instead.

See [the operating budget](cost-budget.md) for operation ceilings and bounded raw
retention. Budget exhaustion pauses ingestion and is visible in sync health.

Cron changes can take up to fifteen minutes to propagate. Watch
`/api/v1/sync` and the ingestion Worker's logs for real runs rather than treating
a successful deployment as evidence of successful ingestion. Initial catch-up
queues all known municipalities; source freshness improves as this queue drains.

`scheduled_polling` describes the configured mechanism; the separate health
status can still be `degraded`. Summary source freshness expires after three
minutes, detail freshness after fifteen. Source report time and successful check
time remain separate. A regenerated timestamp does not publish new result rows.

The source fetch has a 30-second timeout and a 24 MiB uncompressed limit in the
Worker (the largest observed 2026 document is about 17.5 MB). Processing normalizes
one row at a time and releases raw response strings before D1 writes to bound
memory. A shared D1 throttle caps IEC request starts at two per second across
the scheduler and consumers. HTTP 429/503 responses trigger shared backoff; Retry-After is respected,
with delayed queue retries. A source pending for over an hour can be reclaimed if
a message was lost; normally retries or reconciliation recover it sooner.

Use Cloudflare Worker logs for `source_refresh_failed`, `snapshot_published` and
`scheduler_completed`, and inspect the dead-letter queue for exhausted jobs.
After fixing a persistent source error, the scheduled reconciliation can retry it
without replacing the last-good results. To stop polling, remove the sync Cron
Trigger and pause queue delivery before changing publication state. The GitHub
repository contains application code and configuration; raw archives and local
databases are excluded.

### Launch verification — 2026-11-05

At 18:17 SAST, `/api/v1/sync` reported `healthy`: all 214 current-election source
documents had been automatically refreshed, with zero failed or overdue sources
and an empty pending queue. Coverage remained 213 municipalities, 4,485 wards and
23,696 voting districts, plus the national and nine provincial summaries.
Multiple real Cron Trigger and Queue invocations were observed in production.

All six election years were checked over the public API, including CORS,
conditional GET/304, method restrictions and pagination errors. Cloudflare's
compressed responses use weak ETags; the API accepts them correctly. The 17.5 MB
Johannesburg source was processed in the Workers runtime, and its live R2 archive
was downloaded and verified against the checksum exposed by the API.

The public API/placeholder deployment was built from an isolated copy because
unfinished front-end work was arriving concurrently in the shared repository.
That UI work was preserved in the workspace. The launch verification captures a
point in time; consult the live health endpoint for current operating status.

Sources: [IEC results home](https://results.elections.org.za/),
[IEC municipal dashboard](https://results.elections.org.za/dashboards/lge/LGEResultsDashboard.aspx),
[IEC 2016 municipal elections handbook](https://www.elections.org.za/content/Documents/Publications/2016-Municipal-Elections/2016-Municipal-Elections-Handbook/),
[Wrangler local binding proxy](https://developers.cloudflare.com/workers/wrangler/api/).
