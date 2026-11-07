// Inspect the artifacts that Wrangler deploys, without logging credential values.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseEnv } from 'node:util';

const config = JSON.parse(readFileSync('dist/server/wrangler.json', 'utf8'));
assert.equal(config.vars.CHAT_ENABLED, 'false', 'Production chat must remain disabled.');
assert.ok(config.vars.OPENROUTER_API_KEY === '', 'Production must not have an inference credential.');
assert.ok(!config.secrets?.required?.includes('OPENROUTER_API_KEY'), 'Production must not require an inference credential.');
assert.match(readFileSync('dist/client/.assetsignore', 'utf8'), /^\/__preview\/$/m,
  'Local preview artifacts must be excluded from deployment.');

// Check every value, even when different local environment files reuse a name.
const credentials = new Map();
function remember(values) {
  for (const [name, value] of Object.entries(values)) {
    if (!name.startsWith('PUBLIC_') && /KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL/i.test(name)
      && typeof value === 'string' && value.length >= 12) credentials.set(value, name);
  }
}
remember(process.env);
for (const name of readdirSync('.').filter(name => /^(?:\.env|\.dev\.vars)(?:\.|$)/.test(name))) {
  remember(parseEnv(readFileSync(name, 'utf8')));
}

function* deployedFiles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (['__preview', '.prerender', '.dev.vars', '.assetsignore'].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) yield* deployedFiles(path);
    else if (entry.isFile()) yield path;
  }
}
let checked = 0;
for (const path of deployedFiles('dist')) {
  const bytes = readFileSync(path);
  for (const [value, name] of credentials) {
    assert.ok(!bytes.includes(Buffer.from(value)), `Embedded credential ${name} in ${path}.`);
  }
  if (path.endsWith('.mjs')) {
    assert.ok(!bytes.includes(Buffer.from('https://openrouter.ai/api/v1/responses')),
      `Production inference code was not eliminated from ${path}.`);
  }
  checked++;
}
console.log(`Production safety checks passed: inference disabled; ${checked} artifacts checked for local credentials.`);
