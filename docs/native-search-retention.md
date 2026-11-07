# Native search retention and citation retest — 7 November 2026

The website's shared preview now uses native search in Terra's main Responses loop. It no longer calls the separate research model. This supersedes the integration recommendation in [the initial experiment](native-search-evaluation.md); that report remains a record of the earlier failures.

## What changed

- `native-agent.ts` replays the complete Responses output, including encrypted reasoning, native search items, annotations, function calls and function results. It does not convert that state into Chat Completions messages. Opaque provider state is request-local and never enters the public journal.
- Search and every application tool use the same Terra turn. Two native actions are allowed across the whole turn, with the remaining allowance passed into each request. Six model steps, 18 application calls, a 90-second deadline and a 12,288-token total output budget remain enforced. Serialized replay input is capped at 240,000 characters to accommodate native items and read articles.
- `read_news_sources` opens at most three articles with strict publisher/redirect allowlists, time and byte limits. Article text remains in function results through subsequent election/chart calls. There is no SerpAPI, new search service or research sub-agent.
- `answer_question` requires a source ID and supporting quotation for each news paragraph. Quotes must exist in a successfully read article; raw model-generated citation URLs and unread source IDs are rejected. Links are assembled server-side. Up to 25 words of supporting quotations per article are saved in the hidden evidence artifact, alongside the final claim and URL.
- Progress and charts stream as before. Final prose is withheld until citation validation succeeds. “From the web” remains hidden; publisher labels and favicons remain visible on the inline links.

An OpenRouter incompatibility was found during implementation: `include: ['web_search_call.action.sources']` returns HTTP 400 even though OpenAI itself documents it. `reasoning.encrypted_content` works. We therefore preserve returned native items and open the model's search-informed URLs on known public publishers. Such a URL is **not** declared provider-verified simply because the model supplied it. Successful article reads and quote matching establish the saved provenance.

## Live results

| Test | Duration | Reported complete-turn cost | Native actions | Result |
| --- | ---: | ---: | ---: | --- |
| Johannesburg council question, repaired runner | 34.6 s | $0.128722 | 2 | Four model steps; news evidence survived result and chart calls; two separately sourced political claims. |
| News-only DA–ActionSA question | 31.9 s | $0.057633 | 2 | Two accessible sources; explicitly disclosed an unreadable commentator interview instead of attributing an unsupported view. |
| Browser coalition turn, then arithmetic-only follow-up | Not separately metered | Not separately metered | Search activity on the coalition turn; none in the arithmetic follow-up | Both turns saved and replayed; charts and inline citations hydrated. |

For context, the initial separate-research sample was 45.6 seconds/$0.109068, and the broken native-before-chart sample was 38.0 seconds/$0.131559. These are individual diagnostic runs with different caching and tool choices, **not a price or speed benchmark**. Native search is not inherently cheaper: retrieved content and repeated context are still billed.

The two metered repaired runs total $0.186355. Two tiny compatibility probes added $0.000180. This excludes the unmetered browser turns; it is not a total-account-spend claim. Rejected HTTP 400 probes returned no inference usage.

## Citation audit

The council probe cited [TimesLIVE's Zille interview](https://www.timeslive.co.za/politics/elections-2026/2026-11-06-zille-favours-actionsa-or-anc-coalition-in-joburg/) for her preference, and [Sam Mkokeli's Daily Maverick op-ed](https://www.dailymaverick.co.za/article/2026-11-03-fourteen-days-to-find-a-mayor-mashaba-holds-the-key-anc-the-lock/) for Mashaba's condition. Both articles were read independently and supported those distinct claims. The op-ed was attributed as such. This fixes the observed failure of attaching Zille's article to Mashaba's position.

The browser and news-only answers cited [Daily Maverick's coalition-conditions report](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/) for Beaumont's negotiating conditions; the browser also cited Mokonyane's openness subject to stability. The built-in web reader could not open that page, but a direct bounded article read retrieved the paragraphs and confirmed their speaker and scope. The answer distinguished these positions from a Johannesburg agreement.

Quote existence is not a semantic proof that every paraphrase follows from it. The model must still classify news assertions correctly, preserve scope and dates, and distinguish inference from reporting. Manual audits remain necessary. Publisher access failures can reduce coverage, and these tests do not establish performance for every municipality. The first repaired probe still offered a broader hypothetical arithmetic coalition; the browser run chose two documented routes instead. Political selection can still improve.

## End-to-end verification

Verified in a saved conversation on the local development server. Private preview links and conversation identifiers are intentionally omitted.

The browser was reloaded while native search was running. The same turn continued and finished, preserving its source evidence. Its three clickable citations displayed publisher names and favicons, with no extra web-summary card. Two interactive council scenarios showed 140 and 151 estimated seats against the 136-seat majority. An arithmetic-only follow-up returned DA–ANC's 151 seats with no recorded search activity or news artifact. A separate browser session verified public read access.

Validation: 21 focused native/search/client/render tests passed; Astro check reported zero errors and warnings (two unrelated video deprecation hints). Regression cases cover exact response-item replay, exhausted search allowance, rejected/invented citations followed by repair, concurrent article caps, unsafe redirects, oversized reads, fragmented SSE, incomplete responses and provider-error redaction. The real browser exercised the Cloudflare Worker/Durable Object path.

Manual runner: `node --env-file=.env scripts/eval-native-chat.ts /tmp/report.json [question]`. It incurs OpenRouter charges. Reports for this session are `/tmp/counted-native-retention-joburg.json` and `/tmp/counted-native-retention-news.json`; public browser events are in `/tmp/counted-native-browser-final.ndjson`. No deployment was made.
