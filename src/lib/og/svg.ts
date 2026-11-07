import { OG_HEIGHT, OG_WIDTH, type OgPage } from './model.ts';
import { nationalOgMap, type OgMap } from './maps.ts';

const ink = '#163a30', paper = '#fff9ec', muted = '#b6cbbd', gold = '#edc66e';
const escapeXml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!);
const clean = (value: string) => value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
// Conservative glyph widths keep long municipal names inside the text column.
const width = (value: string, size: number) => [...value].reduce((sum, char) => sum + (/[ ilI.,’'!:;]/.test(char) ? .3 : /[MWmw@]/.test(char) ? .95 : /[A-Z0-9]/.test(char) ? .7 : .59), 0) * size;
function titleLines(value: string) {
  const title = clean(value);
  let size = 82;
  let lines: string[] = [];
  for (; size >= 40; size -= 2) {
    lines = [];
    for (const word of title.split(' ')) {
      const last = lines.length - 1;
      if (last < 0 || width(`${lines[last]} ${word}`, size) > 620) lines.push(word);
      else lines[last] += ` ${word}`;
    }
    if (lines.length <= 2 && lines.every(line => width(line, size) <= 620)) break;
  }
  size = Math.max(size, 40);
  const shown = lines.slice(0, 3).map(line => {
    if (width(line, size) <= 620) return line;
    let clipped = line;
    while (width(clipped, size) > 590) clipped = clipped.slice(0, -1);
    return clipped === line ? line : `${clipped}…`;
  });
  if (lines.length > 3) shown[2] += '…';
  return { lines: shown, size };
}

/** Public page identity and geographic boundaries only; no result-driven colours. */
export function ogSvg(page: OgPage, icon: string, map: OgMap = nationalOgMap()) {
  const { lines, size } = titleLines(page.title);
  const text = (value: string, x: number, y: number, fontSize: number, color = paper, weight = 500) =>
    `<text x="${x}" y="${y}" font-family="${weight === 700 ? 'Space Grotesk' : 'Space Grotesk Medium'}, sans-serif" font-size="${fontSize}" font-weight="${weight}" fill="${color}">${escapeXml(clean(value))}</text>`;
  const titleY = lines.length === 1 ? 325 : lines.length === 2 ? 292 : 260;
  const logo = icon.replace(/<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const subtitle: string[] = [];
  for (const word of clean(page.subtitle).split(' ')) {
    const last = subtitle.length - 1;
    if (last < 0 || width(`${subtitle[last]} ${word}`, 26) > 620) subtitle.push(word);
    else subtitle[last] += ` ${word}`;
  }
  const electionHeading = page.fictional ? 'FICTIONAL SCENARIO' : page.year ? `LOCAL ELECTIONS ${page.year}` : 'SOUTH AFRICAN ELECTIONS';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
    <defs><linearGradient id="og-boundary-fill" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#afd8be"/><stop offset=".55" stop-color="#7ebbc0"/><stop offset="1" stop-color="#e3c786"/>
    </linearGradient></defs>
    <rect width="1200" height="630" fill="${ink}"/>
    <g font-family="Space Grotesk Medium, sans-serif">
      <rect x="58" y="48" width="62" height="62" rx="16" fill="${paper}"/>
      <g transform="translate(68 61) scale(.038)">${logo}</g>
      ${text('Counted', 136, 94, 44, paper, 700)}
      ${text('.co.za', 318, 94, 28, muted)}
      ${text(electionHeading, 60, 198, page.year ? 44 : 37, gold, 700)}
      ${lines.map((line, i) => text(line, 56, titleY + i * size * 1.12, size, paper, 700)).join('')}
      ${subtitle.slice(0, 2).map((line, i) => text(line, 60, 449 + i * 31, 26, muted)).join('')}
      <path d="M60 518H1140" stroke="#3e5c4f"/>
      ${text(page.fictional ? 'Satirical game · Invented political scenarios' : 'South African local election coverage', 60, 565, 24, muted)}
      <text x="1140" y="565" text-anchor="end" font-family="Space Grotesk, sans-serif" font-size="26" font-weight="700" fill="${gold}">counted.co.za</text>
    </g>
    <svg x="742" y="155" width="412" height="322" viewBox="${escapeXml(map.viewBox)}" preserveAspectRatio="xMidYMid meet">
      ${map.paths.map(p => `<path d="${escapeXml(p.d)}" fill="${escapeXml(p.fill)}" fill-rule="evenodd" stroke="${ink}" stroke-width="1.2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`).join('')}
    </svg>
    <rect y="618" width="300" height="12" fill="#347e65"/>
    <rect x="300" y="618" width="300" height="12" fill="#deb251"/>
    <rect x="600" y="618" width="300" height="12" fill="#5287be"/>
    <rect x="900" y="618" width="300" height="12" fill="#cd6d5d"/>
  </svg>`;
}
