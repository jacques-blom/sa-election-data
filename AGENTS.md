# Counted development

## One shared dev server

Every Codex thread and terminal in this checkout uses the same Astro server.
Run `pnpm dev --info` first to find its URL, mode, PID and log. This is a read-only
file/process check; inside the Codex sandbox it explicitly reports liveness as
unverified. `pnpm dev --logs` shows the last 200 log lines without starting anything.

When the task needs the app, run `pnpm dev` **outside the Codex sandbox**. It reuses
the running server or starts one, prints its URL, and exits. The daemon keeps
running across thread endings. Do not start another process per thread and do not
stop the shared server when your task finishes.

- `pnpm dev:local` requests local D1/R2 data.
- `pnpm dev:chat` requests local data with chat enabled and SerpAPI disabled.
- `pnpm dev:live` requests authenticated live result bindings. With no server
  running, `pnpm dev` also defaults to this maintainer mode.
- A mode, host or port mismatch reports the existing URL and fails without
  changing it. Use the existing mode whenever it satisfies the task.
- `pnpm dev --restart` restarts the current mode after environment/config changes
  or a wedged server. `pnpm dev:chat --restart` explicitly switches everyone to
  chat mode. Explain any necessary restart because it affects other threads.
- `pnpm dev --stop` stops it for everyone. Use only when the user asks to stop or
  consolidate servers, or when recovering a broken shared server.

Use the URL printed by the launcher. The initial default is port 4321; changing
ports is a shared restart, never a workaround for an already-running server.
Never run raw `astro dev`, `--ignore-lock`, `--force`, a custom preview config, or
`astro dev status/stop/logs`. The native CLI can mistake host PIDs for dead
processes inside Codex's isolated PID namespace and remove its lock file.
Never delete `.dev/` or `.astro/dev.json` to bypass a running server.

The launcher uses Linux `flock` to serialize lifecycle operations, Astro's native
background process, and an additional ignored `.dev/server.json` record. Use the
normal build/typecheck/test commands for validation; do not launch another app
server for a browser check.

## Browser use

Use an isolated `agent-browser --session <task-name>` for app tests. Use
`--auto-connect` or the known Chrome CDP endpoint only when a task needs the user's
signed-in browser or their help signing in. Use that browser for X research too.

## Research

If built-in web search returns shallow results, use Firecrawl for deeper research.
