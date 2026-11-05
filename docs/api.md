# Counted API — v1

The current election is refreshed by a scheduled Cloudflare Worker. Historical
elections are preserved from the verified backfill. Check `/api/v1/sync` for actual
polling health and timestamps; a running service does not guarantee fresh upstream data.
All endpoints are public, read-only GET requests. JSON responses support CORS,
ETag/If-None-Match and a 15-second cache lifetime.

## Quick start

No API key or account is needed. The base URL is
`https://sa-election-data.jacques.workers.dev/api/v1`.

List the available elections:

```sh
curl 'https://sa-election-data.jacques.workers.dev/api/v1/elections'
```

Find a municipality, then follow its `results_url` to get votes, party rows,
progress and source information:

```js
const base = 'https://sa-election-data.jacques.workers.dev';
const response = await fetch(`${base}/api/v1/elections/2026/areas?level=municipality&limit=5`);
if (!response.ok) throw new Error(`API returned ${response.status}`);
const page = await response.json();
console.log(page.areas); // Each area includes its results_url.
```

You can also [open the municipality list](/api/v1/elections/2026/areas?level=municipality&limit=5)
or [view Witzenberg's results](/api/v1/elections/2026/areas/municipality/9909)
directly in your browser.

## Endpoints

- [`/api/v1`](/api/v1) — API information and caveats.
- [`/api/v1/sync`](/api/v1/sync) — scheduler heartbeat, source freshness, pending jobs, failures and latest publication.
- [`/api/v1/elections`](/api/v1/elections) — imported elections and source health.
- [`/api/v1/elections/2026`](/api/v1/elections/2026) — coverage and the IEC's expected area counts.
- [`/api/v1/elections/2026/areas?level=municipality`](/api/v1/elections/2026/areas?level=municipality) — browse municipalities.
- [`/api/v1/elections/2026/areas?level=ward&municipality_id=9909`](/api/v1/elections/2026/areas?level=ward&municipality_id=9909) — browse a municipality's wards.
- [`/api/v1/elections/2026/areas?level=voting-district&ward_id=10202001`](/api/v1/elections/2026/areas?level=voting-district&ward_id=10202001) — browse voting districts.
- [`/api/v1/elections/2026/areas/municipality/9909`](/api/v1/elections/2026/areas/municipality/9909) — Witzenberg results.
- [`/api/v1/elections/2026/areas/ward/10202001`](/api/v1/elections/2026/areas/ward/10202001) — a ward's published results.
- [`/api/v1/elections/2026/areas/national/ZA`](/api/v1/elections/2026/areas/national/ZA) — national summary, including its coverage limitations.
- [`/api/v1/elections/2026/sources`](/api/v1/elections/2026/sources) — source URLs, successful checks, and refresh failures.

## Filters and pagination

Substitute 2000, 2006, 2011, 2016 or 2021 for historical elections. Area-list levels
are `national`, `province`, `municipality`, `ward`, and `voting-district`.
List endpoints accept `limit` (1–200, default 50) and `offset` (default 0).
Area lists can filter by `province_id`, `municipality_id`, and `ward_id`.
IDs are the IEC's IDs **within that election**. A matching ID does not establish
that two elections used the same boundary.

List responses include `limit`, `offset` and `total`. Increase `offset` by `limit`
to fetch the next page; stop when `offset + limit >= total`. Area lists return
an `areas` array, and source lists return a `sources` array.

## Caching and errors

Use GET to read data, HEAD for response headers, and OPTIONS for CORS preflight.
Browser JavaScript can access the API from any origin. Save a response's `ETag`
and send it as `If-None-Match` on the next request; a `304 Not Modified` response
has no body, so reuse your saved data. Polling more often than the 15-second cache
lifetime will not make the upstream count update sooner.

| Status | Meaning |
| --- | --- |
| `200` | Successful request; the response body is JSON. |
| `304` | The cached response is still current. |
| `400` | Invalid level, filter or pagination parameter. |
| `404` | Unknown endpoint, election or area. |
| `405` | Unsupported HTTP method. Use GET, HEAD or OPTIONS. |
| `503` | Results are temporarily unavailable. Retry later. |

Error responses for `400`, `404` and `503` include an `error` message. A successful
response can still contain stale results: check `source.freshness` and source
timestamps rather than relying on HTTP status alone.

## Reading results correctly

### Freshness and provenance

`source` identifies the original IEC URL, immutable snapshot, area's report
timestamp, HTTP Last-Modified, latest check, latest successful check, and any
refresh error. `checked_recently` describes our fetch, not when the IEC last
counted a vote. Compare the source timestamps too. Historical report timestamps
often reflect later regeneration of the files, not the date of the election.

`latest_document_reported_at` and `latest_document_sha256` describe the latest
validated source document. `published_at` is when changed results were made
visible through the API. Live payloads use indexed R2 packs; D1 holds their
publication pointers and the area directory. When the IEC regenerates only timestamps, the immutable result
snapshot and its `area_reported_at` remain unchanged; the latest-document fields
advance. `null` publication/observation fields on historical backfills mean that
the live publisher did not create those records.

The summary is checked every minute. Changed municipalities are queued promptly;
every municipality is also due for an independent check after ten minutes, even
if the summary does not change. Queue processing and upstream backoff can add
delay. Summary results become `stale` after three minutes without a successful
check; municipality, ward and voting-district results after fifteen minutes.
`stale_after_seconds` gives the applicable threshold. Failed checks keep the last
good results with `refresh_failed`. `/api/v1/sync` reports degraded health if the
scheduler or any sources fall behind, or upstream backoff is active.

`budget_paused` means an ingestion operation allowance was exhausted. The last
published results remain available and retain their real timestamps. The sync
endpoint exposes the rolling 32-day counters, measured importer CPU and its
telemetry heartbeat. Sync pauses if the CPU meter is stale. These are not an
account-wide billing cap. Current API responses cache for 15 seconds, historical
responses for 24 hours. The Worker also uses the edge Cache API to avoid repeated
D1 and R2 work. Conditional requests still use ETags.

Raw-byte retention is bounded: each live source keeps its current and previous
published pack, including the exact IEC document. Older snapshot IDs, hashes and
timestamps remain in the provenance catalogue, but their raw files may have
expired. Clock-only municipality rebuilds update observation metadata without
creating another archived pack. Existing historical archives are unchanged.

### Ballots and party lists

`votes.source_total` is the IEC's published total, often combining multiple
ballots. `votes.ward` and `votes.pr` retain the separate fields when present.
`null` means the field was unavailable; it must not be read as zero. No turnout
percentage is inferred from combined ballots. Voting-district records often
lack a ballot breakdown entirely.

`party_list_scope` is `leading_parties_only` for national/provincial summaries
and `all_rows_in_source` for detailed municipality/ward/voting-district files.
The former can contain an `OTHER` aggregate. Such rows have `entry_type:
aggregate` and a null `party_id`; they are not another political party. The
original signed ID is retained as `source_entry_id`.

Some negative IDs belong to real historical parties; only the IEC's `-2` OTHER
entry is treated as an aggregate. When old result files omit names,
`party_name_source: iec_party_directory` identifies names resolved from the
[directory used by the IEC dashboard](https://results.elections.org.za/dashboards/lge/MapsJason/2016/PartyList.js).
These are directory labels, not independently reconstructed historical names.

### Progress and data quality

`progress` reports completed/expected counts only where the source supplies a
positive expected count. Placeholder zero/negative fields become null. Synthetic
ward-zero groups in some 2000 files are not exposed as electoral wards. Reporting 100%
does not establish an officially declared result. The 2026 catalogue remains
`provisional` until final declaration handling is implemented.

`quality.vote_total_reconciliation` compares the sum of the published party
rows to the stated valid-ballot total, where both exist. A discrepancy is
reported explicitly; the source figures are never silently adjusted.

Impossible negative seat counts become null in the normalized `seats` fields.
Their original values remain in `source_anomalies`, also collected under `quality`.
Raw source snapshots retain every original field.

The website's **Estimated council seats** view is a separate calculation from the
current count. API `seats` fields remain source-reported allocations and may be
partial; they are never replaced by estimates. See the repository's
`docs/seats.md` for the model's assumptions and validation rules. A complete,
reconciled IEC allocation takes precedence in the website and coalition playground.

The dashboard feeds used here do not supply a complete separate dataset for
district-council ballots. National and provincial summaries are source-reported
snapshots, not an artificial sum of municipalities fetched at different times.

## Source

[IEC municipal election dashboard](https://results.elections.org.za/dashboards/lge/LGEResultsDashboard.aspx)
and its public JSON documents. These .js URLs contain JSON and are parsed as
data, never executed. No IEC API credentials are used. This project is independent
of the IEC. Source URLs and checksums are included for verification.

## Named places and boundaries

Search the South African place directory with
[`/api/v1/places?q=Calvinia&page=1`](/api/v1/places?q=Calvinia&page=1).
Responses include `total`, a page size of 60, and compact place records with
name, province, municipality, geographic bounds and canonical result-page URL.
An empty query returns the metros. Names and aliases can be combined with a
province to distinguish places sharing a name.

[`/api/v1/places/calvinia`](/api/v1/places/calvinia) includes the place's
many-to-many ward/municipality relationships and the current result snapshots.
[`/2026/places/calvinia.md`](/2026/places/calvinia.md) presents the same scope and
figures as Markdown. A town page reports whole overlapping wards, not a
calculated town-only vote total. These mappings use statistical main-place
boundaries labelled 2016 and electoral ward boundaries for 2026.

`/api/v1/geometry/:level/:id` returns a GeoJSON feature for `province`,
`municipality`, `ward`, `voting-district` or `town`. Electoral IDs are IEC IDs;
town IDs are Stats SA main-place codes. Boundaries are simplified geographic
context, not proof of voter registration. Place search caches for five minutes,
result endpoints for fifteen seconds, and geometry for one day. Source and
status fields must accompany any result presentation.
