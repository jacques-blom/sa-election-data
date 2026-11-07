import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

// Production preparation only: slice generated drawings, register their pivots,
// nearest-neighbour resize, and pack lossless atlases. No invented art frames.
const source = new URL('../assets/coalition-animation/', import.meta.url);
const output = new URL('../public/images/coalition/', import.meta.url);
async function frames(name, columns, rows) {
  const file = new URL(name, source).pathname;
  const { width, height, hasAlpha } = await sharp(file).metadata();
  if (!hasAlpha) throw new Error(`${name} needs real transparency`);
  const result = [];
  for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
    const left = Math.round(col * width / columns), top = Math.round(row * height / rows);
    const cell = await sharp(file).extract({ left, top, width: Math.round((col + 1) * width / columns) - left, height: Math.round((row + 1) * height / rows) - top }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let x0 = cell.info.width, y0 = cell.info.height, x1 = 0, y1 = 0;
    for (let y = 0; y < cell.info.height; y++) for (let x = 0; x < cell.info.width; x++) {
      if (cell.data[(y * cell.info.width + x) * 4 + 3] >= 128) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    }
    if (x1 <= x0 || y1 <= y0) throw new Error(`Empty sprite: ${name} ${row}/${col}`);
    result.push({ cell, bounds: { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 } });
  }
  return result;
}

async function pack(groups, columns, size, filename, contentHeight, baseline) {
  const layers = [];
  let row = 0;
  for (const group of groups) {
    // One scale per character across its sequence prevents size changes.
    const scale = Math.min(contentHeight / Math.max(...group.map(f => f.bounds.height)), (size - 6) / Math.max(...group.map(f => f.bounds.width)));
    for (const [col, frame] of group.entries()) {
      const width = Math.max(1, Math.round(frame.bounds.width * scale));
      const height = Math.max(1, Math.round(frame.bounds.height * scale));
      const input = await sharp(frame.cell.data, { raw: frame.cell.info }).extract(frame.bounds).resize(width, height, { kernel: 'nearest' }).png().toBuffer();
      layers.push({ input, left: col * size + Math.round((size - width) / 2), top: row * size + baseline - height });
    }
    row++;
  }
  const palette = await sharp({ create: { width: columns * size, height: row * size, channels: 4, background: '#00000000' } }).composite(layers).png({ palette: true, colours: 96, dither: 0 }).toBuffer();
  const atlas = await sharp(palette).webp({ lossless: true }).toBuffer();
  if (filename) await writeFile(new URL(filename, output), atlas);
  return atlas;
}
const rowsOf = (items, columns) => Array.from({ length: items.length / columns }, (_, row) => items.slice(row * columns, (row + 1) * columns));
await pack(rowsOf([...(await frames('portraits-a.png', 4, 4)), ...(await frames('portraits-b.png', 4, 4))], 4), 4, 48, 'leaders-expressions-v2.webp', 44, 46);
await pack(rowsOf([...(await frames('walk-a.png', 8, 4)), ...(await frames('walk-b.png', 8, 4))], 8), 8, 64, 'leaders-walk-v2.webp', 54, 58);
// Photo-referenced Mashaba correction. Replace only his row: the other seven
// leaders retain their original pixels, including their original palette.
async function replaceRow(base, replacement, cellSize, filename, index = 6) {
  const original = await sharp(new URL(base, output).pathname).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const info = { ...original.info, height: Math.max(original.info.height, (index + 1) * cellSize) };
  const data = Buffer.alloc(info.width * info.height * 4);
  original.data.copy(data);
  const row = await sharp(replacement).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (row.info.width !== info.width || row.info.height !== cellSize) throw new Error('Replacement row dimensions do not match');
  row.data.copy(data, index * cellSize * info.width * 4);
  await sharp(data, { raw: info }).webp({ lossless: true }).toFile(new URL(filename, output).pathname);
}
const mashaba = await frames('mashaba-v3.png', 4, 3);
await replaceRow('leaders-expressions-v2.webp', await pack([mashaba.slice(0, 4)], 4, 48, null, 44, 46), 48, 'leaders-expressions-v3.webp');
await replaceRow('leaders-walk-v2.webp', await pack([mashaba.slice(4)], 8, 64, null, 54, 58), 64, 'leaders-walk-v3.webp');
// Updated national cameos plus the additional Johannesburg DA cameo (row 8).
for (const [name, index] of [['ghl', 1], ['gayton', 5], ['corne', 7], ['zille', 8]]) {
  const drawings = await frames(`${name}-v4.png`, 4, 3);
  const baseVersion = index === 1 ? 'v3' : 'v4';
  await replaceRow(`leaders-expressions-${baseVersion}.webp`, await pack([drawings.slice(0, 4)], 4, 48, null, 44, 46), 48, 'leaders-expressions-v4.webp', index);
  await replaceRow(`leaders-walk-${baseVersion}.webp`, await pack([drawings.slice(4)], 8, 64, null, 54, 58), 64, 'leaders-walk-v4.webp', index);
}
await pack(rowsOf(await frames('speaker.png', 4, 3), 4), 4, 64, 'speaker-frames-v2.webp', 58, 61);
const secretary = await frames('speaker-secretary-v3.png', 4, 3);
// The new sheet has registered feet. Use one crop across ALL moods so a lifted
// wing or gavel cannot recenter or resize her body between animation frames.
const left = Math.min(...secretary.map(f => f.bounds.left));
const top = Math.min(...secretary.map(f => f.bounds.top));
const bounds = { left, top,
  width: Math.max(...secretary.map(f => f.bounds.left + f.bounds.width)) - left,
  height: Math.max(...secretary.map(f => f.bounds.top + f.bounds.height)) - top };
await pack(rowsOf(secretary.map(frame => ({ ...frame, bounds })), 4), 4, 64, 'speaker-frames-v3.webp', 58, 61);
const chamber = await sharp(new URL('chamber.png', source).pathname).resize(256, 96, { kernel: 'nearest' }).png({ palette: true, colours: 64, dither: 0 }).toBuffer();
await sharp(chamber).webp({ lossless: true }).toFile(new URL('council-chamber-v2.webp', output).pathname);
try {
  await pack([await frames('delegate.png', 4, 2)], 8, 64, 'delegate-walk-v2.webp', 54, 58);
} catch (error) {
  if (process.argv.includes('--allow-missing-delegate') && String(error).includes('Input file is missing')) console.warn('Delegate pending');
  else throw error;
}
console.log('Prepared coalition animation atlases.');
