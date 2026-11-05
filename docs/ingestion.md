# Ingestion and live updates

## Working locally

```sh
pnpm data:ingest --years all
pnpm data:load
pnpm dev
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

Run one loader at a time. No continuous polling process, production Cron Trigger,
Queue, or R2 bucket has been started or created. A separate personal-account D1
database has been created and backfilled; these local commands do not refresh it.

## Moving the backfill to personal Cloudflare D1

`pnpm data:export` writes `.data/exports/bootstrap.sql` locally. It includes the
schema and a consistent snapshot of the processed data, with result rows before
the pointers that publish them. It does not upload anything. The export is safe
to rerun and contains no SQLite transaction wrappers or internal Wrangler tables.

The verified bootstrap was imported into the personal-account D1 database on
2026-11-05 with:

```sh
pnpm exec wrangler d1 execute RESULTS_DB --remote --profile personal --file .data/exports/bootstrap.sql
```

The remote database contains 150,566 current area-result rows across six elections,
1,353 active source documents, and 2,912 snapshot metadata records. All coverage
counts and active source snapshot IDs match the local database. The imported
database is about 989 MB. Treat this as a snapshot, not an automatically refreshing
live service. The 2026 fetch window was 16:10–16:13 SAST on 2026-11-05.

Use this bootstrap flow for initial loading, not to overwrite an actively updating
database with an old export. Raw gzip snapshots still need uploading to R2 separately;
the SQL file contains their provenance and relative archive paths, not the raw
documents. Subsequent live updates should be written by the ingestion Worker,
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
See [the API contract](../public/api.md) for field semantics and limitations.

## Production update design (not deployed)

1. A Workers Cron Trigger checks the small current-election index every minute.
   It rediscovers areas and compares municipality report timestamps/progress.
2. Changed municipalities become idempotent Queue jobs, with bounded concurrency,
   conditional GETs, timeouts and exponential backoff respecting Retry-After.
   A full reconciliation sweep at least every ten minutes catches detail changes
   the index did not reveal, including corrections to completed municipalities.
3. Store each fetched document and response metadata in R2 before publication.
   Validate with the shared parser. Compare actual result fields separately from
   generation timestamps, so clock-only rebuilds do not rewrite every D1 row or
   create misleading "votes changed" events.
4. Serialize publication per source and use a compare-and-swap on its active
   version. Stage changed rows, then switch the source pointer. Retried jobs are
   harmless. Reject older source reports; allow newer downward corrections.
5. Serve versioned results from D1. Public API responses cache for 15 seconds.
   The browser can poll our lightweight version endpoint every 15–30 seconds;
   client traffic never increases requests to the IEC. SSE can follow later.
6. Track successful-fetch age, source-report age, queue lag, validation failures,
   and reconciliation gaps. Alert on sustained failures; show the last good data
   with a stale/error label. Send exhausted jobs to a dead-letter queue.

This provides near-real-time publication, not a direct count-room stream. The
IEC describes its dashboard updates as every 5–10 minutes. Our initial target is
roughly one to two additional minutes after a normal upstream publication, to
be measured under load rather than promised as an SLA. Updates found only by a
reconciliation sweep can take longer. National/provincial and municipality files
can have different source timestamps; expose that rather than imply a single
simultaneous national snapshot.

Before production: provision personal R2/Queue resources,
implement the scheduled worker and queue consumer, verify reuse terms, and test
source outages, duplicate/out-of-order jobs, cache freshness and load. No Fudge
account or GitHub remote is used.

Sources: [IEC results home](https://results.elections.org.za/),
[IEC municipal dashboard](https://results.elections.org.za/dashboards/lge/LGEResultsDashboard.aspx),
[IEC 2016 municipal elections handbook](https://www.elections.org.za/content/Documents/Publications/2016-Municipal-Elections/2016-Municipal-Elections-Handbook/),
[Wrangler local binding proxy](https://developers.cloudflare.com/workers/wrangler/api/).
