# Counted API — v1

The current election is refreshed by a scheduled Cloudflare Worker. Historical
elections are preserved from the verified backfill. Check `/api/v1/sync` for actual
polling health and timestamps; a running service does not guarantee fresh upstream data.
All endpoints are public, read-only GET requests. JSON responses support CORS,
ETag/If-None-Match and a 15-second cache lifetime.

## Quick start

No API key or account is needed. The base URL is
`https://counted.co.za/api/v1`.

List the available elections:

```sh
curl 'https://counted.co.za/api/v1/elections'
```

Find a municipality, then follow its `results_url` to get votes, party rows,
progress and source information:

```js
const base = 'https://counted.co.za';
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
- [`/api/v1/updates`](/api/v1/updates) — recorded ward wins, council outcomes, completed counts and linked corrections. The [Latest updates page](/updates) presents the same records.
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
They also accept `q`, a literal case-insensitive area-name fragment of at most
80 characters, to discover IDs within a selected election.
IDs are the IEC's IDs **within that election**. A matching ID does not establish
that two elections used the same boundary.

List responses include `limit`, `offset` and `total`. Increase `offset` by `limit`
to fetch the next page; stop when `offset + limit >= total`. Area lists return
an `areas` array, and source lists return a `sources` array.

## Milestone updates

`/api/v1/updates` accepts `type` (`all`, `wins`, `councils`, `complete`,
`corrections`), `province` (IEC ID 1–9), `q` (municipality/ward text, at most
80 characters), and `limit` (1–50, default 30). Results are newest first.
Use `before=next_before` for older records, `after=latest_id` for newer records,
or `event=ID` for one saved announcement. Use only one cursor at a time.
`/updates?event=ID` is its permanent HTML link. Invalid filters return 400,
a missing event returns 404, and a database outage returns 503.

Each update preserves the relevant `before` and `after` facts, source URL,
snapshot IDs, IEC report time, observation time, and publication time.
`previous_event_id` links a correction to its earlier announcement;
`superseded_by` flags an announcement that has since been revised. These facts
remain available after older raw result packs expire. The source URL always
points to the IEC's current file, not an immutable archived copy.

The feed uses explicit reported ward seats and complete, reconciled council
allocations. It never turns a vote leader or estimated allocation into a win.
Count completion requires all expected voting districts in a municipality to
report. A reported outcome is still provisional until officially declared.
Routine vote changes and regenerated report timestamps do not produce posts.
Historical comparisons are not inferred from matching ward numbers.

The first import is a baseline, not a fresh announcement. On rollout, the
importer compares changes against the preceding published snapshot. This feed
does not reconstruct announcements from before tracking began. Before the feed
schema/publisher is activated, `status` is `not_started` and `updates` is empty.

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

## MCP access

AI clients can use the public, read-only `/mcp` Streamable HTTP endpoint after
deploying the MCP-enabled version. It exposes election discovery, named-place
mapping, area results, source health and milestone updates. No API key is needed.
Use `list_elections`, then `list_areas` and `get_results` with an explicit year,
or `search_places` and `get_place` for 2026 geographic mappings. Read the
`counted://methodology` resource for interpretation rules. Lists and party rows
are paginated, with at most 50 records per call; source totals and quality flags
continue to describe the complete source. The repository's `docs/mcp.md` explains
the tool contracts, client setup and deployment configuration.

For open-ended calculations in Python, call `get_analysis_guide`. It loads
instructions and links to a standard-library download client at
`/analysis/counted_data.py`, which saves complete imported scopes as JSONL and CSV
with a coverage/provenance manifest. No separately installed skill is needed.
The agent's Python environment or host must support downloading files.
When Python has no network access, pass complete MCP-returned records into Python
directly; a URL alone is not a file attachment. No Work-mode dependency or server
code execution is required for calculations over data supplied by tools.

### Page aggregates through MCP

`get_api_docs` and the `counted://api-documentation` resource return this complete
document as Markdown. Additional read-only tools expose the website's calculated
data without HTML scraping:

| Tool | Parameters and output |
| --- | --- |
| `get_overview` | `year`, optional `province_id`, `limit`/`offset`: national/provincial source summary, region cards, reporting, council-majority counts where available, and a municipality page. |
| `get_area_summary` | `year`, `level`, `area_id`, optional `ballot`, `party_limit`/`party_offset`: full-source share denominator, paginated party shares/history/allocations, leader/ties, progress, quality, source and available years. |
| `list_area_summaries` | `year`, `level`, parent IDs, name `query`, optional `ballot` and `party_id`, `limit`/`offset`: compact area cards with an optional selected party for cross-area Python analysis. Default 10, maximum 25 areas. |

`ballot` is `auto`, `pr`, `ward` or `source_total`. The returned basis is explicit:
national/provincial summaries use combined ballots, and combined-only historical
records use combined counts. Denominators are calculated before party pagination.
Council `status` is `reported`, `estimated` or `unavailable`; raw reported seats
and derived allocations remain distinct. Estimates follow the same current-count
assumptions as the website and never enter reported council-majority counts.
Movements are percentage points against the previous election at the same ID,
with ballot fallback and unknown comparisons labelled. They are not validated
boundary-adjusted swings. An earlier OTHER row prevents assuming zero for an
unlisted party. Towns still map to whole wards; district-council results and actual
coalition membership are not inferred. Returned data URLs identify the underlying
records; these aggregate tools do not add separate REST routes.

### Result images through MCP

`render_results_image` draws one area's shares (`year`, `level`, `area_id`, optional
`ballot`, `top` 3–15 and `party_id`). `render_comparison_image` draws previous-election
percentage-point changes for one area, or a named party's vote shares across 2–12
selected areas (`year`, `level`, `area_ids`, `mode: previous_election | areas`,
optional `ballot`, `party_id` and `top`). Previous-election comparisons use the
preceding imported election and current named-party entries with known baselines;
they are not boundary-adjusted and do not comprehensively rank party exits.
Cross-area mode requires a named `party_id` and a common ballot basis.
`render_council_image` draws council seats (`year`, `municipality_id`, optional
`selected_party_ids`, maximum 20). Selections are hypothetical; reported and
estimated seats remain distinct. Grouped independents cannot be selected as one party.

Each response contains PNG image content plus `data.image_url`, `image_markdown`,
`alt_text`, dimensions and chart data. The MCP Apps resource
`ui://counted/result-image-v1.html` displays it in supporting clients. Other clients
can use the PNG link; Markdown image display is client-dependent.
`data_url` points to immutable JSON evidence for the image. Generated PNG and JSON
are available through `GET`/`HEAD /images/results/<sha256>.png` or `.json` with
ETags and one-year immutable caching. An old image keeps its captured figures;
call the tool again for an updated snapshot. Public image generation caches
derived artifacts without changing election records or running caller code.

Unlike the REST GET endpoints above, `/mcp` accepts protocol POST requests and
OPTIONS. JSON-RPC responses are not publicly cached.

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

`/api/v1/map/boundaries?ids=19100001,19100002` returns a GeoJSON
`FeatureCollection` of up to 40 full ward boundaries in one request. IDs must
be eight digits; duplicates are removed. Invalid or oversized requests return
400, unknown ward IDs return 404, and unavailable geometry returns 503 without
caching a partial batch. Successful responses cache for one day.
