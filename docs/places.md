# Place journeys

The D1 place directory has 213 metro/local municipalities and 13,804 named main places, from a
complete 14,039-record government layer. Unnamed/non-urban remainder records
are excluded. Subplaces/suburbs have not been imported; the Place type and
many-to-many relationships allow them later. Main-place data happens to include
some familiar suburb names; it is not a complete suburb directory.
The static district catalogue adds 44 district municipalities, each with a dedicated
page and membership links to its local municipalities. All 257 councils appear at `/councils`.

Each main-place polygon is intersected with 2026 MDB ward polygons. Only
positive-area intersections are included, with the conservative boundary-sliver
reconciliation below; a centre point never determines the scope of a town page.
Every mapped ward links to its whole-ward result, and substantive cross-council
relationships are retained when a place crosses municipal boundaries.
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
- `/places`: a browse directory linked from the homepage, search and every page's footer. Province links lead to every municipality and named place, including noindex places such as Calvinia.
- `/places?province=:slug`, `/places?municipality=:slug` and `/places?ward=:id`: alphabetical place lists with 60 entries per page. Municipal and ward scopes use every current relationship, including cross-boundary places, rather than the display municipality name. Every pagination link is server-rendered, with a distinct canonical URL for each page.
- `/2026/wards` (and each historical election year): all published wards, optionally scoped with `?province=:slug`, with links onward to voting districts. These directories also expose historical wards whose municipalities no longer have a current place page.
- `/search`: shared election-area and Google address search, metro shortcuts and a link to the full place directory. The search field becomes the header only on mobile.
- `/search?q=...`: server-rendered name/alias search with disambiguation and pagination, including a form for visitors without JavaScript; query pages are noindex.
- `/find-address`: permanent redirect to `/search` for existing links.
- `/2026/districts/:slug`: district council availability, boundary map and member local-council result rows. District council ballots and seats are unavailable in the current feed; member results are never aggregated into a district outcome.
- `/api/v1/places?q=...&page=1`: compact directory search and bounds.
- `/api/v1/places/:slug` and `/2026/places/:slug.md`: scope and current result snapshots.

Province pages link to their district municipalities, place directory and ward
directory. Municipality pages list the first 12 related towns/main places and
link to the full list; ward pages do the same for overlapping places. Towns
link back to every mapped parent municipality and its other places. These
links work without JavaScript and do not depend on submitting a search.

Municipality pages link to their parent district; metros have no district parent.
Town pages lead with municipality result cards above their ward results, each
paired with its district link where applicable. Every mapped parent is shown when a place crosses council boundaries.
These cards remain available when town results cannot load, and replace the
majority-builder callouts on town pages. Single-parent towns include both councils
in their breadcrumbs. Current district membership is not inferred for historical elections.

`/sitemap.xml` includes the public navigation pages, browse directories,
election-year landing pages, provinces, district municipalities, eligible
municipalities/main places and current wards.
It enumerates the directory on request and caches for five minutes, independent
of election result publication. A build does not need to fetch all result data.
No synthetic lastmod is emitted. Search engines decide what to index.

Main places become eligible only when the old municipality code matches one
current municipality and ward-union coverage is at least 99.5%. This is automated
validation, not a claim that every boundary has been reviewed by a person.
Places that fail these checks remain available but noindex and excluded from the
sitemap. Calvinia is explicitly excluded: its statistical extent overlaps
wards 1, 2, 6 and 7, while the Hantam report describes the town in wards 1, 2 and 6.
Noindex pages retain their scope explanation and links to useful ward pages.

### Boundary precision

`scripts/maps/place_overlaps.py` reconciles tiny foreign-council overlaps using
the same rule for every place. It has no Pretoria exception. The source council
must still exist and cover at least 99.5% of the place. All foreign overlaps
combined must occupy at most 0.01% of the place, and must lie entirely within
10 metres of both the place boundary and its intersection with the source
council. The tolerance covers the combined simplification and coordinate
rounding of the current place and ward imports. Measurements use a local metric
projection; neither source boundary is changed.

Only when every condition passes are the foreign ward and municipality
relationships removed together. Small interior enclaves, substantial crossings,
insufficient source coverage and missing or changed source councils retain their
relationships for review. Small ward intersections within the source council
are retained. Coverage uses the union of retained intersections, so overlapping
wards cannot count the same land twice. Votes are never allocated by area.

The geography build records every correction, removed ward/council ID and area
measurement in `validation.json` under `sliverCorrections`. A read-only audit
can be run before rebuilding; both scripts require Shapely and pyproj:

```sh
python -m unittest discover -s tests -p 'test_place_overlaps.py'
python scripts/maps/audit-place-overlaps.py
python scripts/maps/build-geography.py
```

The audit writes `.data/geography/overlap-audit.json`; it does not change the seed
or database. The 7 November 2026 audit of all 13,804 named places found 708
corrections meeting the rule and retained 1,164 multi-council mappings. Pretoria
retains 49 Tshwane wards, and Pietermaritzburg retains 23 Msunduzi wards. Both
pass indexing checks after reconciliation. Durban's 34 wards and Calvinia's
four wards and explicit noindex restriction are preserved. These are automated
classification results, not individual manual reviews of all 708 corrections.
Rebuilding produces local data; the regenerated directory must be loaded or
published separately before served pages or the sitemap change.

The 708 corrections were published to production D1 on 7 November 2026, with
the place search index refreshed. All affected records were read back and
matched against the prepared data. Live HTML checks confirmed Pretoria's 49
Tshwane wards and Pietermaritzburg's 23 Msunduzi wards with `index,follow`; all
708 corrected URLs appeared in the live sitemap. Durban, Calvinia and the
cross-council Groot Brakrivier page passed control checks. The backup, guarded
rollback SQL and verification reports are stored locally under
`.data/geography/sliver-publication-20261107/` (ignored by Git).

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

Internal-link tests additionally cover noindex places, multiple parents,
relationship years, duplicate names across pagination, historical wards and
packed result directories. Browser verification in `.data/internal-links/`
(ignored) covers home → Northern Cape → Hantam → Calvinia → ward → voting
district, province → district, historical ward browsing, canonical URLs,
invalid selections and 390px/1440px layouts, including navigation without
JavaScript. The local data coverage report checks every imported place through
province directory pagination and every voting district through its year's ward
directory.
