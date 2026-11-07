# Initial-render audit — 7 November 2026

The saved-chat bug used different server and browser renderers: the initial HTML
contained raw tables, which JavaScript replaced with charts. After fixing that,
this audit checked the app's Astro script entrypoints and initial DOM mutations.

## Corrections

| View | Initial mismatch | Correction |
| --- | --- | --- |
| Vote history | A shared party selection initially showed all readouts and undimmed chart bands. | Render the selected party's readouts and band opacity on the server. |
| Coalition Chaos | Shared deals initially showed zero seats and unselected parties. The first client update also drew a different speaker line. | Render the URL's validated deal, meter, controls and backstory on the server; retain its speaker memory when attaching the controller. |
| Council directory | All matching councils appeared before the client reduced the list to 24 rows. | Share the page-size constant and render the same initial batch. A noscript style reveals every matching row when JavaScript is disabled. |
| Search | Prefilled queries gained a clear button after startup. Area-scoped searches gained a 42px scope row. | Render both controls with their correct initial visibility. |
| AI connection instructions | Copy buttons appeared after startup and changed the layout, particularly on mobile. | Render disabled buttons and enable them in place. |
| Mobile map | The results panel grew from a short loading message to a 520px list. | Reserve a bounded panel height for both loading and loaded content. |

## Scope and method

Source review covered the app's script entrypoints: chat; result/history controls;
council filters; coalition game and picker; address/search controls; sharing and
copy controls; fixed and full maps; news; and live results/updates. Standard
result charts, council-seat bars, district charts, highlights and government
records already render as formatted HTML/SVG on the server.

Browser checks use the shared Astro server and an isolated browser at 1280px and
390px widths. Application script requests are initially blocked while style
modules are allowed. After fonts load, capture visible component geometry,
selected rows/parties and control visibility. Unblock and import each original
Astro script URL, then compare the same page after controllers attach. Do not
append cache-busting parameters to Astro's script URLs: in development that can
return untransformed TypeScript and create misleading syntax errors.

Representative routes include current and historical national/provincial
results, a municipality with shared history selections, district, ward and
voting-district results, council filters, shared/empty coalition deals, search,
AI instructions, changes, government history, place directory, updates, saved
chat and the map. Also check a filtered directory with JavaScript disabled:
every matching row must remain accessible and nonmatching rows must stay hidden.

The final browser pass covered 22 routes/states at both widths (44 comparisons):
no measured initial/enhanced geometry or selection differences, script import
failures, or horizontal page overflow. The no-JavaScript Western Cape directory
showed all 30 matching councils and kept other provinces hidden. The focused
history, directory, coalition, search and chat regression runs passed 64 tests.
The final project typecheck completed with zero errors/warnings (two existing
video hints), and the production Worker build passed.

## Intentional asynchronous content

- Map tiles and geometry load in reserved map frames. Map results now also have
  a reserved mobile viewport.
- News headlines are a client-fetched list with an explicit loading/error state.
  They can expand the news section when the request completes; this is still
  asynchronous content, rather than a raw-results fallback being reformatted.
- A previously selected private address and chat ownership/recent threads come
  from browser storage and cannot be included in public cached HTML.
- Live results, new chat output, user selections, dialogs and game animations
  legitimately update after the initial page. They are not initial-render
  mismatches.

This is an initial-render parity audit, not a production Core Web Vitals or
Lighthouse measurement. Browser checks cover representative data and states,
not every area, saved conversation or network response.
