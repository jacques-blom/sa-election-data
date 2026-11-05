import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

export function migrationFiles(directory = 'migrations') {
  return readdirSync(directory).filter(name => name.endsWith('.sql')).sort().map(name => ({
    name,
    statements: readFileSync(resolve(directory, name), 'utf8').split(';').map(sql => sql.trim()).filter(Boolean),
  }));
}

// Bootstrap scripts intentionally replay idempotent migrations. SQLite lacks
// ADD COLUMN IF NOT EXISTS, so adopt columns already installed by Wrangler too.
export function addedColumn(sql: string) {
  const match = sql.replace(/--[^\n]*/g, '').trim().match(/^ALTER TABLE (\w+) ADD COLUMN (\w+)\s/i);
  return match ? { table: match[1]!, column: match[2]! } : null;
}

export async function migrateD1(db: D1Database) {
  for (const file of migrationFiles()) {
    const pending: D1PreparedStatement[] = [];
    for (const sql of file.statements) {
      const added = addedColumn(sql);
      if (added) {
        const columns = await db.prepare(`PRAGMA table_info(${added.table})`).all<{ name: string }>();
        if (columns.results.some(row => row.name === added.column)) continue;
      }
      pending.push(db.prepare(sql));
    }
    if (pending.length) await db.batch(pending);
  }
}
