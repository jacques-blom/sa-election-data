# Sharing analytics

The existing Google tag (`G-3ZMP92JG7N`) receives the following events only on
`counted.co.za`. Analytics failures do not interrupt sharing. Local development
and preview hosts do not send these events.

| Event | Meaning |
| --- | --- |
| `share_open` | A page, result, coalition or update share dialog opened. |
| `share_attempt` | The visitor pressed Share inside the dialog. |
| `share` | The native sharing promise resolved; `method` is `native_image` or `native_text`. |
| `share_save_image` | A PNG download was triggered, directly or as a sharing fallback. |
| `share_copy_link` | The link was successfully written to the clipboard, directly or as a fallback. |
| `share_copy_caption` | The caption was successfully written to the clipboard. |
| `share_format_change` | The visitor selected another image format. |
| `share_cancel` | The browser rejected native sharing with `AbortError`. |
| `share_error` | Rendering, sharing, downloading or clipboard writing failed. |

`share` follows Google's [recommended event](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#share).
The remaining names are custom events. Native promise resolution does not prove
delivery to a recipient, and a download event does not prove the file was saved
or posted. `AbortError` generally means dismissal but can also be returned when
the browser has no suitable share target. Opening the dialog, copying and
downloading do not count as a native `share`.

Each event includes `content_type` (`page`, `result`, `coalition`, `update`),
`item_id` (shared page pathname), `share_source` (`page`, `chart`, `coalition`,
`update`) and `share_format` (`portrait`, `square`, `status`, `link`). `method`
distinguishes native image/text, clipboard and download fallbacks; error events
use it to identify the failed operation. No error messages are collected.

Page and referrer URLs are stripped to origin and pathname on every event.
Captions, image contents, filenames, query strings, fragments, searches,
addresses, coordinates and selected coalition parties are not sent. Update IDs
are not included: per-update sharing is grouped under `/updates`.

After deployment, use GA4's Realtime or DebugView to verify event arrivals as
described in [Google's event setup guide](https://developers.google.com/analytics/devguides/collection/ga4/events).
Open a result, change format, copy its link and caption, save the PNG, then share
and cancel a native share. Check a plain page and a coalition too. Register the
event parameters you need as event-scoped custom dimensions to break them down
in reports ([Google's parameter guide](https://developers.google.com/analytics/devguides/collection/ga4/event-parameters)).
These changes collect future activity; they cannot recover historical shares.
