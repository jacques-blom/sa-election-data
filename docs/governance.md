# Government and coalition data

Counted vendors MISTRA 2026 v1.0 (175 administrations, 80 municipal codes) separately from live IEC results. See data/mistra/2026-v1.0/NOTICE.md for attribution and mixed reuse terms. No ACCORD dataset is imported.

Import with `pnpm data:governance`; check deterministic output with `pnpm data:governance --check`. The source commit and CSV SHA-256 are in generated metadata. All rows map by stable municipal code to a 2026 municipal ID; unmapped/duplicate codes, party columns, roles or malformed dates fail the import. Source issues and seat totals that do not reconcile are retained and flagged.

`src/lib/governance/corrections.ts` applies sourced editorial clarifications during import. A corrected record retains its original wording and any changed termination code in `editorialCorrection`, alongside evidence links and a review date. The UI labels these as Counted clarifications. Ditsobotla’s September 2025 change is council reconstitution, consistent with the source narrative, rather than dissolution. George’s July 2023 outright majority was temporary; its note now records the February 2024 ward loss and June 2024 coalition split. The pinned CSV and recorded period boundaries remain unchanged.

## Display rules

- Show government history below the 2026 results (or the results-pending message). Hide the card where no administration records exist; an ongoing election does not need a “Government not verified” placeholder.
- Use “Who has governed here” and dated historical context while the count is ongoing. Show government-change comparisons only when both administrations are confirmed, and hide partner-seat panels without usable comparisons.
- Coverage ends 2026-02-28, despite the October release date.
- Roles, seats and officeholders are at inauguration; later changes may be in Notes.
- A latest row, including Active, is historical context, never proof of government now or immediately before the election.
- Outside supporters are distinct from members. Grouped independents cannot be matched as a party.
- An absent record is not evidence of majority rule. Districts are not covered.
- The 2026 formation-member comparison is hypothetical arithmetic, using exact normalised full names and explicit aliases. Missing, ambiguous or unknown parties block calculation, rather than becoming zero. Disputed membership blocks the comparison.
- A reported seat allocation is not a final declaration. Reporting completion never confirms government formation.
- Historical election pages do not receive 2026 government context.
- Result headlines and council modals compare governing parties from immediately before the 2026 election with the confirmed new administration. Prefer verified pre-election membership; otherwise show the latest recorded administration with its own date and “Last recorded” label. Show “Pending” until the post-election membership is known. Only two verified phases produce a retained/changed verdict. This shared government comparison is independent of the 2021-to-2026 vote and seat comparisons; national/provincial council counts are labelled “Seat majorities”. Historical 2021 views keep their original post-2021 administration.

## Confirming 2026 governments

`src/lib/governance/verified.json` is intentionally empty until evidence has been reviewed. Add a record per municipality and phase only when official council proceedings or independently corroborated public sources establish membership. Source dates must substantiate the phase; do not populate before-election from MISTRA merely because its record is Active.

Each record has municipalityId (2026 IEC ID), election: 2026, phase: before-election or after-election, effectiveFrom (ISO date), verifiedAt (ISO date), members and supporters (MISTRA party keys), arrangement (coalition, minority or single-party), leadParty (explicitly evidenced key or null), sources (title/url pairs), and notes. Party keys must exist in parties.ts; add new organisations with evidence. Grouped independents are disallowed until individually identified records are supported. Update a phase record with a newly verified arrangement, retaining prior evidence in version control. Do not infer the lead party from mayor or seat size.

The validator rejects duplicate phases, bad dates, overlapping roles, absent sources and invalid parties. Before/after comparison distinguishes retention, former partner governing alone, a changed lead party, and changes to composition/support. These labels depend on confirmed administrations, not vote shares or seat finality. Until both phases exist, government change is unconfirmed.

Election finality continues to use the app’s election metadata; final results alone cannot populate verified.json. Government records have their own verification dates.

## Surfaces

Municipality government cards (including when results are pending), town/ward parent context, home/province council outcomes, council dashboard rows, coalition builder, highlights, map context, API, MCP and Markdown place exports use the same source module. The original seat-outcome and majority-change metrics remain electoral measures.

`governmentBaseline` and `governmentComparison` choose the same dated baseline for visual comparisons, map/share captions, AI summaries and exports. `GovernmentTransition` is shared by council modals, municipality headlines, the council directory and highlights, provincial municipality cards, the government directory, municipality history and coalition pages, and explicitly named parent-council context on ward/voting-district pages. Historical views never receive the current comparison. Retained governments are excluded from government-change highlights, and exports label each phase using its own members.

`GET /api/v1/governments` paginates covered municipalities (limit 1–200, offset). `GET /api/v1/governments/{id|code|slug}` returns source, coverage, latest record, full history, verification state and government change. A valid municipality without source records returns not-covered, not a false single-party government. Municipal and ward result endpoints carry separate government context for 2026. MCP get_government_history uses the same endpoint.

Static records ship with the application; they require no D1 migration, upstream runtime requests or production writes.

## Majority administrations and historical seat baselines

`src/lib/governance/majority-administrations.json` records sourced facts about single-party administrations outside MISTRA’s coalition coverage. It currently contains Buffalo City: the municipal 2024/25 annual report, political governance section (p. 61), records that the ANC formed the government after the 2021 election. The IEC seat-calculation report gives ANC 61 of 100 seats. Both source links are attached to the record. The report’s financial-year end, 30 June 2025, is an evidence-period date, not a verification of who held office immediately before the 2026 election. These factual summaries retain their original sources and are not relicensed under MISTRA’s CC BY licence.

Other municipalities can display a `2021 council` baseline from complete archived IEC seats. This is explicitly an election allocation, not evidence of subsequent government or an entry in `verified.json`. MISTRA history takes precedence over an electoral baseline; later recorded administrations must not be hidden by the 2021 majority.

The historical seat reader accepts grouped OTHER entries only when the full ward/PR allocation reconciles and a grouped or unidentified majority is impossible. It does not estimate missing historical seats or relax live 2026 validation. This restores complete historical council allocations to municipality cards, council comparisons and MCP summaries.

`src/lib/history/corrections.ts` attaches the [IEC’s 26 May 2022 Cape Town recount correction](https://www.gov.za/news/media-statements/electoral-commission-finalises-electoral-court-sanctioned-recounts-cape-town). The original archive has DA 136/Cape Independence Party 1; the derived allocation moves one PR seat to give 135/2. It requires the exact original council and party seat counts, cannot apply twice, and leaves raw snapshots and votes untouched. The chart identifies the older vote shares explicitly, while corrected seat views link the IEC statement.

Municipality, province and national pages include an accessible vote-share history chart with year inspection, party highlighting, historical council outcomes, source links and a values table. The chart uses a consistent ballot basis, preserves missing-data gaps, marks 2026 points as provisional, and stops at the page’s selected election. Results are published same-ID geographies, not boundary-adjusted comparisons. `/api/v1/history/{level}/{id}` exposes the same calculations and provenance.

