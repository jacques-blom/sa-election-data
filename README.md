# SA Election Data

A personal civic-tech project by Jacques Blom to make South African local election
results easier to find, understand, and reuse. The name is provisional.

This repository currently contains an Astro SSR application configured for
Cloudflare Workers, a holding page, and a live `/api/health` JSON endpoint.
Election ingestion, geographic lookups, results pages, and public data APIs are
not implemented yet.

## Local development

Use Node 24 (the devbox version is pinned in `.node-version`) and pnpm 12.16.1.

```sh
pnpm install
pnpm dev
```

Open `http://localhost:4321`. When using the devbox remotely, forward port 4321
over SSH or through your editor. Development and preview use Cloudflare's local
Workers runtime and do not require a Cloudflare login.

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Develop with hot reload |
| `pnpm check` | Generate Worker types and check Astro/TypeScript |
| `pnpm build` | Build the production Worker and static assets |
| `pnpm preview` | Serve the production build locally |
| `pnpm deploy:dry-run` | Build and validate the deployment bundle without uploading |
| `pnpm cf:types` | Regenerate types after changing Wrangler bindings |

`astro.config.mjs` enables SSR by default. `wrangler.jsonc` holds the source
Workers configuration; Astro generates the production configuration and entrypoint
during the build. Edit the source configuration, not files in `dist/` or `.wrangler/`.

Sessions and runtime image processing are disabled, so the starter does not need
KV or Cloudflare Images. Add D1, R2, and any other bindings when those features
are implemented. Keep local secrets in `.dev.vars`; this file and `.env*` are
ignored by Git. Generated Worker types are also ignored and recreated by
`pnpm check` or `pnpm cf:types`.

## Personal accounts

GitHub and Cloudflare resources for this project belong to Jacques's personal
accounts. Do not use the Fudge organisation or Cloudflare account.

The repository starts locally on `main`, with no Git remote. When publication is
requested, create the repository under Jacques's personal GitHub account and add
that repository as `origin`.

Before the first Cloudflare deployment:

1. Create a dedicated personal login with `pnpm exec wrangler auth create personal`
   and select the personal account in the authentication flow.
2. Bind it to this directory with `pnpm exec wrangler auth activate personal .`.
3. Run `pnpm exec wrangler whoami` and add the verified personal `account_id` to
   `wrangler.jsonc`.
4. When ready to publish, run `pnpm deploy`.

`pnpm deploy` explicitly selects the `personal` profile. These setup commands have
not been run. An exported `CLOUDFLARE_API_TOKEN` takes precedence over profiles;
use only personal-account credentials in this project's shell and future CI.

References: [Astro Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/),
[Wrangler authentication profiles](https://developers.cloudflare.com/workers/wrangler/profiles/).
