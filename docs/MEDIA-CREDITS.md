# Stock media credits

Video loops, posters and stills in [`public/media/`](../public/media) come from two
places: the free tier of [Mixkit](https://mixkit.co) and two free files on
[Wikimedia Commons](https://commons.wikimedia.org). Every item we use allows commercial use on
a website with no attribution. The typed manifest the page builders import is
[`lib/media.ts`](../lib/media.ts). Each entry there carries the same credit as this page.

Licences checked on **8 November 2026**: the licence pages were read on that date, and the licence on each item page was checked before its file was downloaded.

## Licences relied on

| Licence | What it allows | Attribution | Checked |
|---|---|---|---|
| [Mixkit Stock Video Free License](https://mixkit.co/license/#videoFree) | "can be used in your commercial and non-commercial projects, for free … download, copy, modify, distribute, publicly perform and broadcast". Limits are in the [Mixkit User Terms](https://mixkit.co/terms/) (last revised 2 Oct 2025): don't resell or redistribute the raw files as stock, don't use them in breach of the Acceptable Use Policy, don't use Mixkit or Envato as a trademark, and don't scrape or bulk-download. | Not required ("we would appreciate it") | 2026-11-08 |
| Public domain, US federal government work ([17 U.S.C. § 105](https://www.law.cornell.edu/uscode/text/17/105)) | Any use. The U.S. Coast Guard's name and insignia are not licensed, and its footage must not imply endorsement. We use only frames of commercial tankers: no USCG cutter, aircraft or insignia appears in any asset. | Not required | 2026-11-08 |
| [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) | Public-domain dedication; any use, including commercial. | Not required | 2026-11-08 |

### Not used, and why

- **Mixkit Stock Video Restricted License.** Personal use only, so no commercial use, no
  company social posts and no advertising. Most of Mixkit's best tanker, container-ship,
  Bosphorus and container-port aerials (for example ids 35454, 21056, 11937, 11938, 17210,
  34290, 35446, 39193, 29010, 30121, 30090, 45576) carry this licence. **None of them is
  used.** We checked the licence on every item page before downloading the file.
- **Mixkit free items with brands as the subject.** We rejected these:
  - 4316: the MSC cruise ship and its funnel logo dominate the frame.
  - 4209: the hull reads "Sumitomo Osaka Cement", and the ship is a cement carrier, not a tanker.
  - 4012 and 4011: "APM Terminals" is on the cranes, and Maersk-liveried ships and branded containers fill the frame.
- **Coverr** ([licence](https://coverr.co/license), dated 4 Nov 2026). Free commercial use
  is allowed, but its free library had nothing usable: no tanker, LPG, Bosphorus or industrial
  port footage. Most results for those searches are sponsored Shutterstock or iStock items,
  which fall under their own licences. Nothing from Coverr is used.
- **Wikimedia Commons CC BY / CC BY-SA files.** They require attribution or share-alike, so
  they were excluded. We used only CC0 and public-domain files.

## Video loops

Every loop is under `public/media/video/`, with posters under `public/media/poster/`.

| Slot | Files | Source item | Title | Author | Licence | Part used | Notes |
|---|---|---|---|---|---|---|---|
| `hero` | `hero-1080.mp4`, `hero-720.mp4`, `hero-portrait.mp4` (720×1280) | https://commons.wikimedia.org/wiki/File:20200423_-_Oil_Tankers_sit_off_the_coast_of_Southern_California.webm | 20200423 - Oil Tankers sit off the coast of Southern California | Aidan Cooney, U.S. Coast Guard District 11 PADET Los Angeles (USCG ID 200423-G-SL960-827), 23 Apr 2020 | Public domain (US federal government work) | 30.45–36.45 s | Helicopter aerial over the tanker anchorage off Los Angeles and Long Beach. The source is 720p (Commons VP9 transcode), upscaled to 1080. The loop plays forward, eases to a stop and drifts back. A small boat in frame reverses with it. |
| `gas` | `gas-1080.mp4`, `gas-720.mp4` | same as `hero` | same | same | Public domain (US federal government work) | 0.15–6.15 s | A loaded crude/product tanker at anchor. **This is not an LPG carrier:** no licensable LPG or ammonia carrier video exists (see the end of this page). The source is 720p, upscaled, with an eased forward/back loop. |
| `sea` | `sea-1080.mp4`, `sea-720.mp4`, `sea-portrait.mp4` (720×900) | https://mixkit.co/free-stock-video/boat-sailing-in-the-sea-seen-from-high-above-50176/ | Boat sailing in the sea seen from high above | Mixkit (no individual creator credited) | Mixkit Stock Video Free License | 3.25–14.5 s | A top-down drone shot of a small workboat and its wake on deep teal sea; the vessel is not a merchant ship. A 95% crop drifts with the boat so the 1 s crossfade lines up. |
| `port` | `port-1080.mp4`, `port-720.mp4` | https://mixkit.co/free-stock-video/shot-of-a-pier-in-the-city-4001/ | Shot of a pier in the city | Mixkit | Mixkit Stock Video Free License | 0.96–5.28 s | A London Docklands basin at dusk: dockside cranes, moored ships and lights on the water, with the O2 dome in the background. A timelapse played at 0.8×; the ping-pong loop lets the sky darken and brighten without a jump. |
| `bosphorus` | `bosphorus-1080.mp4`, `bosphorus-720.mp4`, `bosphorus-portrait.mp4` (720×900) | https://mixkit.co/free-stock-video/tourist-ferries-arriving-at-the-port-4004/ | Tourist ferries arriving at the port | Mixkit | Mixkit Stock Video Free License | 0.16–8.64 s | Istanbul's Karaköy waterfront and the Galata Tower across the Golden Horn, with city ferries crossing (sped-up footage). A docked ferry's operator name appears in some frames, so the loop starts on a frame without it. |
| `night` | `night-1080.mp4`, `night-720.mp4`, `night-portrait.mp4` (720×900) | https://mixkit.co/free-stock-video/tourist-port-in-france-at-night-4141/ | Tourist port in France at night | Mixkit | Mixkit Stock Video Free License | 0.7–6.1 s | A small Ligurian harbour at night, with yachts and lights on still water. **This is not Istanbul:** no free Istanbul-at-night waterfront footage exists. Denoised; ping-pong loop. |
| `ocean` | `ocean-1080.mp4`, `ocean-720.mp4`, `ocean-portrait.mp4` (720×1280) | https://mixkit.co/free-stock-video/sea-water-texture-waving-44372/ | Sea water texture waving | Mixkit | Mixkit Stock Video Free License | 4.0–15.5 s | A dark open-sea surface with no horizon, for backgrounds and the footer. 1.5 s crossfade loop. |

Item upload dates on Mixkit: 50176 on 24 Jul 2023, 4001 and 4004 on 20 Mar 2020, 4141 on
18 Mar 2020, 44372 on 16 Nov 2022.

## Stills

All stills are in `public/media/still/` at 1600×900, as AVIF and WebP.

| File | Source item | Title | Author | Licence | Frame | Notes |
|---|---|---|---|---|---|---|
| `tanker-bow` | https://commons.wikimedia.org/wiki/File:20200423_-_Oil_Tankers_sit_off_the_coast_of_Southern_California.webm | 20200423 - Oil Tankers sit off the coast of Southern California | Aidan Cooney, USCG | Public domain (US federal government work) | 43.5 s | Upscaled from 720p |
| `tanker-at-anchor` | same | same | same | Public domain (US federal government work) | 3.0 s | Upscaled from 720p |
| `tanker-fleet-aerial` | same | same | same | Public domain (US federal government work) | 34.5 s | Upscaled from 720p |
| `lpg-carrier-deck` | https://commons.wikimedia.org/wiki/File:22,000_cbm_LPG_Carrier_Navigator_Centauri_transits_Porpoise_Bay.webm | 22,000 cbm LPG Carrier Navigator Centauri transits Porpoise Bay (28 May 2021) | Extemporalist | CC0 1.0 | 66 s | Midship deck only: the ship's name and funnel mark are out of frame. Upscaled from 720p. |
| `open-sea` | https://mixkit.co/free-stock-video/aerial-shot-of-calm-blue-sea-1080/ | Aerial shot of calm blue sea (6 Feb 2019) | Mixkit | Mixkit Stock Video Free License | 1.0 s | |
| `wake-topdown` | https://mixkit.co/free-stock-video/boat-sailing-in-the-sea-seen-from-high-above-50176/ | Boat sailing in the sea seen from high above | Mixkit | Mixkit Stock Video Free License | 8.0 s | |
| `port-dusk` | https://mixkit.co/free-stock-video/shot-of-a-pier-in-the-city-4001/ | Shot of a pier in the city | Mixkit | Mixkit Stock Video Free License | 7.0 s | |
| `galata-waterfront` | https://mixkit.co/free-stock-video/tourist-ferries-arriving-at-the-port-4004/ | Tourist ferries arriving at the port | Mixkit | Mixkit Stock Video Free License | 5.5 s | |
| `mosque-night` | https://mixkit.co/free-stock-video/mosque-during-the-night-4312/ | Mosque during the night (18 Mar 2020) | Mixkit | Mixkit Stock Video Free License | 4.0 s | Yeni Cami, Istanbul |

## Gaps

- **No LPG, LNG or ammonia carrier video at sea.** The only openly licensed gas carrier we
  found is the CC0 Navigator Centauri clip. It is a fixed camera watching the ship sail past,
  so the frame keeps moving and cannot be looped cleanly, and its name and funnel logo fill
  much of the clip. We used it for one still only.
- **No Istanbul or Bosphorus aerial, and nothing of Istanbul at night on the water.** Every
  Bosphorus drone shot on Mixkit, plus the busy-waterways timelapse, is under the Restricted
  License.
- **No commercially licensed drone shot of a large ship underway on open sea.** The hero uses
  public-domain helicopter footage of tankers *at anchor*, which is 720p and upscaled. If a
  paid licence is acceptable, replacing `hero`, `sea` and `gas` with properly licensed 4K
  originals would be the biggest quality gain. The Mixkit restricted items listed above are
  available as 4K Envato Elements downloads under a commercial licence.

## How the files were made

The files were encoded with ffmpeg 6.1. Each loop is trimmed to its best segment and made
seamless in one of two ways:

- **Crossfade:** the last 0.6–1.5 s is crossfaded into the first frames.
- **Ping-pong:** the clip plays forward and then backward. We used this where the subject
  moves and a crossfade would show it twice.

Other processing: a light `hqdn3d` denoise on the night, dusk and 720p sources, and lanczos
scaling.

Encoding: H.264 High, yuv420p, `-movflags +faststart`, no audio, keyframes every 2 s. CRF
19–26 with a VBV cap from each loop's length keeps the 1080p files at or under ~3.7 MB, the
720p files at or under ~1.7 MB and the portrait files at or under ~1.3 MB.

Posters are each loop's first frame:

- AVIF from libaom (still-picture mode, CRF 34)
- WebP at quality 74

All files under `public/media` total about 41 MB.

## Derived media (stage)

Made by OBM Shipping from the items above; no new sources. Recipe and rebuild: [`docs/STAGE.md`](STAGE.md) §7.

| Files | Made from | How |
|---|---|---|
| `video/reel-1080.mp4` (1600×900), `video/reel-720.mp4`, `poster/reel-*` | `port` 0–5 s, `bosphorus` 1–6 s, `gas` 0–5 s, `sea` 0.4–5.4 s (the loops above) | 20 s edit with hard cuts, no audio; licences are those of the four source items (Mixkit Stock Video Free License; public domain) |
| `graded/*-{1600,800,portrait}.{avif,webp}` | first frames of `hero`, `gas`, `reel`, `bosphorus`, `night`, `ocean` | the clip's lens grade baked in (`colorlevels` + `lut3d`) |
| `graded/still/*.{avif,webp}` | the stills above | the still's lens grade baked in, 1200 wide |
| `lut/*.cube` | — | the five lens grades as 3D LUTs (`components/site/stage/grades.ts`) |
| `stage/bathy-*.{avif,webp}` | — | rendered by OBM Shipping's own bathymetry shader (no third-party content) |
