# Latest updates

## Local simulation

Run `pnpm dev:local` and open `/updates?demo=1` to see all eight fictional
updates. Use **Start over**, **Next update**, and **Show all** to step through
completed counts, ward wins, an independent winner, a council majority, a hung
council, a changed winner, withdrawn completion and a revised seat allocation.
Original cards only acquire their correction link once that step is reached.
Filters, pagination, permanent links and the sample API preserve the current step.

Every card is labelled simulated. Place names, candidates, figures and timestamps
are invented. Real party names/logos are used to preview the styling. The sample
source is a simulation identifier, with no fabricated IEC source link. This mode
does not read or write election data, does not poll the live feed, and stores no
shared simulation state. Each request renders the selected step independently.

Both `/updates?demo=1` and `/api/v1/updates?demo=1` are enabled only by Astro's
development mode. Production builds return 404 for these URLs and omit the
fixture module. Simulation responses bypass caches and are marked noindex.

## Live feed

The `/updates` page and `/api/v1/updates` endpoint share an append-only D1 feed.
The page is server rendered, linked from navigation and included in the sitemap.
Province, area search, type filters, cursor pagination, and permanent event links
work without JavaScript. While visible, the newest page checks a small API response
every 30 seconds and offers a “Show new updates” link rather than moving the
reader's current cards. Older pages and saved announcements do not poll.

## Publication rules

- Ward: exactly one explicit `WardSeatsWon=1`, consistent party identities, no
  conflicting awarded seats, and no contradictory available ward vote totals.
  Missing ward progress does not manufacture count completion.
- Council: the existing seat validator must return `reported`, with every seat
  allocated and party totals reconciled. The estimated branch never emits events.
  Independent candidates are not treated as a single party majority.
- Completion: a positive integer expected voting-district count must equal the
  reported completed count. Only whole municipalities generate these milestones.
- A council outcome and newly completed count in the same publication share one
  council card. Its saved facts include district completion.
- Changes in outcome, a revised council allocation, and withdrawn completion
  generate linked corrections. Routine vote/margin changes and regenerated dates
  remain quiet. Card figures describe their saved snapshot, not today's totals.
- Ward gains/holds remain deferred until boundary comparability is verified.

`workers/sync/updates.ts` compares the new milestones with `result_update_state`.
At rollout it reads the preceding active source snapshot as the baseline. A
first-ever import creates state without announcements. Event inserts and state
writes use the same source lease/pointer guard and transaction as result
publication. Failed publication rolls them back; retries cannot duplicate them.
Existing cards retain their saved facts, while a query adds the next correction
link. Report time, observed time and publication time are separate, displayed in
SAST. None is presented as the precise time voting or counting ended.

## Rollout

Apply the additive schema before deploying the sync Worker:

```sh
pnpm exec wrangler d1 execute RESULTS_DB --remote --profile personal --config wrangler.jsonc --file migrations/0006_result_updates.sql --yes
pnpm deploy
pnpm sync:deploy
```

For local data, replace `--remote --profile personal` with `--local`. The public
reader handles an absent schema as an empty, not-yet-started feed, while genuine
database errors return 503. New events begin with subsequent changed source
publications. No fabricated results or retrospective announcement times are seeded.

Each changed municipality now writes one additional state row, plus events for
new milestones or corrections. Unchanged-file fast paths retain their existing
cost. R2 retention is unchanged: compact source packs retain current and previous
versions, while the feed preserves the relevant before/after facts in D1.
