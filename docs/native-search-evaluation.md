# Native search experiment — 7 November 2026

**Follow-up:** Evidence retention and citation handling have since been repaired and retested. See [the implementation and retest](native-search-retention.md). The results below describe the original experiment.

Native OpenAI search inside Terra's main request works, but this trial does not justify replacing the current research function yet. Search in the final answer step was faster, with weaker citation coverage and no cost saving. Search followed by an application tool handoff did not deliver usable live-news citations to the final answer.

No production chat settings, shared dev-server settings or provider credentials were changed. These are manual, paid experiments against the existing local election data, not deployed chat threads.

## Method

Question: **“Which parties could form a majority in Johannesburg in 2026? Show me the council seats.”**

All runs used `openai/gpt-6.1-terra`, medium reasoning, the existing Counted MCP tools, political background, QuickJS calculations and interactive visual renderer. OpenAI routing was pinned with no provider fallback, including the baseline main model. SerpAPI was not used.

Limits matched the app: six model steps, 90 seconds, 8,192 output tokens per step, 12,288 total main-model output tokens, existing function-tool limits and at most two native search actions per complete turn. The baseline retained its additional 4,096-token research allowance. The native variants allowed search in just one model request to enforce the turn-wide search cap.

The native variants changed search availability and prompt wording, so this is a small diagnostic comparison, not a controlled statistical benchmark. One run of each completed variant is insufficient to establish typical latency, price or quality. Prompt caching and different tool choices also affected costs. Local results were provisional estimates and flagged delayed; no data refresh occurred between runs.

## Observations

Costs below are the sum of OpenRouter's reported `usage.cost`, including search fees and the separate research request where applicable. Times include local harness startup and tools.

| Variant | Time | Reported cost (USD) | Billed searches | Result |
| --- | ---: | ---: | ---: | --- |
| Current separate research function | 45.6 s | $0.109068 | 2 | Three news links in the final answer, spanning two outlets; four source URLs in the intermediate research. |
| Native search after data, before chart rendering | 38.0 s | $0.131559 | 2 | Chart rendered, but no native source events reached the harness. Final answer said current negotiations could not be verified and cited dated background instead. |
| Native search in the final answer step | 27.9 s | $0.117612 | 1 | Chart rendered and two clickable links appeared, both to one TimesLIVE article; one native source annotation received. |

All variants produced three interactive council scenarios. Their core arithmetic agreed with the tool data: DA–ActionSA 140 seats and DA–ANC 151, against a 136-seat majority in a 270-seat estimated council. Alternative combinations differed. The displayed seat totals were recomputed from the returned visual datasets and matched the answers. The existing Markdown renderer produced publisher-labelled citation links with favicons.

An initial, excluded probe cost $0.080013 and performed zero searches. Its guard treated omitted search usage on an election-only step as unknown and disabled subsequent search. This was a harness error, not a search-quality result. Total spend across all four probes was **$0.438252**. No additional model calls were made for grading.

## Citation and political-analysis review

The final-step native answer identified leadership bargaining and distinguished possible majorities from agreements. However, it cited the same [TimesLIVE interview with Zille](https://www.timeslive.co.za/politics/elections-2026/2026-11-06-zille-favours-actionsa-or-anc-coalition-in-joburg/) for both Mashaba's alleged condition excluding Zille and ANC leaders' reservations. Reading the article confirmed Zille's preferences, but it did not substantiate those two additional claims. A working clickable link is not sufficient evidence for every nearby assertion.

The baseline linked ANC reservations to the relevant [TimesLIVE report about Ntuli](https://www.timeslive.co.za/politics/2026-11-06-ntuli-casts-doubt-on-anc-da-deal-for-johannesburg-mayoralty-takes-swipe-at-zille/), which does support that claim. It also acknowledged differing accounts of Mashaba's position. Its [Citizen source](https://www.citizen.co.za/news/its-coalition-time-heres-what-the-major-political-parties-are-saying/) could not be independently opened during this review, so the whole answer is not certified as verified. Neither final answer incorporated a named commentator's assessment, despite that instruction.

Both successful news answers also offered the previous administration's recorded partners plus ATM as an exact-majority illustration. They labelled willingness unverified, but that remains an arithmetic construction, not a demonstrated politically plausible third route.

## Integration findings

- Installed `@openrouter/ai-sdk-provider` 3.1.0 exposes `tools.webSearch`. It serializes its arguments at the tool's top level; the probe normalized the wire request to the documented `{type: 'openrouter:web_search', parameters: {engine: 'native'}}` form.
- Search usage was omitted on requests that did not search and present on the requests that did. The probe's final policy grants one search-enabled request, capped at two actions, rather than resetting the allowance each model step.
- The search-before-chart run returned a function call after searching. Its subsequent answer had no usable live-search citations. This is consistent with native search evidence not surviving the Chat Completions/function-call round trip; it does not establish that the search engine found no relevant reporting. The raw hidden reasoning was deliberately not recorded.
- Keeping search and the final answer in the same request preserved a source annotation and Markdown links. However, choosing visual scenarios before searching prevents the fresh evidence from guiding their selection. It is an experiment, not the preferred final architecture.
- Production `runChat` currently handles text and function tools but does not persist native `source` events. A production native-search integration must preserve citation metadata and usable evidence through application tool calls, retain a turn-wide budget, and expose search progress.

The next integration experiment should test a Responses-based main loop with full supported response-item replay, then compare several municipalities and news-only questions. OpenRouter documents that its [Responses API is stateless](https://openrouter.ai/docs/api/reference/responses/overview): `previous_response_id` and `store: true` cannot be used as a shortcut. The [server-tool documentation](https://openrouter.ai/docs/guides/features/server-tools) confirms native search can coexist with application functions; it does not require a research sub-agent.

## Reproduce

The manual runner is `scripts/eval-chat-search.ts`. It reads the existing ignored `.env`, uses local D1 bindings and writes only public answers, artifacts and usage metadata. It does not log credentials, request headers, raw provider errors or hidden reasoning. Each invocation incurs OpenRouter charges.

```sh
WRANGLER_LOG_PATH=/tmp/counted-search-eval-wrangler.log node --env-file=.env scripts/eval-chat-search.ts separate /tmp/counted-search-separate.json
WRANGLER_LOG_PATH=/tmp/counted-search-eval-wrangler.log node --env-file=.env scripts/eval-chat-search.ts native /tmp/counted-search-native-window.json
WRANGLER_LOG_PATH=/tmp/counted-search-eval-wrangler.log node --env-file=.env scripts/eval-chat-search.ts native-final /tmp/counted-search-native-final.json
```

These commands do not start or restart Astro. The original report files remain at the `/tmp` paths above for this session. The two substantive final answers are saved alongside this report in `native-search-answers.md`.
