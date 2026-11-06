import type { ResultImage } from './model.ts';
import { councilPoints } from '../../seats/diagram.ts';

const ink = '#163a30', paper = '#fff9ec', muted = '#536b60', gold = '#edc66e';
export const escapeXml = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]!));
const text = (s: string, x: number, y: number, size = 24, color = ink, bold = false) =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${bold ? 700 : 500}">${escapeXml(s)}</text>`;
function wrap(s: string, max: number) {
  const lines: string[] = [];
  for (const word of s.split(/\s+/)) {
    const last = lines.length - 1;
    if (last >= 0 && lines[last]!.length + word.length + 1 <= max) lines[last] += ` ${word}`;
    else lines.push(word);
  }
  return lines;
}

export function imageDimensions(model: ResultImage) {
  return { width: 1200, height: 342 + (model.council ? 400 : 0) + model.rows.length * 90 + model.notes.flatMap(n => wrap(n, 94)).length * 28 + 60 };
}

export function resultImageSvg(model: ResultImage) {
  const { width, height } = imageDimensions(model);
  const offset = model.council ? 400 : 0;
  const footerY = 342 + offset + model.rows.length * 90;
  const swingScale = Math.max(1, ...model.rows.map(r => Math.abs(r.value ?? 0)));
  const rows = model.rows.map((r, i) => {
    const y = 338 + offset + i * 90;
    const label = wrap(r.label, 38).slice(0, 2);
    if (wrap(r.label, 38).length > 2) label[1] = label[1]!.slice(0, 34) + '…';
    const value = r.value === null ? 'Unavailable' : model.unit === 'seats' ? String(r.value)
      : model.unit === 'pp' ? Math.abs(r.value) < 0.005 ? '0.00' : `${r.value > 0 ? '+' : ''}${r.value.toFixed(2)}` : `${r.value.toFixed(2)}%`;
    const barWidth = r.value === null ? 0 : model.unit === 'pp' ? Math.abs(r.value) / swingScale * 205
      : Math.max(0, Math.min(1, r.value / (model.council?.total ?? 100))) * 410;
    const barX = model.unit === 'pp' ? 740 - ((r.value ?? 0) < 0 ? barWidth : 0) : 535;
    return `${r.highlighted ? `<rect x="32" y="${y - 33}" width="1136" height="80" rx="12" fill="#e8eddf"/>` : ''}
      ${label.map((l,j) => text(l, 52, y + j * 23, 21, ink, true)).join('')}
      <rect x="535" y="${y - 18}" width="410" height="24" rx="5" fill="#dce4d9"/>
      ${r.value === null ? '' : `<rect x="${barX}" y="${y - 18}" width="${barWidth}" height="24" rx="5" fill="${r.color}"/>`}
      ${model.unit === 'pp' ? `<path d="M740 ${y - 26} V${y + 13}" stroke="${muted}"/>` : ''}
      ${text(value, 975, y + 2, r.value === null ? 23 : 30, ink, true)}
      ${text(r.detail, 535, y + 33, 21, muted)}`;
  }).join('');
  let seats = '';
  if (model.council) {
    const council = model.council;
    const owners = council.groups.flatMap(g => Array.from({ length: g.seats }, () => g));
    seats = `<g transform="translate(232 278) scale(2.3)">${councilPoints(council.total).map((p,i) =>
      `<circle cx="${p.x}" cy="${p.y}" r="${council.total > 150 ? 3.1 : 4}" fill="${owners[i]!.selected ? owners[i]!.color : '#cdd6c9'}"/>`).join('')}</g>
      <rect x="52" y="657" width="1096" height="12" rx="6" fill="#dce4d9"/>
      ${council.selected === null ? '' : `<rect x="52" y="657" width="${1096*council.selected/council.total}" height="12" rx="6" fill="${ink}"/>`}
      <path d="M${52+1096*council.majority/council.total} 648 V679" stroke="#b17024" stroke-width="4"/>
      ${text(`${council.majority} seats for a majority${council.selected === null ? '' : ` · ${council.selected} selected`}`,52,704,24,ink,true)}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Space Grotesk">
    <rect width="1200" height="${height}" fill="${paper}"/>
    <rect width="1200" height="270" fill="${ink}"/>
    ${text('Counted.co.za', 52, 57, 30, paper, true)}${text(model.status, 710, 54, 22, gold, true)}
    ${text(model.title.length > 44 ? model.title.slice(0, 43) + '…' : model.title, 52, 126, model.title.length > 33 ? 40 : 48, paper, true)}
    ${text(model.subtitle, 52, 170, 23, '#c2d2c7')}
    ${text(model.metric, 52, 233, model.metric.length > 10 ? 29 : 38, gold, true)}${text(model.metric_label, 360, 228, 22, paper)}
    ${model.unit === 'pp' ? text('← decrease', 535, 293, 19, muted) + text('0', 734, 293, 19, muted) + text('increase → (pp)', 800, 293, 19, muted) : ''}
    ${seats}${rows}
    <path d="M52 ${footerY - 10} H1148" stroke="#cdd6c9"/>
    ${model.notes.flatMap(n => wrap(n, 94)).map((line,i) => text(line, 52, footerY + 26 + i * 28, 21, muted)).join('')}
    <rect x="0" y="${height - 10}" width="400" height="10" fill="#347e65"/><rect x="400" y="${height - 10}" width="400" height="10" fill="${gold}"/><rect x="800" y="${height - 10}" width="400" height="10" fill="#5287be"/>
  </svg>`;
}
