import { councilPoints } from '../seats/diagram.ts';
import { formatNumber, formatTime } from '../places/format.ts';
import { imageDescription, type ShareCard, type ShareFormat } from './model.ts';

const ink = '#163a30', paper = '#fff9ec', muted = '#b6cbbd', gold = '#edc66e';
let assets: Promise<HTMLImageElement> | undefined;
async function brandAssets() {
  assets ??= Promise.all([
    document.fonts.load('700 80px "Counted Share"'),
    document.fonts.load('500 40px "Counted Share"'),
    new Promise<HTMLImageElement>((resolve, reject) => {
      const logo = new Image();
      logo.onload = () => resolve(logo); logo.onerror = () => reject(new Error('Logo unavailable'));
      logo.src = '/brand/counted-icon.svg';
    }),
  ]).then(([, , logo]) => logo).catch(error => { assets = undefined; throw error; });
  return assets;
}

/** Draw from a captured model, never from DOM screenshots or a changing live result. */
export async function drawShareImage(canvas: HTMLCanvasElement, card: ShareCard, format: ShareFormat) {
  const logo = await brandAssets();
  canvas.width = 1080;
  canvas.height = format === 'status' ? 1920 : format === 'portrait' ? 1350 : 1080;
  canvas.setAttribute('aria-label', imageDescription(card));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Image export is unavailable in this browser.');
  const story = format === 'status', square = format === 'square';
  const top = story ? 160 : 56;
  const chartY = story ? 830 : square ? 510 : 610;
  const chartH = story ? 590 : square ? 354 : 490;
  const footer = chartY + chartH + 30;
  const text = (value: string, x: number, y: number, size: number, color = paper, weight = 500) => {
    ctx.font = `${weight} ${size}px "Counted Share", sans-serif`;
    ctx.fillStyle = color; ctx.textBaseline = 'top'; ctx.fillText(value, x, y);
  };
  const fit = (value: string, x: number, y: number, width: number, size: number, color = paper, weight = 500) => {
    while (size > 24) { ctx.font = `${weight} ${size}px "Counted Share", sans-serif`; if (ctx.measureText(value).width <= width) break; size--; }
    // Long party names are shortened visually; the full name stays in the text alternative.
    ctx.font = `${weight} ${size}px "Counted Share", sans-serif`;
    let label = value;
    while (ctx.measureText(label).width > width && label.length > 1) label = label.slice(0, -1);
    if (label !== value) label = label.slice(0, -1) + '…';
    text(label, x, y, size, color, weight);
  };
  const wrap = (value: string, x: number, y: number, width: number, size: number, color = paper) => {
    let lines: string[] = [];
    do {
      ctx.font = `700 ${size}px "Counted Share", sans-serif`; lines = [];
      for (const word of value.split(' ')) {
        const last = lines.length - 1;
        if (last < 0 || ctx.measureText(`${lines[last]} ${word}`).width > width) lines.push(word);
        else lines[last] += ` ${word}`;
      }
      if (lines.length <= 2) break;
      size -= 2;
    } while (size > 36);
    lines.slice(0, 2).forEach((line, i) => fit(line, x, y + i * size * 1.08, width, size, color, 700));
  };
  const box = (x: number, y: number, w: number, h: number, color: string, radius = 16) => {
    ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fill();
  };

  ctx.fillStyle = ink; ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Oversized brand geometry adds depth without competing with the numbers.
  ctx.save(); ctx.globalAlpha = .09; ctx.drawImage(logo, 650, top + 110, 420, 352); ctx.restore();
  box(56, top, 68, 68, paper, 18); ctx.drawImage(logo, 66, top + 14, 48, 40);
  text('Counted', 140, top + 3, 46, paper, 700);
  text('.co.za', 330, top + 19, 28, muted);
  text(`LOCAL ELECTIONS ${card.year}`, 655, top + 24, 25, muted, 700);
  fit(card.area, 56, top + 106, 968, square ? 36 : 44, gold, 500);
  wrap(card.headline, 56, top + 164, 968, square ? 68 : 90);

  const metricY = square ? 374 : story ? 580 : 416;
  fit(card.metric, 56, metricY, 480, square ? 118 : 156, paper, 700);
  fit(card.metricLabel, 540, metricY + 25, 480, 32, paper);
  fit(card.ballot, 540, metricY + 72, 480, 25, muted);
  if (card.kind === 'coalition') text('HYPOTHETICAL', 56, metricY - 33, 23, gold, 700);

  box(40, chartY, 1000, chartH, paper, 28);
  if (card.council) {
    const council = card.council;
    const arcScale = square ? 1.5 : story ? 2.05 : 1.7;
    const arcX = square ? 68 : story ? 215 : 268;
    const arcY = chartY + 24;
    const owners = council.groups.flatMap(p => Array.from({ length: p.seats }, () => p));
    ctx.save(); ctx.translate(arcX, arcY); ctx.scale(arcScale, arcScale);
    councilPoints(card.total ?? 0).forEach((point, i) => {
      const p = owners[i]; ctx.fillStyle = p?.selected ? p.color : '#d8dfd4';
      ctx.beginPath(); ctx.arc(point.x, point.y, (card.total ?? 0) > 150 ? 3.2 : 4.1, 0, Math.PI * 2); ctx.fill();
    }); ctx.restore();
    const labelX = square ? 570 : 80, labelY = square ? chartY + 38 : chartY + (story ? 350 : 292);
    text(`${council.majority} to a majority`, labelX, labelY, square ? 31 : 36, ink, 700);
    const shown = card.parties.slice(0, square ? 4 : 6);
    shown.forEach((p, i) => {
      const col = !square ? i % 3 : 0, row = !square ? Math.floor(i / 3) : i;
      const x = labelX + col * 306, y = labelY + 60 + row * (square ? 42 : 48);
      box(x, y + 5, 14, 23, p.color, 4);
      fit(`${p.short}  ${p.value}`, x + 26, y, square ? 400 : 270, 29, ink);
    });
    const remainder = card.parties.length - shown.length;
    if (remainder > 0) text(`+ ${remainder} more`, square ? labelX : 775, square ? labelY + 232 : labelY + 5, 24, '#526b5d');
    // Majority line and selected share make the threshold visible alongside the seat dots.
    const meterY = chartY + chartH - 48;
    box(80, meterY, 920, 12, '#d8dfd4', 6);
    if (council.selected) box(80, meterY, 920 * council.selected / (card.total || 1), 12, ink, 6);
    const marker = 80 + 920 * council.majority / (card.total || 1);
    ctx.fillStyle = '#b17024'; ctx.fillRect(marker - 2, meterY - 8, 4, 28);
  } else {
    const rows = card.parties.slice(0, 5);
    const rowHeight = square ? 57 : story ? 92 : 78;
    const startY = chartY + 32;
    if (!rows.length) text('No party figures published yet', 80, startY + 55, 38, ink);
    rows.forEach((p, i) => {
      const y = startY + i * rowHeight;
      fit(p.short, 80, y, 245, square ? 33 : 38, ink, 700);
      box(345, y + 4, 458, square ? 30 : 36, '#e1e6d9', 8);
      if (p.share !== null && p.share > 0) box(345, y + 4, Math.max(4, 458 * p.share / 100), square ? 30 : 36, p.color, 8);
      fit(p.share === null ? p.value === null ? '—' : formatNumber(p.value) : `${p.share.toFixed(1)}%`, 832, y, 170, square ? 35 : 40, ink, 700);
    });
    const scope = card.total === null ? 'Published votes · shares unavailable' : `${formatNumber(card.total)} valid ballots${card.parties.length > 5 ? ' · top 5 shown' : ''}`;
    fit(scope, 80, chartY + chartH - 40, 920, 24, '#526b5d');
  }
  const p = card.progress;
  fit(p ? `${formatNumber(p.completed)} / ${formatNumber(p.expected)} districts reporting` : 'Reporting progress unavailable', 56, footer, 968, 26, paper);
  fit(card.note, 56, footer + 37, 968, 24, muted);
  fit(`Source: IEC · ${formatTime(card.reportedAt)}`, 56, footer + 74, 968, 24, muted);
  text('counted.co.za', 56, footer + 114, 28, gold, 700);
  text('Explore the full picture →', 663, footer + 114, 27, paper);
  // Keep important content inside the story/status UI safe zones.
  const bandY = canvas.height - (story ? 104 : 12);
  ['#347e65', '#deb251', '#5287be', '#cd6d5d'].forEach((color, i) => {
    ctx.fillStyle = color; ctx.fillRect(i * 270, bandY, 270, 12);
  });
}
