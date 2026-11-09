# The Stage — contract for page builders

The Stage is the one fixed layer behind every page that uses it (DESIGN-V2 §2, §6). It plays
licensed footage and two procedural plates through a single lens: one grade per plate, calm
zones under copy, vignette and grain, rounded apertures, and a tide wipe between windows.
Everything on top of it is a **window** (transparent: the plate shows) or a **card** (opaque).

Code: `components/site/stage/`. Styles: `app/stage.css`. Media: `lib/media.ts` and
`public/media/`. Lab (development only): `/stage-lab`.

```
z 30  header (fixed)                 reads data-ground of the section under it
z 30  rail (fixed, desktop)          <StageRail/>
z 10  page content                   <StageWindow/> transparent · <Card/> opaque
z −1  chart frame + horizon line     <StageProvider frame/> (desktop)
z −1  STAGE                          graded poster (server) → WebGL canvas (when live)
```

## 1. Quick start

`StageProvider`, `StageWindow`, `StageAperture`, `Card` and `ShipLines` are server-safe (no
hooks). `PauseMotion` and `StageRail` are client components. Import from
`@/components/site/stage`.

```tsx
import { Card, PauseMotion, StageAperture, StageProvider, StageRail, StageWindow, calm } from "@/components/site/stage";

export default function Home() {
  return (
    <>
      {/* Once per page, before the content. List every plate the page's windows use, in
          page order: the first one's poster is the LCP image (fetchpriority="high"). */}
      <StageProvider plates={["V-hero", "P-bathy", "P-lines", "V-reel", "V-night", "V-ocean"]} />
      <StageRail label="On this page" items={[{ id: "hero", label: "Departure" }, { id: "who", label: "Local depth" } /* … */]} />

      <StageWindow id="hero" plate="V-hero" className="hero">
        <StageAperture inset="calc(12px + 28px * var(--stage-out))" radius="calc(28px + 8px * var(--stage-out))" />
        <div {...calm()} className="hero__head">
          <h1>Tankers &amp; gas, …</h1>
        </div>
        <p {...calm(0.5)} className="hero__lead">Crude, clean products, …</p>
        <PauseMotion />
      </StageWindow>

      {/* Touches the hero: the plate changes with a tide wipe along their boundary. */}
      <StageWindow id="who" plate="P-bathy">…</StageWindow>

      {/* A card between two windows: the plate swaps while the card covers the screen. */}
      <Card id="desks" ground="paper">…</Card>
      …
    </>
  );
}
```

A page that uses none of this simply does not mount `StageProvider`: nothing loads.

## 2. Components

### `<StageProvider plates frame? />`

| Prop | Type | |
| --- | --- | --- |
| `plates` | `PlateId[]` | Every plate the page's windows use, in page order. The first is server-rendered eagerly with `fetchpriority="high"`; the rest load lazily as their windows approach (1.5 viewports). A window whose plate is missing here still works but gets centred framing and a console warning in development. |
| `frame` | `boolean` (default `true`) | Chart-frame hairlines (under the header, down both content edges, "+" crosses) and the horizon hairline, desktop ≥ 1024px only. |

It renders the fixed `.stage` (posters, canvas, calm overlays, vignette, grain, tide line)
and `.stage-frame`. It is a server component: the media manifest stays on the server; the
client half (`StageClient`) receives only each plate's framing (~1 KB) and runs the runtime.

### `<StageWindow plate ground? horizon? as? …section props>`

A transparent section through which the stage shows `plate`. Writes `data-stage-window`,
`data-plate`, `data-ground` and (with `horizon={false}`) `data-horizon="off"`.

- `ground` (`"dark"` default | `"light"`): what is under the copy. The header and rail take
  their colours from it. Every plate is dark; use `"light"` only for `plate="none"` on paper,
  or while an aperture on paper is small (see §4).
- Make windows at least ~60vh tall (pins can be much taller). Two edges on screen at once is
  resolved in favour of the one nearest the viewport centre.
- While a window or card is on screen the stage writes four scrub variables on it (0..1), for
  scroll-linked CSS — never needed for content to be visible:

| Variable | 0 → 1 while… |
| --- | --- |
| `--stage-in` | its top travels from the viewport bottom to the viewport top |
| `--stage-out` | its bottom travels from the viewport bottom to the viewport top |
| `--stage-pin` | a section taller than the viewport scrolls under a `position: sticky` child (top at the top → bottom at the bottom) |
| `--stage-through` | its whole passage (top at the bottom → bottom at the top) |

### `<StageAperture inset? radius? ground? className? style? />`

A rounded opening inside a window (one per window). The plate shows inside it; outside it the
**ground** colour (`"dark"` navy-deep #051624, `"light"` sand #F3EFE4). The ground is painted
by the DOM (a huge box-shadow clipped by the window with `overflow: clip`, so it never lags the
scroll and pinned children keep working) and mirrored by the lens's rounded-rect SDF, which
also cover-fits the footage to the opening: grow the opening and the footage grows with it
(Penta's showreel).

Geometry is plain CSS on the element (`position: absolute; inset; border-radius`):
`inset` and `radius` props set `--ap-inset` / `--ap-radius` (defaults `var(--stage-inset)`
12px / 8px phone and `var(--stage-radius)` 28px / 22px phone). For anything else, give it a
class and drive `inset` and `border-radius` from the window's `--stage-*` variables:

```css
/* Process reel (§7.5): 62% wide on paper → full bleed over the first 45% of a 220vh pin. */
.process__ap {
  --k: min(1, calc(var(--stage-pin, 0) / 0.45));
  inset: calc(32% * (1 - var(--k))) calc(19% * (1 - var(--k))) calc(6% * (1 - var(--k)));
  border-radius: calc(var(--stage-radius) * (1 - var(--k)));
}
```

```tsx
<StageWindow id="process" plate="V-reel" ground="light" className="h-[220vh]">
  <div className="sticky top-0 h-[100svh]">
    <StageAperture ground="light" className="process__ap" />
    …
  </div>
</StageWindow>
```

**Reshaping without layout shift.** Changing `inset` with the scroll moves the box, which the
browser counts as a layout shift (CLS). The homepage keeps the box still instead and grows a
border in the ground colour (`border: <width> solid var(--ap-ground)`, outer radius = border +
inner radius); the runtime draws the plate in the **opening inside the border** (box minus
border widths, inner corner radius), so both techniques work (`.h-hero__ap`, `.h-process__ap`
in `components/site/home/home.css`; a 4px outline in the ground colour hides the seam where the
border meets the shadow).

The lab's `lab-reel` scene is exactly this. Switch the window's `data-ground` to `"dark"`
yourself once the aperture is full bleed if the header should turn glass-navy there (the
stage follows attribute changes).

### `<Card ground? as? …section props>`

An opaque sheet over the stage: `ground="paper"` (sand, navy text) or `"night"` (navy-deep,
sand text). Margin `var(--stage-inset)` either side, radius `var(--stage-radius)` (top
corners only on phones), `data-stage-card`, `data-ground` (`light` / `dark`). Settles in
(translateY 64px, scale .985 → rest) with scroll-driven CSS where supported, never with
reduced motion. Cards stacked back to back get a `--stage-inset` gap. A card covering ≥ 92%
of the viewport freezes the plate (no decoding); the gutters show the frozen frame.

Stacking (the previous card scaling to .965 and dimming 25% under the next) is page CSS:
use the card's own `--stage-out`.

### `<ShipLines ship className? />`

Where `P-lines` draws the active class's 3D lines plan, inside a `plate="P-lines"` window.
Give it a size (e.g. `min-h-[38vh] flex-1`). Change `ship` (`"vlcc" | "suezmax" | "aframax" |
"lr1" | "mr" | "vlgc" | "mgc" | "handysize" | "pressurised"`) to morph the hull (700 ms,
ease-swell; instant while motion is paused). On phones, the low tier and until the
compositor is live it shows the class's `VesselArt` with a light ribbon running along the
waterline (`html[data-stage-lines="svg"]`). Decorative (`aria-hidden`): the class cards
(crawlable `<a>`s), the segmented control and the `aria-live="polite"` caption belong to the
page. Class data for captions: `SHIP_CLASSES[slug].label` / `.longName`.

### `<PauseMotion className? labels? />`

WCAG 2.2.2. A real `<button>` whose label is the action ("Pause motion" / "Play motion").
Every instance on a page shares one state, stored per viewer in `localStorage`
(`levanter:motion-paused`, guarded) and mirrored on `<html data-motion="paused">`. Paused:
video holds its frame, grain, sonar ping, ribbons and flowmap stop; scroll-linked changes
(wipes, apertures) still follow the scroll. Put one bottom-right in the hero, one in the
letter scene and one in the footer legal row. It adapts to `[data-ground="light"]`.

### `<StageRail items label />`

The rail in the gutter (desktop ≥ 768px): `items: { id: string; label: string }[]` — section
ids in page order, evenly spaced. The ship rests on a waypoint while its section is read and
sails between them (jumps with reduced motion); labels on hover/focus; a click jumps to the
section; colour from the `data-ground` under its middle; hides once the last waypoint's
section has scrolled past half the viewport. Right side in RTL. Hidden in print.

### `calm(k?)`

`{...calm()}` or `data-calm=""` on a copy block inside a window makes it a **calm zone**: the
lens pulls the plate toward navy-deep by `k` (0.35–0.55, default 0.45) over what the element
draws — the union of its text's line boxes (text nodes only: element boxes such as block-level
line spans do not count), within its box — feathered 96px
(`CALM_FEATHER`: wide enough to read as shade, never as a box, on a bright day plate), and
switches the flowmap off there. Up to 6 zones are active at once (the
largest visible ones). Put them on the blocks that hold text — headline, lead, CTA row, fact
grid — not on whole sections. A zone fits the text it holds (a heading that wraps inside a wide
max-width gets no shade beside its lines), but one zone round a short line and a long one still
darkens the plate beside the short one: give such lines zones of their own. This is what keeps
copy at WCAG AA over moving footage; verify with rendered pixels. In poster mode the same zones
are drawn as navy overlays at the same strength and feather (a box-shadow as wide as it is
blurred, so there is no step at the zone's edge).

### `data-stage-pin`

On any element inside a `P-bathy` window: the sonar ping (rings every 6 s) starts at its
centre. Draw the pin itself (dot, glow, mono label) in the DOM.

## 3. Attributes and variables

| On | Attribute | Set by | Meaning |
| --- | --- | --- | --- |
| window | `data-stage-window`, `data-plate`, `data-ground`, `data-horizon="off"` | `StageWindow` | a window, its plate, its ground, no horizon line |
| element in window | `data-stage-aperture`, `data-aperture-ground` | `StageAperture` | the opening and its ground |
| card | `data-stage-card`, `data-ground` | `Card` | an opaque sheet |
| element in window | `data-calm="0.35–0.55"` | page | calm zone |
| element in window | `data-stage-lines`, `data-class` | `ShipLines` | P-lines slot and class |
| element in window | `data-stage-pin` | page | sonar ping origin |
| `<html>` | `data-stage="poster|live"` | stage | live once the canvas has a decoded frame |
| `<html>` | `data-stage-tier="high|medium|low"`, `data-stage-why` | stage | tier, and why it is low (`save-data`, `slow-network`, `low-memory`, `reduced-motion`, `no-webgl`, `software-gl`, `forced`) |
| `<html>` | `data-stage-lines="3d|svg"` | stage | which hull is showing |
| `<html>` | `data-motion="paused"` | `PauseMotion` | key your own CSS animation off it |
| `.stage` | `data-a`, `data-b`, `data-ground`, `data-mode` | stage | plates on screen (above / below the tide), dominant ground |

Changes to `data-class`, `data-plate`, `data-ground` and `data-calm` are picked up without a
scroll (mutation observer).

CSS tokens (`app/stage.css`, `:root`): `--stage-inset` (12 / 8px), `--stage-radius`
(28 / 22px), `--stage-ease-tide` `cubic-bezier(.22,1,.36,1)`, `--stage-ease-swell`
`cubic-bezier(.65,0,.35,1)`, `--stage-ease-quick` `cubic-bezier(.33,1,.68,1)`,
`--stage-edge` (the frame's content edge, `var(--edge)`), `--stage-frame-top` (`var(--hdr-h)`).
Durations (§5): 180 · 420 · 640 · 900 · 1200 ms; in JS `DURATION` from `stage/motion.ts`
(with `easeTide`, `easeSwell`, `easeQuick` as functions).

## 4. Plates, grades, horizon

| Plate | Clip (`lib/media.ts`) | Grade | Use |
| --- | --- | --- | --- |
| `V-hero` | `hero` — tankers at anchor, high aerial | dawn | home hero, `/tankers` hero |
| `V-gas` | `gas` — loaded tanker at anchor, oblique (no LPG carrier footage exists) | day | `/lpg` hero |
| `V-reel` | `reel` — 20 s loop, hard cuts: cranes at dusk → Karaköy by day → tanker at anchor → workboat at sea (opens on the port: its first frame is the poster) | dusk | process aperture |
| `V-strait` | `bosphorus` — Karaköy waterfront, Galata Tower | day | `/turkish-straits` hero |
| `V-night` | `night` — harbour at night (not Istanbul) | night | letter, `/contact` |
| `V-ocean` | `ocean` — dark sea surface | deep | footer, 404 |
| `P-bathy` | procedural contours (static: `/media/stage/bathy-*.avif`) | brand | Who, `/about`, mastheads |
| `P-lines` | procedural 3D lines plan | brand | Ships, class pages |
| `P-hero` | "Lines to light" (static: `/media/stage/hero-lines-*`) | brand | home hero (all 11 homepages) |
| `none` | no plate: the window's ground colour | — | flat paper or night window |

**`P-hero` ("Lines to light", `gl/hero/`).** The VLCC of `lines/` as a lines plan in brass
hairlines with light trails, a glass hull with a brass rim that fills from the bow aft, a
breathing contour sea, bloom (own passes, then the lens as for any plate). The camera follows
the hero window's scroll progress p (`heroProgress`: 0 top at the viewport top → 1 once the
next window has risen `HERO_TAIL` = 0.6 of the viewport over it, clamped 0..1.3; read-only,
no pinning). The homepage hero is a viewport of copy plus a 75svh scene-only tail
(`.h-hero--scene` in home.css; not under reduced motion or print), so the whole orbit plays in
view — about 1.15 viewports of scroll — after the copy has scrolled away through a critically damped spring
(`smoothDamp`, 0.15 s): bow three-quarter → profile (p .55) → stern quarter (p .8) → rising
toward a top-down chart (1–1.3, under the next window's tide). Keyframes: `gl/hero/choreo.ts`
(desktop and portrait-phone tracks; the phone track and the portrait poster share
`(max-aspect-ratio: 4/5)`). Pause motion freezes the clock (trails, contour breathing) while
the scroll still turns the camera; reduced motion is the low tier's poster (and a still at
p 0 if live is forced). The lines are fully drawn when the canvas fades in (the prototype's
draw-in would erase the poster's lines first). Mirrored on RTL pages, poster included.
Homepages ask for `V-hero`; `homeHeroPlate` (plates.ts) swaps it for `P-hero` unless the Media
library holds hero footage of its own — then that video plays as before (other plates an
editor picks for the hero stay as picked; `/tankers` and the calculator keep `V-hero`).

**The grade belongs to the plate**, not to the section: a clip is always shown through its
`look.grade` in `lib/media.ts`, so its graded poster and the live frame are identical and two
grades never meet in one viewport. To regrade a clip, change `look` there and rebuild the
posters (§7). Grade numbers: `stage/grades.ts` (the §6.2 table verbatim).

**Framing** per clip (`look` in `lib/media.ts`): `focal` (landscape), `focalPhone` (in the
portrait file's frame when there is one), optional `focalRtl` (plates are never mirrored for
RTL), `flipX` (open water only), `horizon` (0 top..1 bottom in the source frame, or `null`),
`levels` (black/white points normalised before the grade). Cover-fit keeps the focal point
where CSS `object-position` would; the window's push-in (1.06 → 1.00 across its passage)
zooms around it.

**Horizon line:** the frame's horizon hairline sits on the active plate's horizon as cover-fit
places it (it follows push-in and apertures). Hidden when the plate has none, when it is
cropped away, or with `horizon={false}` on the window.

## 5. Transitions

- **Touching windows** (one's bottom is the next one's top): a tide wipe scrubbed along their
  boundary — the next plate rises bottom-up with the DOM edge, a ragged fbm waterline (±3.5%
  of the viewport) with a 6px brass-light line at 35% and a 0.4px chromatic split. Where
  either side shows a flat ground (outside an aperture) the edge is straight, matching the
  DOM. The outgoing plate darkens up to 15% as the next rises.
- **Windows separated by a card**: the edge sits behind the card's middle, so the plate
  swaps while the card covers the screen.
- Poster mode does the same with a straight clip and a soft brass line.

## 6. Quality, lifecycle, budgets

| Tier | Who | What |
| --- | --- | --- |
| high | desktop, > 4 cores / > 4 GB (or unknown), ≥ 1024px wide | 1080/1600w video, DPR ≤ 1.5, flowmap (fine pointer), 3D hull |
| medium | laptops with fewer cores or less memory, narrow windows, phones | 720p or portrait video, DPR ≤ 1.25, no flowmap, SVG hull on phones |
| low | save-data, 2G/3G, ≤ 2 GB memory, reduced motion, no WebGL2, software WebGL | posters, static procedural images, SVG hull — no canvas, no video, no three.js download |

- **Poster mode first.** The server renders every listed plate's graded poster (`<picture>`:
  portrait source on portrait screens, AVIF then WebP, 800w/1600w), CSS vignette and grain.
  The site is finished without JavaScript or WebGL. Without JS only the first plate shows.
- **Then live**, on high/medium only: after the LCP entry is reported and an idle callback
  (fallback: `load` + 400 ms, cap 5 s), the compositor chunk (three.js r187 + compositor) is
  imported; the canvas fades in over the poster (400 ms) once the first plate has a decoded
  frame (`requestVideoFrameCallback`, or `loadeddata`).
- **One decoder:** only the plate covering more of the screen plays; the other on screen holds
  a frame (or its graded poster until it has one). The next plate gets `preload="metadata"`
  1.5 viewports away and `preload="auto"` at 0.5; nothing else is requested.
- **Paused** (render loop stopped, video paused, last frame held) on a hidden tab, when no
  window intersects the viewport, when a card covers ≥ 92%, and with Pause motion.
- **Auto-downgrade:** below 45 fps for 3 s of rendering → one tier down (high → medium drops
  the flowmap and DPR; medium → low returns to posters). WebGL context lost for 2 s → posters.
- **Flags:** `?stage=0` posters only; `?stage=1` live even on software GL (tests);
  `?stagetier=high|medium|low` forces a tier. Development builds expose `window.__stage`
  (`debug()`: tier, mode, composition, renderer info, `setClock(s)` for still screenshots).
- **Measured** (esbuild, minified + gzip): client first-load part ≈ 7.8 KB gz (runtime,
  composition maths); compositor chunk ≈ 150 KB gz (three.js ≈ 140), loaded lazily; GPU 1–3
  draw calls per frame (lens, bathy target, lines target, flowmap).
- **P-hero** is a lazy chunk of its own (≈ 34.6 KB min / 13.2 KB gz: scene, hull, shaders,
  choreography; three.js and `lines/` come from the compositor chunk), imported the first time
  a P-hero window is on screen; its poster shows (and the canvas waits) until its first frame.
  Per tier: high 5 fbm octaves, 1,400 dust motes, bloom ¼ + ⅛, hull 128 columns; medium 4
  octaves, 800 motes, bloom ¼ + ⅛, 112 columns; portrait phones 4 octaves, 500 motes, bloom ¼
  only, 96 columns, lines sampled at 70 % (≈ 1.9k instead of 2.6k segments). DPR caps and the
  pixel budget are the stage's; auto-downgrade rebuilds the plate for the new tier; no
  flowmap over it. ~11–13 draw calls, ~10 passes, 30–40k triangles; render targets ≈ 28 MB at
  1440×900 DPR 1 (half-float when available). Measure on a real GPU before tuning: SwiftShader
  timings mean nothing. Hero video 2.1 MB
  desktop / 0.9 MB portrait; hero poster AVIF 15 KB (1600w) / 6 KB (800w).

## 7. Media pipeline

- `lib/media.ts`: every clip and still with `look` (grade, focal points, flipX, horizon,
  levels) and `graded` (the poster or still with its grade baked in);
  `proceduralStatics.bathy`; `gradeLuts`.
- `public/media/lut/<preset>.cube`: the five grades as 17³ LUTs (≤ 1/255 from the shader).
- `public/media/graded/`: graded first-frame posters (1600w, 800w, portrait; AVIF + WebP)
  for the plate clips; `graded/still/`: graded 1200w stills for rows, lanes, portholes
  (use these, never the ungraded ones, on public pages).
- `public/media/video/reel-{1080,720}.mp4`: the V-reel edit (1600×900 / 1280×720, H.264,
  no audio, `+faststart`), with ungraded `poster/reel-*`.
- `public/media/stage/bathy-*.{avif,webp}`: P-bathy statics (1920×1200, 900×1600), baked
  from the live shader.

- `public/media/stage/hero-lines-{1600,800,portrait}.{avif,webp}`: the P-hero poster (p 0,
  clock 0; 1600×1000, 800×500, 720×1560), baked from the live plate: open
  `/stage-lab?bake=hero&stage=1&stagetier=high` at 1440×900 @1.111x and 480×1040 @1.5x, call
  `__stage.debug().setClock(0)`, screenshot, encode as below (AVIF 4:4:4 crf 28, WebP q75).

Rebuild after changing a `look` or a grade:

```sh
npx vite-node components/site/stage/tools/build-media.ts -- luts posters stills   # + reel
# P-bathy statics: open /stage-lab?bake=bathy&stage=1 at 1920×1200 and 600×1067 @1.5x,
# screenshot, encode AVIF 4:4:4 (crf 28) + WebP — see the tool's header.
```

Then copy the printed byte sizes into `lib/media.ts`.

## 8. Reduced motion, print, no JavaScript

- **Reduced motion:** low tier — graded posters, static contours, the P-hero still at p 0,
  SVG hull without its ribbon animation, no card settle, rail ship jumps. Wipes and apertures still follow the
  scroll position (they are scroll-linked, not animated). Pinned sections should become
  normal flow in page CSS.
- **Print:** stage, frame, rail, pause buttons and apertures hidden; cards and windows flat
  white with navy text.
- **No JavaScript:** first plate's poster, no calm overlays (posters are graded dark enough
  for the hero, but copy elsewhere should not rely on the stage for contrast without JS).

## 9. The lab

`/stage-lab` (development only — in production the route's import is compiled out and it
answers 404; `noindex`; its own root layout without the site chrome) shows every plate, the
five grades on graded stills, both apertures (hero exit, process reel pin), both wipes
(footage → procedural, footage → footage), a card swap, the lines-plan morph, Pause motion
and a live debug readout. `?stage=0` / `?stage=1&stagetier=high` switch modes;
`?bake=bathy` renders the P-bathy static.

## 10. Migration notes

- The painted voyage engine (`components/site/voyage/engine/`) is retired from the build
  (§3); it lives in git history (tag `voyage-painted-v1` to be set by the lead).
- The transitional adapter (`components/site/voyage/`, `Journey.tsx`) and the "Homepage
  journey (legacy)" block of `app/stage.css` are gone: the English and localized homepages
  (`components/site/home/`) use these primitives directly, in the section order set in the
  admin.
- The header reads `data-ground` from the section under its centre line; windows and cards
  always carry it.

## 11. Tests

`npx vitest run components/site/stage`: grades as numbers and the LUT writer, calm-rect
selection and falloff, tier picking and DPR caps and the fps governor, composition and
cover-fit maths, preload scheduling and video file choice (with the hero weight budgets),
rail progress, easings, class parameters and the 700 ms morph, and the lines-plan geometry;
`gl/hero/hero.test.ts`: P-hero keyframes (through every key, monotone, flat ends, continuous,
the orbit order), scroll progress and the spring (no overshoot, settles, frame-rate
independent), the hull data and the homepage plate swap.

## 12. The Media library (content/media.json) and footage from other sites

Editors replace footage and stills in `/keystatic` → Media → Media library (Turkish guide:
`docs/CMS.md` §3.3). `lib/media.ts` applies the entries to the shipped manifest: `videos` and
`stills` are what the site plays and shows; `shippedVideos` / `shippedStills` are the licensed
files alone (the media pipeline and the budget tests use those). An empty entry changes
nothing. Per plate (`PLATE_SLOTS`: V-hero → hero, V-gas → gas, V-reel → reel, V-strait →
bosphorus, V-night → night, V-ocean → ocean): an upload under `public/media/uploads/` or an https
link to a video file, an optional portrait file, a poster, the grade, focal points, flipX,
horizon, credit and licence.

- **Nothing raw.** A poster or still that the build did not grade (an upload, a link, or a
  shipped item in another grade) carries `graded.css = <preset>` and a `#lv-grade-<preset>`
  URL fragment. `<GradeFilters/>` (`components/site/stage/GradeFilters.tsx`, rendered once per
  page by SiteShell, and only while the library holds such media: `needsCssGrade` in
  `lib/media.ts`) defines the five grades as SVG filters with the lens maths (exposure →
  luma → tritone + brass split → chroma kept; within 0.02 of `gradeRgb`, tested), and CSS
  applies them to every `img[src$="#lv-grade-…"]` and to the stage's fallback `<video>`. The
  compositor grades such posters in the shader like video (`graded = 1`). A new clip without a
  poster has none (the layer shows the ground, `data-no-poster`).
- **Layers** of plates with Media library footage carry `data-video`, `data-video-phone`,
  `data-remote` (absolute URL), `data-no-poster`, `data-flip` and `data-grade`.
- **CORS.** WebGL may only upload a video from another origin as a texture if that origin
  allows it, so every video loads with `crossOrigin="anonymous"` (a tainted texture would throw).
  Before the compositor boots, the runtime fetches each remote video's headers in CORS mode
  (`corsAllowed`, 6 s timeout, body aborted). If any is refused — or a video errors later in
  the compositor (`onMediaError`: no consent, 404, codec) — the page goes to poster mode with
  `data-stage-why="remote-media"` and the runtime plays Media library footage itself: a plain
  `<video muted loop playsinline>` (no `crossOrigin`) in the plate's poster layer, through the
  CSS grade, with the poster-mode calm zones, vignette, grain and tide clip. One decoder: only
  the dominant plate plays; it pauses with Pause motion, a hidden tab or when no window is on
  screen. These videos follow the §6.5 plan too (`preload="auto"` on screen or within 0.5
  viewports, `metadata` within 1.5) and are released — src removed, buffers freed — once
  their plate is further away. If that fails too the element is dropped and the poster (or ground) stays — never a
  black plate. Reduced motion holds a still frame.
- **Grade "none"** (admin label "None — original colours (testing only)") shows a plate or
  still in its own colours: `look.ungraded`, no `css` on its images, no `data-grade` on its
  layer, `graded = 0` in the lens. For comparing other footage only; DESIGN-V2 §16 still holds
  for the live site.
- **Low tier** (reduced motion, `?stage=0`, no WebGL) shows a clip without a poster as its
  first frame (`#t=0.1`, never played); not on save-data, slow networks or low memory.
- The compositor takes a video's real size from `loadedmetadata` (Media library files are not
  probed at build time).

