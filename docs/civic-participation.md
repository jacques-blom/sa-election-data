# Coalition learning and civic participation

Implemented locally on 7 November 2026. This does not deploy the app or create a scheduled crawler.

## Learning after a roll

`src/lib/seats/learning.ts` derives a short explanation from the already resolved outcome. The eight topics cover pivotal partners, a numerical cushion, withheld support, caucus disagreements, attendance, cooperation, budgets and residents' participation. The rule is independent of party identity. A partial withdrawal never becomes an invented partner exit; an absence does not imply that the councillor lost their elected seat. Re-rendering a result does not draw a new lesson or scenario.

The explanation appears beneath a compact verdict. The modal has a scrolling body between a fixed header and footer, so replay controls reach its bottom edge without covering the final content. The footer is hidden during a roll; a new outcome resets the body’s scroll position. The lesson’s guide link opens separately so the deal stays available. “Get involved in [municipality]” closes the modal, scrolls to the local panel and focuses its heading without resetting the selected parties. The existing fictional-scenario notice, source backstory and fixed-target explanation remain visible.

Partial-delegation outcomes explain that councillors in one party can disagree and may face party discipline. “Half the delegation” is explicitly a fictional game rule, not a frequency estimate or prediction. `/participate#caucuses` gives attributed examples from the DA’s account of Cape Town’s 2018 no-confidence vote and ActionSA’s March 2023 statement about two Tshwane councillors. The simulation does not model expulsions or seat vacancies.

Voting context follows [Constitution section 160](https://www.justice.gov.za/constitution/chp07.html). Participation guidance also links to [CoGTA's local-government guide](https://www.cogta.gov.za/index.php/2021/06/01/understanding-local-government/). `/participate` explains representatives, meetings, local priorities, budgets and the difference between the game's fixed target and real voting rules.

## Coverage and evidence

`GetInvolved.astro` renders for every valid metro/local municipality game page, including when seat data is pending or unavailable. It accepts a place rather than a game model, so it can also be reused on other municipality pages. The catalogue has 213 playable municipalities; district councils have a different seat model and are not game destinations.

The base is the [GCIS provincial and local government directory](https://www.gov.za/about-government/contact-directory/provincial-local-government), fetched on 7 November 2026. `municipal-directory.json` stores only the listed municipality name and its actual directory URL. Matching includes province, protecting against the two Emalahleni municipalities. Reviewed spelling differences are explicit in the importer. No URL is inferred from a municipality name.

- 211 municipalities match individual official directory entries. Their destinations were fetched and their titles checked; five transient request failures succeeded on retry.
- Collins Chabane and JB Marks were not listed in the fetched index. Their panels explicitly link to the national directory and general participation guidance rather than inventing a local entry.
- Additional municipal participation or document indexes are stored in `resources.ts`, with review dates and instructions tailored to the destination. The linked pages themselves are the source evidence.
- Buffalo City's `public_notices.php` returned HTTP 500 and Mangaung's `schedule-for-council-meetings/` returned 404. They were excluded; both use their verified local government-directory entry instead.
- Ekurhuleni, Tshwane and eThekwini produced certificate-chain errors in command-line clients but loaded in Chrome without a certificate override. They were inspected in the browser. The IEC lookup uses bot protection, so automated HTTP status alone is not a reliable availability check.

The indexes may include expired consultation notices. The UI never claims that comments are currently open or supplies a meeting date/deadline from these indexes. It prompts residents to check the year, deadline and participation instructions. No councillor names or contact details are inferred from election results or copied into a potentially stale local contact database.

Deep links expire to the directory/guidance fallback 180 days after editorial review. Year-specific pages can specify `validThrough`; Johannesburg's 2026 notices expire at the end of 2026 in South African time. The base official directory remains available as a fallback. Ward links use the existing municipality-scoped map and address lookup. “Find my municipality” is always offered because the council being played may not be where the player lives.

## Maintenance

To refresh the GCIS list, fetch the source URL above into an HTML file, then run:

```sh
node scripts/import-civic-directory.ts /tmp/directory.html YYYY-MM-DD
node --test tests/civic-resources.test.ts
```

Review the diff, unresolved names and the actual destination pages before publishing. The importer rejects a clearly incomplete input or ambiguous matches. It does not fetch individual pages or certify their contents.

To check link health without changing the reviewed data:

```sh
node scripts/check-civic-links.ts > /tmp/civic-links.json
node scripts/check-civic-links.ts --local-only > /tmp/civic-local-links.json
```

The checker uses four concurrent public GET requests and reports status, final URL and page title. It exits unsuccessfully if a request fails. Inspect redirects, soft errors and content; a 200 response is not proof that the page is appropriate or current. Use a normal browser for certificate-chain/bot-protection differences; never bypass certificate errors. Only renew `checkedAt` after reviewing the destination's purpose and dates. No monitoring or scheduled refresh has been configured.
