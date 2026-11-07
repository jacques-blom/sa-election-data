import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { unstable_dev } from 'wrangler';

test('TypeScript calculations and instruction limits run inside workerd', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'counted-chat-runtime-'));
  const config = join(directory, 'wrangler.json');
  writeFileSync(config, JSON.stringify({ name: 'counted-chat-runtime-test', compatibility_date: '2026-11-05', compatibility_flags: ['nodejs_compat'] }));
  const worker = await unstable_dev('tests/fixtures/chat-runtime.ts', { config, local: true, port: 0, inspectorPort: 0, logLevel: 'error',
    experimental: { disableExperimentalWarning: true, disableDevRegistry: true, watch: false } });
  try {
    const calculated = await worker.fetch('/');
    assert.equal(calculated.status, 200);
    assert.deepEqual(await calculated.json(), { n: 27, network: 'undefined' });
    const stopped = await worker.fetch('/loop');
    assert.equal(stopped.status, 422);
    assert.match(await stopped.text(), /interrupted/);
  } finally { await worker.stop(); rmSync(directory, { recursive: true, force: true }); }
});
