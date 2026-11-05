# Turnout data: verified source and integration plan

Turnout can be shown at national, province, municipality, ward and voting-district
levels once the dedicated data is imported. Towns/suburbs need a separate scope:
show the overlapping wards' turnout, or a verified aggregation of whole districts.
Never estimate town-only voters from polygon overlap percentages.

## Why the current result feed is insufficient

The imported MapsJason source contains combined ballot counts and registered
voters for national/province/municipality summaries. Ward and voting-district
records do not supply the registered-voter denominator. The combined vote count
includes multiple ballot types: it is not the number of people who voted.
Dividing it by registered voters, or dividing it by two, does not produce a
reliable turnout measure.

The [IEC report description](https://results.elections.org.za/) defines municipal
turnout as the highest of ward or PR votes cast, divided by registered voters
plus MEC7 votes. The dedicated reports label their scope **audited voting
districts**, including the registered-voter denominator.

## Current public reports verified on 5 November 2026

- [EC101 municipality report](https://results.elections.org.za/home/LGEPublicReports/1887/Voter%20Turnout/EC/EC101.pdf):
  registered voters, MEC7, turnout count and percentage by ward, plus total.
- [Ward 21001010 report](https://results.elections.org.za/home/LGEPublicReports/1887/Voter%20Turnout/EC/EC101/21001010.pdf):
  the same fields for each voting district, plus ward total. This confirms the
  public reports reach voting-district level without authenticated IEC API access.

Both downloads are labelled 2026 Local Government Elections and include a
printed timestamp. They were extracted and visually checked. Evidence copies
are in `.data/results-home/turnout-2026-*` (local, ignored).

These two reports are not an atomic publication: the municipality's ward row
and the child ward's total differ despite print times only seconds apart.
Do not silently mix their denominators or assume a result-feed timestamp also
applies to turnout. The national `.../ZA.pdf` path returned 404; a national report
URL and coverage for all provinces still need discovery. An observed report
path is not proof that every area's report has been published.

## Before exposing percentages

1. Discover and validate available reports (or their public CSV/Excel equivalent)
   for each level. Keep election and geography IDs, source URL, publication time
   and retrieval time; reject the wrong election/area or a changed table schema.
2. Archive unchanged/changed source documents using the existing R2 snapshot
   pattern. Parse in the ingestion process, never in a visitor's page request.
   Fit polling into the shared sync budget; turnout reports can update at a
   different cadence from vote-count files.
3. Store turnout count, registered voters in the same audited districts, MEC7
   adjustment, official percentage, coverage and method separately from party
   results. Validate the percentage against its numerator/denominator with
   rounding tolerance. Missing/zero denominators remain unavailable.
4. Prefer each area's direct report. If rolling up child records, require a
   consistent, non-overlapping coverage set; sum counts and denominators, never
   average percentages. Label a calculated aggregation separately from the
   direct IEC report. Publish a coherent turnout snapshot independently.
5. Render **Turnout in audited districts: X%**, with its own timestamp and
   coverage explanation while the election is incomplete. Show unavailable
   when a report is missing. Expose the same typed fields and provenance in
   JSON and Markdown. Reporting coverage and turnout stay distinct.

This change verifies feasibility and updates the page hierarchy. It does not
claim that turnout ingestion or production turnout display is already running.
