export function sqlLiteral(value: unknown): string {
  if (value === null) return 'NULL';
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string' && !value.includes('\0')) return `'${value.replaceAll("'", "''")}'`;
  throw new Error('Unsupported SQL export value');
}
