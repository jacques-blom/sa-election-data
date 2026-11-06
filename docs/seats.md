# Council seats and coalition playground

Municipality pages show a full council seat estimate from the current count, or
the IEC's reported allocation when it is complete and reconciles. Town, suburb,
ward, province and national pages do not infer council seats from their votes.
The existing read-only API continues to expose the IEC's source seat fields;
estimates are a separate presentation calculation, never written into source data.

## Current-count estimates

`src/lib/seats/allocation.ts` combines each party's ward and municipal PR votes.
It reserves the IEC's reported independent ward wins, excludes independent votes
from the party quota, and distributes the remaining seats using whole quotas and
largest remainders. The quota is `floor(party votes / available seats) + 1`.
A remainder tie favours the party with more votes; an equal-vote tie at the final
seat makes the estimate unavailable. Party order never breaks a tie.

Reported party ward wins are a floor. If a party has more ward wins than its
proportional entitlement, those seats are retained and the remaining parties'
quota is recalculated. An entitlement equal to the party's ward wins needs no PR
top-up and does not itself change other parties' allocations.

This is a conditional calculation using the votes counted so far, not a forecast
of missing districts. It assumes parties can fill their estimated seats and
fixes only reported ward wins and independent seats. It does not model unfinished
ward contests, further independent wins, unopposed-ward adjustments, parties
without a usable PR list or candidate-list shortages. These limitations matter:
the arithmetic alone cannot reproduce every final IEC allocation. The estimate
label, count coverage and caveats remain visible or available with the result,
playground and exports. There are no winner calls or inferred governing agreements.

Reference: [Municipal Structures Act, Schedule 1, items 12, 13 and 16](https://www.dpsa.gov.za/ethicsofficerguide/resources/lg/Municipal%20Structures%20Act_up%20to%20Nov2022.pdf).

The model requires a positive council size, all individual party rows, integer
vote and seat counts, consistent ward/PR splits and reconciled source totals.
Zero votes, missing fields, aggregates, contradictory totals and unresolved
ties produce an explanation instead of numbers. The 1,000-seat upper bound is
a defensive rendering limit, above all councils in the imported data.

The IEC's allocation replaces an estimate only when its seat progress is complete,
every party's ward plus PR seats equals its total, every expected ward is
accounted for, and all party totals add up to the council size. It remains
labelled **IEC-reported**, **provisional**, rather than independently declared.

## Playground

`/2026/places/{slug}/coalition` adapts the mockup's party controls, semicircular
seat diagram, segmented bar and share tools to the municipality's current seats.
It opens only where a full breakdown is available and no party individually
reaches the majority threshold. No combination is preselected unless party IDs
are provided in a shared URL. Combinations are never recommended or ranked.

The threshold is `floor(council seats / 2) + 1`; the bar marker stays at exactly
50%. At 60 of 120 seats, a selection is one seat short; 61 reaches the threshold.
The grouped INDEPENDENTS row is displayed in the council's total but cannot be
selected as one coalition bloc. Its seats remain neutral in the playground.

Selection uses stable IEC party IDs in `?parties=...`. Live refreshes preserve
the selected IDs and recompute the on-page totals, status and diagrams from the
new result. An open share preview keeps its captured figures; reopening it uses
the latest allocation. Shared links open the latest available allocation and do
not promise a frozen historical snapshot.

The image leads the shared sheet, with a large seat total, majority headline,
seat diagram, Counted branding and a compact source/time footer. Square,
portrait and story formats preserve the hypothetical and estimated/reported
labels. Post captions contain just the selected parties, seat total and outcome,
plus the hypothetical/estimated context. “Share to WhatsApp” is primary and
“Share” secondary. Native file sharing includes the PNG and caption; the web
fallback saves the PNG and asks the user to attach it in WhatsApp.

Controls use `aria-pressed`, keyboard activation, 44px minimum heights and a
single polite result announcement. Seat fills and bar segments transition
together; reduced-motion preferences disable transitions. Long real party lists
may require scrolling; no party is hidden in an Other category.

## Verification

`tests/seats.test.ts` checks both ballots, independent seats, ward overhang,
equal-entitlement cases, remainder ties, bad data, complete source allocations,
seat conservation and the coalition majority boundary. Use `pnpm check`,
`pnpm test` and `pnpm build`, plus browser checks for responsive controls, shared
URLs, live corrections while sharing, keyboard use and all PNG dimensions.
