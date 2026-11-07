# Coalition Chaos: implementation and research

Researched and implemented 7 November 2026. This is a local prototype, not a deployed change or a measured engagement improvement.

The [current copy catalogue](coalition-copy-inventory.md) and [fact-check decisions](coalition-copy-audit.json) supersede the original copy counts and historical-source notes below. The editorial review removed weak duplicates, qualified disputed accounts and made historical dates visible.

## Entry and discovery

`/chaos` redirects to the Johannesburg game featured in the trailer. The municipality picker and random button remain available. Shared party selections continue using council-specific `/coalition?parties=…` links.

The reusable `ChaosPromo` uses Madam Speaker’s v3 sprite, pixel type and a single touch-friendly Play action. It appears after the national results, in current council seat cards, the council directory, province/district pages, highlights and coalition history. Ward and voting-district invitations open their parent municipality. Historical result pages retain only the quiet footer link. Existing coalition banners share the new artwork.

The 20-second Remotion trailer now records real Johannesburg play: DA + ActionSA, 138 estimated seats against a 136-seat majority. A genuine fictional draw removes ActionSA’s 44 seats. The end card uses `counted.co.za/chaos`; the prior Witzenberg cut is retained locally in `video/coalition-chaos/out/v2/`.

## The design hypothesis

A calculator becomes a short, replayable political story: invite parties, cross the majority line, discover who has bargaining power, test a fictional crisis, then renegotiate. The tension is between a lean agreement where every partner matters and a larger deal with a numerical cushion. Players choose their own parties. Seat arithmetic is identical for every party; dated, sourced relationships add context-specific stories without assigning reliability scores.

## Evidence and the decisions it informed

| Evidence | Design decision | Limits |
| --- | --- | --- |
| [Ryan, Rigby & Przybylski (2006)](https://selfdeterminationtheory.org/SDT/documents/2006_RyanRigbyPrzybylski_MandE.pdf): four studies associate autonomy and competence with enjoyment; social relatedness also predicts enjoyment in the multiplayer study. | Let players choose any combination; show immediate arithmetic and a clear achievable target; offer voluntary sharing. | This research motivates the design; it does not prove this particular game will retain players. |
| [Hunicke, LeBlanc & Zubek, MDA (2004)](https://www.cs.northwestern.edu/~hunicke/pubs/MDA.pdf): mechanics create dynamics that shape the experience. Challenge, discovery, expression and narrative are distinct forms of enjoyment. | One tap-based mechanic produces bargaining, dependence and a political story. Art and jokes support that interaction. | A design framework, not a causal engagement experiment. |
| [MISTRA Coalitions Barometer, 2026 edition](https://coalitions.mistra.org.za/): covers 80 hung councils, 179 administrations and 107 parties from November 2021 to February 2026. | Show pivotal partners and test withdrawals; avoid claiming an arithmetic majority is an actual administration. | Historical coverage, not evidence of today’s agreement or a prediction. |
| [MISTRA Barometer II, 2023–2025](https://mistra.org.za/wp-content/uploads/2025/08/MISTRA-COALITION-BAROMETER-II-web-ready-11-Aug-2025.pdf): shifting alignments and small-party bargaining make municipal coalitions more complex than two fixed ideological teams. | No hard-coded friendly/enemy parties and no invented party stability ratings. Situational satire applies to whichever party occupies the role. | The PDF was too large for the web reader; indexed passages and MISTRA’s publication summary informed this qualitative point. |
| [Johannesburg’s council statement, 5 May 2023](https://joburg.org.za/media_/Pages/Media/Media%20Statements/2023%20Media%20Statements/May/Joburg-elects-the-Executive-Mayor.aspx): Al Jama-ah’s Kabelo Gwamanda won the mayoral ballot with 139 votes. | The “small party, big chair” discovery is real political context. Include a source under the game’s rules. | This is a dated example, not a claim about the current mayor. |
| [GNU formation statement, 30 June 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): cooperation across the political spectrum was formalised through a statement of intent. | Let surprising combinations exist. The joke is the negotiation, not the assumption that a party pairing is impossible. | National arrangements cannot be inferred for a municipality. |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/): AA target minimum is 24 CSS pixels with exceptions; enhanced AAA target is 44. Dragging needs a single-pointer alternative. | Tap buttons, at least 44px controls, no drag requirement, keyboard operation, native dialog, reduced-motion support. | Visual/browser checks do not constitute a full accessibility audit. |

## Rules and state

- Keep existing source-entry IDs, independent-aggregate exclusions, source metadata, share URLs and seat calculations.
- Win at the existing majority threshold. A key partner is any selected party whose removal takes the total below that threshold. A lean deal has no removable partner.
- Roll one independent fictional scenario at a time. The current deck contains generic events, two outcomes per researched profile, and solo-party fallbacks. The generated copy catalogue records the exact active counts. Cards cover withdrawals of support, absences and cooperation; solo stories do not invent coalition partners.
- Card IDs are remembered in memory during the page visit. Applicable cards are exhausted before repeats. Unseen local stories take priority over national stories, followed by the general deck. Outcomes are resolved once when drawn; live DOM patches never reroll them. These are editorial variety rules, not estimates of event likelihood.
- Show cause, subtraction, verdict and margin: “FF+ withdraws support from 1 seat. 17 − 1 = 16 seats. You still have a majority. 12 needed · 4 seats to spare.” Each card starts independently from the original deal, not the previous card’s outcome.
- All scenarios retain the fixed majority target and leave the actual results and selection unchanged. They are not simulations of council voting law, attendance or abstention rules.
- Selection and source fingerprints invalidate an open scenario after relevant live updates. Refreshes keep valid selected IDs and recompute all totals.
- No party-specific bonuses, penalties, compatible-party lists, attributed fictional quotes or invented allegations. Generic roles use identical rules; tied roles and the actor in a contextual walkout are selected uniformly. Every relationship has a walkout and a truce. Historical sources establish the backstory, not the fictional event or its probability.
- Local previews using local bindings hide the freshness banner and do not poll, as requested. Source metadata remains available in the rules/source details. The `COUNTED_LOCAL_SNAPSHOT` Vite constant distinguishes local bindings from `CLOUDFLARE_ENV=live`; it is guarded by `import.meta.env.DEV`. Production and development with live bindings retain the existing genuine stale/error warnings.
- Portraits are national party-leader cameos, not assertions about municipal candidates. The dated roster and official source links live in `src/lib/seats/leaders.ts`; inspect those before updating the atlas. DA leader is Geordin Hill-Lewis, FF+ leader is Corné Mulder.
- Small parties without a leader portrait receive the same size selectable card and their IEC-backed party logo when available, with a text initial otherwise. Full party names remain in the button labels and name tooltips; the separate “Who’s who?” roster has been removed. Exact organisation-name aliases recognise local parties such as MAP16, NCM, CFRA and PDC without changing canonical election data.

## Political backstories added after feedback

The previously generic drama did not encode DA–ActionSA history. The `political-history.ts` and `local-history.ts` catalogues contain dated local and national references. Histories require all their named parties to be selected; local records use municipality IDs, provincial records use the province, and local versions take precedence over national references for the same pair. Dated public-position profiles can coexist with older local cooperation stories. A matching local pair also takes precedence over its single-party local backstory. National history is explicitly labelled as national and does not establish a local pact. The selection shows one short contextual joke and an optional “The real backstory” disclosure; relevant plot cards carry their own disclosure.

| Pair and scope | Historical basis |
| --- | --- |
| DA + ActionSA, Johannesburg | [ActionSA, 26 January 2023](https://www.actionsa.org.za/coalition-negotiations-collapse-ahead-of-joburg-motions-of-no-confidence/) documents the party’s criticism of coalition negotiations and its proposal to field a mayoral candidate; [council minutes](https://joburg.org.za/about_/government/Documents/Council-Meetings/2023-Signed-Council-Minutes/26-JANUARY-2023-10TH-ORD.pdf) provide the council record. Party criticism is attributed, not adopted as fact. |
| DA + ActionSA, Tshwane | [ActionSA, 25 September 2024](https://www.actionsa.org.za/gauteng-in-action-25-september-2024/) announced withdrawal from the DA-led coalition and gave its stated reasons. |
| ANC + ActionSA, Tshwane | Nasiphi Moya’s election on 9 October 2024: [council minutes](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997), [SABC on ANC support](https://www.sabcnews.com/sabcnews/932249-2/). |
| DA + PA, Johannesburg | January 2023 negotiations and Phalatse’s no-confidence vote: [council record](https://joburg.org.za/about_/government/Documents/Council-Meetings/2023-Signed-Council-Minutes/26-JANUARY-2023-10TH-ORD.pdf), [SABC reporting](https://www.sabcnews.com/sabcnews/phalatse-upbeat-shell-defeat-motions-of-no-confidence/). Responsibility for the breakdown was disputed. |
| ANC + EFF, Johannesburg | The [2022/23 annual report](https://lg.treasury.gov.za/supportingdocs/JHB/JHB_Annual%20Report%20Draft_2023_Y_20240206T154952Z_ntuthuzeloa.pdf) lists both in the January 2023 Government of Local Unity. |
| ANC + IFP, KwaZulu-Natal | [IFP’s June 2024 statement](https://ifp.org.za/newsroom/ifp-press-conference-to-provide-an-update-on-the-government-of-national-unity/) describes national and provincial cooperation; no municipal agreement is inferred. |
| ANC + DA; DA + FF+; DA + PA, national references | [Presidency, 30 June 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024) names these parties as GNU participants. |
| ANC + MK, national reference | [ANC membership statement, 29 January 2024](https://www.anc1912.org.za/statement-of-the-national-executive-committee-of-the-anc-on-the-membership-of-jacob-zuma/) records Zuma’s support for MK and his suspension. |

If no researched pairing matches, a selected ANC, DA, EFF, MK, IFP, PA, FF+ or ActionSA activates its dated national party backstory and two fictional stories. The party stories withdraw half a delegation or keep it together; they never invent a coalition partner. A generic card also retains access to the selected coalition’s backstory. Unknown minor parties still receive the general deck and source-backed logos when available. This is a deliberately bounded catalogue, not comprehensive coverage of every council or a claim about November 2026 alliances. Add records with dates, attributable facts, geographic scope, sources and both a rupture and a cooperation story.

### Expanded local and national coverage

Local coverage includes all eight metros and all nine provinces. The earlier expansion ledger is retained as historical research; the current catalogue records which episodes survived the editorial review. No current alliance or party reliability is inferred from these episodes.

- **Ekurhuleni, ANC–EFF:** their 2023–2024 governing arrangement and March 2024 public dispute; [EWN, 6 March 2024](https://www.ewn.co.za/2024/03/06/the-plug-must-be-pulled-doesnt-matter-when-anc-on-ekurhuleni-coalition-pact-with-eff). The ANC’s account is attributed rather than adopted as an account of blame.
- **Nelson Mandela Bay, ANC–EFF:** the May 2023 change from Retief Odendaal to Gary van Niekerk; [eNCA, 26 May 2023](https://www.enca.com/news/northern-alliances-gary-van-niekerk-elected-new-nelson-mandela-bay-mayor), [ACCORD’s historical timeline](https://coalitions.accord.org.za/coalition/nelson-mandela-bay/). The municipal IDP corroborated the coalition in search-indexed text but its URL redirected to a 404 help page; the app uses the working reporting and timeline links.
- **eThekwini, ANC–EFF:** the EFF’s vote against the February 2023 no-confidence motion; [TimesLIVE, 3 February 2023](https://www.timeslive.co.za/politics/2023-02-03-motion-of-no-confidence-against-ethekwini-mayor-mxolisi-kaunda-fails/). Supporting that vote is not presented as a formal coalition agreement.
- **Knysna, ANC–PA:** the PA’s September 2023 withdrawal and its stated explanation about appointments; [Knysna-Plett Herald, 7 September 2023](https://www.knysnaplettherald.com/News/Article/Politics/colourful-coalition-politics-in-knysna-on-a-knife-edge-due-to-race-202309071039).
- **DA–ActionSA and DA–IFP nationwide:** the [August 2023 Multi-Party Charter](https://www.actionsa.org.za/a-multi-party-charter-for-south-africa/). Local DA–ActionSA records override this national pairing in Johannesburg and Tshwane. ANC–PA uses the June 2024 GNU announcement, overridden by the Knysna record there.
- **Major-party fallback histories:** the five GNU participants with portraits use the dated Presidency announcement above. EFF uses its [July 2013 founding manifesto](https://effonline.org/wp-content/uploads/2025/02/FOUNDING-MANIFESTO.pdf); MK uses its [August 2024 organisational statement](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/); ActionSA uses its [organisational overview](https://www.actionsa.org.za/ready-for-action/). These explain party history, not municipal agreements.

### Roll, reveal and replay

“Test the deal” and “Roll the dice” enter a 1.5-second fictional negotiation interlude, with a pixel die and three changing quips. “Skip to result” is always available; reduced-motion users get a 200ms static reveal. Closing, editing or receiving changed source data cancels pending timers. A same-snapshot refresh preserves loading progress and the already-resolved outcome. Repeated clicks cannot start overlapping rolls.

There is no “1 / 3” sequence or “Another twist”. The outcome offers “Try another coalition” (return to the editable original selection) and “Roll the dice / Restart with N seats”. The original total appears above the result too.

Up to four party portraits/logos form a compact cast. Affected parties come first; additional partners are counted below. Whole-party exits use a full-body walk cycle in an illustrated council chamber, with doorway occlusion and a textual OUT/lost-seats badge. Partial withdrawals use disappointed expressions and their own label. Unidentified absences never attach blame to a randomly invented party. The outcome meter shows remaining support, striped lost support and the fixed majority marker. Reduced-motion shows a static doorway pose. Party logos come from the existing IEC-backed manifest by party ID; missing portraits use these logos, with text initials as a final fallback. The walkout uses an anonymous delegate for a party without a leader sprite. See the [animation research and asset specification](coalition-animation.md).

## Mobile and assets

The game uses its own compact header: a larger pixel wordmark, a municipality name with an aligned chevron, a compact clickable province directly above it, a generated Random die and a “View election results” button that stays on one line and opens the current council’s results. The 60px Random control balances the two-line location block. Province and municipality controls open the in-game picker. Random shuffles ready councils equally, excludes the current one and checks the selected destination's seat data before navigating. Failed reads leave the player’s deal intact. A maximum of eight candidate reads bounds failures during an outage.

Madam Speaker and her changing speech bubble live inside the sticky score panel. Majority deal names, including “The very big group project”, appear in the bubble. Selection changes automatically draw a relevant comment, prioritising newly completed public-position pairings and then other new relationships. First picks have 95 short lines across 24 sourced backstories, with applicable local solo stories also available. Other selections mix history and seat-based commentary; a large coalition is not automatically called fragile. Unseen lines take priority. The bubble is plain text, and unchanged live refreshes preserve both the quote and its source disclosure. See the [final eight-party research audit](coalition-commentary-research.md). There is no timed carousel. The party list has a little breathing room above “Who’s in?”, without a slogan or repeated tap instructions. The score shows seats remaining or spare; the lower bar contains Test the deal and a share icon when a majority is reached. Dated historical context appears beside sourced jokes; the full backstory and sources remain in disclosures. Other site pages keep their navigation with smaller mobile branding and search decoration while retaining 44px touch targets.

The scoreboard stays above the list; the action stays near the thumb. Result actions stay reachable while the small-screen dialog scrolls. Only a single plot twist is presented at a time. Party cards are two columns on phones and three on wider screens. Long names are abbreviated locally, without changing canonical data. Short landscape screens disable sticky panels so content stays reachable.

Silkscreen is locally hosted under its bundled SIL Open Font License. Normal prose retains the readable site font. The generated sprite atlases are transparent WebP files with explicit CSS cells; no animation library or external image request is needed. Reduced-motion users get no hop animation.

## Evaluation

Unit tests cover threshold ties, pivotal partners, redundant partners, scenario arithmetic, independent-roll exhaustion and rollover, visual loss attribution, national fallbacks, solo councils, grouped independents, immutable selections, renamed-party invariance for general cards, geographic history matching, equal actor selection, local/live data notices and live allocation invalidation. Browser checks cover small screens, long names, clear win/loss arithmetic, repeated rolls, loading cancellation/skip, local backstory disclosures, keyboard dismissal, sharing and live refresh behaviour.

Next evaluate with people: can a first-time player make a majority without explanation, understand why a small party matters, and voluntarily make another combination? Compare first-majority completion, time to the first understandable win, post-twist rebuilds and share completion against the previous builder. Ask whether the jokes feel even-handed. Do not treat longer dwell time alone as success. Proposed gameplay funnel events are not added in this prototype; existing sharing analytics remain in use and selections are not newly logged.

## Asset generation

The current animation assets, generated PNG source sheets and complete new prompts are documented in [coalition-animation.md](coalition-animation.md). The following describes the original static atlases, which remain available as source references.

Built-in imagegen was used, then Sharp resized and encoded the outputs for the app. The first hand-inked concept was superseded by the requested pixel style. Final game assets:

- `public/images/coalition/speaker-pixel.webp`: three poses, left to right deadpan / celebration / shock.
- `public/images/coalition/leaders-pixel.webp`: four columns by two rows. Ramaphosa / Hill-Lewis / Malema / Zuma; Hlabisa / McKenzie / Mashaba / Mulder.
- `public/images/coalition/random-die-pixel.webp`: transparent gold/cream die, generated with the built-in imagegen tool, then encoded as an 80px lossless WebP for display at 32px. Original generation is retained in the local image-generation archive.

Final prompts follow for reproducibility.

### Random die

Use case: stylized-concept. Asset type: a single production sprite for the Random municipality button in Coalition Chaos, an 8-bit South African political satire browser game. Create ONE cheerful chunky 8-bit dice sprite, a single six-sided die at a three-quarter angle, showing three distinct faces and crisp square pips. Gold and warm cream top/front surfaces, ochre shaded side, very dark forest-green outlines and pips. Authentic low-resolution pixel art: as if drawn on a 32 by 32 pixel grid then nearest-neighbour upscaled, large sharp square pixels and stepped silhouette, limited palette of 6 colours, no antialiasing, no smooth vector curves, no gradients. Strong bold readable silhouette that works as a tiny 40px UI sprite beside existing pixel cartoon characters. Die occupies roughly 85% of the square canvas, centred, with a little transparent padding all around. Genuinely transparent background. No text, no lettering, no other objects, no frame, no UI mockup, no sparkle, no cast shadow, no multiple dice, no sprite sheet.

### Party leader atlas

Use case: stylized-concept
Asset type: production sprite atlas for an 8-bit South African political satire mobile game.
Create EXACTLY EIGHT recognisable, good-humoured caricature portrait sprites of real South African political party leaders, arranged in a STRICT grid of FOUR columns by TWO rows. Overall 2:1 image ratio, each cell square, equal dimensions, perfectly aligned. Transparent background. Bust portraits, exaggerated big heads and tiny shoulders, each identical scale and facing slightly toward the viewer. Each sprite entirely inside its own cell with at least 12% empty margin on every side.
Style: authentic 8-bit pixel art, designed as if each portrait is just 48 by 48 pixels then upscaled with nearest neighbour; chunky clearly visible square pixels, hard stepped edges, limited palette of 12 colours per portrait, deep forest green outlines, warm cream highlights. NO smooth outlines, NO gradients, NO antialiasing, NO photorealism, NO painterly texture.
EXACT ORDER left to right:
TOP ROW:
1. Cyril Ramaphosa (ANC): older Black South African man, receding close-cropped greying hair, round broad face, warm brown skin, wide distinctive smile, dark suit with gold tie.
2. Geordin Hill-Lewis (DA, NOT John Steenhuisen): younger white South African man about 40, light brown neatly side-parted hair, rounded face, clean-shaven, rectangular dark-rim glasses, navy suit and blue tie.
3. Julius Malema (EFF): middle-aged Black South African man, round face, red beret and red collared shirt, assertive raised eyebrow.
4. Jacob Zuma (MK): older Black South African man, bald, distinctive rounded head and forehead, broad grin, rectangular spectacles, olive-green jacket.
BOTTOM ROW:
5. Velenkosini Hlabisa (IFP): middle-aged Black South African man, very short hair, broad serious face, glasses, charcoal suit and burgundy tie.
6. Gayton McKenzie (PA): middle-aged stocky South African man, brown skin, very short dark hair, broad face, small close-cut goatee, cheerful emphatic grin, emerald green polo.
7. Herman Mashaba (ActionSA): older Black South African man, very short receding greying hair, angular lean face, distinctive moustache, green jacket and white shirt.
8. Corné Mulder (FF+): older white South African man, short swept-back grey hair, glasses, broad face, clean-shaven, navy suit and orange tie.
All eight receive equal visual prominence and the SAME affectionate satirical tone, mildly exaggerated expressions without grotesqueness. No real party logos, no words, no labels, no frames, no pedestal, no symbols, no additional characters. Truly transparent empty areas. Sprites must be easy to isolate by splitting the image into a regular 4x2 grid.

### Speaker pixel conversion

Reference: the original three-pose secretary bird concept generated in this chat.

Transform this Madam Speaker secretary bird sprite sheet into authentic chunky 8-bit pixel art for a retro political satire game. Preserve the same secretary bird identity, grey ivory and orange feathers, black crest, spectacles, tiny dark green formal jacket, gavel and papers. Keep exactly three poses in an evenly spaced horizontal 3x1 grid with square equal cells and overall 3:1 aspect ratio: left sceptical deadpan, centre triumphant, right shocked. Make the characters cuter with oversized expressive heads, stubby bodies and simplified thin orange legs. Design each full-body sprite as if drawn on a 64x64 pixel grid and enlarged with nearest neighbour: clearly visible large square pixels, stepped contours, limited 16-colour palette, absolutely NO smooth outlines, gradients, painterly shading or antialiasing. Flat old-school pixel clusters, crisp and readable at 90px. Each full silhouette and papers contained in its cell, with transparent space between sprites. Truly transparent background, no text, no panels or borders.

