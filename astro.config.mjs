// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { createRequire } from 'node:module';
import { SITE_ORIGIN } from './src/lib/site.ts';

// Keep machine-specific development hosts in ignored local configuration.
if (existsSync('.env')) loadEnvFile('.env');
const allowedHosts = [process.env.DEV_ALLOWED_HOSTS, process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS].filter(Boolean).join(',').split(',').map(host => host.trim()).filter(Boolean);

export default defineConfig({
	site: SITE_ORIGIN,
	server: {
		allowedHosts,
	},
	output: 'server',
	adapter: cloudflare({ imageService: 'passthrough' }),
	integrations: [{
		name: 'counted-shared-dev',
		hooks: {
			'astro:config:setup': ({ command }) => {
				if (command === 'dev' && process.env.COUNTED_DEV_MANAGED !== '1') {
					throw new Error('Use pnpm dev (or pnpm dev:local / pnpm dev:chat) to share this checkout\'s server. Do not start Astro directly or use --ignore-lock.');
				}
			},
		},
	}],
	// The .wasm suffix lets Cloudflare's Vite plugin bundle a static WASM module.
	vite: {
		// A busy port is an error, never a reason to start another preview elsewhere.
		server: { strictPort: true },
		define: { 'import.meta.env.COUNTED_LOCAL_SNAPSHOT': JSON.stringify(process.env.CLOUDFLARE_ENV !== 'live'),
			'import.meta.env.COUNTED_CHAT_TEST_LIMIT': JSON.stringify(Number(process.env.COUNTED_CHAT_TEST_LIMIT) || 0) },
		resolve: { alias: { '@counted/quickjs.wasm': createRequire(import.meta.url).resolve('@jitl/quickjs-wasmfile-release-sync/wasm') } },
	},
	// Public results pages do not need a session-storage namespace.
	session: false,
});
