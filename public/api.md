# SA Election Data API — v1

This is a local development API. Automatic live polling is not deployed yet.
All endpoints are public, read-only GET requests. JSON responses support CORS,
ETag/If-None-Match and a 15-second cache lifetime.

## Endpoints

- `/api/v1` — API information and caveats.
- `/api/v1/elections` — imported elections and source health.
- `/api/v1/elections/2026` — coverage and the IEC's expected area counts.
- `/api/v1/elections/2026/areas?level=municipality` — browse municipalities.
- `/api/v1/elections/2026/areas?level=ward&municipality_id=9909` — browse a municipality's wards.
- `/api/v1/elections/2026/areas?level=voting-district&ward_id=10202001` — browse voting districts.
- `/api/v1/elections/2026/areas/municipality/9909` — Witzenberg results.
- `/api/v1/elections/2026/areas/ward/10202001` — a ward's published results.
- `/api/v1/elections/2026/areas/national/ZA` — national summary, including its coverage limitations.
- `/api/v1/elections/2026/sources` — source URLs, successful checks, and refresh failures.

Substitute 2000, 2006, 2011, 2016 or 2021 for historical elections. Area-list levels
are `national`, `province`, `municipality`, `ward`, and `voting-district`.
List endpoints accept `limit` (1–200, default 50) and `offset` (default 0).
Area lists can filter by `province_id`, `municipality_id`, and `ward_id`.
IDs are the IEC's IDs **within that election**. A matching ID does not establish
that two elections used the same boundary.

## Reading results correctly

`source` identifies the original IEC URL, immutable snapshot, area's report
timestamp, HTTP Last-Modified, latest check, latest successful check, and any
refresh error. `checked_recently` describes our fetch, not when the IEC last
counted a vote. Compare the source timestamps too. Historical report timestamps
often reflect later regeneration of the files, not the date of the election.

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

The dashboard feeds used here do not supply a complete separate dataset for
district-council ballots. National and provincial summaries are source-reported
snapshots, not an artificial sum of municipalities fetched at different times.

## Source

[IEC municipal election dashboard](https://results.elections.org.za/dashboards/lge/LGEResultsDashboard.aspx)
and its public JSON documents. These .js URLs contain JSON and are parsed as
data, never executed. No IEC API credentials are used. This project is independent
of the IEC. Source URLs and checksums are included for verification.
