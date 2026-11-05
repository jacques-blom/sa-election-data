// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

// Keep machine-specific development hosts in ignored local configuration.
if (existsSync('.env')) loadEnvFile('.env');
const allowedHosts = (process.env.DEV_ALLOWED_HOSTS ?? '').split(',').map(host => host.trim()).filter(Boolean);

export default defineConfig({
	server: {
		allowedHosts,
	},
	output: 'server',
	adapter: cloudflare({ imageService: 'passthrough' }),
	// Public results pages do not need a session-storage namespace.
	session: false,
});
