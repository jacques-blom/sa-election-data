# Responsive verification

Checked on 5 November 2026 against the local Astro preview on port 4322.

## Coverage

- Every one of the 139 sitemap URLs at 320px and 1440px, with result disclosures
  expanded: home, API documentation, map, nine provinces, two indexed places
  and 125 indexed ward pages.
- Calvinia, search and empty-search results, home search results, and the
  explicit place, ward and province not-found pages.
- Twenty ward stress cases selected from all 4,485 imported ward records using
  long party/candidate names, large vote totals and long party lists. These
  include all nine provinces and a ward with 83 party rows. Some are also in
  the sitemap; the remaining ward URLs share the same tested template.
- Representative templates at phone, tablet, desktop and landscape sizes;
  follow-up breakpoint checks at 24 widths from 320px to 1920px, including
  540/541, 680/681, 800/801 and 950/951px.
- Open share panels, all party rows, source disclosures, a selected map ward,
  and an unavailable map-result response. Short landscape checks include
  568×320 and 844×390px.

The browser checks measure page overflow, clipped figures, overlapping card
content and navigation. Wide code examples may scroll within their own block;
the page itself must fit. Expected HTTP statuses and browser runtime errors
are checked separately. Screenshots provide a visual review of the main
templates. This is browser viewport testing, not a physical-device certification.

## Fixes

The national ballot total crowded its card around 568px. From 541px to 680px,
the count cards now use two columns with reporting progress spanning the row.
The home hero also stacks at that width so its heading and search keep enough
space. Phone and larger desktop layouts retain their existing structure.

During verification, parallel result-storage changes introduced a server-only
dependency into the map's browser bundle. Number/date formatting and party
styles now live in `src/lib/places/format.ts`, with compatible re-exports from
the server result module. The map imports the browser-safe helpers directly.
No display values or party colours changed.

## Local evidence

- `.data/responsive/audit.json`: complete route/viewport audit.
- `.data/responsive/fix-verification.json`: breakpoint and selected-map checks.
- `.data/responsive/ward-cases.json`: selected data stress cases.
- `.data/responsive/`: desktop/mobile screenshots and the fixed landscape stats.

These are ignored local artifacts. The checks use the existing local Playwright
installation and Chrome. The production frontend has not been deployed as part
of this responsive review.

## Results-first follow-up (5 November 2026)

The revised result hierarchy passed 546 browser checks: all 213 municipality
pages, all nine provinces, national results, 20 ward stress cases, a town and
a voting district at 320px and 1440px; representative views also cover 360,
390, 540, 568, 640, 768, 800 and 1024px, including expanded data and Share panels.
No horizontal overflow, clipped text, detected overlaps or browser errors.
Evidence: `.data/results-home/audit.json`. This is template and municipality
coverage, not a claim to have opened every newly imported town or all 4,485 wards.

The changes preserve the parallel map/directory integration. Turnout report
ingestion remains separate; no turnout percentages were invented for layout.

## Party logos (5 November 2026)

The logo changes passed 57 browser checks against a saved production build with
local election data. National results, two provinces, a municipality, a town,
and three ward cases were checked at 320, 390, 540, 541, 768, 1024 and 1440px,
with full party lists and municipality tables expanded. The selected-ward map
panel was also checked at 390px. There were no missing displayed logos,
horizontal overflow, clipped figures, detected overlaps or browser errors.
Screenshots were reviewed after reserving space for logos beside party names.

All 516 asset checksums and IEC-ID mappings were verified, including neutral
fallbacks for independents, aggregates, unknown IDs and the three missing IEC
files. Astro/TypeScript checks, the production build, and the existing overview,
places, maps and map-interaction test files passed. Evidence is saved locally in
`.data/party-logos/audit.json` and `.data/party-logos/` screenshots.
