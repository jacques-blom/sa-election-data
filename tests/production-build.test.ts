import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const check = fileURLToPath(new URL('../scripts/check-production.mjs', import.meta.url));

test('production artifact validation rejects credentials and enabled inference without exposing secrets', () => {
  const directory = mkdtempSync(join(tmpdir(), 'counted-production-'));
  const write = (path: string, contents: string) => writeFileSync(join(directory, path), contents);
  const config = (enabled = 'false', key = '', required: string[] = []) => write('dist/server/wrangler.json',
    JSON.stringify({ vars: { CHAT_ENABLED: enabled, OPENROUTER_API_KEY: key }, secrets: { required } }));
  const run = () => spawnSync(process.execPath, [check], { cwd: directory, encoding: 'utf8' });
  try {
    mkdirSync(join(directory, 'dist/server'), { recursive: true });
    mkdirSync(join(directory, 'dist/client'), { recursive: true });
    config();
    write('dist/client/.assetsignore', '/__preview/\n');
    write('dist/server/entry.mjs', 'export default {};');
    assert.equal(run().status, 0);
    config('true');
    assert.notEqual(run().status, 0);
    config('false', 'example-development-credential');
    const configured = run();
    assert.notEqual(configured.status, 0);
    assert.ok(!configured.stderr.includes('example-development-credential'));
    config('false', '', ['OPENROUTER_API_KEY']);
    assert.notEqual(run().status, 0);
    config();
    write('dist/client/.assetsignore', '');
    assert.notEqual(run().status, 0);
    write('dist/client/.assetsignore', '/__preview/\n');
    write('.env', 'OPENROUTER_API_KEY=example-development-credential\n');
    write('.env.example', 'OPENROUTER_API_KEY=\n');
    write('dist/server/entry.mjs', 'const environment = "example-development-credential";');
    const embedded = run();
    assert.notEqual(embedded.status, 0);
    assert.match(embedded.stderr, /Embedded credential OPENROUTER_API_KEY/);
    assert.ok(!embedded.stderr.includes('example-development-credential'));
    write('dist/server/entry.mjs', 'fetch("https://openrouter.ai/api/v1/responses");');
    assert.notEqual(run().status, 0);
    write('dist/server/entry.mjs', 'export default {};');
    assert.equal(run().status, 0);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
