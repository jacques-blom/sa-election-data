# Contextual news

Current-election national, provincial and municipality result pages, and individual
majority-builder pages, show Google News RSS search results. Towns, suburbs, wards,
voting districts and historical elections do not show current news.

Queries use the area name plus `local elections`, or `coalition` on majority-builder
pages, with Google's `after:2026-11-04` operator (main election day) and South African
English locale. This fixed start date keeps election coverage in scope as time passes. Google
chooses relevance and ordering. Counted does not score, summarise, filter by topic
or publisher, or reorder articles. Only malformed entries, unsafe URLs and duplicate
links are omitted. The first three headlines are visible; the reader can reveal
the rest six at a time or open the corresponding Google News search.

`/api/news?scope=coalition&since=2026-11-04&area=swellendam` fetches RSS on the server. Allowed scopes
are `national`, `province`, `municipality` and `coalition`; area slugs must exist in
the catalogue. The start date is fixed server-side; `since` versions the browser URL,
and the date is included in the edge cache key to avoid reusing the old seven-day feed.
No API key, AI provider, new database or scheduled job is required.
Headlines load independently of election data and retain their state during live
result updates. Switching to a historical election removes the news panel.

The Cloudflare Cache API retains successful feeds for up to 24 hours, refreshes
on the first request after 30 minutes, and serves labelled saved results on upstream
failure. Failures back off for one minute. These caches are per Cloudflare location;
there is no global refresh lock. RSS requests have an eight-second timeout and a
1 MiB body limit. Browser requests have a twelve-second timeout. Feed availability
and indexing lag depend on Google; this is not a real-time news API with a service
guarantee. Keep the linked Google search available for loading, empty and error states.

Validation: `node --test tests/news*.test.ts`, `pnpm check`, `pnpm build`, and a browser
check of Swellendam's results/coalition pages and the history slider.
