# Place journeys

The directory has 213 municipalities and 13,804 named main places, from a
complete 14,039-record government layer. Unnamed/non-urban remainder records
are excluded. Subplaces/suburbs have not been imported; the Place type and
many-to-many relationships allow them later. Main-place data happens to include
some familiar suburb names; it is not a complete suburb directory.

Each main-place polygon is intersected with 2026 MDB ward polygons. Only
positive-area intersections are included; a centre point never determines the
scope of a town page. Every mapped ward links to its whole-ward result, and all
parent municipalities are retained when a place crosses municipal boundaries.
Votes are never apportioned by overlap area or presented as a town-only total.

## Data and search

`place_directory` in D1 stores versioned place payloads and eligibility for
indexing. `place_search` uses FTS5 with accent normalization, name/alias weighting
and province/municipality disambiguation. Search and API pages are bounded at
60 rows. No national town catalogue is shipped to the browser. The small
synchronous catalogue retains generated municipalities for overview links and
existing curated aliases. `/map` resolves a selected Google area through the
canonical area API and fits its full bounds without filtering out other wards.

The DPME government main-place layer is labelled 2016, while wards are from MDB
2026. Those dates and scope limitations appear on the pages. Common renamed
places have aliases; `Port Elizaberth`, a source typo, displays as Port Elizabeth
and is searchable as Gqeberha. Its source-derived URL remains stable.

Source: https://dpmegis.dpme.gov.za/arcgis/rest/services/Adminboundaries/MapServer/7
Build/reconciliation scripts and generated validation report are documented in
[maps.md](maps.md). Source archives and large generated packs are ignored by Git.

## Pages and indexing

- `/2026/places/:slug`: municipality or statistical main-place scope.
- `/2026/wards/:id`: all 4,485 reconciled wards, with voting-district links.
- `/2026/voting-districts/:id`: district figures with separate ballots; noindex for now.
- `/search`: shared election-area and Google address search, with a browsable town/municipality directory. The search field becomes the header only on mobile.
- `/search?q=...`: server-rendered name/alias search with disambiguation and pagination, including a form for visitors without JavaScript; query pages are noindex.
- `/find-address`: permanent redirect to `/search` for existing links.
- `/2026/districts/:slug`: district scope and member municipality links; district council ballot results are unavailable in this dataset.
- `/api/v1/places?q=...&page=1`: compact directory search and bounds.
- `/api/v1/places/:slug` and `/2026/places/:slug.md`: scope and current result snapshots.

`/sitemap.xml` contains 16,558 URLs at this import: home, API, map, search,
9 provinces, 213 municipalities, 11,847 eligible main places and 4,485 wards.
It enumerates the directory on request and caches for five minutes, independent
of election result publication. A build does not need to fetch all result data.
No synthetic lastmod is emitted. Search engines decide what to index.

Main places become eligible only when the old municipality code matches one
current municipality and ward-union coverage is at least 99.5%. This is automated
validation, not a claim that every boundary has been reviewed by a person.
The other 1,957 places remain available but noindex and excluded from the
sitemap. Calvinia is explicitly excluded: its statistical extent overlaps
wards 1, 2, 6 and 7, while the Hantam report describes the town in wards 1, 2 and 6.
Noindex pages retain their scope explanation and links to useful ward pages.

## Partial results

HTML, JSON and Markdown read the active published result snapshot on request,
with 15-second cache headers. Visitors never trigger an IEC fetch. Town queries
retrieve only their overlapping wards and all parent councils; municipalities
retrieve all their wards. R2 result packs are hydrated through the existing data
layer. Source timestamps, delayed updates and provisional status are preserved.
Missing votes are not zero, PR and ward ballots stay separate, and reporting
completion is not a declaration. Unknown entities return 404; unavailable
result storage returns 503. Geographic search and result refresh are independent.

## Verification

Municipality pages put the ward map at the top of the right column, with an
inline address lookup beneath it. On phones the address lookup comes before
the results. The ward cards remain browsable without a ward-number filter.
Address suggestions are restricted to the current municipality's bounding box
when valid bounds exist, with a control to search all South Africa. These are
rectangular search bounds, not an exact municipal boundary; the selected pin is
still matched against ward polygons. Missing bounds retain country-wide search.
The national and standalone address searches also retain country-wide scope.
Verification covers metro and local-municipality bounds, widening and restoring
the scope, stale suggestions, empty/error states, nine viewport widths, mobile
dismissal, and a live Google suggestion through to the real ward result. Evidence
and the browser check are in `.data/search/municipality-*` and
`.data/search/verify-municipality.cjs` (ignored).

Every place/address search uses `PlaceSearch.astro` and Google's
[Autocomplete Data API](https://developers.google.com/maps/documentation/javascript/place-autocomplete-data),
with South African suggestions, debouncing and a token per search session.
The dropdown also fetches official election areas from `POST /api/search`:
provinces, 213 local/metro municipalities, 44 district municipalities and 4,485
wards. These labelled entries precede Google places/addresses. Local and metro
municipalities take precedence over same-named statistical towns. Queries such
as `Knysna`, `WC048`, `Knysna ward 5`, `10408005`, `Garden Route` and `DC4` match
their actual area. Ward numbers are exact; descriptions identify the municipality,
province and municipal/ward codes. Election suggestions respect the optional
local scope and remain usable during a Google outage.

After selection, `POST /api/resolve-area` matches an area by name, Google type,
province and geographic disambiguation. Gauteng opens province results;
Knysna opens the municipality even when Google classifies it as a locality;
Calvinia retains its whole-town extent. An unlisted Google area, such as Newlands
in Cape Town, opens Google's full viewport on `/map` with browsable ward boundaries.
This is labelled as a Google area view, not an electoral boundary or a suburb vote
total. Its Google place ID preserves the selection across navigation and reloads;
the name and viewport are fetched from Google again, not stored in our directory.
Ambiguous matches still offer a choice. Areas without a valid viewport show the
lookup message. Neither case falls back to a central ward. Addresses and landmarks
alone use `POST /api/locate`.
On `/map`, the Google map frames/highlights the resolved area with its results
link; the other search surfaces navigate to the canonical results page.

Raw search text is sent to Google and the election-area search endpoint in a
no-store POST, never in a public search URL. Official suggestions already have
canonical IDs and boundaries and do not need Google details or a point lookup.
The resolver receives selected Google area metadata in a separate no-store POST. Live result refreshes preserve the search and any
selected address/map. Municipality ward finders keep their optional local
search scope and switch to all South Africa.

Suggestions stay below the input above 600px. At 600px and below, focus opens a
native modal dialog with the same input, keyboard navigation and a Back control.
Back, Escape and selection restore the input and page scrolling; the dialog follows
the visual viewport when the mobile keyboard changes the available height.

Unified-search verification on 5 November 2026 covers live Google suggestions
from the homepage, directory, address finder, municipality finder and map;
Gauteng, Knysna and Calvinia canonical routing and full-area map framing; real
address-to-ward lookup; and mobile modal dismissal, scrolling and overflow.
Desktop was checked at 1440px and mobile at 390px. The 11 live checks and browser
script are recorded in `.data/search/unified-verification.json` and
`.data/search/verify-unified.cjs` (ignored). Unit coverage includes Google outages,
stale responses, unknown and ambiguous areas, municipality/town distinctions,
province routing, and Google map browsing and selection.

Expanded election autocomplete verification is recorded in
`.data/search/election-autocomplete-verification.json` and
`.data/search/verify-election-autocomplete.cjs`. It covers municipality defaults,
ward names/IDs, municipal codes, district destinations/member lists, map selection
and URL restoration, live Google address lookup, mobile use and Google outages.
Unit tests additionally check stale provider responses, Enter while suggestions
are pending, exact ward numbers and the complete district membership partition.

`pnpm check`, `pnpm test`, `pnpm build`. Tests cover active snapshots, cross-council
places, missing wards, ballot separation, FTS query syntax, disambiguation,
polygon holes, multipart polygons and edge points. Browser verification covers
address suggestions and ward handoff, fixed maps, clickable subregions, map
search, mobile layout, and SVG/HTML fallbacks. Development runs on port 4322.
