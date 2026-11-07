// One Astro daemon per checkout. Inspired by Fudge's shared dev entry point;
// Astro owns the daemon, while flock serializes starts, stops and mode changes.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const root = realpathSync(join(dirname(script), '..'));
const stateDir = join(root, '.dev');
const stateFile = join(stateDir, 'server.json');
const astroLock = join(root, '.astro/dev.json');
const log = join(root, '.astro/dev.log');
const astro = join(root, 'node_modules/astro/bin/astro.mjs');
const profiles = new Set(['live', 'local', 'chat']);
const help = `One shared Astro server per checkout (Linux; requires flock).

pnpm dev                    reuse the server, or start with live data
pnpm dev:local              start/reuse local data mode
pnpm dev:chat               start/reuse local chat mode, without SerpAPI
pnpm dev --info             read status, URL, mode and log path (sandbox-safe)
pnpm dev --logs             show the last 200 log lines (sandbox-safe)
pnpm dev --restart          restart the current mode; affects all threads
pnpm dev:chat --restart     explicitly switch the shared server to chat mode
pnpm dev --stop             stop the shared server for everyone

Starts/restarts accept --port <number> and --host <address>.
Default address: http://127.0.0.1:4321. The command exits once ready;
the server keeps running until stopped. Run lifecycle commands outside
Codex's sandbox so they can see the host's processes. Do not use --ignore-lock.`;

function json(file) {
  try { return JSON.parse(readFileSync(file, 'utf8')); }
  catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) return null;
    throw error;
  }
}

function inCodexSandbox() {
  try { return readFileSync('/proc/1/cmdline', 'utf8').split('\0')[0].includes('codex-linux-sandbox'); }
  catch { return false; }
}

function record() {
  const state = json(stateFile);
  const native = json(astroLock);
  const candidates = [state, native].filter(value => Number.isSafeInteger(value?.pid) && value.pid > 1 && typeof value.url === 'string');
  return (!inCodexSandbox() && candidates.find(isOurServer)) || candidates[0] || null;
}

function isOurServer(value) {
  try {
    const args = readFileSync(`/proc/${value.pid}/cmdline`, 'utf8').split('\0');
    return realpathSync(`/proc/${value.pid}/cwd`) === root
      && args.some(arg => /(?:\/astro\/bin\/astro\.mjs|\/\.bin\/astro)$/.test(arg))
      && args.includes('dev');
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ESRCH') return false;
    // Permission errors must never be treated as a dead process.
    throw error;
  }
}

function status() {
  const value = record();
  return {
    root,
    running: value ? (inCodexSandbox() ? null : isOurServer(value)) : false,
    ...value,
    profile: value?.profile ?? 'unknown',
    log,
    ...(value && inCodexSandbox() ? { note: 'Recorded server; process liveness cannot be verified inside the Codex sandbox.' } : {}),
  };
}

function runAstro(args, env = process.env) {
  const result = spawnSync(process.execPath, [astro, 'dev', ...args], { cwd: root, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Astro failed. See ${log}`);
}

function printServer(value, action) {
  console.log(`${action}: ${value.url} (${value.profile ?? 'unknown'} mode, PID ${value.pid})`);
  console.log(`Logs: ${log}\nStatus: pnpm dev --info`);
}

function parse(args) {
  const options = { command: 'start', locked: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--') continue;
    if (arg === '--locked') { options.locked = true; continue; }
    if (['--info', '--logs', '--restart', '--stop', '--help', '-h'].includes(arg)) {
      if (options.command !== 'start') throw new Error('Choose one lifecycle command.');
      options.command = arg === '-h' ? 'help' : arg.slice(2);
    } else if (['--profile', '--port', '--host'].includes(arg)) {
      const value = args[++i];
      if (!value || value.startsWith('-')) throw new Error(`${arg} needs a value.`);
      options[arg.slice(2)] = value;
    } else {
      throw new Error(`Unsupported option: ${arg}. Run pnpm dev --help. Extra instances and --ignore-lock are not supported.`);
    }
  }
  if (options.profile && !profiles.has(options.profile)) throw new Error('Profile must be live, local or chat.');
  if (options.port && (!/^\d+$/.test(options.port) || +options.port < 1024 || +options.port > 65535)) {
    throw new Error('Port must be an integer between 1024 and 65535.');
  }
  return options;
}

function lifecycle(options) {
  const recorded = record();
  const existing = recorded && isOurServer(recorded) ? recorded : null;
  if (options.command === 'start' && existing) {
    const mismatch = (options.profile && options.profile !== existing.profile)
      || (options.port && +options.port !== existing.port)
      || (options.host && options.host !== existing.host);
    if (mismatch) {
      printServer(existing, 'Already running');
      throw new Error('Requested settings differ. Reuse this URL, or explicitly use --restart to change the shared server for everyone.');
    }
    printServer(existing, 'Reusing');
    return;
  }
  if (existing) {
    // Restore Astro's record if a sandboxed/raw CLI invocation removed it.
    mkdirSync(dirname(astroLock), { recursive: true });
    writeFileSync(astroLock, JSON.stringify(existing));
    runAstro(['stop']);
    if (isOurServer(existing)) throw new Error('The previous server has not stopped; refusing to start another.');
  }
  rmSync(stateFile, { force: true });
  rmSync(astroLock, { force: true });
  if (options.command === 'stop') { console.log('Shared dev server stopped.'); return; }

  const profile = options.profile ?? (options.command === 'restart' && profiles.has(recorded?.profile) ? recorded.profile : 'live');
  const host = options.host ?? recorded?.host ?? '127.0.0.1';
  const port = options.port ?? recorded?.port ?? 4321;
  const env = { ...process.env, COUNTED_DEV_MANAGED: '1', CLOUDFLARE_ENV: profile === 'live' ? 'live' : '' };
  // Do not accidentally inherit a previous daemon's background marker.
  delete env.ASTRO_DEV_BACKGROUND;
  env.COUNTED_CHAT_TEST_LIMIT = profile === 'chat' ? '100' : '0';
  if (profile === 'chat') { env.CHAT_ENABLED = 'true'; env.SERPAPI_API_KEY = ''; }
  runAstro(['--background', '--host', host, '--port', String(port)], env);
  const started = json(astroLock);
  if (!started || !isOurServer(started)) throw new Error('Astro did not publish a live server record.');
  const state = { ...started, profile, host };
  writeFileSync(`${stateFile}.tmp`, JSON.stringify(state, null, 2), { mode: 0o600 });
  // Keep a second record outside .astro, which build tools can regenerate.
  // Atomic rename also keeps sandbox-safe, lock-free status reads consistent.
  renameSync(`${stateFile}.tmp`, stateFile);
  printServer(state, 'Shared server ready');
}

try {
  const args = process.argv.slice(2);
  const options = parse(args);
  if (options.command === 'help') console.log(help);
  else if (options.command === 'info') console.log(JSON.stringify(status(), null, 2));
  else if (options.command === 'logs') {
    const result = spawnSync('tail', ['-n', '200', log], { stdio: 'inherit' });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  } else {
    if (process.platform !== 'linux') throw new Error('The shared launcher currently requires Linux and flock.');
    if (inCodexSandbox()) throw new Error('Run this lifecycle command outside the Codex sandbox. Use pnpm dev --info inside it; no state has been changed.');
    mkdirSync(stateDir, { recursive: true });
    if (options.locked) lifecycle(options);
    else {
      const result = spawnSync('flock', ['--close', '--timeout', '90', join(stateDir, 'lifecycle.lock'), process.execPath, script, '--locked', ...args], { cwd: root, stdio: 'inherit' });
      if (result.error) throw new Error(`Cannot acquire the dev-server lock: ${result.error.message}. Install util-linux (flock).`);
      process.exitCode = result.status ?? 1;
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
