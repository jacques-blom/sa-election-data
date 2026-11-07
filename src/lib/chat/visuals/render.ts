import { councilPoints } from '../../seats/diagram.ts';
import { historyFlow } from '../../history/flow.ts';
import { safeLink } from '../contracts.ts';
import type { VisualArtifact, VisualColumn, VisualParty, VisualMeta } from './model.ts';
import { renderExtra } from './extra-render.ts';
import { createDOM } from './dom.ts';

function append(parent: Node, ...children: Node[]) { children.forEach(child => parent.appendChild(child)); }

const number = (n: number) => new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 1 }).format(n);
const value = (n: number | null, unit: string) => n === null ? 'Unavailable' : `${number(n)}${unit === 'percent' ? '%' : ''}`;
function paint(color: string) { return /^#[a-f0-9]{6}$/i.test(color) ? color : '#627875'; }
function badge(column: VisualMeta) {
  return column.status === 'hypothetical' ? 'Hypothetical' : column.status === 'unavailable' ? 'Unavailable'
    : `${column.status === 'estimated' ? 'Estimated' : 'Reported'}${column.provisional ? ' · provisional' : ''}`;
}
export function renderVisual(artifact: VisualArtifact, options: { document?: Document; interactive?: boolean; serialize?: boolean; hydrateRoot?: HTMLElement } = {}): HTMLElement {
  const document = options.document ?? globalThis.document;
  const dom = createDOM(document, options);
  const { el, svg } = dom;
  const button = (text: string, fn: () => void, className?: string) => dom.button(text, fn, className ?? '');
  function chartHeading(title: string, columns: VisualColumn[], size: string) {
    const card = el('section', undefined, 'cv-chart'); card.dataset.size = size;
    const header = el('header'); append(header, el('h3', title), el('p', columns[0]!.scope, 'cv-scope'));
    const status = el('p', [...new Set(columns.map(badge))].join(' / '), 'cv-badge');
    if (columns.some(c => c.notes.some(n => /delay|stale/i.test(n)))) append(status, document.createTextNode(' · Updates delayed'));
    append(header, status); append(card, header); return card;
  }

  function council(title: string, column: VisualColumn, initial: string[], size: string) {
    const card = chartHeading(title, [column], size); card.dataset.component = 'CouncilScenario';
    const total = column.total!, majority = Math.floor(total / 2) + 1;
    const selection = new Set(initial);
    const chart = svg('svg', { viewBox: '0 0 320 170', role: 'img', class: 'cv-council' });
    const marker = svg('line', { x1: 160, x2: 160, y1: 3, y2: 112, class: 'cv-majority-marker', 'aria-hidden': 'true' });
    const markerLabel = el('p', `${majority} for majority`, 'cv-majority-label');
    const circles = councilPoints(total).map(point => {
      const dot = svg('circle', { cx: point.x.toFixed(1), cy: point.y.toFixed(1), r: total > 150 ? 3.2 : 4.1 });
      const title = svg('title'); append(dot, title); append(chart, dot); return { dot, title };
    });
    append(chart, marker);
    const score = el('p', undefined, 'cv-score'), description = el('p', undefined, 'cv-verdict');
    description.setAttribute('aria-live', 'polite');
    const members = el('p', undefined, 'cv-members');
    const details = el('details', undefined, 'cv-controls'); append(details, el('summary', 'Adjust parties'));
    const choices = el('div', undefined, 'cv-party-choices');
    const controls = column.parties.filter(p => p.selectable && p.value! > 0).map(p => {
      const choice = button(`${p.short} · ${p.value}`, () => { selection.has(p.id) ? selection.delete(p.id) : selection.add(p.id); update(); });
      choice.title = p.name; choice.style.setProperty('--party', paint(p.color)); append(choices, choice); return { choice, p };
    });
    const reset = button('Reset selection', () => { selection.clear(); initial.forEach(id => selection.add(id)); update(); }, 'cv-reset');
    append(details, choices, reset, el('p', 'Changes here are local to this view. Reset restores the saved scenario.', 'cv-note'));
    const grouped = column.parties.filter(p => !p.selectable).reduce((n, p) => n + p.value!, 0);
    if (grouped) append(details, el('p', `${grouped} grouped seats cannot be selected as one party.`, 'cv-note'));
    function update() {
      const picked = column.parties.filter(p => selection.has(p.id)), seats = picked.reduce((n, p) => n + p.value!, 0);
      // Selected seats fill the same left-to-right positions in every scenario.
      // Keep the source party order within each block, and for the whole council.
      const ordered = [...picked, ...column.parties.filter(p => !selection.has(p.id))];
      const owners = ordered.flatMap(p => Array.from({ length: p.value! }, () => p));
      circles.forEach(({ dot, title }, index) => {
        const p = owners[index]!;
        dot.setAttribute('fill', paint(p.color));
        dot.setAttribute('opacity', !selection.size || selection.has(p.id) ? '1' : '.16');
        dot.dataset.partyId = p.id;
        title.textContent = `${p.name}: ${p.value} seats`;
      });
      controls.forEach(({ choice, p }) => choice.setAttribute('aria-pressed', String(selection.has(p.id))));
      score.textContent = selection.size ? `${seats} / ${total} seats` : `${total} council seats`;
      members.textContent = selection.size ? picked.map(p => p.short).join(' + ') : `${column.year} · ${column.label === String(column.year) ? 'Whole council' : column.label}`;
      description.textContent = selection.size ? `${seats >= majority ? `${seats - majority} above` : `${majority - seats} short of`} the ${majority}-seat majority` : `${majority} seats for a majority`;
      description.dataset.majority = String(selection.size > 0 && seats >= majority);
      chart.setAttribute('aria-label', `${title}. ${score.textContent}. ${description.textContent}. ${members.textContent}`);
      card.dataset.selectedSeats = String(seats);
    }
    append(card, chart, markerLabel, score, members, description, el('p', 'Selected coalitions are hypothetical; seat arithmetic does not establish an agreement.', 'cv-note'), details);
    update(); return card;
  }

  function support(title: string, columns: VisualColumn[], requested: string[], size: string) {
    const card = chartHeading(title, columns, size); card.dataset.component = 'PartySupport';
    const unit = columns[0]!.unit;
    const identities = new Map<string, VisualParty>();
    columns.forEach(c => c.parties.forEach(p => { if (!identities.has(p.id)) identities.set(p.id, p); }));
    const ids = requested.length ? requested : [...identities.keys()].sort((a, b) => {
      const peak = (id: string) => Math.max(...columns.map(c => c.total ? (c.parties.find(p => p.id === id)?.value ?? 0) / c.total : 0));
      return peak(b) - peak(a);
    }).slice(0, 5);
    const series = ids.map(id => identities.get(id)!);
    const ceiling = unit === 'percent' ? 100 : Math.max(1, ...columns.map(c => c.total ?? 0));
    // Geometry is shared with VoteHistory. Its numeric column keys are positions
    // here, so a factual and hypothetical column can both refer to the same year.
    const model = { series, ceiling, available: columns.some(c => c.total !== null), columns: columns.map((c, index) => {
      const values = series.map(p => ({ ...p, value: c.parties.find(row => row.id === p.id)?.value ?? null }));
      const available = c.total !== null, remainder = available ? Math.max(0, c.total! - values.reduce((n, p) => n + (p.value ?? 0), 0)) : 0;
      return { year: index, available, total: c.total, ceiling, majority: unit === 'seats' && available ? Math.floor(c.total! / 2) + 1 : null,
        values, segments: [...values.filter(p => p.value !== null && p.value > 0),
          ...(remainder > 1e-8 ? [{ id: 'remainder', name: 'Other and unlisted', short: 'Other', color: '#b1baa8', value: remainder }] : [])] };
    }) };
    const geometry = historyFlow(model);
    let active = columns.length - 1, highlighted: string | null = null;
    const legend = el('div', undefined, 'cv-legend'); legend.setAttribute('aria-label', 'Highlight a party');
    const legendButtons = series.map(p => {
      const b = button(p.short, () => { highlighted = highlighted === p.id ? null : p.id; update(); });
      b.title = p.name; b.style.setProperty('--party', paint(p.color)); append(legend, b); return { b, id: p.id };
    });
    append(legend, el('span', 'Other', 'cv-other'));
    const chart = svg('svg', { viewBox: `0 -5 ${geometry.width} ${geometry.height + 10}`, preserveAspectRatio: 'none', class: 'cv-support-svg', 'aria-hidden': 'true' });
    for (const t of [0, .5, 1]) append(chart, svg('line', { x1: 0, x2: geometry.width, y1: t * geometry.height, y2: t * geometry.height, stroke: '#dce1d3' }));
    const marks: { node: SVGElement; id: string }[] = [];
    for (const band of geometry.bands) {
      const path = svg('path', { d: band.path, fill: paint(band.color), opacity: '.38' }); append(chart, path); marks.push({ node: path, id: band.id });
    }
    const markers: SVGElement[] = [];
    for (const column of geometry.columns) {
      for (const p of column.nodes.filter(p => p.known && p.height > 0)) {
        const rect = svg('rect', { x: column.x, y: p.top, width: geometry.barWidth, height: p.height, fill: paint(p.color) }); append(chart, rect); marks.push({ node: rect, id: p.id });
      }
      const marker = svg('rect', { x: column.x - 4, y: -4, width: geometry.barWidth + 8, height: geometry.height + 8, rx: 4, fill: 'none', stroke: '#163a30', 'stroke-width': 1.5 });
      markers.push(marker); append(chart, marker);
      if (column.majority) append(chart, svg('line', { x1: column.x, x2: column.x + geometry.barWidth,
        y1: geometry.height - column.majority / ceiling * geometry.height, y2: geometry.height - column.majority / ceiling * geometry.height,
        stroke: '#163a30', 'stroke-width': 2, 'stroke-dasharray': '3 2' }));
    }
    const plot = el('div', undefined, 'cv-support-plot'); append(plot, chart);
    const axis = el('p', `0–${number(ceiling)} ${unit === 'percent' ? '%' : 'seats'}${unit === 'seats' ? ' · dashed marks show majorities' : ''}`, 'cv-axis');
    const labels = el('div', undefined, 'cv-column-labels'); labels.style.setProperty('--count', String(columns.length));
    const columnButtons = columns.map((c, index) => {
      const b = button(c.label, () => { active = index; update(); }); append(b, el('small', c.status === 'hypothetical' ? 'Hypothetical' : c.status === 'unavailable' ? 'Unavailable' : c.status === 'estimated' ? 'Estimate' : c.provisional ? 'Provisional' : String(c.year)));
      b.setAttribute('aria-label', `${c.label}: ${badge(c)}`); append(labels, b); return b;
    });
    const readout = el('div', undefined, 'cv-readout'); readout.setAttribute('aria-live', 'polite');
    function update() {
      legendButtons.forEach(({ b, id }) => b.setAttribute('aria-pressed', String(id === highlighted)));
      marks.forEach(({ node, id }) => node.setAttribute('opacity', highlighted && id !== highlighted ? '.08' : node.tagName.toLowerCase() === 'path' ? '.38' : '1'));
      markers.forEach((marker, index) => marker.setAttribute('opacity', index === active ? '1' : '0'));
      columnButtons.forEach((b, index) => b.setAttribute('aria-pressed', String(index === active)));
      const c = columns[active]!;
      readout.replaceChildren(el('strong', `${c.label} · ${badge(c)}`));
      if (c.total === null) { append(readout, el('p', 'Comparable data unavailable.')); return; }
      if (unit === 'seats') append(readout, el('p', `${c.total} seats · ${Math.floor(c.total / 2) + 1} for a majority`, 'cv-note'));
      const rows = el('div', undefined, 'cv-readout-values');
      for (const p of series.filter(p => !highlighted || highlighted === p.id)) {
        const row = el('div'); row.style.setProperty('--party', paint(p.color));
        append(row, el('span', p.short), el('strong', value(c.parties.find(r => r.id === p.id)?.value ?? null, unit))); append(rows, row);
      }
      append(readout, rows);
    }
    const details = el('details', undefined, 'cv-controls'); append(details, el('summary', 'View exact values'));
    const tableWrap = el('div', undefined, 'cv-table-scroll'), table = el('table'), head = el('thead'), tr = el('tr');
    append(tr, el('th', 'Party')); columns.forEach(c => append(tr, el('th', c.label))); append(head, tr); append(table, head);
    const body = el('tbody');
    for (const p of identities.values()) {
      const row = el('tr'); append(row, el('th', p.name)); columns.forEach(c => append(row, el('td', value(c.total === null ? null : c.parties.find(v => v.id === p.id)?.value ?? null, unit)))); append(body, row);
    }
    append(table, body); append(tableWrap, table); append(details, tableWrap);
    append(card, el('p', columns.find(c => c.status !== 'hypothetical')?.basis ?? (unit === 'percent' ? 'Hypothetical support (%)' : 'Hypothetical seats'), 'cv-note'),
      legend, axis, plot, labels, readout, el('p', 'Bands connect the same party across columns; they do not show individual voters moving. Missing values stay unavailable; Other includes remaining and unlisted values.', 'cv-note'), details);
    update(); return card;
  }

/** The same tree and default state are used on the server and in the browser. */
  const root = el('div', undefined, 'chat-visual'); root.dataset.visualVersion = String(artifact.version);
  function render(key: string): HTMLElement {
    const node = artifact.spec.elements[key]!;
    if (node.type === 'CouncilScenario') return council(node.props.title, artifact.charts[key]!.columns[0]!, node.props.selected_party_ids, node.props.size);
    if (node.type === 'PartySupport') return support(node.props.title, artifact.charts[key]!.columns, node.props.party_ids, node.props.size);
    const extra = artifact.charts[key] && renderExtra(node, artifact.charts[key]!, dom); if (extra) return extra;
    if (node.type === 'Text') return el('p', node.props.text, 'cv-text');
    const layout = el(node.type === 'Card' ? 'section' : 'div', undefined, `cv-${node.type.toLowerCase()}`);
    if (node.type === 'Card') append(layout, el('h3', node.props.title));
    if (node.type === 'Grid') layout.style.setProperty('--columns', String(node.props.columns));
    node.children.forEach(child => append(layout, render(child))); return layout;
  }
  if (artifact.version !== 1) { append(root, el('p', 'This saved visual uses an unsupported version.')); return root; }
  try { append(root, render(artifact.spec.root)); }
  catch (error) { if (options.hydrateRoot) throw error; root.replaceChildren(el('p', 'This visual could not be displayed. The saved answer is still available.')); return root; }
  const columns = Object.values(artifact.charts).flatMap(c => [...c.columns, ...(c.table ? [c.table] : []), ...(c.timeline ? [c.timeline] : [])]);
  const details = el('details', undefined, 'cv-evidence'); append(details, el('summary', 'Sources & assumptions'));
  const seen = new Set<string>();
  for (const column of columns) {
    const signature = JSON.stringify(column); if (seen.has(signature)) continue; seen.add(signature);
    const section = el('section'); append(section, el('h4', `${column.scope} · ${column.label} · ${badge(column)}`));
    append(section, el('p', column.basis));
    column.notes.forEach(note => append(section, el('p', note)));
    const sources = new Map(column.sources.map(source => [source.url, source]));
    for (const source of sources.values()) {
      const href = safeLink(source.url); if (!href) continue;
      const a = el('a', source.title); a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; append(section, a);
    }
    if (column.provenance) {
      const raw = el('details'); append(raw, el('summary', 'Snapshot details'), el('pre', JSON.stringify(column.provenance, null, 2))); append(section, raw);
    }
    append(details, section);
  }
  append(root, details); dom.finish(); return root;
}
