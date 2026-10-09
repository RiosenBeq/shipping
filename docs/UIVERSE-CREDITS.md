# Uiverse.io credits

The `uv-*` components in [`app/uiverse.css`](../app/uiverse.css) are adapted from
open-source elements published on [Uiverse.io](https://uiverse.io) and mirrored in
its official archive, [uiverse-io/galaxy](https://github.com/uiverse-io/galaxy)
(snapshot `adbd2ad`, 2 Sep 2024). We re-coloured each one to the LEVANTER navy + brass
palette, adjusted it for accessibility (WCAG AA contrast, visible `:focus-visible`
states, motion gated behind `prefers-reduced-motion`) and simplified the markup.
Each block in the stylesheet also carries a one-line credit comment.

| # | Role | Class(es) | Original author | Uiverse file | Link | License |
|---|------|-----------|-----------------|--------------|------|---------|
| 1 | Primary CTA (shine sweep + icon nudge) | `.uv-btn`, `.uv-btn--lg`, `.uv-btn--sm` | satyamchaudharydev | `Buttons/satyamchaudharydev_rude-wolverine-24.html` | https://uiverse.io/satyamchaudharydev/rude-wolverine-24 | MIT |
| 2 | Outline / ghost button (sliding fill) | `.uv-btn-outline`, `.uv-btn-ghost-light` | Wlidha09 | `Buttons/Wlidha09_chilly-mole-32.html` | https://uiverse.io/Wlidha09/chilly-mole-32 | MIT |
| 3 | Card (corner arrow tab, title underline) | `.uv-card`, `.uv-card--dark`, `.uv-card--hover` | satyamchaudharydev | `Cards/satyamchaudharydev_itchy-chipmunk-95.html` | https://uiverse.io/satyamchaudharydev/itchy-chipmunk-95 | MIT |
| 4a | Floating-label filled field | `.uv-field` | fbernack | `Inputs/fbernack_honest-bat-69.html` | https://uiverse.io/fbernack/honest-bat-69 | MIT |
| 4b | Centre-out focus bar (field) | `.uv-field` | AbanoubMagdy1 | `Inputs/AbanoubMagdy1_afraid-yak-99.html` | https://uiverse.io/AbanoubMagdy1/afraid-yak-99 | MIT |
| 5 | Segmented radio group | `.uv-segmented` | Yaya12085 | `Radio-buttons/Yaya12085_rude-mouse-79.html` | https://uiverse.io/Yaya12085/rude-mouse-79 | MIT |
| 6 | Hero background (chart graticule) | `.uv-hero-pattern` | csemszepp | `Patterns/csemszepp_serious-cobra-89.html` | https://uiverse.io/csemszepp/serious-cobra-89 | MIT |
| 7a | Loader (porthole wave) | `.uv-loader`, `.uv-loader--sm`, `.uv-loader--on-dark` | mrhyddenn | `loaders/mrhyddenn_angry-goat-2.html` | https://uiverse.io/mrhyddenn/angry-goat-2 | MIT |
| 7b | Loader (sonar ping ring) | `.uv-loader` | Gautammsharma | `loaders/Gautammsharma_polite-bat-25.html` | https://uiverse.io/Gautammsharma/polite-bat-25 | MIT |
| 8 | Status toast (wave edge) | `.uv-toast` | akshat-patel28 | `Cards/akshat-patel28_quick-baboon-29.html` | https://uiverse.io/akshat-patel28/quick-baboon-29 | MIT |
| 9 | Tag / chip | `.uv-chip`, `.uv-chip--dark` | Javierrocadev | `Cards/Javierrocadev_young-panda-66.html` | https://uiverse.io/Javierrocadev/young-panda-66 | MIT |
| 10 | Skeleton shimmer | `.uv-skeleton`, `--text`, `--circle` | elijahgummer | `Cards/elijahgummer_hot-fly-77.html` | https://uiverse.io/elijahgummer/hot-fly-77 | MIT |
| 11 | Tooltip from `data-tooltip` | `.uv-tooltip`, `.uv-tooltip--light` | TanimMahbub | `Tooltips/TanimMahbub_white-fly-43.html` | https://uiverse.io/TanimMahbub/white-fly-43 | MIT |
| 12 | Animated underline links | `.uv-link`, `.uv-nav-link`, `.uv-nav-link--light` | ArturCodeCraft | `Buttons/ArturCodeCraft_horrible-mule-54.html` | https://uiverse.io/ArturCodeCraft/horrible-mule-54 | MIT |
| 13 | Accordion plus/minus icon morph | `.uv-accordion` | AKAspidey01 | `Checkboxes/AKAspidey01_itchy-wombat-76.html` | https://uiverse.io/AKAspidey01/itchy-wombat-76 | MIT |
| 14 | Floating action button (pulse ring) | `.uv-fab` | Carlos-vargs | `Buttons/Carlos-vargs_pink-ladybug-22.html` | https://uiverse.io/Carlos-vargs/pink-ladybug-22 | MIT |

Uiverse URLs follow the `https://uiverse.io/<author>/<name>` pattern, taken from the
archive file name `<author>_<name>.html`.

## License

Every element above is distributed under the MIT License of the Uiverse.io
galaxy archive. The licence text below applies to the adapted portions of
`app/uiverse.css`:

```
MIT License

Copyright (c) 2023 Uiverse.io

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
