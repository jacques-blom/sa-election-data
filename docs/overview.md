# National and province results

The national, province, municipality, town and ward templates put published
votes first. Reporting coverage appears once beside each result. Routine timestamps,
source-detail panels, manual refresh links and repeated provisional badges are omitted;
the footer identifies IEC results as provisional. Delayed or failed updates still show
a notice. Detailed provenance remains in the API and copied share summaries.

- Home: a compact heading with voting-district reporting progress, a full-width
  place/address search, then three columns: province results map, national party
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
selected Google areas use `/?q=...`; selected addresses open a Google map and
ward lookup inline. Missing Google access still permits directory suggestions.
Province filters support server-side GET requests and
immediate client-side filtering. Essential content and tables work without JS.
`/search` remains the separate place-search route owned by the place work.

The sitemap now includes all nine province URLs. Query pages are noindex and
canonicalize to the unfiltered route. Province links and content render on the
server. Search, Share and filter controls have labels and keyboard support.

Share copies a dated, provisional summary with its source and snapshot ID.
The URL opens current results; it is explicitly not an immutable snapshot link.
Native sharing is offered only when supported. No PNG export is provided here.

Display-only province paths were copied from the prototype’s
`assets/geography.js`, containing simplified MDB province geometry. Only shapes
were copied, never prototype election figures. Paths are unsuitable for address
lookup. Their source is the MDB Provinces service documented by the prototype.
The maps now use party colours: the national map reflects the highest share
shown in each province summary; province maps show provisional municipal PR
leaders. Unknown or tied results use a neutral fill. Maps are not council-outcome
trackers. Small province silhouettes on the result cards are decorative; the
home-page SVG provides native province links for pointer, touch and keyboard use.

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
