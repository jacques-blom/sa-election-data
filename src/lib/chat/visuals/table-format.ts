import type { VisualTable } from './model.ts';

/** Shared exact-value export. Neutralise spreadsheet formulas without changing numeric cells. */
export function tableCSV(table: VisualTable, ids: string[]) {
  const columns = ids.map(id => table.columns.find(c => c.id === id)!);
  const cell = (value: string | number | null) => {
    const raw = value === null ? 'Unavailable' : typeof value === 'number' ? String(value) : (/^[\s]*[=+@\-]/.test(value) ? `'${value}` : value);
    return `"${raw.replaceAll('"', '""')}"`;
  };
  return [[...['Status', 'Scope', 'Year', 'Area / party'].map(cell), ...columns.map(c => cell(`${c.label} (${c.unit})`))].join(','),
    ...table.rows.map(r => [cell(`${table.status}${table.provisional ? ' · provisional' : ''}`), cell(table.scope), cell(table.year), cell(r.label), ...columns.map(c => cell(r.values[c.id] ?? null))].join(','))].join('\r\n');
}
