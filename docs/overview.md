# National and province results

The national, province, municipality, town and ward templates put published
votes first. Reporting coverage appears once beside each result. Routine timestamps,
source-detail panels, manual refresh links and repeated provisional badges are omitted;
the footer identifies IEC results as provisional. Delayed or failed updates still show
a notice. Detailed provenance remains in the API and copied share summaries.

- Home: a compact heading with voting-district reporting progress, a full-width
  place/address search, a compact council-majority strip, then three columns: province results map, national party
  vote shares and all eight metros. Metros show municipal PR leaders and their own
  reporting progress; missing, zero and tied results remain explicit. On phones,
  national results come first, then the map and metros. Province cards follow below.
  The province map is always visible,
  rendered as SVG with clickable provinces, preliminary party shares and a legend.
  It needs no JavaScript, WebGL or map-tile downloads; `/map` handles geographic exploration.
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
  never renormalize the listed parties to 100%. Cards show party shares under a shared ballot-scope label, without winner claims. Invalid or unreconciled totals suppress shares.
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

Home search combines directory matches with Google place/address suggestions.
Directory queries use a bounded, uncached `POST /api/search`, so raw addresses
do not enter search URLs. Directory matches open their place/province page;
selected Google areas open their canonical results page or map extent; selected addresses open a Google map and
ward lookup inline. Missing Google access still permits directory suggestions.
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

“Share to WhatsApp” is the primary action; “Share” is secondary. File-capable
browsers open the device share menu with the PNG and caption. Otherwise the
WhatsApp action saves the PNG and opens a text composer, explicitly asking the
user to attach the saved image. Save image, copy caption and copy link remain
available. Shared URLs preserve only the ballot selection, not address searches
or other private query parameters.

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

## Council overview

The current-election homepage includes a compact council-majority strip above
the existing map, national votes and metros. It counts single-party majorities,
councils with no overall majority, and pending/unavailable allocations, with a
party breakdown of reported majorities. Only complete reconciled IEC allocations
enter the first two counts. Estimates never become reported outcomes. Grouped
independents cannot be a single-party majority. The denominator uses the IEC's
expected municipality count when consistent with the directory; otherwise it is
explicitly limited to councils in the available results.

An always-visible “Are you a political mastermind?” banner links to `/majority-builder`,
where every current council can be searched, including pending allocations. The
invitation sits outside the council summary card and remains compact above the
existing map, votes and metro panels.

Packed live results use the existing sync milestone state, matched to the exact
source snapshot captured by the overview. Only the council milestone is selected;
the homepage does not download every municipality's R2 pack. Local/legacy D1
payloads and the already-hydrated metros use the same seat validator as council
pages. A missing milestone or snapshot mismatch stays pending/unavailable. A
database failure displays an unavailable overview without hiding other results.
Historical pages omit this current-election overview. Governing agreements are
not inferred from seats; the repository does not yet record those arrangements.

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
The current national page remains `/`. Links work without JavaScript; the native
range input updates results on input, without a document reload, while preserving
focus and scroll position. A drag creates one browser-history entry. Ballot selection
and municipality filters are retained. Nearby years preload with two concurrent reads;
in-flight requests are shared and the latest selection wins. A per-tab LRU cache
holds up to 12 pages / 8 MB for 30 minutes (15 seconds for the live count). Failed
requests keep the displayed results and can be retried.
Historical pages hide reporting progress and do not poll the live count or report
old snapshots as delayed. Place/address search stays visible but disabled, preserving
typed text until the reader returns to 2026. Keyed result containers and stable map
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
pages omit current ward/district geometry; the national overview's province outlines
are labelled as current. Town/suburb relationships are currently mapped only for
2026, so their sliders do not offer unverified historical town extents. Individual
ward links can still show earlier published results.

`tests/history.test.ts` covers comparison denominators and ballot fallback, missing
and partial results, new parties, identity ambiguity, zero rounding, active historical
snapshot reads and year-preserving links. Browser verification is recorded in
`.data/history/` for mobile and desktop results, keyboard navigation and browser Back.
