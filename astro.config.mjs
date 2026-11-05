// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
	output: 'server',
	adapter: cloudflare({ imageService: 'passthrough' }),
	// Public results pages do not need a session-storage namespace.
	session: false,
});
