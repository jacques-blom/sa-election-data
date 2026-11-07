import type { VisualTable } from './model.ts';
import { append, value, type VisualDOM } from './dom.ts';
import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson';
export type Shapes = FeatureCollection<Polygon | MultiPolygon, { id: string; name: string }>;
// Mercator coordinates; the SVG viewBox fits the requested areas, not the page.
const project = ([lon, lat]: number[]) => [lon! * Math.PI / 180, -Math.log(Math.tan(Math.PI / 4 + lat! * Math.PI / 360))];
export function createMapView(card: HTMLElement, data: VisualTable, initial: string, dom: VisualDOM) {
  const { el, svg, select, button, areaLink } = dom;
  const status = el('p', `2026 MDB boundaries${data.status === 'hypothetical' ? ' · hypothetical values' : ''}. Tap an area to inspect.`, 'cv-note');
  append(card, status);
  let columnId = initial, selected = data.rows[0]!.id;
  const controls = el('div', undefined, 'cv-map-controls'), readout = el('div', undefined, 'cv-map-readout'); readout.setAttribute('aria-live', 'polite');
  const metric = select('Colour by', data.columns.filter(c => c.unit !== 'text').map(c => ({ id: c.id, label: c.label })), initial, id => { columnId = id; update(); });
  const picker = select('Inspect area', data.rows.map(r => ({ id: r.id, label: r.label })).sort((a, b) => a.label.localeCompare(b.label)), selected, id => { selected = id; update(); });
  const chart = svg('svg', { class: 'cv-map-svg', role: 'img', 'aria-label': 'Area values; use the area selector for keyboard access' });
  const plot = el('div', undefined, 'cv-map-plot'), legend = el('p', undefined, 'cv-map-legend'), marks = new Map<string, SVGPathElement>();
  const loading = el('p', 'Loading map…', 'cv-map-loading'); loading.setAttribute('role', 'status');
  let zoom = 1, width = 0, height = 0;
  const fit = () => { if (width) chart.setAttribute('viewBox', `${width / 2 - width / (2 * zoom)} ${height / 2 - height / (2 * zoom)} ${width / zoom} ${height / zoom}`); };
  const zooms = el('div', undefined, 'cv-map-zoom');
  append(zooms, button('Zoom in', () => { zoom = Math.min(4, zoom * 1.5); fit(); }), button('Fit map', () => { zoom = 1; fit(); }));
  append(controls, metric, picker); append(plot, chart, loading, zooms); card.insertBefore(controls, status); card.insertBefore(plot, status); card.insertBefore(legend, status); card.insertBefore(readout, status);
  const column = () => data.columns.find(c => c.id === columnId)!;
  function update() {
    const c = column(), numbers = data.rows.map(r => r.values[c.id]).filter((v): v is number => typeof v === 'number');
    const low = Math.min(0, ...numbers), high = Math.max(1, ...numbers);
    for (const row of data.rows) {
      const mark = marks.get(row.id), v = row.values[c.id]; if (!mark) continue;
      const t = typeof v === 'number' ? (v - low) / (high - low) : 0;
      mark.setAttribute('fill', typeof v !== 'number' ? '#dce1d5' : `rgb(${Math.round(224 - 196 * t)} ${Math.round(234 - 130 * t)} ${Math.round(215 - 135 * t)})`);
      mark.setAttribute('stroke', row.id === selected ? '#141e1c' : '#fffdf6'); mark.setAttribute('stroke-width', row.id === selected ? '2.2' : '.6');
      mark.querySelector('title')!.textContent = `${row.label}: ${value(v, c.unit)}`;
    }
    const row = data.rows.find(r => r.id === selected)!;
    readout.replaceChildren(el('strong', row.label), el('span', `${c.label}: ${value(row.values[c.id], c.unit)}`), areaLink('View results ↗', row.href));
    for (const option of picker.querySelectorAll('option')) option.selected = option.value === selected;
    legend.textContent = numbers.length ? `${value(low, c.unit)} — ${value(high, c.unit)} · Grey: unavailable` : 'No values available · Grey: unavailable';
    chart.setAttribute('aria-label', `${data.scope}. ${c.label}. ${data.status}. ${data.year}. 2026 boundaries.`);
  }
  update();
  function draw(shapes: Shapes) {
    const ids = new Set(data.rows.map(r => r.id));
    const matches = shapes.features.filter(f => ids.has(String(f.properties.id)));
    if (!matches.length) throw new Error('No matching boundaries');
    const areas = data.geography === 'province' ? shapes.features : matches;
    const paths = areas.map(f => ({ id: String(f.properties.id), rings: (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).flatMap(p => p.map(ring => ring.map(project))) }));
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const path of paths) for (const ring of path.rings) for (const [x, y] of ring) { minX = Math.min(minX, x!); maxX = Math.max(maxX, x!); minY = Math.min(minY, y!); maxY = Math.max(maxY, y!); }
    const scale = Math.min(560 / (maxX - minX), 300 / (maxY - minY));
    for (const area of paths) {
      const d = area.rings.map(ring => ring.map(([x, y], i) => `${i ? 'L' : 'M'}${((x! - minX) * scale + 20).toFixed(2)},${((y! - minY) * scale + 20).toFixed(2)}`).join(' ') + 'Z').join(' ');
      const path = svg('path', { d, 'fill-rule': 'evenodd', 'vector-effect': 'non-scaling-stroke', fill: '#e8eddf', stroke: '#fffdf6', 'stroke-width': '.6' }); append(path, svg('title'));
      if (ids.has(area.id)) { path.addEventListener('click', () => { selected = area.id; update(); }); marks.set(area.id, path); }
      else { path.style.cursor = 'default'; path.querySelector('title')!.textContent = 'Outside selected data'; }
      append(chart, path);
    }
    width = (maxX - minX) * scale + 40; height = (maxY - minY) * scale + 40;
    fit(); update(); loading.hidden = true;
  }
  return { card, draw, fail() { loading.textContent = 'Map unavailable. Area values and links are below.'; } };
}
export type MapView = ReturnType<typeof createMapView>;
