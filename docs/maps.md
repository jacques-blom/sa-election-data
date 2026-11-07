# Maps

`/map` uses Google Maps JavaScript with our electoral boundaries in Google Data layers.
All place/address inputs share `PlaceSearch.astro` and Google Places Autocomplete
(New): the homepage, map, directory, address finder and municipality ward finder.
Google suggestions are restricted to South Africa; municipality inputs retain
an optional local search scope and a switch to all South Africa. Official
municipality, district and ward suggestions share the same dropdown; selecting
them uses their canonical IDs and full boundaries directly.

Selections are classified before lookup. Provinces resolve to province results;
cities, towns, municipalities and suburbs resolve by name, type, province and,
when needed, geographic disambiguation. `/api/resolve-area` returns canonical
area URLs and whole-area bounds/geometry. On `/map`, the full boundary is framed
and highlighted with a link to area results. Other search surfaces navigate to
the canonical results page. Unknown or ambiguous areas are never converted to
the ward at their centre. Only addresses and landmarks use `POST /api/locate`.
`?district=DC4` restores a selected district; `?ward=10408005` restores a ward.

District metadata is in `src/lib/maps/district-index.json`; its 44 boundaries are
static GeoJSON under `public/maps/geometry/districts-2026/`. The geometry API
redirects district requests to those assets. Run `scripts/maps/import-districts.py`
with Shapely installed after the regular geography build to regenerate them.
It archives MDB's `DistrictMunicipalities2026_15Mar2026` and the district membership
fields in `LocalMunicipalities2026_15Mar2026`. Districts are identified by DC codes
because the source category field calls them B. Membership is reconciled against
our current IEC municipality catalogue, excluding the known legacy FS164 record.
The 44 districts partition all 205 current local municipalities; metros are not
district members. Display outlines are unions of the reconciled municipal
geometries, simplified by 0.001 degrees with topology preserved, so the legacy
record cannot expand a district into today's Mangaung area. No district election
results are inferred by summing local or ward ballots.

The Google explorer retains progressive electoral detail: provinces below zoom
5, municipalities below zoom 8, then wards. Provinces and municipalities each
use one versioned static GeoJSON overview, retained across camera changes;
municipal bounds come from the administrative catalogue. `GET /api/v1/map/areas`
returns ward metadata for the viewport, capped at 250. Wider views retain
municipalities with a prompt to zoom in. `GET /api/v1/map/boundaries?ids=...`
loads up to 40 full ward polygons per batch, with three batches in flight. Each
batch uses one D1 query and coalesces adjacent geometry-pack records into bounded
R2 range reads. Compressed and decoded byte budgets bound request memory use.
The sidebar and result colours start loading before geometry finishes, and each
completed batch is drawn immediately. Panning preserves polygons still in view;
the browser caches 400 ward geometries and 24 viewport metadata responses.
Stale camera responses cannot repaint the map. Failed batches leave successfully
loaded polygons visible and can be retried by moving the map.

Party fills, ballot-specific legends, keyboard-accessible area buttons and ward
result panels remain available. Visible leaders and selected ward results
refresh every 30 seconds while visible and online. Missing data stays neutral.
The URL retains the camera, selected ward or canonical selected area. Address
text and Google place IDs are never put in URLs or saved to the catalogue.

Address selections on every search surface open the matching ward's result page
directly. Multiple matches offer a ward choice; missing matches and lookup errors
keep the search available. Only the selected Google place ID, ward ID and an
expiry timestamp are retained in sessionStorage for one hour, scoped to the tab.
The destination fetches fresh address details once for its address label and map.
Neither the address nor its coordinates enter URLs, shared links or browser storage.
If storage is blocked, navigation still opens ward results without the address context.

Result-page previews use MapLibre/Protomaps for our own electoral data. A ward
opened from an address instead uses Google Maps in the existing map slot, with
the ward outline and address pin. Its heading includes the address and a link to
the map. The address and pin are hidden while viewing historical results; live
result refreshes preserve both. Other wards never inherit the selection.
The following archive sections describe those previews and the underlying
boundary datasets; selected Google addresses are displayed on Google maps.

## Basemap archive and serving

The pinned basemap is a bbox extract of the official Protomaps build:

- Source: `https://build.protomaps.com/20261105.pmtiles`, basemap schema 4.15.2.
- Bounds: west 16, south -35, east 33, north -22. Zooms 0–14; higher zooms
  overzoom these tiles. Covers mainland South Africa and some surroundings.
- File: `.data/maps/south-africa-20261105.pmtiles` (ignored by Git).
- Size: 496,205,208 bytes.
- SHA-256: `70c26ae64a14307079b766cfb6b2099c0ec3755bdddda56855198d97ae129125`.

The `MAP_TILES` R2 binding serves the archive through
`/maps/basemap/south-africa-20261105.pmtiles`. The route supports bounded,
open-ended and suffix HTTP byte ranges, HEAD, ETag/304 and 416 responses. R2
streams just the requested bytes; a normal map visit does not download the
whole archive. The versioned file has a one-year immutable cache header. A new
basemap must use a new key in `src/lib/maps/config.ts`.

Protomaps sprites and Latin/extended-Latin font blocks are checked into
`public/maps/`, so the browser uses our own origin for all map requests. Other
scripts/languages need additional glyph blocks. MapLibre's worker is bundled
using Vite's `?worker&url` import, required by MapLibre 6.

## National ward archive

`wards-2026-20261105.pmtiles` contains the `wards` vector layer at zooms 3–12
(with overzoom above 12), built with Tippecanoe 2.79.0. Source polygons are
simplified for display; approximate point lookup does not establish registration. No feature
coalescing is used. Party shading is applied at runtime, independently of the
boundary archive. Tiny polygons become visible as you zoom.

- Size: 15,814,325 bytes.
- SHA-256: `741e08f33f9b9588e5cf87001e1f8746343ed37a4ac7178fa7610cb42a9bdb55`.
- R2 key: `wards-2026-20261105.pmtiles`, served by the same allowlisted range
  route as the basemap.
- `src/lib/maps/ward-index.json` is server-only metadata for full-ward bounds,
  names, province and stable IDs. It is not shipped to the map client.
- The importer validates pagination, uniqueness and the upstream feature count.
  All 4,485 IDs were reconciled with the active local D1 2026 ward records:
  no missing result IDs or boundary IDs.

With [Tippecanoe](https://github.com/felt/tippecanoe) installed:

```sh
pnpm maps:import-wards
pnpm maps:tiles
pnpm maps:load-wards
```

Set `ELECTION_TIPPECANOE` to a binary path if it is not on PATH. The import
writes source GeoJSON under ignored `.data/maps/` and the server metadata index.
Bump `WARDS_KEY` and the build script's output key when publishing a changed
boundary snapshot, because range responses are cached immutably.

## Local setup

Use the [official PMTiles CLI](https://docs.protomaps.com/pmtiles/cli) (this
extract used 1.31.2), then load it into local R2:

```sh
mkdir -p .data/maps
pmtiles extract https://build.protomaps.com/20261105.pmtiles \
  .data/maps/south-africa-20261105.pmtiles \
  --bbox=16,-35,33,-22 --maxzoom=14 --download-threads=4
pnpm maps:load
pnpm dev:local --host 0.0.0.0
```

`maps:load` uses local bindings and multipart upload; it never uploads to a
remote bucket. It shares `.wrangler/state/v3` with the dev server. A fresh clone needs this archive
loaded separately. Local D1 results also need the
result data import (`pnpm data:load`).

The source build may eventually be removed from Protomaps' rolling archive.
Keep the extracted file, or make a new versioned extract and update the key,
manifest and hash together. See [basemap downloads](https://docs.protomaps.com/basemaps/downloads).

## Deployment

The frontend configuration binds `MAP_TILES` to `sa-election-map-tiles`.
Provision that bucket and upload all five versioned map objects (listed below) under their filenames before
publishing the frontend. The bucket does not need public access: the Worker
reads it through the binding. The 496 MB archive needs an S3-compatible
multipart uploader (e.g. rclone); do not put it in Worker static assets or
assume a local R2 upload also uploaded it remotely.

The map bucket and archives have **not** been provisioned remotely by this
change. Existing result ingestion/deployment is independent. The map route
returns 503 if its archive is missing; SSR result pages continue to work.

## Sources and attribution

- [Protomaps basemaps](https://github.com/protomaps/basemaps), using
  `@protomaps/basemaps` 5.7.2 styles and v4 light sprite assets from
  `https://protomaps.github.io/basemaps-assets/sprites/v4/`.
- [OpenStreetMap attribution and ODbL](https://www.openstreetmap.org/copyright).
  Attribution starts collapsed behind the (i) control on every MapLibre map,
  including embedded previews, and can be opened or closed with that control.
- Noto Sans Regular, Medium and Italic glyphs from
  `https://protomaps.github.io/basemaps-assets/fonts/`; font OFL is included at
  `public/maps/fonts/LICENSE.txt`.
- [MDBWards2026](https://services7.arcgis.com/oeoyTUJC8HEeYsRB/arcgis/rest/services/MDBWards2026/FeatureServer/0),
  queried in ordered batches of 500 until all 4,485 wards are imported. The
  original Cape Town/Hantam preview polygons can still be rebuilt with
  `pnpm maps:boundaries`. That script also copies the reviewed Calvinia source
  from the sibling `election-research/2026-11-05/geography/calvinia.json` archive.
- [Stats SA main places hosted by DPME](https://dpmegis.dpme.gov.za/arcgis/rest/services/Adminboundaries/MapServer/7),
  main place 366005. See [place scope and limitations](places.md).

## Verification

`pnpm check`, `pnpm test`, `pnpm build`. Tests cover range edge cases and unique
geographic IDs in addition to existing ballot/provenance checks. Browser checks
cover labels, actual polygon clicks, ward dropdowns, shared links, mobile layout
and failed/unavailable result states. The static result pages continue to work
without downloading the map renderer.

## Nationwide fixed maps and address search (November 2026)

Result pages now use lazy MapLibre previews over the real Protomaps basemap.
The renderer is dynamically imported only when a preview approaches the viewport.
The home page uses a separate, always-visible SVG province map with preliminary
party shares and native result links, so it does not download this renderer or tiles.
The MapLibre previews are configured
with `interactive: false`. Dragging, wheel zoom, touch zoom and keyboard panning
are disabled on these previews; the page can scroll normally. Subregions can
be selected, with equivalent HTML links. `/map` remains the interactive view.

Hovering an electoral area highlights its boundary and shows its name. On touch
screens, tapping opens a persistent tooltip with a **View results** link; tapping
the area itself does not navigate. The tooltip closes with its close button,
Escape, a tap outside the area/map, or a camera move. Desktop clicks on preview
maps still open results directly. The interactive ward map also shows these
tooltips while retaining its selected-ward results panel and gold selection.

- Home: a static, clickable SVG of provinces; province pages: municipality previews.
- Municipality pages: wards; town pages: overlapping wards and a dashed place outline.
- Ward pages: voting districts; district pages: the district outline.
- Current result colours/captions are supplied by each page; boundaries alone
  do not imply a declared winner.

Additional pinned R2 objects are `administrative-2026-20261105-v3.pmtiles`,
`voting-districts-2026-20261105.pmtiles` and `geometry-20261105-v3.pack`. The first
contains 9 provinces and 213 reconciled municipalities; the second contains
23,696 voting districts. The gzip record pack serves individual GeoJSON outlines
by bounded byte ranges through `/api/v1/geometry/:level/:id`. D1 stores offsets
and bounding boxes. All ward and district identifiers and district-to-ward
parents were checked against the local IEC directory.

Government sources are MDB's `Provinces`,
`LocalMunicipalities2026_15Mar2026`, `VotingDistricts2026_Final` and
`MDBWards2026` ArcGIS services. The municipal source has 214 records, including legacy code FS164, which is
absent from the current IEC directory. Administrative outlines are therefore
unions of the reconciled 2026 wards grouped by current municipality/province;
this ensures that displayed boundaries match the actual result scope.
A 0.0001-degree closing tolerance removes metre-wide display seams introduced
by independently rounded ward coordinates. Large holes are preserved. This
display cleanup never changes ward point lookup or town-to-ward intersections.

Rebuild with Python + Shapely and Tippecanoe:

```sh
python3 scripts/maps/import-main-places.py
python3 scripts/maps/import-page-geography.py
python3 scripts/maps/build-geography.py
python3 scripts/maps/build-province-preview.py
python3 scripts/maps/build-municipality-preview.py
python3 scripts/maps/build-page-tiles.py
node scripts/maps/load-geography.ts
```

The loader applies `0004_geography.sql` to local D1 and uploads the three
additional objects to local R2. It never writes remote bindings. Import before
starting a new frontend version; use a new object version when geography changes.
The province overview is checked into `public/maps/geometry/` and deployed with
the app's static assets. Its generator uses the reconciled administrative data,
preserves all nine province IDs and simplifies display geometry by 0.01 degrees.
Update its versioned filename and `PROVINCES_URL` together when rebuilding for a
new boundary snapshot. It is not used for address or ward containment.
The municipal overview similarly preserves all 213 electoral IDs, simplifies
display geometry by 0.002 degrees with topology preserved, and is kept below
1 MB. The generator checks validity and limits area change to 0.5%; full selected
outlines and address containment continue to use the original geometry API.
`/api/locate` accepts only a small POST JSON body containing `lat` and `lng`.
It checks candidate ward polygons, including holes and multipart geometry.
The response is no-store. These simplified geographic boundaries and Google
map pins are approximate; this is not a registration or voting-station service.

Google Maps JavaScript is loaded on demand by the shared search loader, and on
entry to `/map`. Google place details complete the autocomplete session once.
All search surfaces distinguish whole areas from street addresses and landmarks.
Whole-area selection uses the canonical area resolver; addresses use a Google
map and coordinate-to-ward lookup. Google content is not persisted in the public
directory or displayed on the Protomaps previews.

Configure `PUBLIC_GOOGLE_MAPS_API_KEY` in ignored `.env` and the frontend build
environment. Enable Maps JavaScript API and Places API (New), restrict the key
to these APIs and the site's HTTP referrers, including `http://localhost:4321/*`
for development. This browser key is intentionally public in the built client;
restriction is essential. Rebuild when changing it. Public privacy and terms
pages are linked beside the input. The widget retains Google's attribution.

Production needs all five map objects, `0004_geography.sql` and the generated
place/geometry rows, plus the configured browser key and production referrer.
Local import and verification do not provision these remote resources.
