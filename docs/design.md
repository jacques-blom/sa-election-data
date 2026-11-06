# Counted: product and interaction design

Updated 5 November 2026. This is a proposed design; features described below are not all implemented.

The interactive prototype is at `../sa-election-mockups/index.html`. Open it directly or run `python3 -m http.server 4177 --directory ../sa-election-mockups`. All results, historical comparisons, national and province totals, candidates and council allocations in the prototype are fictional. It does not fetch live election data.

## Purpose

Help residents find local election results, understand changes, share a useful summary and contact their ward councillor. People should be able to start with an address, a familiar place name or a province.

Lead with maps, charts and large numbers. Use short labels to explain what they measure, with detailed methods one tap away. Keep the editorial voice nonpartisan.

## Name

The site is **Counted**, with **South African election results** as the descriptor.
Jacques registered **counted.co.za** on 5 November 2026. Use Counted consistently
in the wordmark, page titles, accessible labels and API documentation. Keep the
existing soft-corner Flag X icon beside the live-text name.

Use **https://counted.co.za** for public links, canonical URLs, sharing and
documentation. Internal Worker, D1, queue and bucket names can retain
`sa-election-data`; those resource names are not the public brand.

## Visual design

Use warm paper, green-black text, generous spacing and the selected soft-corner Flag X icon. The upper fork combines the South African flag’s green Y, black triangle and gold edging; the blue and red lower arms complete a voting X. Render “Counted” as live text beside the icon, never as part of a wordmark image. Use the icon alone for favicons and compact placements. Keep the wordmark readable at phone size. Large shapes and numbers establish the hierarchy; labels explain the data without competing with it.

The shared wordmark uses bold Space Grotesk with tight spacing, followed by a smaller `.co.za` suffix at 60% opacity. The suffix shares the baseline and remains readable on phones. The accessible name is “Counted.co.za home”. `Brand.astro` imports the trusted SVG master as raw markup and embeds it in the server-rendered page, so the logo needs no separate image request. Keep the wordmark as selectable live text, and retain the original SVG file for favicons and downloads.

| Element | Direction | Use |
| --- | --- | --- |
| Background | Warm paper, #F5F3E9 | Page background and share images. |
| Text | Green-black, #163A30 | Headings and primary labels. |
| Brand accents | Deep green, gold, black, blue and red in the selected Flag X; quieter ochre and terracotta in page patterns | Keep the icon flat, with consistent soft corners. Brand colours do not indicate party support. |
| Party colours | Consistent colours with a neutral Other | Municipality shapes, vote bars, history and image exports. Always include party names. |
| Reporting progress | A light-to-dark indigo scale | The national province map, with a labelled 0 to 100% legend. It measures districts reporting, not party support. |
| Typography | Space Grotesk, locally bundled under the OFL | Large numerals, headings and labels. |
| Geography | Simplified MDB province and municipality outlines | Recognisable places; displayed shape size does not represent votes. |
| Charts | Horizontal vote bars, paired historical bars, progress rings and council seats | Comparisons with explicit values and denominators. Reporting percentages use a small circular indicator inline and a horizontal progress bar in standalone summaries, including the home page. |
| Components | 20px surfaces, 12px controls, 6px details and 24px dialogs | Apply the same radius scale across desktop and mobile. Keep seat dots, map points and avatars circular. |

### South African patterns

Use three original SVG treatments, each with a defined role. The references guide repeat, texture and construction; the artwork does not reproduce a particular fabric print or assign invented meanings to colours.

| Reference | Treatment | Placement |
| --- | --- | --- |
| Shweshwe printed cotton | Small ivory dots, circles and diamond repeats on indigo | Comparison cards; keep it away from chart marks. The decorative strip beside home search has been removed. |
| Zulu beadwork | Rows of small coloured beads forming geometric diamonds | A quiet, fading header background, narrow bands on council cards and the footer. |
| Xhosa umbhaco garments | Layered dark bands on a warm field, with small bead-like details | Councillor guidance and participation cards. |

Sources: [Da Gama's shweshwe production](https://www.dagama.co.za/shweshwe-african-cultural-fabrics/), [Brighton Museum's shweshwe textile](https://fashioningafrica.brightonmuseums.org/textiles/r6104-9-textile-shweshwe/), [The Met's beaded belt, attributed to a Zulu or Sotho artist](https://www.metmuseum.org/art/collection/search/314789) and [The Met's umbhaco wrap skirt, attributed to a Xhosa or Mfengu artist](https://www.metmuseum.org/art/collection/search/316786). Traditions and meanings vary by maker and community. Develop the production artwork with South African designers or makers, with credit for commissioned work.

The [pattern reference page](../../sa-election-mockups/patterns.html) shows the three treatments together. Use one treatment per component. Keep patterns outside data plots and at lower contrast than results. Shared images use the same identity and retain legible source and status labels.

The header shares the warm page background, without an enclosing border or opaque navigation bar. A restrained beadwork repeat fades into the page behind the navigation, leaving the logo and controls clear. Patterns provide identity; they never encode election results.

The selected soft-corner Flag X is now a small, editable SVG: `public/brand/counted-icon.svg` in the real site and `assets/electioninfo-icon.svg` in the prototype. It redraws the approved generated shape with solid, moderately muted green #347E65, gold #DEB251, charcoal #263E34, blue #5287BE and coral #CD6D5D. Keep these colours stronger than the rejected pastel treatment. The wordmark remains live text in `src/components/Brand.astro`. The SVG is the master for headers, favicons and prototype image exports; PNG and WebP files are derived compatibility/download assets. Preserve the 1117:936 aspect ratio and tight viewBox. Asset details are recorded in `public/brand/asset-info.json`.

### Real-site implementation

The existing home, municipality, town, ward and search pages use `src/styles/design.css` on top of their component foundations. `src/styles/patterns.css`, imported by the shared layout, owns decorative treatments using the original mockup SVGs in `public/patterns/`:

- Beadwork fades into the shared header and forms a complete 28px repeat in the footer, place cards, municipality cards, council seat panels and majority builders. Keep the whole diamond visible instead of cropping it to a few pixels.
- Council rows use neutral surfaces. The compact council-page highlights restore the coloured cards: indigo with shweshwe for majority changes, pale green with beadwork for vote-share moves, and warm sand with a woven edge for pending races.
- Dense movement and seat-change panels use a faint corner of shweshwe linework. `shweshwe-ink.svg` retains the original geometry with indigo strokes on a transparent field, so it blends into the existing panel colour without an opaque rectangle.
- The warm banded treatment finishes ward/place guidance cards and the AI callout. On phones the callout’s side panel becomes a bottom band, leaving the text and button the full width.

These CSS pseudo-elements are decorative, ignore pointer input and disappear in print and forced-colour modes. They carry no result meaning, never cover chart marks and add no JavaScript or image dependencies. Reporting indicators continue to use indigo based on actual district reporting.

The council page at `/councils` says “2026 council results” and leads with one place/address search. Compact council rows replace the card grid; each shows its name, province, seat split and outcome once. Estimated seats and district reporting remain explicit. National vote shares and the province map are the home page at `/`.

Ballot and status views retain their data, denominators, warnings and source times. On phones, party names sit above the bar so long published names remain readable. The header also styles the map navigation being built in parallel. Page types with no implementation are not linked as working features.

### Home page and navigation

The home page serves the whole country with national vote shares, the province map, metro results and election history. National results is the first navigation destination, followed by Councils, Highlights and Explore map. The council page starts with place search, followed by allocation coverage, province selection and a single row of outcome filters. Each party with a reported majority has an option alongside All councils, No majority and Pending. Counts follow the province; party selection never promotes estimates into majorities. More filters contains majority changes. The first eight council rows precede compact coloured highlight cards, which disappear while filtering. Council filters and shared links stay on `/councils`.

The prototype has 15 municipality pages: all eight metros plus Makana, Mossel Bay, Polokwane, Ray Nkonyeni, Mbombela, Rustenburg and Sol Plaatje. Search also recognises example town names such as Makhanda, Margate, Nelspruit and Kimberley. Each province has at least one example page.

National and province figures describe a fictional full count. They are independent of the smaller set of 15 municipality examples. National totals sum the nine province summaries. Reporting coverage is 14,605 of 23,696 districts, or 61.6%; 52 of 213 metro and local councils have completed counts; 22 of those have no single-party majority. These are design fixtures, not claims about the actual election. Production totals must come from the complete dataset and state their coverage. District councils need a separate scope because their ballots and allocations differ.

Municipality pages lead with council seats: a seat diagram, seats by party and the majority threshold. Use the complete, reconciled IEC allocation when available; otherwise show **Estimated council seats**, calculated from both ballots with reported ward wins and independent seats accounted for. State that it is based on the current count and can change, and provide reporting coverage and the model's assumptions. PR vote percentages alone are insufficient. If the inputs do not reconcile, show why a seat estimate is unavailable and retain the vote results. See [seat methodology](seats.md). Province and national views retain reporting coverage and scoped vote aggregates; combining seat counts across councils does not describe control of any one council. Insights show rankings and trends. The ward page shows the contest while counting and the representative after declaration. The contact guide uses more text because it gives instructions.

On mobile, the council page’s first screen prioritises the title, search and council filters. Rows place the council name and outcome above the seat bar. Highlights never precede the council results. Share images need a separate check at messaging-app size. Never rely on colour or geographic size alone. Label reporting progress as districts.

Basic maps, local search and results already exist in ElectionSePush and ElectAI. The proposed emphasis is comparisons across places, changes between updates, reusable public data and summaries people can send to their communities. Councillor lookup also exists; connect it to the result status, verified contacts and practical guidance.

## Council seats and coalition checker

The municipality’s default share card follows its selected view: council seats when allocated, PR vote share when the user opens that tab. Label ward-plus-PR council seats separately from PR ballot percentages. A seat majority does not establish an agreement, election of a mayor or actual control of council decisions.

Offer **Try a coalition** when no party holds more than half the seats and a complete reported or estimated allocation by individual party is available. Preserve the estimate label throughout the playground and exports. An aggregated “Other” total cannot act as a coalition partner. Grouped independent seats remain unselected because individual candidates are unavailable. Missing estimates and councils with a single-party majority link back to their results instead.

- Start with no parties selected. Show each party’s allocated seats and a clearly labelled toggle. Do not recommend combinations or rank their political plausibility.
- Update the total, coloured seat dots, seat bar and shortfall immediately. Place the segmented seat bar below the majority message, with each selected party’s colour and a compact party/seat legend. The marker stays at exactly 50% of all council seats; the result still requires `floor(total council seats / 2) + 1`. Reaching exactly half is one seat short, not a majority. Unselected seats remain neutral.
- Party controls use a uniform thin border and soft party-colour fill when selected, with a simple minus symbol to remove and plus symbol to add. Avoid checkboxes and thick selected-edge borders. Preserve `aria-pressed`, focus visibility, party names and seat counts.
- Animate selected-seat colours and bar widths together over about 280ms. Keep chart elements in place between updates. The total changes directly with a short fade, rather than counting through intermediate numbers. Do not bounce or stagger each seat: large selections such as DA’s 54 seats became visually busy. Rapid toggles retarget existing transitions; reduced-motion settings update immediately. Announce the final, correct total once per interaction.
- Keep button focus after each toggle, expose `aria-pressed`, announce the updated total/status and provide Clear selection. All states must work without colour cues.
- Keep the entire coalition workspace within one viewport on phones and computers: all party controls, Clear selection, selected-seat total, seat diagram, majority status and Share. Use a compact result above a two-column party grid on phones, and side-by-side result and controls on computers. Include Clear selection as the final grid cell. Remove the duplicate mobile summary.
- Use the small viewport height (`svh`) so an expanded mobile browser toolbar does not hide the controls. Reduce navigation, decorative space and diagram height in short windows while keeping party buttons at least 44px high. On the shortest phone screens, the segmented bar replaces the seat-dot diagram; keep the total, status, 50% marker and all controls visible. Keep a direct link back to the municipality. At accessibility zoom or below the supported minimum height, allow normal scrolling rather than clipping content. Show the hypothetical/demo label in the workspace and put longer explanations behind How this works.
- Preserve the selected parties and snapshot in the URL. Reopening a link restores that exact scenario; unknown and duplicate party identifiers are ignored.
- Export the same selection as text or square, portrait and status PNGs. Include municipality, selected party seats, total council seats, majority threshold, timestamp, source and **Hypothetical**. A link is attached to WhatsApp text; image sharing uses the native share sheet where supported, with PNG download as fallback.

The prototype uses Nelson Mandela Bay’s **fictional** 120-seat allocation to demonstrate the boundary: 60 is one short; 61 reaches a majority. It contains seven individually selectable parties. Mossel Bay demonstrates a single-party majority, and Makana demonstrates pending allocation. These fixtures do not describe actual results or actual coalition negotiations. The checker performs seat arithmetic; predictions and suggested political agreements remain outside V1.

Background: [COGTA’s framework for coalitions in local government](https://www.cogta.gov.za/index.php/2021/11/22/a-framework-for-coalitions-in-local-government/). The full-seat threshold used here is a simple majority reference, not a simulation of meeting attendance, abstentions or the rules for every council vote.

## Copy

### Education in the results

Use `CivicGuide` for contextual explanations: one useful sentence stays visible;
a native disclosure opens small visual examples. The same content lives at
`/guide`, linked from the footer. It works without JavaScript, and result refreshes
retain the reader’s open disclosures. Keep full methodology in the existing source
details rather than the primary explanation.

Council outcomes lead with **outright majority**, **hung council**, or **seats
pending**. Pair colour with a written label and icon. Only reconciled reported
seats establish an outcome; estimates remain pending in summaries. Show the
largest party’s seats against the halfway line and state the integer majority
threshold. Exactly half is not enough. Historical views identify the election
year, not the current government.

Vote leaders are explicitly labelled as leading **in votes**. Explain ward/PR
ballots beside the ballot selector, council types beside the place heading, and
voting districts on their own pages. Reporting is distinct from turnout; national
and provincial local-election totals do not elect a national or provincial
legislature. Link percentage-point changes to the worked example in the guide.

Apply the linked [Humanizer skill](https://raw.githubusercontent.com/blader/humanizer/refs/heads/main/SKILL.md) to screen text, help, downloads and generated summaries. Use direct labels: Results, Metro leaders, Compare with 2021, Recent updates, Share results and Contact your councillor. Remove slogans, staged fragments and metaphors that make people work out what a feature does.

State the fact and its status: “DA is leading”, “Count complete” or “Seat allocation pending”. Use full place names where space allows. Explain PR, percentage points and council majorities on demand. Retain dates, sources, sample-data labels and uncertainty when editing for brevity. Copy in an exported image must agree with the screen and underlying records.

Whenever a vote percentage and vote count appear together, lead with the percentage and give it the stronger visual emphasis. Show the vote count as smaller, muted supporting text. Put share before votes in tables, map results and exported summaries, and keep unavailable shares explicit.

## Who and what comes first

1. A resident: “What happened where I live, and who represents me?”
2. Someone following the election: “What changed, where is it close, and what does it mean?”
3. A community organiser or journalist: “Give me a reliable summary I can send or reuse.”
4. A developer or assistant: “Give me the same facts and definitions in a structured format.”

V1 connects Results, province and municipality pages, Insights, Saved places, Your ward, a councillor guide and a secondary Data directory. Basic use does not require an account. Save followed places on the device initially. Search accepts municipalities and familiar place names. Address search resolves a selected coordinate against the correct election's ward boundaries; an address is not evidence of voter registration.

## Concrete insight views

| View | The question it answers | Presentation and shareable output |
| --- | --- | --- |
| Metro leaders | Who is ahead in each of the eight metros? | Eight compact cards with municipality, leading party, share, lead over second place, reporting progress and status. One share action exports the complete board. No map required to read it. |
| Compare with 2021 | How has support changed here? | Paired bars for each party, 2021 → 2026, with percentage-point changes. During counting, default to the same matched reporting districts and show coverage; offer final 2021 totals as a clearly different comparison. |
| Biggest movers | Where has a party gained or lost the most support? | Ranked changes with party and province filters, minimum comparable coverage, direction, sample size and comparison method. Rank gains and losses separately. New entrants say “new”, not a fabricated swing from zero. |
| Closest races | Which contests deserve a closer look? | Current margin in votes and points, outstanding districts, and the two leading parties/candidates. Show the scope of the ranking. A small margin is not a prediction or a declaration. |
| Council outcomes | Where is there a majority or a hung council? | Confirmed seat totals against the majority threshold. Separate awaiting seats, majority, and no single-party majority. Winning most votes does not establish control of the council. |
| Recent updates | Which results have been decided since I last checked? | Confirmed ward wins, confirmed council outcomes, completed counts and corrections to earlier announcements, scoped to followed places. Exact “from” and “to” snapshots, evidence and timestamps. |
| Party footprint | Where is this party doing better or worse? | A searchable municipality list and a distribution of comparable changes. Party selection never changes the rules or threshold for inclusion. |
| Election trends | Is this part of a longer trend? | 2016 / 2021 / 2026 local-election vote share, turnout and seats as separate series. No implied continuity across changed boundaries. A national election is a separate context, not an interchangeable baseline. |

Ship national and province browsing, municipality results, the metro board, comparisons, closest races and a milestone feed first. Release biggest-mover rankings only when matching and coverage rules are trustworthy. Party footprint, longer trends and a broader majority tracker follow. Do not delay clear basic results for AI chat.

### Recent updates: V1 publication rules

Publish only when a result is confirmed or an area finishes reporting:

1. **Confirmed ward win:** a party's candidate or an independent has won the ward, supported by an explicit, verified IEC result/seat signal. A provisional lead never triggers a win announcement. Where historical boundaries are comparable, say “gains Ward X from Party B” or “retains Ward X” within that announcement; do not create another post.
2. **Confirmed council outcome:** confirmed seat allocations establish a party majority or no single-party majority (a hung council). The largest vote share alone does not establish a council win or who will form the government.
3. **Counting complete in an area:** a reliable IEC reporting measure establishes that all expected reporting units for the stated area and ballot have reported. This means counting/reporting completion, not polling stations closing. Use “Count complete. Official confirmation pending” while declaration or seat allocation is outstanding. Placeholder progress fields must not trigger completion.

Corrections are the necessary follow-up to these announcements: publish a visible correction linked to the original when a previously announced winner, council outcome or completion status changes. Preserve the original snapshot and annotate it rather than silently rewriting history.

Combine a win and completion arriving together into one card. Keep routine vote totals, percentage milestones and changing provisional leaders in the live results views, outside this feed. Scope ward announcements to the viewed/followed area and group them in national views to avoid a flood of individual posts. A historical import establishes the baseline; it does not create fresh news.

Each card includes election, area, ballot, confirmed/provisional status, absolute time in SAST, the source evidence and supporting snapshot IDs. Include the winning margin, seat split and a short factual explanation where available. Distinguish source time from when we observed and published the update. Generate the copy from deterministic templates.

Defer official recount/delay announcements until a dependable official-announcement source is integrated; never infer them from a stalled count. Before enabling automatic win/completion posts, verify that the IEC source actually supplies the required signals. The current provisional numeric feed alone is not evidence of an official declaration.

## Results and comparison rules

- Every card states its ballot: municipality PR vote for the metro board; ward ballot for a councillor contest. Never add ward and PR votes and call the sum voters.
- “381 of 700 voting districts reporting” is distinct from “54.4% of votes counted”. The latter usually cannot be inferred. Shortened UI wording must preserve that distinction.
- Source time, retrieval time, publication time and snapshot ID are separate fields. Show SAST explicitly. Do not imply a feed is live when stale; keep the last valid snapshot with a visible age.
- A live leader is not a winner. A fully reported count is not automatically an official declaration. Seat allocations and government formation are separate events.
- Live comparisons require comparable geographies and the same ballot. Match unchanged districts or use a documented crosswalk. Never infer votes within a suburb by apportioning the land area of intersecting wards. Where matching is impossible, say so and suppress the swing.
- The percentage-point calculation is current share minus baseline share. Explain it on demand with a simple example. Keep “points” distinct from percentage growth.
- Use deterministic, versioned calculations. Every insight links to its supporting rows and method. An AI may explain those facts later; it must not invent projections or recompute an alternative answer.
- Feeds may be revised or regress. Snapshot ingestion is idempotent, records corrections, and never silently edits an already shared historical card.

## Sharing is part of the product

Every chart, insight and place has a visible Share action, including on mobile. The user's selected geography, ballot, filters, comparison and snapshot travel with it. A share sheet previews exactly what will be exported.

**V1 actions:** share to WhatsApp, use the device share sheet, download PNG, copy a concise text summary, copy a snapshot link, and download the underlying CSV. Native sharing may carry the image if the browser supports file sharing. A WhatsApp web link can prefill text and a link; it cannot silently attach an image. Offer “Save image, then attach it” as the explicit fallback. Do not claim it sends anything automatically.

**Formats:** square 1080 × 1080 for group chats and social posts; portrait 1080 × 1350 for feed posts; story/status 1080 × 1920 with safe zones; landscape 1200 × 630 for link previews. All carry the election, area, ballot, source, absolute date/time, reporting coverage and provisional/final status. Include a readable short URL. Use stronger type and less content than the screen, so compressed WhatsApp images remain legible. Never make colour the only indicator. Generated images have equivalent plain text for accessibility.

Suggested share templates:

1. “National election results”: party vote shares and province results, with ballot scope, reporting coverage and denominators.
2. “Metro leaders at 15:00”: the complete eight-metro board.
3. “Tshwane results”: top parties, progress, margin and one short explanation.
4. “Change since 2021”: the largest comparable changes, with the baseline in the image.
5. “Updates since 14:00”: confirmed results and completed counts linked to the supporting snapshots.
6. “Your ward councillor”: declared winner, ward, official contact availability and a link to the guide; never the resident's address.

Shared links open an immutable snapshot with a conspicuous “View latest” action. The normal place URL always opens current information. A correction annotates the affected snapshot rather than silently replacing it. Open Graph images derive from that same snapshot. Filters fit in an allowlisted URL; raw addresses, precise residential coordinates and draft messages never enter share links, images, analytics or metadata. Downloads must preserve the illustrative watermark in the prototype.

Implementation direction: one presentation-neutral summary model feeds on-screen charts, text, PNG/SVG renderers, HTML metadata, REST and Markdown. Version and cache image exports by snapshot, template and format in R2. Keep the browser preview and server export templates equivalent. Do not screenshot arbitrary UI chrome. Generate exports from a saved snapshot so they can be reproduced.

## Your ward and your councillor

After a selected address resolves to a ward, show the ward number, municipality and boundary year, followed by the ward contest and representative. The municipality PR result remains a separate tab/link. Address search does not require an ID number and does not check registration. Let users correct an imprecise pin or an ambiguous boundary match. Keep the selected address in the current session rather than persisting it by default.

Use explicit result states:

| State | Public wording | Contact behaviour |
| --- | --- | --- |
| No results | “Your new councillor is not known yet.” | Link to the current official ward office, clearly dated and labelled. |
| Partial count | “[Name] is leading so far.” | Candidate identity and party, margin, reporting progress; do not label them the councillor-elect. |
| Narrow / unresolved count | “No councillor confirmed yet.” | Show the actual margin and outstanding reporting units. “Too close to call” requires a published decision rule; V1 does not make election calls. |
| All districts reported, awaiting declaration | “Count complete. Official confirmation pending.” | Keep candidate status distinct from winner. |
| Official winner | “[Name] has been elected.” | Cite the declaration and date. Track councillor-elect versus current officeholder/term separately. |
| Verified current representative | “Your ward councillor” | Official public email, office number, public office hours and ward office address where published; source and last-checked date. |
| Vacancy / by-election / changed contact | Explain the current status | Preserve historical election results and update the current representative record independently. |

No “likely winner” in V1 without a separate, transparent projection method. Never turn a candidate's campaign contact into an official office contact, infer an email address, or make WhatsApp available merely because a mobile number exists. Contact publication will lag an election in some municipalities. “Contact details not published yet” plus a verified municipal fallback is a useful, honest state. Show professional contact details intended for public use; omit residential addresses and unrelated personal details. Provide a correction/report-stale link with moderation, not an unverified public edit.

### Contacting your councillor

A dedicated, linkable page, also available as a sheet from the councillor card, has three paths:

1. **A service problem:** find the correct municipal reporting channel; log it and keep the reference number; follow the relevant municipality's escalation process if unresolved; share the reference, location, dates and requested outcome with the ward office. Councillors represent and escalate; they do not personally dispatch repair teams. Use the municipality's emergency channel for an emergency.
2. **A community priority:** attend an announced ward meeting, submit a concise proposal, ask how it can enter the ward plan, municipal budget or public participation process, and track the response. Link to verified meeting calendars and current local deadlines only when available.
3. **Help drafting a message:** a simple editable template asks what happened, where, when, the reference number and the action requested. Copy or open the user's own mail client; always let them review and send it themselves. No automatic political outreach or bulk messaging.

The councillor represents all residents regardless of how they voted. Avoid party persuasion, promises of a response, and invented universal escalation deadlines. Keep contact and participation information current after election night.

Official evidence checked for this design: the [IEC councillor directory](https://www.elections.org.za/pw/voter/Who-Is-My-Ward-Councillor) supports browsing by municipality and ward; [Tshwane's ward councillor directory](https://www.tshwane.gov.za/?page_id=17228) publishes contact columns; [Cape Town's ward guidance](https://www.capetown.gov.za/family-and-home/meet-the-city/city-council/wards/) explains representation and participation. Coverage, freshness and reusable access still need validating before building a national contact dataset. The [government ward committee handbook](https://www.gov.za/sites/default/files/gcis_document/201409/dplgwardhandbook0.pdf) is background for participation, not a source of current local deadlines.

## Party logos

Party lists pair the published name with the IEC's official artwork: national
and province summaries, province and municipality cards, full municipal tables,
ward cards, result charts, the province-map legend and the selected-ward panel.
The existing colours still encode bars and map areas. Logos use a consistent
square slot with `object-fit: contain`; the artwork is not cropped or recoloured.
They are decorative for assistive technology because the adjacent name identifies
the party. Independent candidates, aggregates and unavailable logos use a neutral
marker while retaining their names.

The assets come from the IEC's `content/img_parties/` originals, for example
[the ANC artwork](https://www.elections.org.za/content/img_parties/ANC.jpg).
The dashboard's `Party_Images` thumbnails have circular frames and shadows
baked into their pixels; do not use those for future imports. The UI adds no
background, border, rounded crop or shadow to the original artwork. A circle
that belongs to a party's actual logo is retained.

`src/lib/parties/logos.json` records each IEC ID, source URL, original and output
dimensions, SHA-256 fingerprints and import time. Lookups use IDs, not
abbreviations or candidate names. Full-size originals are archived locally in
`.data/party-logos/originals/`. Sharp resizes the whole image to fit within 192px
and encodes it as lossless WebP in `public/parties/`, preserving its aspect ratio
and transparency. This also handles IEC files whose `.jpg` URLs actually return
PNG bytes. Images are loaded lazily and use content-hashed filenames; visitors
do not request files from the IEC.

After importing local results, run `pnpm data:logos` (or `pnpm data:logos 2021`
for another imported election). It uses the local IEC party directory, downloads
and decodes the originals, and regenerates the manifest. Review changes before
deploying. The checked-in assets and manifest are sufficient for normal builds.

## Information architecture and delivery

Results opens with national party vote shares, area search and province result cards. At every geography, lead with the result: party/candidate votes, share and a provisional margin where calculable. Reporting progress and source times are supporting context. Towns lead with their overlapping wards’ results, with a visible whole-ward scope note. A province lists its municipalities. A municipality shows allocated council seats first, or PR vote results while seats are pending, followed by comparisons and updates. Hung councils with complete party allocations link to the coalition checker. Insights contains metro leaders, biggest movers, closest races and recent updates. Saved places keeps a resident's selections. Your ward connects the result, representative, public contacts and guide. Data exposes HTML, JSON, Markdown and CSV with definitions and sources.

Proposed production stack remains Astro SSR with small React islands on Cloudflare Workers. D1 holds indexed current records and aggregates; R2 holds raw input snapshots, detailed geometry, historical exports and generated images. Ingestion and snapshot publication are separate from rendering. Address lookup uses geocoded coordinates, bounding-box candidates, then an exact point-in-polygon check. Keep boundary versions and ward/result identifiers explicit. The mockup is plain local HTML/CSS/JavaScript and adds no production dependencies.

Public HTML is the universal entry point for search and consumer assistants. REST JSON is the canonical machine representation; per-area Markdown and CSV are derived from it. A small remote MCP can expose search, results, comparisons, changes and methods for clients that explicitly support/configure it. Do not assume ordinary consumer assistants can discover or call an arbitrary API or MCP automatically.

## Acceptance and scope

- A first-time visitor can find a municipality, understand whether its result is provisional, and share a meaningful card without a tutorial.
- Design and test the phone layout separately. Search, Share and Follow are reachable, charts remain legible, and no vital context lives only in a hover.
- Keyboard navigation, visible focus, accessible labels, adequate contrast, text equivalents and reduced-motion support are built in. Essential information works without heavy client JavaScript in production.
- All displayed and exported numbers come from one snapshot, with explicit denominators and source times. A stale or unavailable upstream feed is an ordinary designed state.
- V1 includes official candidate/winner identities where obtainable and a useful “contacts pending” state. Complete national contact coverage is not a launch prerequisite.
- V1 includes a neutral coalition seat calculator for complete reported or estimated party allocations with no single-party majority. It never predicts alliances. Estimates use the documented current-count model and remain distinct from IEC-reported seats.
- Defer AI chat, automated analyst/news monitoring, forecasts, coalition predictions, custom arbitrary-boundary aggregates, accounts and push notifications until the data and core flows work reliably.

Prototype coverage includes national and province browsing, 15 municipality pages, seat-first allocated results, a shareable coalition checker, comparisons and insights, saved places, sample search, a ward count/declared scenario, councillor guidance, working image/text/CSV/JSON/Markdown downloads and a share preview. Live ingestion, real address geocoding, official candidate/contact ingestion, hosted snapshot URLs, SSR and real APIs are implementation work, not simulated live services.
