# Election highlights

`/highlights` is the dedicated editorial overview of the 2026 municipal count. It reuses `getCouncilDashboard` and the existing versioned council summaries; it adds no source fetches, migrations or writes. The homepage retains its short highlights sidebar.

Homepage highlight cards open the matching section on `/highlights`: majority changes,
vote-share changes or close races. Individual place names within the cards link to
their council or ward results. Both destinations use ordinary links with separate
keyboard focus. The heading and footer open the full page. Detailed
rankings and methodology live on that page rather than in an expandable home section.

The page combines five sections rather than separate pages for each ranking:

- Majority changes: gains and losses by party, plus summary counts for councils moving between a majority and a hung outcome or between majority parties. A single link opens the homepage with `changed=1` to explore all changed councils; this page does not show a partial council list. Both elections must have reported seat allocations. Losing a majority to a hung council counts as a loss; unchanged outcomes do not contribute.
- Beside the majority chart, seat gains/losses compares total ward + PR seats by party across the same councils with reported allocations in both elections. This includes hung councils and unchanged majorities. Complete seat breakdowns allow a party absent from one election to count as zero seats; estimates and missing allocations are excluded on both sides. Independent seats are explicitly grouped, without matching individual candidates. The eight largest absolute net changes appear as one diverging bar per party, ordered from gains to losses, with previous/current totals and comparison coverage. Changes in council size are disclosed; gains and losses need not sum to zero.
- Local swings: the existing top six gains and losses in combined ward + PR vote shares, restricted to current completed counts and comparable complete party lists. A party missing from a complete list has zero share. These are local, not national, rankings.
- Close pending races: the existing qualifying municipal PR and ward rankings, separately labelled. At least 50% and less than 100% district reporting, margin within 2 percentage points, with no reported council allocation/ward winner. If none qualify, show counts in progress without claiming they are close.
- Paths to a majority: reported hung councils with a unique largest party, ranked by seats short of the strict majority threshold; alongside the most divided councils, ranked by the lowest largest-party share of all council seats. The divided ranking includes tied largest parties and uses shares so council size does not dominate. Independent seats remain in the denominator but their combined total is not treated as one party. Stacked seat bars show the split, the majority marker and the exact shortfall. Both lists exclude estimates and link to the majority builder without implying political agreements.
- Province picture: all councils grouped into reported majority, reported no-majority, pending and unavailable, with links to the filtered council directory.

All sections remain expanded. Plain anchor navigation and server-rendered links work without JavaScript; the existing live-results polling refreshes the page while visible. A failed read returns an honest 503 and retry action, not zero-filled rankings. Partial summary coverage and delayed sources retain their notices.

Inspiration: the subject selection in [Results Desk](https://iec-results.fly.dev/) and its [movers](https://github.com/wkirschbaum/iec/blob/main/lib/iec_web/live/movers_live.ex) and [close-contests](https://github.com/wkirschbaum/iec/blob/main/lib/iec_web/live/contests_live.ex) pages. Styling and calculations use Counted's own components and data rules.

`tests/election-highlights.test.ts` covers majority turnover, seat changes across matched reported allocations (including new/departed parties, independents and council size changes), strict seat thresholds, estimated/tied exclusions, province completeness and the pending-count fallback. Existing council-dashboard tests cover the source comparisons and close-race criteria.
