import type { VisualSpec } from './catalog.ts';
import type { ResolvedChart, VisualTable } from './model.ts';
import { changeValue } from '../../history/change.ts';
import { tableCSV } from './table-format.ts';
import { append, value, paint, badge, type VisualDOM } from './dom.ts';
import { createMapView } from './map-view.ts';
type Element = VisualSpec['elements'][string];

export function renderExtra(node: Element, chart: ResolvedChart, dom: VisualDOM): HTMLElement | undefined {
  const { el, button, heading, areaLink } = dom;
  function ranked(node: Extract<Element, { type: 'RankedBars' }>, table: VisualTable) {
    const p = node.props, column = table.columns.find(c => c.id === p.value_column)!;
    const card = heading(p.title, table, p.size, node.type), list = el('ol', undefined, 'cv-ranked');
    let ascending = false, expanded = false; const highlight = new Set(p.highlight_ids);
    const controls = el('div', undefined, 'cv-toolbar');
    const sort = button('Highest first', () => { ascending = !ascending; update(); });
    const more = button('Show more', () => { expanded = !expanded; update(); });
    const count = el('span', undefined, 'cv-note'); count.setAttribute('aria-live', 'polite');
    append(controls, sort, more); append(card, controls, list, count);
    const values = table.rows.map(r => Number(r.values[column.id] ?? 0)), min = Math.min(0, ...values), max = Math.max(1, ...values);
    function update() {
      const rows = [...table.rows].sort((a, b) => {
        const av = a.values[column.id], bv = b.values[column.id];
        if (av === null) return bv === null ? a.label.localeCompare(b.label) : 1;
        if (bv === null) return -1;
        return (Number(av) - Number(bv)) * (ascending ? 1 : -1) || a.label.localeCompare(b.label);
      });
      const shown = rows.slice(0, expanded ? 50 : p.top_n); list.replaceChildren();
      for (const row of shown) {
        const li = el('li'), v = row.values[column.id];
        const b = button('', () => { highlight.has(row.id) ? highlight.delete(row.id) : highlight.add(row.id); update(); }, 'cv-rank-row');
        b.setAttribute('aria-pressed', String(highlight.has(row.id))); b.title = `Highlight ${row.label}`;
        b.style.setProperty('--party', paint(row.color));
        const label = el('span', row.label, 'cv-rank-label'), amount = el('strong', value(v, column.unit));
        const track = el('span', undefined, 'cv-rank-track'), fill = el('span');
        fill.style.width = `${typeof v === 'number' ? Math.abs(v) / (max - min) * 100 : 0}%`; fill.style.marginLeft = `${((typeof v === 'number' && v < 0 ? v : 0) - min) / (max - min) * 100}%`; if (min < 0) track.style.setProperty('--zero', `${-min / (max - min) * 100}%`); if (typeof v === 'number' && v < 0) fill.dataset.negative = 'true';
        append(track, fill); append(b, label, amount, track); append(li, b);
        if (row.href) append(li, areaLink('Results ↗', row.href)); append(list, li);
      }
      sort.textContent = ascending ? 'Lowest first' : 'Highest first';
      more.hidden = rows.length <= p.top_n; more.textContent = expanded ? 'Show less' : `Show ${Math.min(50, rows.length)}`;
      count.textContent = `${shown.length} of ${rows.length} · ${column.label}${column.unit === 'seats' ? ' (seats)' : ''}`;
    }
    update(); return card;
  }

  function comparison(node: Extract<Element, { type: 'Comparison' }>, chart: ResolvedChart) {
    const [before, after] = chart.columns, p = node.props;
    const card = heading(p.title, after!, p.size, node.type);
    if (before!.status !== after!.status) append(card, el('p', `${before!.label}: ${before!.status} → ${after!.label}: ${after!.status}`, 'cv-note'));
    const labels = el('div', undefined, 'cv-comparison-head'); append(labels, el('span', 'Party'), el('span', before!.label), el('span', after!.label), el('span', 'Change')); append(card, labels);
    for (const id of p.party_ids) {
      const a = before!.parties.find(p => p.id === id), b = after!.parties.find(p => p.id === id);
      const row = el('div', undefined, 'cv-comparison-row'), name = el('strong', (b ?? a)!.short);
      name.title = (b ?? a)!.name; name.style.setProperty('--party', paint((b ?? a)!.color));
      const delta = a?.value != null && b?.value != null ? changeValue(b.value - a.value, after!.unit === 'percent' ? 'pp' : 'seats') : null;
      append(row, name, el('span', value(a?.value, before!.unit)), el('span', value(b?.value, after!.unit)), el('strong', delta?.text ?? '—', 'cv-delta'));
      row.title = delta?.description ?? 'Change unavailable'; append(card, row);
    }
    append(card, el('p', `Changes in ${after!.unit === 'percent' ? 'percentage points' : 'seats'}. Missing values are unavailable.${before!.status !== 'hypothetical' && after!.status !== 'hypothetical' && before!.year !== after!.year ? ' Same-area comparison; boundaries may have changed.' : ''}`, 'cv-note'));
    return card;
  }

  function dataTable(node: Extract<Element, { type: 'DataTable' }>, table: VisualTable) {
    const p = node.props, card = heading(p.title, table, p.size, node.type), toolbar = el('div', undefined, 'cv-toolbar');
    const input = el('input'); input.type = 'search'; input.placeholder = 'Filter rows'; input.setAttribute('aria-label', `Filter ${p.title}`);
    const columns = p.column_ids.map(id => table.columns.find(c => c.id === id)!);
    let query = '', page = 0, sortId = columns.find(c => c.unit !== 'text')?.id ?? '', ascending = !sortId;
    const pageSize = p.size === 'compact' ? 5 : 10;
    const wrap = el('div', undefined, 'cv-data-scroll'), grid = el('table'), head = el('thead'), hr = el('tr'), body = el('tbody');
    grid.setAttribute('aria-label', p.title); wrap.tabIndex = 0; wrap.setAttribute('role', 'region'); wrap.setAttribute('aria-label', 'Scrollable data table');
    const headings = [{ id: '', label: 'Area / party' }, ...columns];
    const headers = headings.map(c => {
      const th = el('th'); th.scope = 'col'; const b = button(c.label, () => { ascending = sortId === c.id ? !ascending : true; sortId = c.id; page = 0; update(); }); append(th, b); append(hr, th); return { th, id: c.id };
    });
    append(head, hr); append(grid, head, body); append(wrap, grid);
    const nav = el('div', undefined, 'cv-toolbar cv-pagination'), status = el('span', undefined, 'cv-note'); status.setAttribute('aria-live', 'polite');
    const prev = button('Previous', () => { page--; update(); }), next = button('Next', () => { page++; update(); });
    const download = button('Download CSV', () => {
      const blob = new Blob(['\uFEFF' + tableCSV(table, p.column_ids)], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob), a = el('a'); a.href = url; a.download = 'counted-data.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    input.addEventListener('input', () => { query = input.value.toLocaleLowerCase(); page = 0; update(); });
    append(toolbar, input, download); append(nav, status, prev, next); append(card, toolbar, wrap, nav);
    function update() {
      const rows = table.rows.filter(r => `${r.label} ${columns.map(c => r.values[c.id] ?? '').join(' ')}`.toLocaleLowerCase().includes(query));
      rows.sort((a, b) => {
        const av = sortId ? a.values[sortId] : a.label, bv = sortId ? b.values[sortId] : b.label;
        if (av == null) return bv == null ? 0 : 1; if (bv == null) return -1;
        return (typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))) * (ascending ? 1 : -1);
      });
      headers.forEach(({ th, id }) => th.setAttribute('aria-sort', id === sortId ? ascending ? 'ascending' : 'descending' : 'none'));
      body.replaceChildren();
      for (const row of rows.slice(page * pageSize, (page + 1) * pageSize)) {
        const tr = el('tr'), label = el('th'); label.scope = 'row'; append(label, areaLink(row.label, row.href)); append(tr, label);
        for (const c of columns) append(tr, el('td', value(row.values[c.id], c.unit))); append(body, tr);
      }
      if (!rows.length) { const tr = el('tr'), td = el('td', 'No matching rows'); td.colSpan = columns.length + 1; append(tr, td); append(body, tr); }
      prev.disabled = page === 0; next.disabled = (page + 1) * pageSize >= rows.length;
      status.textContent = rows.length ? `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, rows.length)} of ${rows.length}` : '0 rows';
    }
    update(); return card;
  }

  function timeline(node: Extract<Element, { type: 'GovernmentTimeline' }>, chart: ResolvedChart) {
    const data = chart.timeline!, p = node.props, card = heading(p.title, data, p.size, node.type);
    append(card, el('p', data.cutoff ? `Source coverage through ${data.cutoff}. Open-ended records are not confirmation of today's government.` : 'Hypothetical administrations · not a record of events', 'cv-note'));
    const list = el('ol', undefined, 'cv-timeline'); let all = false;
    const more = button('Show older administrations', () => { all = !all; update(); });
    const events = [...data.events].reverse();
    function update() {
      list.replaceChildren();
      for (const e of events.slice(0, all ? events.length : 3)) {
        const row = el('li');
        append(row, el('p', `${e.approximate ? 'Around ' : ''}${e.start} — ${e.end ?? (data.status === 'hypothetical' ? 'open-ended scenario' : 'no end recorded')}`, 'cv-timeline-date'), el('h4', e.title),
          el('p', e.members.length ? e.members.join(' + ') : 'Membership not established', 'cv-timeline-members'));
        if (e.supporters.length) append(row, el('p', `Outside supporters: ${e.supporters.join(' + ')}`, 'cv-note'));
        if (e.note || e.sources?.length) {
          const detail = el('details', undefined, 'cv-timeline-details'); append(detail, el('summary', 'Details & sources'));
          if (e.note) append(detail, el('p', e.note)); e.sources?.forEach(s => append(detail, areaLink(s.title, s.url))); append(row, detail);
        }
        append(list, row);
      }
      more.hidden = events.length <= 3; more.textContent = all ? 'Show latest three' : `Show all ${events.length} administrations`;
    }
    if (!events.length) append(card, el('p', 'No dated administrations in this dataset.', 'cv-note'));
    append(card, list, more); update(); return card;
  }


  if (node.type === 'RankedBars') return ranked(node, chart.table!);
  if (node.type === 'Comparison') return comparison(node, chart);
  if (node.type === 'DataTable') return dataTable(node, chart.table!);
  if (node.type === 'GovernmentTimeline') return timeline(node, chart);
  if (node.type === 'Metric') {
    const meta = chart.table ?? chart.columns[0]!, metric = chart.metric!, card = heading(node.props.title, meta, node.props.size, node.type);
    if (node.props.data.kind === 'council' && ['surplus', 'selected'].includes(node.props.data.calculation)) card.querySelector('.cv-badge')!.textContent = `Hypothetical coalition · ${badge(meta).toLowerCase()} seats`;
    append(card, el('p', value(metric.value, metric.unit), 'cv-metric-value'), el('p', metric.unit === 'seats' ? `${metric.detail} · seats` : metric.detail, 'cv-note')); return card;
  }
  if (node.type === 'ResultsMap') {
    const data = chart.table!, card = heading(node.props.title, data, node.props.size, node.type);
    const view = createMapView(card, data, node.props.value_column, dom);
    if (dom.interactive) {
      const mount = () => { void import('./map-render.ts').then(m => m.loadResultsMap(view, data)).catch(view.fail); };
      if (typeof IntersectionObserver !== 'undefined') {
        const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { observer.disconnect(); mount(); } }, { rootMargin: '100px' }); observer.observe(card);
      } else if (typeof window !== 'undefined') mount();
    }
    const links = el('details', undefined, 'cv-controls'); append(links, el('summary', 'Area values & links'));
    const list = el('ul', undefined, 'cv-map-links');
    const column = data.columns.find(c => c.id === node.props.value_column)!;
    data.rows.forEach(r => { const li = el('li'); append(li, areaLink(r.label, r.href), el('span', value(r.values[column.id], column.unit))); append(list, li); });
    append(links, list); append(card, links); return card;
  }
}
