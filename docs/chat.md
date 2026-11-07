# Ask Counted

`/chat` is the website's election assistant. It streams progress, publishes sourced answers, composes interactive
council scenarios and party-support charts, runs bounded TypeScript calculations,
and displays result images, custom bar charts and related news. It uses the existing Astro/Cloudflare deployment.
No separate sandbox account or service is needed.

## Enable it

Ask Counted is temporarily local-only and has no menu item in any environment.
Development servers allow direct access to `/chat` when the OpenRouter key is
configured. Production builds hide its callout and return 404 for `/chat`, saved conversation pages and
all `/api/chat` routes. The shared gate is `src/lib/chat/availability.ts`;
`CHAT_ENABLED` does not override this temporary restriction. The Durable Object
also rejects inference in production, and the deployed `OPENROUTER_API_KEY`
variable is deliberately empty. The public menu
links to Coalition Chaos as **Game**.

Use a dedicated OpenRouter account and key for this project.

1. Sign in to [OpenRouter](https://openrouter.ai/) with the account intended for this project.
   Create a Counted-specific API key with a spending cap in the key settings.
   Start with a small cap; a suggested trial cap is $5/month, set by the account
   owner. No credits have been purchased by this implementation.
2. Save `OPENROUTER_API_KEY` in the ignored `.env` file alongside `SERPAPI_API_KEY`.
   Never use a `PUBLIC_` prefix. Alternatively use `.dev.vars`, but then include
   **both** server secrets there: Wrangler stops reading `.env` once `.dev.vars`
   exists. The local loader overrides the empty `OPENROUTER_API_KEY` variable from `.env`;
   the `live` development environment also declares it in `secrets.required`.
   Restart the development server after changing the key. The entry is documented in `.env.example`.
   See [Cloudflare secrets](https://developers.cloudflare.com/workers/configuration/secrets/).
3. Apply `migrations/0009_chat_usage.sql` to the local database using the usual
   migration workflow, or `pnpm exec wrangler d1 migrations apply RESULTS_DB --local`.
   The server fails closed if this table is missing.
4. Chat is enabled automatically in development. Use `pnpm dev:local` for local data; `pnpm dev` selects the
   separate `live` environment and would write usage reservations to the live D1.
5. Verify a real answer, a follow-up, a coalition chart, TypeScript analysis and
   news search with that key. Use `pnpm dev:chat` for the shared local preview
   (initially port 4321): it blanks `SERPAPI_API_KEY`, while still loading
   the OpenRouter key from `.env`. The checked-in deployment settings stay disabled.
   If a different mode is already running, reuse it or deliberately switch with
   `pnpm dev:chat --restart`. Use `pnpm dev --info` for the actual URL. All threads
   share this process; see the [development workflow](../README.md#shared-server-across-codex-threads).

The managed `chat` development profile has a user-approved allowance of 100 turns
per UTC day, both globally and per visitor, so shared local testing does not exhaust
the production defaults. Its three-per-minute and per-answer limits still apply.
This override is compiled out of production builds: deployed chat retains the
configured 25 global turns/day and 10 per visitor/day. Switching the local allowance
requires restarting the shared server; existing usage counters are retained.

For production, apply the new migration to the intended remote database, configure
the personal key as a Worker secret, then remove the temporary local-only gate
before enabling and deploying the feature. Wrangler
`versions secret put` stages a secret; `secret put` deploys immediately. Keep the
key out of shell arguments, source files, logs and chat. Existing deployment
scripts target the `personal` profile. The production release keeps inference disabled.

## Refresh local election data

The shared server's `chat` profile uses local D1/R2. Production's scheduled
ingestion does not update that copy. To refresh it without restarting Astro:

```sh
pnpm data:ingest --years 2026
pnpm data:load
pnpm data:districts
```

Run these sequentially, with only one local importer/loader running at a time.
For a quicker municipality-only refresh, add `--municipality 3003` to the ingest
command for Johannesburg; this also checks the national/provincial summary.
`data:districts` is separate because district results use local D1/R2 directly.
These commands leave production and saved chat transcripts unchanged.

Inspect `/api/v1/sync` and the relevant area's `source.freshness` and
`source.last_successful_check_at`. `refresh_mode: manual_import` and
`status: not_started` describe the absent scheduler, not an unsuccessful manual
refresh. Successful check time and the IEC report time are different: refetching
unchanged results does not mean new votes were counted. The detail freshness
window is 15 minutes, so refresh again when needed or use the maintained live
bindings for ongoing live-data work. Saved answers and chart snapshots retain
their original data; ask a new question to get an updated analysis.

## Model and search choice

Prices below were checked on 7 November 2026; recheck before changing providers.
They exclude hosting, taxes and any credit purchase fees. The configured default
is `openai/gpt-6.1-terra` at **medium** reasoning, replacing the initial cheap
coding-oriented Qwen candidate. This is a benchmark-informed starting point;
no model has yet passed a live election evaluation in this application.

Artificial Analysis's current **Intelligence Index v5.0.1** scores below must not
be compared with scores from its older v4.3 articles. Benchmark cost per task
includes the benchmark's actual token use; it is not a Counted chat-turn price.

| Option / reasoning | AA index | AA USD/task | OpenRouter USD per million input / output | Use here |
| --- | --- | --- | --- | --- |
| GPT-6.1 Terra / medium | 38 | $0.17 | $1 / $5 | Default balance of capability and response time |
| GPT-6.1 Sol / medium | 46 | $0.36 | $2 / $10 | Higher-quality candidate; exceeds configured price ceiling |
| DeepSeek V4.1 Flash 1017 / high | 29 | $0.46 | $0.15 / $0.60 | Cheap tokens; more reasoning work on AA's tests |
| GPT-6 Luna / high | 21 | $0.07 | $0.10 / $0.50 | Lower-cost candidate for simpler questions |
| MiMo-V2.6-Pro | 30 | $0.26 | $0.435 / $0.87 | Inexpensive candidate; higher first-answer latency on AA |

Sources: [Artificial Analysis leaderboard](https://artificialanalysis.ai/leaderboards/models),
[live OpenRouter catalogue](https://openrouter.ai/api/v1/models),
[Terra pricing](https://openrouter.ai/openai/gpt-6.1-terra),
[Sol pricing](https://openrouter.ai/openai/gpt-6.1-sol).
All five advertise tool calling and reasoning. Their performance on actual
Counted questions still needs checking. The server currently requests medium
reasoning; selecting a candidate benchmarked at high requires changing that
setting too. Model and reasoning choices are server-side only.

**Muse:** OpenRouter currently lists no zero-price Muse text endpoint.
[`meta/muse-spark-1.3-contributor`](https://openrouter.ai/meta/muse-spark-1.3-contributor)
is heavily discounted at **$0.10 / $0.20** and supports tools. The standard Spark
1.3 model scores **37 at max** on the current
[AA model page](https://artificialanalysis.ai/models/muse-spark-1-3); this is not
an independent evaluation of the Contributor endpoint at our medium setting.
Meta says Contributor content can be used to train future models, and
[its Contributor guidance](https://dev.meta.ai/help/policies-and-privacy/contributor-tier)
prohibits submitting sensitive, confidential or personal information, including
end-user inputs. This needs deliberate product/privacy consideration before use
in public chat. We keep `data_collection: deny`; no Contributor traffic is enabled.
Muse's consumer free allowance and Muse Code access are distinct from public API
inference. [Muse Code subscription credentials](https://dev.meta.ai/docs/muse-code/subscriptions)
are for Muse Code only; separately created API keys use pay-as-you-go billing.

[`openrouter/free`](https://openrouter.ai/openrouter/free) is another evaluation
option at $0 input/output, with variable model selection and capacity.
The free router filters for tool support but selects among different available
models. Free quotas are account-wide and each agent step consumes a request;
they are not a reliable public-site capacity plan. Check
[current OpenRouter limits](https://openrouter.ai/docs/api-reference/limits).
These catalogue notes are research context: the current native-chat route is
pinned to OpenAI, so changing `CHAT_MODEL` alone cannot select another provider's
free model. There is no automatic fallback to a paid model. Some free endpoints
may be unavailable under the enforced `data_collection: deny` policy.

The provider route rejects prices above $1 input / $5 output per million
tokens and requires support for the requested parameters. Changing to a more
expensive model requires deliberately updating this ceiling in `native-agent.ts`. The website now pins OpenAI routing; the legacy comparison runner remains available for other provider experiments.
For illustration, a turn using 20,000 total input tokens across its model steps
and 2,000 total output tokens (including reasoning) costs about **$0.03** at
Terra's listed price, versus $0.06 for Sol. Actual multi-step use varies; this is
not a per-turn quote or spend guarantee. Reasoning is billed as output and shares
the output-token budget with visible answers. We allow 8,192 tokens per step,
and report generation-limit exits as incomplete instead of successful answers.

Chat news now uses **native OpenAI web search through OpenRouter**, with the same
personal key. It never calls SerpAPI or falls back to it. The rest of the site's
news feeds retain their existing integration.

The main Terra loop uses OpenRouter's **Responses API**, with native
`openrouter:web_search` and the existing AI SDK/MCP function definitions in the
same request. There is no separate research-model call. `native-agent.ts` carries
all response items (including encrypted reasoning, search actions, annotated
messages and function outputs) into the next request unchanged. OpenRouter is
stateless: `store: false`, no `previous_response_id`. Opaque provider state remains
in memory for that turn; it is never displayed, logged or written to the public
thread journal. The old `searchNews` helper is retained only for comparative tests.

The turn has six model requests, 18 application calls, 12,288 output tokens total
(including reasoning), 8,192 per request, 240,000 serialized input characters,
a 90-second deadline and no retries. Native search has **two actions for the whole
turn**. Each request receives only the remaining `max_tool_calls` allowance;
search is removed when exhausted. Returned action counts and billed usage are
checked before executing application calls. Routing remains pinned to OpenAI,
with provider fallbacks disabled and the $1/$5 token-price ceiling. Existing
D1 daily and per-visitor turn caps remain in place.

`read_news_sources` reads at most three articles from supported public publishers.
URLs and every redirect must pass the host allowlist; reads have a ten-second
budget, a 1.5 MB response limit, and at most 16,000 extracted characters per
article. It prefers the publisher's article body, otherwise article/main text,
and does not execute page scripts. Native search confirms when search happened;
OpenRouter currently rejects OpenAI's `web_search_call.action.sources` include.
Consequently model-supplied article URLs are not labelled provider-verified just
because search occurred: each must be opened successfully before it can be cited.
Inaccessible or unsupported sources cannot back a citation.

The model publishes via `answer_question`. Each news paragraph provides a source
ID and a short supporting quotation. The server checks that the source was read
and that the quotation occurs in its extracted text, with at most 25 quoted words
per source. It constructs links from the registry, rejecting invented URLs,
source IDs and missing quotes. This verifies provenance and quotation existence;
it does **not** mathematically prove that a paraphrase follows from a quote.
The prompt requires claim-specific support, correct attribution and separation
of reported positions from inference. Manual citation audits remain necessary.

Progress and visuals stream while the model works. Final prose is held until its
citation checks pass, then published; unchecked draft prose is not flashed to the
reader. The hidden research artifact now stores the published source mappings and
short supporting excerpts for durable replay. The “From the web” card stays hidden.

OpenAI search costs **$0.01 per search call**, plus retrieved-content and model
tokens. Search-call fees are capped at $0.02 per turn under the provider limit;
total cost is higher and variable. The repaired Johannesburg probe on 7 November
2026 used two actions, took 34.6 seconds and reported $0.128722 for the complete
turn. A news-only probe took 31.9 seconds and reported $0.057633. These are smoke
tests, not typical-price guarantees. Keep an OpenRouter key spending cap as an
independent backstop; cancellation cannot undo work already billed upstream.

Inline citations use a publisher name derived from the destination hostname
(known publisher names, otherwise the hostname), rather than labels such as
"Reporting". Decorative favicons come from Google's favicon service with only the
hostname and icon size; requests suppress the chat-page referrer. Search summaries
and provider citations remain saved with the conversation for provenance. They
are not a cross-conversation news cache or official election totals. A failed
search does not silently switch engines or invent news.

Sources: [OpenRouter server tools and limits](https://openrouter.ai/docs/guides/features/server-tools),
[OpenAI tool-call limit](https://developers.openai.com/api/reference/resources/responses/methods/create),
[OpenRouter native search](https://openrouter.ai/docs/guides/features/server-tools/web-search),
[OpenAI pricing](https://developers.openai.com/api/docs/pricing).

## Execution and evidence

### Political analysis

Coalition answers cover both the seat arithmetic and the politics. The website's
editorial brief lives in [`src/lib/chat/politics.ts`](../src/lib/chat/politics.ts):
dated, linked background on the GNU, changing local partnerships, regional
differences and recent negotiations. It is deliberately separate from election
data and the coalition game's fictional stories. Review its sources when updating
it; do not change the review date without checking the factual notes. It is not
an automatically refreshed coalition register or a permanent party compatibility
matrix. The current date is generated for each chat turn, not at Worker startup.

For open questions such as “Which parties could form a majority in Johannesburg?”,
Terra is instructed to check municipal government history and use its existing
`web_search` tool early. The instructions seek local reporting, the parties'
conditions, named commentators' assessments and conflicting evidence. Historical
questions use the relevant period; explicitly arithmetic-only requests and simple
seat lookups do not need news. No additional model, service or increased limit is
introduced: at most two native search actions inside the main loop. Political
questions will use search more often, so average spend can increase within those
existing caps.

The answer should explain a few evidence-backed routes, their majority margins,
incentives and obstacles. It must distinguish agreements, stated positions,
attributed commentary and its own conditional assessment. A national pact is not
proof of a local one; outside voting support is not coalition membership. If news
fails, it should say current positions could not be checked and offer clearly
dated context and conditional analysis. Numerical totals still come from election
tools, and no probability or confirmed deal may be invented.

When changing this brief or model, manually review these cases with live Terra:

- “Which parties could form a majority in Johannesburg in 2026? Show me the council
  seats.” Expect recent research and a political explanation of viable routes,
  not arbitrary majorities such as DA–EFF–MK presented as equally plausible.
- “Only calculate DA + ANC in Johannesburg; no political analysis or news.” Expect
  sourced arithmetic and a visual, without unnecessary news spend.
- “Would DA + EFF + MK work in Johannesburg?” Calculate the requested combination
  while explaining any sourced political barriers; do not refuse the arithmetic
  or claim a permanent impossibility based on old party positions.
- Ask about a smaller municipality or a historical coalition. Expect local and
  period-appropriate evidence, or an explicit coverage gap, rather than importing
  Johannesburg politics or current national alignments.

The Johannesburg question was checked with live Terra on 7 November 2026 in local
thread `3b6ab5fb-3b0f-45e5-953c-50f869959444`. It called government history and native
news research, explained leadership obstacles for DA–ActionSA and DA–ANC, and
checked the shortfall of an ANC–ActionSA–EFF–MK alternative against stored estimates.
The answer cited reporting and retained the stale-data warning. Review also led
to tightening the research prompt to leave election totals to Counted and to ask
for the key unresolved political decision. This is a smoke check, not a broader
accuracy evaluation; the other cases above remain manual evaluation prompts.

### Tools and presentation

AI SDK tool definitions connect to a request-local MCP client/server pair using `InMemoryTransport`. The native Responses loop validates and executes those definitions.
It reuses the actual schemas, validation, readers and renderers in
`createCountedServer`, without a public HTTP request. The website substitutes its
own TypeScript workflow for the MCP's Python/API documentation tools. It preserves
ballot bases, pagination, source timestamps and caveats; article text and previous
assistant messages are never authoritative election evidence.

Successful data reads receive a request-local `dataset_id`. `analyse_data` accepts
only IDs fetched in that turn, strips TypeScript with Sucrase, and runs the code in
a fresh QuickJS context. It has no host functions, secrets, imports, filesystem or
network. Runtime limits are 16 MiB guest memory, 256 KiB stack, 500 interrupt checks,
12,000 code characters, 500,000 dataset characters and 32,000 result characters.
An instruction budget is essential because Workers can freeze `Date.now()` during
synchronous execution. Each run disposes its context/runtime. This is a computation
environment, not a Python environment or an npm package installer.

Vercel's [run](https://github.com/vercel-labs/run) provides a similar QuickJS model
but currently targets Node/Bun worker threads. Vercel Sandbox is a hosted service.
Using [QuickJS's Workers-compatible WASM](https://github.com/justjake/quickjs-emscripten)
directly keeps this feature on the site's existing Worker. The WASM module is
statically bundled through a Vite alias; it never executes generated code in the
host JavaScript engine.

The website uses `@json-render/core` 0.22 with a custom DOM renderer. The catalogue
in `src/lib/chat/visuals/catalog.ts` supplies the model's component vocabulary,
prompt and validation; browser implementations live in `visuals/render.ts`.
No React runtime or arbitrary model-generated HTML/JavaScript is involved.
Saved pages use that same renderer with a request-local `linkedom/worker` document
through `markup.server.ts`. The initial HTML includes the actual charts, layout,
rounded values, pagination defaults and collapsed evidence. Stable node markers
let the browser attach controls in place, preserving existing nodes and open
details. There is no separate raw-data table fallback or server DOM library in the
browser bundle. Maps render their controls and fixed-size plot shell immediately;
geometry fills the reserved space lazily without moving surrounding content.

- `Grid` (one to three responsive columns), `Stack`, `Card` and `Text` compose layouts.
- `CouncilScenario` reuses the site's seat-diagram geometry. Readers can toggle
  named parties and reset the selection; majority arithmetic runs locally. Selected
  parties form a contiguous block from the left, keeping party colours and stable
  order within each block. Unselected seats are muted on the right. A dashed
  halfway guide and numerical majority label make scenarios comparable. With no
  selection, the whole council retains its source party order.
- `PartySupport` reuses the site's stacked history-band geometry. Readers can
  highlight a party, select an election/scenario and inspect exact values. Bands
  connect the same party, not individual voter transfers. Both charts offer
  compact and standard sizing and preserve unavailable values.
  This is the default for broad questions such as “How has CPT's vote changed?”:
  percent data, all returned elections in chronological order, and a 100% stack
  with smaller parties retained in Other. Missing years remain gaps.
- `RankedBars` ranks numeric table columns, with top-N defaults, reversible sorting,
  row highlighting and result links. Expanded rankings are capped at 50 rows.
- `Comparison` compares two party columns and calculates changes in seats or
  percentage points. Missing parties stay unavailable; historical comparisons
  retain the boundary-change caveat. Use it as the primary chart for an explicitly
  requested pair of elections or before/after breakdown, not as a replacement for
  a broad history chart.
- `DataTable` filters, sorts and pages exact values (five rows in compact cards,
  ten in standard cards). CSV downloads retain full precision and all rows;
  spreadsheet formula-like strings are escaped. Wide tables scroll internally.
- `ResultsMap` lazily loads the site's pinned 2026 province/municipality GeoJSON
  into a bounded SVG, with metric selection, tap-to-inspect, an accessible area
  picker and result links. It has no WebGL context or background polling. Map
  failures retain the data and links. Historical factual maps are rejected because
  the matching boundaries are unavailable; hypothetical maps validate real IDs.
- `GovernmentTimeline` shows the latest three administrations with older records
  and source details expandable. Members and outside supporters remain separate.
  MISTRA's cutoff and open-ended dates never become a claim about today's government.
- `Metric` displays a numeric table cell or computes council total, majority,
  selected seats or surplus. Selected coalitions are explicitly hypothetical.
- `get_visualisation_data` loads a complete council allocation or election-history
  columns through an election year. It uses the existing seat, history, correction
  and denominator logic. It returns a turn-local dataset ID and column IDs; these
  datasets are also available to `analyse_data`.
  Additional views are `parties` (one area's share/votes/seats), `summary` (ballots,
  council seats, majority and reporting), `areas` (provinces or municipalities,
  optionally a selected party) and `government` (dated municipality records).
  `areas` accepts `area_id=all`, or a province ID for a municipality subset. These
  bounded reads include at most 300 rows and reject incomplete pages or mixed
  ballot bases. Reporting percentages are not voter turnout.
- `render_visualisation` accepts a complete json-render tree. Chart inputs can
  reference those datasets or contain hypothetical values with scope, year and
  assumptions. Factual data is resolved server-side; callers cannot override its
  status or provenance. Hypothetical values are always labelled, and council
  allocations must sum to the council size using whole seats. Mixed units, areas,
  invalid party selections, grouped-party coalition selections and invalid trees
  are rejected. Layouts have at most 24 elements, five levels and eight charts, with
  two render attempts per answer. Existing turn, token and tool limits still apply.
- Each versioned visual artifact includes the spec and resolved data snapshots,
  sources and provenance. Durable thread replay requires no dataset refetch.
  Reader interactions are local to the view; reload/reset restores the model's
  saved scenario. No extra model calls or shared-thread mutations occur on clicks.
  Sources and assumptions are expandable; estimates, hypothetical status and
  stale-data warnings remain visible. Original rendered images remain readable.

The website omits `render_council_image` from its tool catalogue, directing new
council answers to interactive visuals. Other result images and the public MCP's
image tools retain their immutable URLs and data downloads. Custom bar charts
from analysis retain their inspectable calculations and source links.
Model text is rendered with a small DOM-only Markdown renderer, without raw HTML,
scripts or arbitrary image embeds. It supports paragraphs, basic headings/lists,
bold, inline code and source links; advanced Markdown tables are not rendered.

## Durable threads and sharing

The native Responses loop with AI SDK tools and OpenRouter Terra runs inside `CountedChatThread`,
a Cloudflare Durable Object with SQLite storage. This keeps the existing Astro UI,
MCP tools, sandbox and cost caps. No Redis, external database or additional model
provider is needed. Cloudflare's `AIChatAgent` is a viable alternative with built-in
chat persistence and resumable streams; this implementation retains our smaller
NDJSON transport and existing artifact renderer instead of migrating chat protocols.

- `POST /api/chat` saves a question and request UUID before acknowledging it. Replaying
  that request UUID returns the original turn without another usage reservation or
  model call. A different request cannot overlap an active turn in the same thread.
- `/chat/{uuid}` reads a compact snapshot directly from its Durable Object and
  server-renders saved questions, answers, citations and artifacts into the initial
  HTML. Interactive visuals include readable values and sources before JavaScript
  enhances their controls. The client adopts existing message nodes and connects
  after the rendered cursor, including when a turn finishes during page loading.
  Only unfinished answers carry raw Markdown for continuation; complete transcript
  JSON is not duplicated in the page. The SSR response includes no write capability
  and is `no-store`. Missing threads return 404; temporary storage failures return
  503 with a reconnectable page. Server rendering never starts a model request.
- `GET /api/chat/{uuid}?after={sequence}&view=snapshot` sends assembled saved turns
  in one snapshot, then tails only events newer than its cursor. Completed threads
  render whole answers immediately after loading, without replaying typing or old
  progress states. Active threads restore their partial answer and latest status,
  then stream genuinely new output. Reconnection replaces changed turns (including
  artifacts) rather than appending their old fragments again. The snapshot and cursor
  are captured synchronously to prevent gaps or duplicated text during the handoff.
  Raw event replay remains available when `view=snapshot` is omitted.
- Live text renders at most once per **50 ms**, with the first text immediate.
  Incoming events and cursors are processed immediately. Tool/status changes,
  artifacts, completion, errors and disconnects flush any queued paint; saved
  snapshots and SSR history render immediately. Disposal cancels queued paints.
- The Durable Object saves the first text fragment immediately, then coalesces
  consecutive text for at most **100 ms** or until **4 KiB of UTF-8 text** arrives.
  The deadline starts with the first buffered fragment and is not extended by later
  fragments. Tool/status changes, artifacts, completion, Stop, watchdog timeouts and
  exceptions flush pending text before their event is saved. Each event uses one
  journal insert and one combined answer/status/byte-count update in a transaction.
  Subscribers and SSR read only persisted state, so a crash cannot erase text that
  was already shown. A crash may lose the still-unpublished text in the current
  short batch; timers are in-memory, not a crash-recovery mechanism. Generation
  stays owned by the Durable Object when a reader disconnects. Batch timers are
  cleared at completion and cannot write into a subsequent turn.
- The Durable Object owns generation through `ctx.waitUntil`, with the existing
  90-second run budget and a 120-second watchdog. Closing a tab, navigating or
  disconnecting the response stream does not cancel the model request.
- Explicit Stop is an authenticated request for a specific turn. A stale Stop cannot
  cancel a newer answer. Partial output remains readable.
- If the object actually restarts mid-generation (deployment, crash, etc.), its
  constructor marks that turn interrupted. Saved output is retained. It does not
  pretend it can resume an upstream OpenAI token stream or silently re-bill a retry.
  A new follow-up uses the saved context. Truly automatic recovery across crashes
  would require checkpointing model/tool steps and explicit retry budgets; use a
  Workflow or the Agents durable-execution APIs if that becomes a requirement.

`/chat/{uuid}` is an unlisted public read link. UUIDv4 IDs are generated with
`crypto.randomUUID()`. There is no public thread directory and pages are noindex.
A separate random write capability is kept in the original browser's local storage;
the server stores its SHA-256 hash. The shared URL never contains that capability.
People opening a share link can read live or completed output, but cannot send or
stop turns. Clearing browser storage loses write access, not the saved public page.
Local storage also remembers recent thread links and unsent/unacknowledged requests.

Every model-facing tool requires `summary_for_user` (3–180 characters). This field
is stripped before delegating to the MCP. The UI displays the latest summary as
plain text, with a spinner, elapsed time and Thinking / Using election tools /
Writing the answer phases. Private model reasoning is never displayed or stored.

The Worker entrypoint is `src/worker.ts`; Wrangler exports `CountedChatThread` and
creates its SQLite namespace via the additive `chat-threads-v1` migration. Both
local and live configurations declare the binding. Development storage stays local;
this change does not provision or deploy a production namespace. Production deploys
must include that migration and the existing D1 usage migration. Saved transcripts
have no automatic expiry in this initial version.

Sources: [Cloudflare object lifetime](https://developers.cloudflare.com/durable-objects/api/state/),
[SQLite storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/),
[Cloudflare chat agents](https://developers.cloudflare.com/agents/communication-channels/chat/chat-agents/),
[Astro custom Worker entrypoint](https://docs.astro.build/en/guides/integrations-guide/cloudflare/).

## Cost and privacy boundaries

- Default global cap: **25 reserved turns per UTC day**, configurable up to 500.
- Per network address: **10/day** and **3/minute**, enforced with atomic D1 counters.
- Per turn: **6 model steps**, **8,192 output tokens/step** and **12,288 total main-agent
  output tokens** (including reasoning), **18 tool attempts**, **3 calculations**,
  **1 news research request**, **90 seconds**, and no automatic retries.
- News research has its own **2 native tool-call** and **4,096 output-token** caps,
  so the combined output allowance is at most **16,384 tokens** per turn. Search
  has a **45-second** deadline within the overall turn deadline.
- Request bodies are bounded at 32 KiB. The browser submits one question, a thread UUID
  and a request UUID. History comes from server storage; browsers cannot inject assistant
  history, system messages, tools, model choices or tool results.
- The model context is bounded; pagination/work limits may prevent a complete
  national analysis. The assistant must report partial coverage instead of ranking
  the whole country from a sample.
- Reservations are conservative and are not refunded on failure/cancellation.
  A reservation can be consumed when another limit rejects the request. These
  limits bound cost, not availability under deliberate abuse; use the provider
  key cap as an additional independent spend boundary.
- Conversations, partial text, charts, citations and progress are saved in a SQLite-backed
  Durable Object per thread. New conversation creates a new UUID; it does not delete
  previous conversations. The latest six turns supply bounded model context; election
  data is re-fetched for new numerical claims. Storage is capped at 20 turns per thread
  and 512 KB of output per turn, independently of the context window.
- No prompts, transcript bodies or provider errors are logged. Counters use
  daily keyed address hashes, and old counter rows are cleaned when chat next
  receives a successful reservation. Public chart artifacts are cached. Chat news
  summaries and citations are part of the saved, publicly viewable conversation.
- OpenRouter/model providers receive the conversation and required public data.
  Their retention policies still apply. `data_collection: deny` is not a promise
  of zero retention. The interface and privacy page disclose this transfer.

## Verification

Focused tests cover real MCP discovery/validation, tool-backed streaming using a
mock provider, error redaction, concurrent D1 caps, actual TypeScript computation,
loop/memory/output limits, fresh-context isolation and safe chart/prose rendering.
The sandbox also runs in an isolated workerd test (including an infinite-loop
interruption). Client tests cover split UTF-8 streams, server-owned history, reload,
cursor reconnection, coalesced history above 1 MB, public read-only views and tool progress. Durable Object tests run
in workerd with temporary SQLite storage: disconnect, duplicate submissions, stop,
concurrent sends, permissions, artifacts, process restart and interrupted-turn recovery.
Visual tests additionally cover historical dataset resolution, schema/tree limits,
hypothetical validation, inert text, local interactions and JSON replay. The
workerd thread test saves composed visuals and verifies them after worker restart.
Use `node --test tests/chat*.test.ts`, `pnpm check`, and `pnpm build`.
For browser-DOM tests, `node --test --test-isolation=none tests/chat-client.test.ts
tests/chat-render.test.ts tests/chat-visual.test.ts` explicitly runs named cases.
No paid model request is needed for these tests. Live model quality and provider
quota require the configured key before launch. Search tests cover native routing,
tool/token limits, concurrent request caps, unsafe/absent citations, incomplete
results, response size limits and error redaction.
