# Coalition Chaos animation direction

There is no single universal “gold standard” frame count or engine for an 8-bit game. The useful production standard is readable poses, consistent pixel art, deliberate frame timing and animation that responds promptly to play. Research and implementation checked 7 November 2026.

## Research and application

| Source | Finding | Application here |
| --- | --- | --- |
| [SLYNYRD: Intro to Animation](https://www.slynyrd.com/blog/2018/8/19/pixelblog-8-intro-to-animation) | Strong key poses carry the action. Extra in-between frames can weaken its energy; playback speed changes its feel. | Distinct expression drawings and short reaction sequences. The party selection updates immediately. |
| [SLYNYRD: Human Walk Cycle](https://www.slynyrd.com/blog/2024/5/24/pixelblog-50-human-walk-cycle) | Study real locomotion: foot contact, weight transfer, passing legs, arm swing and body rise. Six or eight drawings can provide an economical cycle. | Eight full-body drawings per leader, held for 90ms each, with a brief recognition pause before walking. This timing is our design choice, not an industry rule. |
| [Aseprite animation documentation](https://www.aseprite.org/docs/animation/), [tags](https://www.aseprite.org/docs/tags/), [onion skinning](https://www.aseprite.org/docs/onion-skinning/) | Frame timelines, per-frame duration, adjacent-frame inspection and named sequences make animation controllable. | Neutral/blink/pleased/disappointed portrait states; idle/celebration/shock speaker sequences. Keep source sheets and timing code separate. |
| [Godot: 2D sprite animation](https://docs.godotengine.org/en/stable/tutorials/2d/2d_sprite_animation.html) | Sprite sheets store individually authored frames; playback selects them at the intended rate. | A lightweight canvas scene plays our atlases. This interaction does not require adding a game engine. |
| [MDN: Crisp pixel art](https://developer.mozilla.org/en-US/docs/Games/Techniques/Crisp_pixel_art_look) | Nearest-neighbour scaling preserves pixel edges; fractional device scaling can still produce uneven pixels. | Native 48px portraits, a 256×96 scene, integer scene positions, no image smoothing. Prefer native or integer display sizes. |
| [Game Programming Patterns: Game Loop](https://gameprogrammingpatterns.com/game-loop.html) | Rendering and animation timing must account for elapsed time rather than assume every display renders at one speed. | Walk frames and position derive from elapsed time. Background tabs stop scheduling work. |
| [W3C: C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39) | Honour the user's reduced-motion preference for interaction-triggered animation. | Static expressions and a clear doorway pose, with all outcome text retained. |

## Asset and playback decisions

The original walkout translated one bust beside a CSS outline. The replacement is a single illustrated scene: full-body gait, planted-foot baseline, a short pause and foreground doorway occlusion. The result text appears immediately; the animation never holds up editing or another roll. Withheld support does not trigger a walkout.

All eight leaders receive identical expression rules. Before selection they are neutral; invited parties look pleased and excluded parties look disappointed. All moods occasionally blink, returning to the appropriate expression. The story cast and result cameos share the same idle clock. Staggered 6–10 second cycles include brief blinks and occasional one-pixel lifts; logos receive only the lift. The bird uses drawn eyelid, wing, beak and gavel frames. A generic delegate represents a party without a leader sprite; that party's logo and name remain in the outcome cast. These are party cameos in fictional scenes. Johannesburg uses Helen Zille for the DA; other councils use Geordin Hill-Lewis. They do not form a full local candidate list.

Madam Speaker reacts to a changed quote even when her majority mood stays the same. An unchanged live refresh preserves the current gesture; rapid changes replace the pending reaction instead of queuing animations. `IntersectionObserver` limits the shared clock to visible sprites, including those revealed by horizontal cast scrolling. Hidden tabs, offscreen casts and sprites behind an open game dialog sleep. Reduced motion clears reactions and shows static mood frames without replaying past dialogue when motion is re-enabled. Client tests cover these transitions and release portraits replaced by a new roll.

Imagegen supplied the new drawings. Generated sheets are starting material, not a guarantee of professional animation quality: registration, palette, rhythm and motion still require inspection. `scripts/prepare-coalition-sprites.mjs` slices the sheets, aligns baselines, uses a shared scale per sequence, reduces palettes without dithering and exports lossless WebP. The original generated PNGs and exact prompts are preserved in `assets/coalition-animation/` for future edits or artist cleanup.

Runtime assets in `public/images/coalition/`:

- `leaders-expressions-v4.webp`: 4 expression columns × 9 character rows, 48px cells.
- `leaders-walk-v4.webp`: 8 gait columns × 9 character rows, 64px cells.
- `speaker-frames-v3.webp`: 4 drawing columns × 3 moods, 64px cells. Secretary-bird redesign; v2 is retained as a source reference.
- `delegate-walk-v2.webp`: 8 anonymous-delegate gait columns, 64px cells.
- `council-chamber-v2.webp`: 256×96 background with the doorway's foreground edge at x=226.

Leader row order is ANC, DA (GHL), EFF, MK, IFP, PA, ActionSA, FF+, then Helen Zille. The older atlases remain available. The walkout assets preload only when a roll needs a full-party exit. Tests cover timing boundaries, cycle completion, equal expression rules, anonymous-delegate fallback, cancellation, refresh continuity and reduced-motion poses. Browser checks include 320px and 390px screens, expression changes, repeated rolls, captured walkout frames and a static reduced-motion result.

## Madam Speaker: secretary-bird revision

The v3 design uses a longer visible grey neck, longer bare legs above dark toes, black feathered thighs, orange facial skin, a small hooked beak and long black quills swept back from the nape. These identification features follow [SANBI’s secretarybird description](https://www.sanbi.org/animal-of-the-week/secretarybird/). Her oversized expressive face, tiny waistcoat, gavel and single agenda sheet are deliberate cartoon choices. The simpler silhouette replaces the round white facial ruff and loose flying papers of the previous design.

The built-in imagegen tool created `assets/coalition-animation/speaker-secretary-v3.png` using the original sheet as an edit reference. The exact prompt is saved in `assets/coalition-animation/speaker-secretary-v3-prompt.txt`. Keep both source versions. All twelve new drawings use one shared crop, scale and ground line in the preparation script: wing and gavel changes must not recenter the character. Her runtime slot remains 64×64, with no extra panel height. Idle includes a blink and side-eye; majority plays a brief approval; losing a majority plays an incredulous reaction ending in deadpan disapproval. Reduced motion holds a readable static pose.

Her voice is a dry council referee: short first-person comments, reluctant approval and exasperation. Seat-based jokes remain conditional on the actual deal: the smallest-partner warning only appears when every partner is essential. Contextual political histories and public positions keep their existing selection priority and source disclosures. No timed speech carousel or extra instructions are added.

## Photo-referenced cast corrections

The user supplied two reference photographs each for Herman Mashaba, Geordin Hill-Lewis, Corné Mulder, Gayton McKenzie and Helen Zille. The built-in imagegen tool produced `mashaba-v3.png`, `ghl-v4.png`, `corne-v4.png`, `gayton-v4.png` and `zille-v4.png` in `assets/coalition-animation/`; exact prompts are the matching `-prompt.txt` files. Each sheet contains four portraits followed by eight right-facing walk poses in a 4×3 grid. The old prompts incorrectly described Mashaba with a moustache, GHL with glasses and Mulder with swept hair; those historical prompts remain for provenance, not as current likeness instructions.

The corrected wardrobe distinguishes the cast at small sizes: Mashaba wears a bright green/black polo; GHL a blue shirt and beige trousers; Mulder a green/white polo; McKenzie a dark tracksuit with white collar and shoulder stripes; Zille a cream blazer and burgundy blouse. Frames retain the existing 48px portrait and 64px walk slots. The preparation script replaces only the requested rows and appends Zille, preserving the four untouched leaders’ visible pixels exactly.

`coalitionLeader()` resolves the character from party and IEC municipality ID. DA uses Zille in Johannesburg (`3003`) and GHL elsewhere. The same resolver supplies party cards, the story cast and canvas walkouts; outcome portraits clone the matching party card. Zille’s reference role is documented in the [DA nomination announcement](https://www.da.org.za/2025/09/i-accept-the-das-nomination-as-mayoral-candidate-for-johannesburg). The gallery generated by `node scripts/preview-coalition-cast.mjs` shows all nine characters, four expressions, walk cycles, the secretary bird and anonymous delegate.
