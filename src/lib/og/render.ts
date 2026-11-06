import { initWasm, Resvg } from '@resvg/resvg-wasm';
import wasm from '@resvg/resvg-wasm/index_bg.wasm';
import mediumFont from './fonts/SpaceGrotesk-Medium.ttf?inline';
import boldFont from './fonts/SpaceGrotesk-Bold.ttf?inline';
import icon from '../../../public/brand/counted-icon.svg?raw';
import type { OgPage } from './model.ts';
import { ogSvg } from './svg.ts';
import type { OgMap } from './maps.ts';

// Bundled assets: image generation requires no font fetch, browser or external API.
await initWasm(wasm);
const fonts = [mediumFont, boldFont].map(data => Uint8Array.from(atob(data.slice(data.indexOf(',') + 1)), char => char.charCodeAt(0)));

export function renderOgImage(page: OgPage, map?: OgMap) {
  return renderSvgImage(ogSvg(page, icon, map));
}

/** Shared deterministic PNG rendering for previews and requested result graphics. */
export function renderSvgImage(svg: string) {
  const renderer = new Resvg(svg, { font: { fontBuffers: fonts, defaultFontFamily: 'Space Grotesk' } });
  try {
    const image = renderer.render();
    try { return new Uint8Array(image.asPng()); }
    finally { image.free(); }
  } finally { renderer.free(); }
}
