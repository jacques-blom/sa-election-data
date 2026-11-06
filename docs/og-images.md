# Link preview images

Every HTML page includes a 1200 × 630 PNG in its Open Graph and Twitter metadata.
`Site.astro` supplies the shared metadata; the standalone API documentation uses
the same `SocialImage.astro` component. Images are served at `/og/v4/index.png` for
the home page and `/og/v4/<public-page-path>.png` for other pages. The versioned
path gives redesigned images a fresh cache key; earlier versioned and unversioned links still work.

Cards use Counted’s bundled font, logo and colours, with the page’s purpose or
area, election year and geographic scope. Current and historical election pages,
provinces, districts, places, wards, voting districts, coalition tools, search,
the map, updates, docs and legal pages are covered. Directory places are resolved
locally; historical wards do not borrow current municipal boundaries.

The election heading is prominent, with geographic artwork on the right:
provinces for the national card, municipal ward divisions where bundled, and
individual area outlines from the geography store elsewhere. Colours are a fixed
decorative palette, never party colours or result shading. Polygon holes and
islands are preserved. Maps have no visible captions or civic-project taglines.
Cards fall back to a South Africa map when a
boundary is unavailable; historical area pages never borrow current boundaries.

## Confirmation policy

**Do not put unconfirmed results in OG images.** The current source has no verified
official declaration signal. The OG model therefore has no vote, leader, winner,
progress, party, seat or coalition-selection fields, and the renderer never reads
result payloads. This also applies to historical imports: an archive label alone
is not a verified declaration. The images remain informational until an explicit,
area-specific IEC declaration and its supporting provenance are integrated.
Neither 100% reporting nor an IEC-reported seat allocation unlocks result artwork.

This policy concerns automatic link previews. The existing user-initiated image
exports retain their ballot, provisional and hypothetical labels.

## Runtime and caching

The endpoint renders SVG to PNG using `@resvg/resvg-wasm` in the Workers runtime.
The font and logo are bundled; maps use the existing ASSETS, D1 and R2 bindings.
It needs no browser, external font service or
image-generation API. Renderer objects and image buffers are freed after rendering.
Successful PNGs use the existing public Cache API middleware with a one-hour TTL.
Directory failures return an uncached generic national card. Invalid paths return
an uncached 404.

Image URLs and cache keys exclude query strings and fragments. Search terms,
addresses, coordinates, ballot choices and selected coalition parties never enter
the image. Social platforms may keep their own previews longer than our cache TTL.

Run `node --test tests/og.test.ts`, `pnpm check` and `pnpm build`. Also fetch images
from the local Workers server to verify production-compatible asset bundling and
inspect the PNGs, especially long area names.

The static Medium and Bold fonts in `src/lib/og/fonts` come from the bundled
variable font, under `public/fonts/FONT-LICENSE.txt`. Static weights are necessary
because this SVG renderer does not apply variable font weight axes. To regenerate
them with Python FontTools installed:

```sh
python3 -m fontTools.varLib.instancer public/fonts/SpaceGrotesk.ttf wght=500 --update-name-table --output=src/lib/og/fonts/SpaceGrotesk-Medium.ttf
python3 -m fontTools.varLib.instancer public/fonts/SpaceGrotesk.ttf wght=700 --update-name-table --output=src/lib/og/fonts/SpaceGrotesk-Bold.ttf
```
