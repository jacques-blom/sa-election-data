# Contextual news

Current-election national, provincial and municipality result pages, and individual
majority-builder pages, show Google News search results through SerpAPI. Towns, suburbs, wards,
voting districts and historical elections do not show current news.

Queries use the area name plus `local elections`, or `coalition` on majority-builder
pages, with Google's `after:2026-11-04` operator (main election day) and South African
English locale. This fixed start date keeps election coverage in scope as time passes. Google
chooses relevance and ordering. Counted does not score, summarise, filter by topic
or publisher, or reorder articles. Only malformed entries, unsafe URLs and duplicate
links are omitted. The first three headlines are visible; the reader can reveal
the rest six at a time or open the corresponding Google News search.

`/api/news?scope=coalition&since=2026-11-04&area=swellendam` fetches headlines on the server. Allowed scopes
are `national`, `province`, `municipality` and `coalition`; area slugs must exist in
the catalogue. The start date is fixed server-side; `since` versions the browser URL,
and the date is included in the edge cache key to avoid reusing the old seven-day feed.
Set `SERPAPI_API_KEY` in the ignored `.env` for local development and as a
Cloudflare Worker secret in production. The key is never sent to the browser,
stored with headlines or included in application error messages. No new database
or scheduled job is required. Google blocks direct RSS requests from Cloudflare's
network, so the server uses [SerpAPI's Google News API](https://serpapi.com/google-news-api)
with `engine=google_news`, `gl=za`, `hl=en` and the same query shown in the Google link.
Highlighted articles and grouped stories are flattened in returned order; only
headline, publisher, article link and ISO publication time are retained.
Headlines load independently of election data and retain their state during live
result updates. Switching to a historical election removes the news panel.

Headlines are fresh for one hour. An edge cache makes repeated page visits cheap;
the existing `RAW_RESULTS` R2 bucket shares entries across locations under the
separate `news/serpapi-v1/` prefix. A conditional R2 write grants one request a
20-second refresh lease. Concurrent visitors get saved headlines, or briefly retry
while the first cold fetch completes. Expired leases recover automatically, and an
old lease cannot overwrite a newer result. Shared-storage failures do not trigger
uncached paid searches.

The first visitor after expiry refreshes that area's feed. There is no scheduled
prefetch of every municipality. Saved headlines can be served, visibly labelled,
for up to 24 hours from their original fetch. Failures back off for five minutes;
authentication and quota errors back off for one hour. Records are replaced on
refresh rather than archived. SerpAPI's own one-hour cache is also enabled; identical
cached searches do not use search credits. Search quotas still depend on the account's
[SerpAPI plan](https://serpapi.com/pricing).

Provider requests have a fifteen-second timeout and a 1 MiB body limit. Browser
requests, including waits for another visitor's refresh, have a twenty-second
deadline. Feed availability and indexing lag depend on Google and SerpAPI. Keep the
linked Google search available for loading, empty and error states.

Validation: `node --test tests/news*.test.ts`, `pnpm check`, `pnpm build`, and a browser
check of Swellendam's results/coalition pages and the history slider.
