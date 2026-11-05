import { createWriteStream, readFileSync, readdirSync } from 'node:fs';
import { mkdir, rename, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { once } from 'node:events';
import { DATA_DIR, openStore } from './lib/store.ts';
import { sqlLiteral } from './lib/sql.ts';

const db = openStore();
const directory = resolve(DATA_DIR, 'exports');
await mkdir(directory, { recursive: true });
const destination = resolve(directory, 'bootstrap.sql');
const temporary = `${destination}.tmp`;
const output = createWriteStream(temporary);
async function write(value: string) {
  if (!output.write(value)) await once(output, 'drain');
}
let rows = 0;
db.exec('BEGIN');
try {
  // The read transaction gives the export a consistent view. No BEGIN/COMMIT is
  // written into the SQL file: D1 manages its own import transactions.
  for (const file of readdirSync('migrations').filter((name) => name.endsWith('.sql')).sort()) {
    await write(`${readFileSync(resolve('migrations', file), 'utf8')}\n`);
  }
  for (const table of ['elections', 'snapshots', 'area_results', 'source_documents']) {
    for (const row of db.prepare(`SELECT * FROM ${table}`).iterate()) {
      const mode = table === 'snapshots' || table === 'area_results' ? 'IGNORE' : 'REPLACE';
      await write(`INSERT OR ${mode} INTO ${table} (${Object.keys(row).join(',')}) VALUES (${Object.values(row).map(sqlLiteral).join(',')});\n`);
      rows++;
    }
  }
  output.end();
  await once(output, 'finish');
  db.exec('COMMIT');
  await rename(temporary, destination);
  console.log(JSON.stringify({ file: '.data/exports/bootstrap.sql', rows, bytes: (await stat(destination)).size, uploaded: false }));
} finally {
  output.destroy();
  db.close();
}
