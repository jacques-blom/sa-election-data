# National and province results

The national, province, municipality, town and ward templates put published
votes first. Reporting coverage appears once beside each result. Routine timestamps,
source-detail panels, manual refresh links and repeated provisional badges are omitted;
the footer identifies IEC results as provisional. Delayed or failed updates still show
a notice. Detailed provenance remains in the API and copied share summaries.

- Home (`/`): national vote shares,
  province map, metro vote results, province summaries and election-year slider.
  Current national history links, `/national-results` and `/2026` resolve here; old elections remain at
  `/{year}`. Maps retain their explicit vote-share scope. `/map` provides detailed
  geographic exploration.
- Councils (`/councils`): place/address search followed by one outcome selector: All councils,
  each party with a reported majority, No majority and Pending. Counts and allocation
  coverage follow the selected province and council type, independently of search and outcome selection.
  All 257 councils (8 metros, 205 locals and 44 districts) appear in compact rows. Available results show seat bars, party counts
  and majority thresholds. Estimates are visibly labelled and remain Pending; district results are Unavailable because the current feed has no district council ballots or seats.
  Metros appear first, with available results prioritised within metros and locals.
  Compact coloured highlight cards follow the first eight councils on desktop and mobile;
  filters hide them to keep matching results together. Council type and majority changes are under
  More filters; party selection reveals a compact gains/losses summary. The header
  omits its duplicate search on this page. Detailed highlights and methodology remain
  at `/highlights`.
- Provinces: selected party vote shares alongside a map of municipal PR leaders,
  then a searchable municipality directory with full party tables.
- Municipalities and wards: provisional leader, vote share and margin over the
  next candidate/party, followed by the full chart. Zero-vote contests show an
  awaiting-votes state with the candidate list collapsed.
- Towns: whole-ward result cards first, then maps and boundary explanations.
  There is no invented town-only total.
- Voting districts: show separate ballots when available. Where the IEC source
  only publishes combined counts, show those with an explicit scope label.
  Do not present them as a ward contest or a separate PR ballot.

The shared layout, maps and national place directory continue to be developed
in parallel. These changes preserve those integrations.

## Data rules

- `src/lib/overview/results.ts` queries active D1 snapshots. One statement reads
  each overview. Different IEC source documents can have different timestamps;
  the page does not claim that all municipality results were published together.
- Summary progress and combined ballot-paper totals come from the IEC summary,
  with explicit denominators. They are not voter counts or turnout.
- National/province combined vote shares use the IEC's reported valid-ballot
  denominator. Province lists are incomplete: show their missing remainder,
  never renormalize the listed parties to 100%. Cards show party shares under a shared ballot-scope label, without winner claims. Invalid or materially conflicting totals suppress shares.
  A source mismatch can retain shares only when it is at most one ballot in 10,000
  and every party's share rounds identically to one decimal place using either total.
  The IEC denominator and original counts remain unchanged, the chart discloses the
  difference, and raw API reconciliation continues to report it. This exception rejects
  duplicate entries and individual shares above 100%; unlisted remainders stay nonnegative.
  Historical summary comparisons use the same denominator checks.
- Separate municipal PR and ward shares use complete published rows for that
  ballot. Missing values, zero totals, ties and aggregate Other rows cannot
  become an individual leader. A margin requires two individual entries.
- Turnout is a separate dataset; see [turnout.md](turnout.md). It cannot be
  calculated from the combined ballot totals currently imported.
- Results remain provisional, even at 100% reporting. Municipality pages now
  show [council estimates or complete IEC-reported seats](seats.md) and a
  hypothetical coalition playground. The national/province overview does not
  make council-outcome or winner announcements from those estimates.
- Invalid progress is hidden. An incomplete count cannot round to 100%.
- Successful check age is visible through delayed-data warnings: three minutes
  for national/province summaries, fifteen minutes for municipalities. Errors
  retain the last valid figures. A failed page query returns 503 and no-store;
  an unknown province returns 404. Both use noindex.
- Regular HTML responses retain their shared 15-second cache. While visible and
  online, result pages poll the small `/api/v1/sync` indicator every 30 seconds,
  and check immediately when the tab/window regains focus or the connection returns.
  Publication or health changes trigger an in-place HTML update. One follow-up
  update allows the independent edge caches to expire; otherwise unchanged pages
  refresh age-based warnings every three minutes.
- Refreshes retain search inputs, the selected ballot, expanded tables, share
  controls and map instances. Province leader colours and share summaries update
  with the figures. A failed refresh retains the last successful content, shows a
  retry notice and tries again. Requests time out after 15 seconds, never overlap,
  and pause while hidden or offline. Static pages do not poll; no-JavaScript
  visitors can reload the page to update the figures.

## Journeys and integration

One prominent home search combines council filtering, directory matches and Google place/address suggestions. A matching-councils link in the suggestions opens the filtered council list. The same input stays inline on phones.
Directory queries use a bounded, uncached `POST /api/search`, so raw addresses
do not enter search URLs. Directory matches open their place/province page;
selected Google areas open their canonical results page or map extent; selected addresses open the matching
ward results directly, including from “Find local results”. The ward page shows the selected address and a
pin on its map. Boundary matches ask the reader to choose a ward. Missing Google access still permits directory suggestions.
Province filters support server-side GET requests and
immediate client-side filtering. Essential content and tables work without JS.
`/search` is the shared destination for place and address search, with browsable
directory results and a name-search form for visitors without JavaScript.
The search field replaces the header only on mobile (up to 600px).
`/find-address` permanently redirects to `/search`.

The sitemap now includes all nine province URLs. Query pages are noindex and
canonicalize to the unfiltered route. Province links and content render on the
server. Search, Share and filter controls have labels and keyboard support.

Sharing opens a branded image preview, with portrait (1080 × 1350), square
(1080 × 1080) and story (1080 × 1920) exports. The cards use a short headline,
large figures, party bars, the Counted logo, ballot scope, reporting coverage,
provisional status and the IEC result time in SAST. A short post caption is
separate from the image's accessible text description.

“Share” opens the device share menu with the PNG and caption when file sharing
is supported. Other browsers share text and save the PNG, or just save the PNG
when native sharing is unavailable. Pages without an image share a link, falling
back to copying it. Save image, copy caption and copy link remain available.
Individual update cards share their saved announcement with its provisional
status, report time and any superseded warning; simulation cards cannot be
shared as public announcements. The AI setup guide also has a Share button.
Shared URLs preserve allowlisted public selections (ballot, coalition parties,
map view and update filters), never search text or address details.

Share actions send Google Analytics events on the production hostname. See
[Sharing analytics](analytics.md) for event definitions and verification.

An open preview captures its figures and keeps them through live updates and
format changes. Reopening sharing picks up new results. Links open the latest
results for that election; they are not immutable snapshot links. The shared
renderer and browser actions live in `src/lib/sharing/`.

Display-only province paths were copied from the prototype’s
`assets/geography.js`, containing simplified MDB province geometry. Only shapes
were copied, never prototype election figures. Paths are unsuitable for address
lookup. Their source is the MDB Provinces service documented by the prototype.
The maps now use party colours: the national map reflects the highest share
shown in each province summary; province maps show provisional municipal PR
leaders. Unknown or tied results use a neutral fill. Maps are not council-outcome
trackers. Small province silhouettes on the result cards are decorative; the
home-page SVG provides native province links for pointer, touch and keyboard use.

## Council dashboard and highlights

The councils page (`/councils`) lists all 257 councils, with metros first. Within
metros and other councils, reported allocations precede counts in progress,
councils awaiting results, and unavailable data, then alphabetical order.

The outcome tabs and coverage counts use the selected province and council type,
independently of search, outcome, party selection or scroll position. More filters
contains All types / Metro / Local / District and Majority changed since 2021.
Choosing a party shows its majorities gained and lost across all comparable
councils in that province/type, including losses outside its current-majority list.
Search and the change toggle do not narrow this summary. Missing comparisons show
dashes, not zero. Choosing another outcome clears an incompatible party selection.
Each row links to the council's page; district names end in “District”.

Province, type, outcome, party and change links work without JavaScript and are shareable.
JavaScript filters the list immediately and reveals another 24 councils as its end
approaches the viewport, retaining the visible extent and selections across live updates.
Without IntersectionObserver or JavaScript, all matching councils remain accessible.
The unified search can contain private addresses, so typed text is kept out of filter
URLs as well as public shares. Legacy council-name query URLs remain readable.
The majority-change highlight is labelled "Outright majorities gained/lost": seat majorities
do not establish which party or coalition governs a municipality.

Only complete reconciled IEC seat allocations enter Majority and No majority.
Estimates stay Pending, identified in seat-graphic descriptions and links to the builder.
Grouped independents cannot be a single-party majority or a selected coalition bloc.
Read failures display Unavailable separately. Missing results remain searchable.
District rows are explicitly unavailable, not pending: the current IEC source
contains 213 metro/local councils and no separate district council ballots or seats.
Districts enter neither party comparisons nor vote-share highlights. Their pages
show local council results separately, never summed into a district council outcome.
Districts have no majority-builder link until full council allocations are supported.
`/majority-builder` redirects to the council directory, retaining province/name filters
and the Pending filter. Builder return links also use `/councils`.

Highlights are nationwide and independent of the directory's filters:

- Majority changes compare reported allocations in both elections: a party gains or
  loses its majority, or one majority party replaces another. No-majority to
  no-majority is not a majority change. The home highlight card opens `/highlights#majority-changes`;
  the full council list opens via `?changed=1`.
- Biggest gains/losses rank combined ward + municipal PR vote-share changes in
  percentage points since the immediately previous election. Current counts must be
  complete. Both party lists must be complete with unambiguous identities. The union
  of parties includes parties absent from a complete current list; missing or partial
  lists never establish zero. Comparisons are published area results, not adjusted
  for boundary changes. The leading gain and loss have paired share bars; more entries
  and coverage details are available on `/highlights#vote-swings`.
- Close pending ward races use ward votes only, a margin no greater than 2 percentage
  points, at least 50% but less than 100% of districts reporting, and no explicit ward
  seat award. Ties remain ties. The vote gap and reporting coverage accompany the
  top-contender bars. These are provisional leads, not forecasts or council majorities.
- Where ward progress is absent, close pending council counts use municipal PR votes
  and the municipality's published district progress, with the same 2-point and 50%
  thresholds. Councils with reported allocations are excluded. Ballot basis is labelled;
  a vote lead does not establish council control. If no close race qualifies, a
  "Count to watch" shows actual progress in a still-counting council, prioritising metros.

The sync publishes a small `council_dashboard` summary in the same guarded transaction
as each municipality's active result pointer. It contains council seats, combined vote
shares, district progress, a close pending council count and up to six closest qualifying
wards. Readers match the
summary to the captured snapshot; stale summaries cannot enter rankings. Keeping each
municipality's closest six is sufficient to find the nationwide closest six using the
same sort order. Routine council-directory reads do not download all municipality or ward packs.
Legacy/local D1 imports use the same derivation. During rollout only metros need fallback
pack reads; validated council milestones supply reported outcomes elsewhere. Missing
highlight coverage is disclosed. A source error or stale successful check shows a notice.

### Rollout

Apply `0007_council_dashboard.sql` before deploying the updated sync Worker. Deploy the
frontend with the sync change. Existing municipality summaries backfill during their
next scheduled reconciliation, even if the source results have not changed; backfilling
neither changes the result snapshot nor creates announcements. To populate summaries
immediately from existing published packs, run `pnpm data:dashboard --remote` for a
read-only dry run, then `pnpm data:dashboard --remote --apply`. The backfill skips current
summaries, bounds reads to four sources at once, and guards each write against the active
snapshot. It does not refetch IEC data, change source pointers or create announcements.
It can be rerun if a source advances during a read. Omitting `--remote` targets local data.
The frontend tolerates an absent summary table and incomplete backfill using the existing
result paths. Missing highlight data is labelled unavailable rather than an absence of
close races. Running the UI locally does not apply migrations or deploy the sync Worker;
live-data development needs the summary rollout too.

## Verification and delivery

`tests/overview.test.ts` and `tests/places.test.ts` cover active snapshots,
geography scope, proper denominators for partial lists, missing/zero/tied votes,
aggregate groups, lead margins, source times and invalid progress.
The results-focused responsive audit is in `.data/results-home/audit.json`;
screenshots are in the same directory. It covers every municipality page and
all nine provinces at phone/desktop widths, plus stress-case ward names and
additional phone/tablet widths, expanded tables and Share panels.

The existing local preview is on port 4322 and uses the local imported D1 copy.
That copy is older than the production sync, so delayed-data warnings in local
screenshots are expected. No production deployment is part of this page change.
Deploy the frontend in coordination with the parallel town and mapping work.

Live refresh regression checks are in `tests/live-poll.test.ts` and
`tests/map-interactions.test.ts`. Browser verification in `.data/live-results/`
exercises repeated polling, focus/visibility changes, failed requests and recovery,
all result-page types, and preservation of filters, expanded tables and map canvases.

## Election history and party movement

The compact election-year slider sits inside the map card where a map is shown.
On ward pages it sits beneath the municipality results card. Historical map cards retain the control with an explanation when old boundaries
are unavailable.

The slider links 2000, 2006, 2011, 2016, 2021 and 2026 wherever
an active result exists for the same IEC area ID. National history is at `/{year}`;
province, municipality, ward and voting-district URLs retain the selected year.
The current national page is `/`. Links work without JavaScript; the native
range input updates results on input, without a document reload, while preserving
focus and scroll position. Scrubbing changes the displayed election without changing
the loaded URL, canonical metadata or browser history. Sharing links use the displayed
election's canonical URL. Ballot selection
and municipality filters are retained. Nearby years preload with two concurrent reads;
in-flight requests are shared and the latest selection wins. A per-tab LRU cache
holds up to 12 pages / 8 MB for 30 minutes (15 seconds for the live count). Failed
requests keep the displayed results and can be retried.
Direct historical pages hide reporting progress, search and current council outcomes.
When scrubbing from 2026, those panels stay visible but disabled, preserving their
space and typed search text until the reader returns to 2026. Historical views do not
poll the live count or report old snapshots as delayed. Keyed result containers and stable map
content slots keep the native slider mounted even while dragging through 2026.

Party changes are **percentage points**, calculated against the immediately
previous election, never the most recent year that happens to be present.
Comparisons match IEC party IDs. National/provincial summaries preserve the
published valid-ballot denominator, including unlisted parties. A party absent
from a truncated summary has no comparison. A complete list with no matching
party establishes zero recorded votes. Aggregates, independent groupings,
ambiguous duplicate identities, zero totals and missing ballot values produce
a dash, not a fabricated change.

Historical detail feeds currently contain combined ballot totals. When the current
view shows separate PR or ward votes, changes compare combined shares in **both**
years. Indicators show an up/down arrow and absolute number inline with the share. It is not the change in the displayed
PR-only or ward-only share. Charts explain this and accessible labels give the
previous year, both shares and the ballot basis. Cards, party tables, ward previews,
province map labels and the interactive map use the same comparison function.

These are comparisons of published area results, not boundary-adjusted swings.
Municipality and ward boundaries may differ even with the same IEC ID. Historical
pages omit current ward/district geometry. During scrubbing, an already displayed
detailed map stays mounted, labelled as 2026 boundaries with historical boundaries
unavailable. Its party colours and result navigation are disabled until returning to
2026; the geometry remains as context, without claiming a historical boundary match.
The national overview's province outlines are labelled as current. Town/suburb relationships are currently mapped only for
2026, so their sliders do not offer unverified historical town extents. Individual
ward links can still show earlier published results.

`tests/history.test.ts` covers comparison denominators and ballot fallback, missing
and partial results, new parties, identity ambiguity, zero rounding, active historical
snapshot reads and year-preserving links. Browser verification is recorded in
`.data/history/` for mobile and desktop results, keyboard navigation and browser Back.
