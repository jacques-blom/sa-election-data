# Counted: Your council. In focus.

A 36-second demo in **4:3, 1440×1080, 30fps**, composed from real recordings of the site's mobile layout. Clean type, gentle camera movement, short transitions and an original quiet instrumental bed. Every point is understandable with sound off.

## Deliverables

- `out/counted-councils-4x3.mp4` — H.264/yuv420p with stereo AAC.
- `out/counted-councils-cover.png` — cover image.
- `out/counted-councils-source.zip` — editable Remotion project, recordings, fonts and music.
- `tweet.txt` — suggested post, not published.
- Watch and download: `/__preview/council-focus/index.html` on the local development server.
- Remotion Studio composition: `CouncilFocus`. Open the URL printed by `npm run studio`.

Studio runs on local port 3002. Use your own private HTTPS mapping for remote access. Its process ID and log are in `out/studio.pid` and `out/studio.log`.

## The edit

| Time | Content |
| --- | --- |
| 0–2s | “Your council. In focus.” |
| 2–9s | Mobile council cards: Buffalo City, then Cape Town. |
| 9–16s | Tshwane’s council summary, then its seat breakdown. |
| 16–23.5s | Select 2021 and 2026 in the council seat history chart. |
| 23.5–32.5s | Scroll through Tshwane’s recorded coalition administrations. |
| 32.5–36s | “Find your council.” and counted.co.za/councils. |

## Capture and evidence

Recorded 7 November 2026 in the isolated `council-demo` browser session, using the existing shared Astro server in live mode. Viewport: **480×640 CSS pixels, 3× device pixel ratio** (1440×1920 recordings). The composition crops those recordings into readable close-ups in a 4:3 frame. It does not reflow or reconstruct the interface, alter results, add administrations, or infer government changes from vote share. Only the Astro development toolbar is hidden in the recording browser. Source timings and interactions are in `public/footage/events.json`.

The visible UI retains provisional result and pending government labels. The coalition segment shows historical changes after the 2021 election, through **28 February 2026**. Its on-screen source/cutoff is persistent. The latest recorded administration is not presented as a verified current government. No post-2026 government change is claimed.

Coalition credit: Caromba, L., Simayile, S., & Ndletyana, A. (2026). *MISTRA Coalitions Barometer Dataset*, 2026 edition (Version 1.0). Mapungubwe Institute for Strategic Reflection. https://coalitions.mistra.org.za. Original coalition coding is [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); underlying IEC seat data and municipal identifiers retain their original terms. Counted normalises dates, matches municipal codes and displays the records. The film crops the interface for presentation. See the repository's `data/mistra/2026-v1.0/NOTICE.md` for the pinned source and full terms.

The score is generated locally from sine tones by `scripts/create-audio.py`. No external samples or imitation voices. The Space Grotesk font licence is bundled.

## Edit and render

```sh
npm ci
npm run check
npm run audio
REMOTION_BROWSER_EXECUTABLE=/opt/google/chrome/chrome npm run render
REMOTION_BROWSER_EXECUTABLE=/opt/google/chrome/chrome npm run poster
npm run studio
```

In this checkout the existing trailer's installed dependencies are reused through a local symlink; the ZIP excludes that symlink and can use `npm ci`. Set `REMOTION_BROWSER_EXECUTABLE` to your Chrome executable, or omit it to let Remotion use its own browser. The preview helper is checkout-specific. It copies outputs into the existing shared site's ignored `public/__preview/council-focus/` directory, without starting or restarting an app server.

`scripts/record-mobile.py` records four takes using agent-browser and the local server. It saves raw captures to `/tmp/council-mobile-recordings`, so recordings do not trigger app reloads. The original environment used `/tmp/council-demo-bin/ffmpeg`, pointing to an installed FFmpeg. Source clips are padded with their final frame for edit handles and normalised to 30fps. Open `src/Video.tsx` for the timeline, crops, typography and captions.
