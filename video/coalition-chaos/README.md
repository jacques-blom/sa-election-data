# Coalition Chaos — 20-second X trailer

Revision 5 refreshes the photo-referenced cast and Johannesburg gameplay. Revision 4 added a dedicated 1080×1350 (4:5) composition for the X post. The 1080×1920 (9:16) version remains available. Both are 30fps and exactly 600 frames, with the same Johannesburg gameplay, /chaos address, secretary bird and three-beat intro. Real gameplay with the existing rules, plus an original chiptune score. All essential meaning is visible with sound off.

## Watch and edit

- Remotion Studio compositions: `CoalitionChaosFeed` (4:5) and `CoalitionChaos` (9:16). Open the URL printed by `npm run studio`.
- Finished trailer preview: `/__preview/coalition-chaos/index.html` on the local development server.
- 4:5 MP4: `out/coalition-chaos-x-4x5.mp4`
- 4:5 cover: `out/coalition-chaos-poster-4x5.png`
- 4:5 composition: `src/TrailerFeed.tsx`
- 9:16 MP4 / composition: `out/coalition-chaos-x.mp4` / `src/Trailer.tsx`
- Shared sprite and artwork components: `src/Art.tsx`
- Recording edit points: `src/footage.ts`
- Recording-only layout: `scripts/recording.css`
- Original score: `scripts/create-audio.mjs`

Studio runs locally on port 3000. Use your own private HTTPS mapping for remote access. Its log and PID are in `out/studio.log` and `out/studio.pid`. The editor can be left running; it refreshes when the composition changes. It is separate from the shared Astro app and does not require restarting it.

This project adds no dependencies to the website.

```sh
cd video/coalition-chaos
npm ci
npm run assets # optional: refresh artwork inside the website repository
npm run audio
npm run check
npm run studio
# In another terminal:
npm run render
npm run poster
# Optional: refresh the retained 9:16 export
npm run render:portrait
npm run poster:portrait
# Package both compositions, then refresh the local preview
npm run source
npm run preview
```

If Chrome is already installed, use `REMOTION_BROWSER_EXECUTABLE=/opt/google/chrome/chrome npm run render`. Otherwise Remotion downloads its renderer browser.

The source ZIP includes the assets, score and both recordings. In a standalone extraction, skip `npm run assets` and `npm run preview`: those two helpers refer to the website checkout. The video sources are ignored by Git, so restore them from the ZIP on a fresh checkout.

## The cut

| Time | Shot |
| --- | --- |
| 0–1.6s | “One mayoral chain.” |
| 1.6–3.2s | “Several personalities.” All eight leader caricatures. |
| 3.2–4.8s | “What could possibly go wrong?” The new secretary bird supplies the side-eye. |
| 4.8–9.3s | “Build a majority.” Real taps select DA and ActionSA in Johannesburg: 136 estimated seats, 136 needed. |
| 9.3–14.4s | A genuine fresh roll: ActionSA walks out. The real result is 136 − 43 = 93 seats, 43 short of a majority. |
| 14.4–16.4s | The bird: “Well. That lasted.” |
| 16.4–20s | Coalition Chaos. “Now with a restart button.” Play at counted.co.za/chaos. |

## Composed for 4:5

`CoalitionChaosFeed` is a separate composition, with its own layouts. It does not resize or crop the complete portrait film.

- The chain and chamber form a shorter opening tableau; the eight portraits are larger in a compact grid.
- The setup text is left-aligned and the secretary bird sits to the right. Her reaction bubble is repositioned to the new composition.
- Four synchronised regions from the actual build recording—municipality, score, four party choices and test button—are repositioned into one compact view. All figures, party names, estimated-seat labels and selection states remain unchanged.
- The build holds at composition frame 116, immediately before the recorded modal transition. An editorial touch marker shows the same Test the deal press at its repositioned location.
- The walkout and its seat calculation fill a dedicated outcome shot. The estimate and fiction labels stay visible. The empty chamber still freezes at frame 114 to prevent the source animation looping.
- The end card has a wider leader line-up and a single prominent `counted.co.za/chaos` destination.

The region coordinates and frame holds are documented in `public/gameplay/feed-edit.json`. Source timestamps below describe the original 9:16 cut; 4:5 uses the additional build hold above.

## A clearer view of the real game

The trailer uses a recording-only stylesheet, injected into an isolated browser. It enlarges the cards, seat totals, majority marker and walkout scene. It hides navigation, extra commentary, historical detail and repeated outcome text. All 23 parties remain selectable in a scrollable roster; the six largest appear in the 9:16 shot. The 4:5 shot focuses on the four largest so that the score, choices and test button remain large and visible together. Touch markers show actual pointer presses.

The website implementation and game logic are unchanged. The trailer never changes seat totals, forces a random value or scripts a favourable outcome. Its selected walkout is one of several normal fresh rolls with the same original coalition. The new Joburg draw is “It’s a matter of principle”: ActionSA walks out. The recorded estimate is DA 93 + ActionSA 43 = 136, exactly the majority. The previous Witzenberg version is retained in `out/v2/`.

Recorded on 7 November 2026 from `/2026/places/johannesburg/coalition`, at 540×960:

- `public/gameplay/build-joburg-v4.mp4`: first 3.825 seconds played at 85% speed, showing the real selections and Test the deal tap.
- `public/gameplay/roll-joburg-v4.mp4`: source 0–3.8 seconds at normal speed, then held on the empty chamber for the rest of the 5.1-second shot. This shows the loading state, ActionSA walkout and loss of majority without replaying the game’s looping exit animation.
- `public/gameplay/source.json`: source metadata.

Both exports and their cover images carry a persistent, high-contrast “Fictional scenario · Satirical game” label, composed in `src/Root.tsx`. The source outcome recording also retains its original fiction label. Seats are the app’s estimates from live provisional IEC votes, visibly labelled as estimates; the event is fictional satire. Political caricatures represent parties. Johannesburg uses Helen Zille for DA; the cast is not a full candidate list.

To reproduce the recording presentation, open that route in `agent-browser --session coalition-trailer-v3`, set the viewport to 540×960, and run `node scripts/inject-recording-style.mjs coalition-trailer-v3`. Record to `/tmp` to avoid development reloads while capturing. Fresh rolls can be invoked through the existing `[data-chaos-roll]` button; its visual controls are hidden in the recording layout. Refresh the page to remove the injected presentation.

## Artwork and audio

- Secretary bird: `public/images/coalition/speaker-frames-v3.webp`.
- Leaders and walk cycles: `leaders-*-v4.webp`, with nine rows. The Johannesburg film uses Helen Zille as the DA cameo; GHL remains the default in other councils. Herman, GHL, Corné and Gayton were redrawn from user-supplied photographs. The chamber remains v2.
- Fonts: Silkscreen and Space Grotesk; licences included.
- Golden chain: original pixel-style vector shapes in `Art.tsx`.
- Soundtrack and effects: original deterministic pulse, triangle, sine and noise synthesis. No external samples or voice imitation. The silence after the power-down is intentional.

The export contains H.264/yuv420p video and 48kHz stereo AAC. The finalisation step trims AAC padding to exactly 20 seconds and places metadata at the beginning for quick playback. The first export and its source ZIP are retained in `out/v1/`.

## Suggested post

> South African coalition politics. Now with a restart button. 🎲
>
> Fictional scenario · Satirical game. Build a majority. Test the deal. Find out who suddenly has principles.
>
> Play Coalition Chaos: https://counted.co.za/chaos

The footage comes from local development. Use the released game’s direct link when posting. This task does not publish the game or post to X.
