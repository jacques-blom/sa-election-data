import { publicUrl } from '../site.ts';

/** Loaded on demand as a tool result: no plugin or installed skill is required. */
export const analysisGuide = {
  version: '1.2.0',
  python_client_url: publicUrl('/analysis/counted_data.py'),
  api_base_url: publicUrl('/api/v1'),
  instructions: `# Analyse Counted data in Python

Use this guide for questions requiring many areas, rankings, comparisons, charts,
or exports. MCP discovers data and supplies interpretation rules; Python can do
arbitrary calculations on saved records. Do not print an entire dataset into chat.

Call get_api_docs to read the complete API contract through MCP. get_overview
returns national/provincial page aggregates; get_area_summary returns calculated
shares, progress, exploratory history and labelled council allocations;
list_area_summaries returns compact rows across areas, optionally for one party.
These are useful inputs to the client's Python for rankings without transferring
every raw party record. Follow every required page, keep source snapshots, and
never rank only a first page as if it covered the whole country.

For a standard visual, use render_results_image (one area's vote shares),
render_comparison_image (previous-election changes or one party across selected
areas), or render_council_image (seats and optional hypothetical coalition).
These tools render exact PNGs and include an MCP Apps viewer; Python is not
needed. Preserve the chart's status and caveats. Use the returned PNG and JSON
download URLs, and image_markdown only when the client has no viewer. Do not
substitute an image-search result or claim an image is visible when only a link
appears. Images are captured snapshots; request a new one for updated figures.
Use Python for custom calculations and charts outside these bounded templates.

## Acquire complete data

1. Inspect list_elections for both coverage and election status, and
   get_sync_status for live health. Choose exactly one geographic level per
   dataset; mixing municipalities, wards and voting districts double-counts votes.
2. Download python_client_url to counted_data.py in the Python workspace. It uses
   Python 3's standard library and public REST GETs, without credentials. Inspect
   it if needed. Example:

   python counted_data.py --year 2026 --level municipality --output data-2026
   python counted_data.py --year 2021 --level municipality --output data-2021

   Optional filters: --province-id, --municipality-id, --ward-id. --base-url
   selects another Counted deployment, e.g. http://localhost:4321 for local tests.
   Start with a small scope when checking connectivity. Every output directory
   must be new; existing analysis files are never overwritten.
3. The helper follows all area/source pages and downloads every party row via
   REST (unlike get_results, the REST area response does not paginate parties).
   It saves results.jsonl, areas.csv, parties.csv, sources.json and manifest.json.
   It verifies source snapshot IDs against catalogs before and after download and
   rejects changed snapshots, duplicate areas and incomplete pages. A failed
   download does not leave a directory marked complete. Retry with a smaller
   scope if the count keeps changing; do not retry indefinitely.
4. Read manifest.json before analysis. complete_for_imported_scope means all
   listed imported areas were downloaded; it does NOT mean all IEC areas were
   imported, all votes counted, results declared, or boundaries comparable. The
   coverage response and source catalog record these separate limitations.
   Files preserve the exact captured figures and checksums for reproducibility;
   live API URLs may subsequently change. There is no globally simultaneous IEC
   snapshot across source files. Keep the downloaded files with your analysis.

If Python cannot fetch URLs (as in normal ChatGPT data analysis), use MCP tool
results directly as Python input, or the host's supported file-download or file
attachment capability. For small analyses retrieve all get_results party pages or
compact list_area_summaries pages, serialize the returned records into Python,
and verify row counts and snapshots. Never assume a returned
URL becomes a local Python file automatically. Report an unavailable data-transfer
path explicitly. Do not substitute summary rows for a full dataset.

## Tables and joins

Government context has a separate source and time basis. Use
get_government_history or /api/v1/governments/{municipality} for administrations.
MISTRA v1.0 ends on 28 February 2026; party roles and officeholders describe
inauguration, with subsequent changes possibly only in notes. Do not infer
current control from an Active row or join a 2026 government onto older election
results. Keep source dates, notes and issue flags. Verified before/after records
are separate; even final seat results cannot prove a coalition formed or changed.

- results.jsonl preserves full area responses: election, area, source, results,
  quality and caveats. Use it for fields not flattened into CSV.
- areas.csv has one row per (year, level, area_id), including source/snapshot,
  freshness, list scope, progress, stated totals and reconciliation.
- parties.csv has one row per published source entry within that area. Join to
  areas on (year, level, area_id); never just area_id. entry_index disambiguates
  rows; party_id alone is not a unique row key. candidate_name matters for
  independents. Aggregate rows are identified by entry_type, not their name.
- IDs are strings. Read year/level/area_id, parent IDs, party_id and source_entry_id
  as strings when importing CSV. CSV blank numeric cells mean unavailable, not
  zero; JSON preserves null explicitly. Preserve nulls in sums (for pandas use
  min_count and explicit completeness checks). Do not silently fill missing votes
  or seats with zero. A duplicate or ambiguous party/candidate identity needs
  review before aggregation, including changes in historical party names.

## Compute freely, keep the measurement explicit

Choose the statistic the question needs and state it: votes, percentage-point
vote-share change, reported seats, or reported council outcomes. Keep PR and ward
ballots separate. votes_source_total may combine ballots and is not voters.
Registered voters and reporting progress do not establish turnout here.

For a complete party list with non-null votes for the selected ballot, a share
can use the sum of ALL source rows for that ballot, including any aggregate rows
in the denominator. Filter aggregates out of party rankings only AFTER computing
that denominator. Preserve the source reconciliation warning. Never use a
combined-ballot reported total as a PR-only denominator, sum percentages, average
municipal percentages as a national share, or infer missing parties from a
leading_parties_only summary. Weighted shares require matching numerator and
denominator coverage. Zero denominators produce unavailable shares.

For "biggest winners and losers in LGE 2026", a useful stated interpretation is
party vote-share change since 2021, with ward and PR analysed separately; reported
seat changes are a separate measure. Compute only where the necessary published
data, ballot definitions and comparison scope support it.
Historical records may have null PR/ward counts even when source_total is known.
If a separate-ballot comparison is unavailable, say so. A comparison of
source_total in BOTH years can be offered as an explicitly labelled
combined-ballot measure; never compare it against a PR-only share.
Compare equivalent
geographic coverage in both years and document excluded areas/parties. Equal
IEC IDs or ward numbers do not prove unchanged boundaries; no validated boundary
crosswalk is supplied. If comparability is unverified, label a same-ID comparison
exploratory and never present it as a boundary-adjusted or national ranking.

2026 is provisional. Partial counting can distort gains/losses geographically.
Report progress and freshness alongside rankings. Raw reported seat fields can be
partial. get_area_summary separately exposes the website's reported or estimated
council allocations with status and assumptions; never mix estimates into reported
seat totals or describe estimates as results. Council control cannot be
inferred from a vote lead; coalition membership is not supplied. Current town
mappings describe whole overlapping wards, not town-only totals.

Return the result with the chosen metric, coverage and exclusions, dates/status,
source links, and the executable Python analysis plus relevant tables/charts.
Keep computations in Python; explain only the findings and limitations that
materially affect the answer.`,
};
