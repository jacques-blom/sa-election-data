# SA Election Data

A personal civic-tech project by Jacques Blom to make South African local election
results easier to find, understand, and reuse. The name is provisional.

This repository currently contains an Astro SSR application configured for
Cloudflare Workers, a local importer for IEC municipal election results from
2000–2026, and a read-only REST API backed by D1. The same backfill has been loaded
and verified in local D1 and Jacques's personal Cloudflare D1 database. The results website,
geographic lookup, and automated production polling are still to be built.

See [ingestion and live updates](docs/ingestion.md) and the
[API contract](public/api.md). Raw snapshots and imported databases live in
`.data/` and `.wrangler/`, outside Git.

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
| `pnpm data:ingest --years all` | Backfill public IEC feeds for 2000–2026 locally |
| `pnpm data:ingest` | Refresh the current election in the local archive |
| `pnpm data:load` | Publish imported snapshots to the local D1 emulator |
| `pnpm data:export` | Produce a SQL backfill file for a future remote D1 import |
| `pnpm test` | Check ingestion validation, corrections, and snapshot integrity |

`astro.config.mjs` enables SSR by default. `wrangler.jsonc` holds the source
Workers configuration; Astro generates the production configuration and entrypoint
during the build. Edit the source configuration, not files in `dist/` or `.wrangler/`.

Sessions and runtime image processing are disabled, so the starter does not need
KV or Cloudflare Images. The real personal-account D1 ID is configured, while
`preview_database_id` preserves the separate local emulator database.
R2 and the automated ingestion resources have not been provisioned.
Keep local secrets in `.dev.vars`; this file and `.env*` are
ignored by Git. Generated Worker types are also ignored and recreated by
`pnpm check` or `pnpm cf:types`.

## Personal accounts

GitHub and Cloudflare resources for this project belong to Jacques's personal
accounts. Do not use the Fudge organisation or Cloudflare account.

The repository starts locally on `main`, with no Git remote. When publication is
requested, create the repository under Jacques's personal GitHub account and add
that repository as `origin`.

The `personal` Wrangler profile is authenticated and bound to this project. It
selects **Blom Media LLC**, account `1644a80d2d9ee897e4a990ce1e8100ee`, which is pinned
in `wrangler.jsonc`. The `sa-election-data` D1 database
(`95ad93f9-e5f0-4a0e-b7c2-74bde7e3b91b`) was created in WEUR and loaded on 2026-11-05.
All 30 year/area-level coverage counts and all 1,353 active source snapshot IDs
were checked against the local database after import.

The Worker has not been deployed and automatic polling is not running.
`pnpm deploy` explicitly selects the `personal` profile when ready to publish.
Check `pnpm exec wrangler whoami` before future remote operations.
An exported `CLOUDFLARE_API_TOKEN` takes precedence over profiles;
use only personal-account credentials in this project's shell and future CI.

References: [Astro Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/),
[Wrangler authentication profiles](https://developers.cloudflare.com/workers/wrangler/profiles/).
