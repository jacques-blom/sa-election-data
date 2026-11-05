import { coalitionSelection, type CoalitionData } from './coalition.ts';
import { seatLabel } from './allocation.ts';
import { formatTime } from '../places/format.ts';
import { councilPoints } from './diagram.ts';

export function drawCoalitionImage(canvas: HTMLCanvasElement, data: CoalitionData, ids: Iterable<string>, size: string) {
  const selection = coalitionSelection(data, ids);
  canvas.width = 1080;
  canvas.height = size === 'status' ? 1920 : size === 'portrait' ? 1350 : 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Image export is unavailable in this browser.');
  ctx.fillStyle = '#f7f5ea'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const text = (value: string, x: number, y: number, pixels = 26, color = '#163a30', weight = 500) => {
    ctx.font = `${weight} ${pixels}px "Space Grotesk", sans-serif`; ctx.fillStyle = color; ctx.fillText(value, x, y);
  };
  const fit = (value: string, x: number, y: number, width: number, pixels = 40) => {
    let font = pixels;
    while (font > 16) { ctx.font = `500 ${font}px "Space Grotesk", sans-serif`; if (ctx.measureText(value).width <= width) break; font--; }
    text(value, x, y, font);
  };
  text('COUNTED · HYPOTHETICAL COALITION', 54, 65, 23, '#61725b', 600);
  fit(data.name, 54, 128, 972, 48);
  text(seatLabel(data), 54, 176, 28, data.status === 'estimated' ? '#815b24' : '#61725b');
  text(`${selection.total} / ${data.total}`, 54, 286, 86);
  text('council seats selected', 54, 327, 25, '#61725b');
  const owners = data.parties.flatMap(p => Array.from({ length: p.seats }, () => p));
  const chosen = new Set(selection.parties.map(p => p.id));
  ctx.save(); ctx.translate(620, 200); ctx.scale(1.18, 1.18);
  councilPoints(data.total).forEach((point, i) => {
    ctx.fillStyle = chosen.has(owners[i]!.id) ? owners[i]!.color : '#dce2d5';
    ctx.beginPath(); ctx.arc(point.x, point.y, data.total > 150 ? 3.2 : 4.1, 0, Math.PI * 2); ctx.fill();
  }); ctx.restore();
  fit(selection.status, 54, 433, 972, 34);
  text(`${data.majority} seats needed for a majority`, 54, 478, 26, '#61725b');
  const footerTop = canvas.height - 210;
  const columns = selection.parties.length > 12 ? 2 : 1;
  const rows = Math.max(1, Math.ceil(selection.parties.length / columns));
  const rowHeight = Math.min(58, (footerTop - 530) / rows);
  selection.parties.forEach((p, i) => {
    const col = Math.floor(i / rows), row = i % rows, width = 972 / columns;
    const x = 54 + col * width, y = 536 + row * rowHeight;
    ctx.fillStyle = p.color; ctx.fillRect(x, y - 15, 9, 22);
    fit(p.short, x + 22, y + 3, width - 110, Math.min(27, rowHeight * .65));
    text(String(p.seats), x + width - 75, y + 3, Math.min(28, rowHeight * .65));
  });
  ctx.strokeStyle = '#d5ddca'; ctx.beginPath(); ctx.moveTo(54, footerTop); ctx.lineTo(1026, footerTop); ctx.stroke();
  text(data.status === 'estimated' ? 'Current-count estimate. Unfinished wards can change seats.' : 'IEC-reported seats. Results remain provisional.', 54, footerTop + 37, 22, '#815b24');
  text('Hypothetical selection. No governing agreement implied.', 54, footerTop + 72, 22, '#61725b');
  text(`IEC result time: ${formatTime(data.source.reportedAt)}`, 54, footerTop + 109, 20, '#61725b');
  text('Source: results.elections.org.za · counted.co.za', 54, footerTop + 142, 20, '#61725b');
  text(data.status === 'estimated' ? 'Reported ward wins fixed; candidate-list limits are not modelled.' : 'Council seats include ward and PR councillors.', 54, footerTop + 175, 18, '#61725b');
}
