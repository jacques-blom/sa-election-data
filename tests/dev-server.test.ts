import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const exec = promisify(execFile);

// A tiny stand-in for Astro's daemon CLI tests process ownership and real flock
// concurrency without starting Cloudflare or touching the checkout's server.
const fakeAstro = `
import { spawn } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
const args = process.argv.slice(2);
const lock = '.astro/dev.json';
if (args.includes('stop')) {
  const state = JSON.parse(readFileSync(lock, 'utf8'));
  process.kill(state.pid, 'SIGTERM');
  for (let i=0; i<100 && existsSync(lock); i++) await sleep(20);
} else if (args.includes('--background')) {
  const child = spawn(process.execPath, [process.argv[1], ...args.filter(a=>a!=='--background')], { detached: true, stdio: 'ignore', env: process.env });
  child.unref();
  for (let i=0; i<100 && !existsSync(lock); i++) await sleep(20);
  if (!existsSync(lock)) process.exit(1);
} else {
  // Make the concurrent-start race visible if the launcher loses its lock.
  await sleep(150);
  mkdirSync('.astro', { recursive: true });
  const port = Number(args[args.indexOf('--port')+1]);
  appendFileSync('starts.log', JSON.stringify({pid:process.pid, env:{live:process.env.CLOUDFLARE_ENV, chat:process.env.CHAT_ENABLED, serp:process.env.SERPAPI_API_KEY, chatLimit:process.env.COUNTED_CHAT_TEST_LIMIT}})+'\\n');
  writeFileSync(lock, JSON.stringify({pid:process.pid, port, url:'http://127.0.0.1:'+port, background:true, startedAt:new Date().toISOString()}));
  process.on('SIGTERM', ()=>{ rmSync(lock, {force:true}); process.exit(0); });
  setInterval(()=>{}, 1000);
}
`;

test('parallel callers share one daemon; modes, restarts and lost Astro state are safe', async () => {
  const root = mkdtempSync(join(tmpdir(), 'counted-dev-test-'));
  mkdirSync(join(root, 'scripts'));
  mkdirSync(join(root, 'node_modules/astro/bin'), { recursive: true });
  copyFileSync(new URL('../scripts/dev.mjs', import.meta.url), join(root, 'scripts/dev.mjs'));
  writeFileSync(join(root, 'node_modules/astro/bin/astro.mjs'), fakeAstro);
  const run = (...args: string[]) => exec(process.execPath, [join(root, 'scripts/dev.mjs'), ...args], { cwd: root });
  const info = async () => JSON.parse((await run('--info')).stdout);
  const starts = () => readFileSync(join(root, 'starts.log'), 'utf8').trim().split('\n').map(line => JSON.parse(line));
  try {
    await Promise.all([run('--profile', 'chat'), run('--profile', 'chat'), run('--profile', 'chat')]);
    const first = await info();
    assert.equal(first.running, true);
    assert.equal(first.profile, 'chat');
    assert.equal(starts().length, 1);
    assert.deepEqual(starts()[0].env, { live: '', chat: 'true', serp: '', chatLimit: '100' });
    await run(); // An unspecified mode joins the existing chat server.
    await assert.rejects(run('--profile', 'local'), /Requested settings differ/);
    await assert.rejects(run('--port', '4398'), /Requested settings differ/);
    await assert.rejects(run('--ignore-lock'), /Unsupported option/);
    assert.equal((await info()).pid, first.pid);

    rmSync(join(root, '.astro/dev.json')); // Reproduce the sandbox-deleted lock.
    await run('--profile', 'chat');
    assert.equal((await info()).pid, first.pid);
    assert.equal(starts().length, 1);
    await run('--restart');
    assert.notEqual((await info()).pid, first.pid);
    assert.equal((await info()).profile, 'chat');
    assert.equal(starts().length, 2);

    await run('--profile', 'local', '--restart');
    assert.equal((await info()).profile, 'local');
    assert.equal(starts().length, 3);
    assert.equal(starts()[2].env.chat, undefined);
    assert.equal(starts()[2].env.chatLimit, '0');
    await run('--stop');
    assert.equal((await info()).running, false);

    // A stale record must not signal an unrelated, still-live process.
    writeFileSync(join(root, '.dev/server.json'), JSON.stringify({ pid: process.pid, url: 'http://localhost:4321', port:4321 }));
    await run('--profile', 'local');
    assert.equal(starts().length, 4);
    assert.equal((await info()).running, true);
  } finally {
    await run('--stop').catch(() => {});
    rmSync(root, { recursive: true, force: true });
  }
});
