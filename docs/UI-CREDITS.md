# UI credits: libraries and pattern sources

What the site's interface borrows from free UI/UX work, and on what terms. The Uiverse.io
adaptations in `app/uiverse.css` have their own table: [`UIVERSE-CREDITS.md`](UIVERSE-CREDITS.md).
The research behind these choices (what was adopted, what was rejected and why) is summarised
in [`REDESIGN.md`](REDESIGN.md) §11, "Cila turu".

## Libraries (npm, exact versions)

| Package | Version | Licence | Copyright | Where | How it loads |
| --- | --- | --- | --- | --- | --- |
| `@number-flow/react` (+ `number-flow`, `esm-env`) | 0.6.2 | MIT | © Maxwell Barvian | Rolling figures: the freight calculator's estimate (TCE or freight needed, voyage result, days) and the LPG converter's result — `components/site/inner/FlowNumber.tsx` | Only on `/freight-calculator` and `/lpg`; server-rendered (declarative shadow DOM), so the figure is in the HTML without JavaScript |
| `embla-carousel` | 8.6.0 | MIT | © David Jerleke | Drag physics for the "Ships we fix" rail on the homepage — `components/site/home/useDesktopRail.ts` | Dynamic import after idle, only on fine-pointer desktops ≥ 1024px with motion allowed; phones, touch, reduced motion and no-JS keep the native scroll-snap rail |
| `embla-carousel-wheel-gestures` (+ `wheel-gestures`) | 8.1.0 | MIT | © Felix Leupold | Horizontal trackpad swipes on the same rail (vertical page scrolling is never taken) | Loaded with Embla |
| `lucide-react` (already in use) | 0.454.x | ISC | © Lucide Contributors | All line icons, on one stroke scale: `ICON_STROKE` in `components/site/iconStroke.ts` (ring 1.25 · inline 1.5 · CTA arrows 1.8) | Per icon, tree-shaken |

The full licence texts ship inside each package (`node_modules/<package>/LICENSE`).

## Patterns re-implemented (ideas only, no code copied)

Visual ideas seen in free collections, rebuilt from scratch on LEVANTER's tokens in plain CSS
and a few lines of TypeScript (no `motion`, no Tailwind 4 classes). Credited as a courtesy:
no third-party code is included, so no licence notice is required.

| # | Pattern | Seen in (licence) | Where in this repo |
| --- | --- | --- | --- |
| P1 | Spotlight glass: a brass glow and a brighter ring under the pointer, on night glass only | Magic UI "Magic Card" (MIT) | `app/patterns.css`, `components/site/Spotlight.tsx` |
| P2 | A light ribbon travelling round the after-hours duty box (the ships' waterline ribbon on a rounded rect) | Magic UI "Border Beam" / "Shine Border" (MIT) | `app/patterns.css`, `components/site/DutyRibbon.tsx` |
| P3 | Odometer counters: digit strips rising from a waterline | NumberFlow; Motion Primitives "Sliding Number" (idea) | `components/site/home/HomeMotion.tsx`, `home.css` (`.odo`) |
| P4 | Blur-rise: opener lines come into focus as they rise (fine-pointer desktops; phones keep the plain rise) | Magic UI "Blur Fade" (MIT) | `home.css` (`[data-reveal="lines"]`) |
| P5 | Lane pulses travelling out from Istanbul on the Reach map (three passes when the map comes into view, then the lanes rest) | Magic UI "Animated Beam" (MIT) | `home.css` (`.h-map__pulses`), `Reach.tsx` |
| P6 | Route list: four benchmark routes in still hairline rows under the Reach heading (first built as a rising marquee; now at rest on every device, outside the tide motion) | Magic UI "Marquee" (MIT), idea only | `home.css` (`.h-ticker`), `Reach.tsx` |
| P7 | Soft rail edges (shade, plus a progressive blur on the high tier) | Magic UI "Progressive Blur" (MIT) | `home.css` (`.ships__viewport`, `.team__viewport`) |
| P8 | Segmented control with a sliding pill (CSS `:has()`) | Motion Primitives "Animated Background" (idea) | `home.css` (`.ships__tabs`) |
| P9 | One brass sheen across the hero's accent word, once | Motion Primitives "Text Shimmer" (idea) | `home.css` (`h-sheen`) |
| ~~P10~~ | Paper grain on paper cards: removed after review (at σ ≈ 1.1 levels it could not be seen, yet cost a request and a background layer on every paper card) | — | — |

Rules they all follow (DESIGN-V2 §5, §16): glass and glow on night grounds only; one motion
family (the tide); every loop stops under `prefers-reduced-motion` and under the site's Pause
motion (`html[data-motion="paused"]`, WCAG 2.2.2); content is visible without JavaScript;
nothing animates in print.

Not taken, by design: Lenis (wheel hijacking), Motion/framer-motion and GSAP (a second motion
system; GSAP's licence is not open source), cobe (a second WebGL context), Aceternity UI
(proprietary licence), React Bits and Animate UI (Commons Clause).
