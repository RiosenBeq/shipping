/**
 * Builds the stage's derived media from the licensed masters in /public/media (DESIGN-V2 §6.6):
 *
 *   luts     /media/lut/<preset>.cube           the five lens grades as 17³ LUTs (grades.ts)
 *   reel     /media/video/reel-{1080,720}.mp4   the 20 s V-reel edit (hard cuts, no audio)
 *            /media/poster/reel-{1920,720}.*     its ungraded first frame
 *   posters  /media/graded/<slot>-{1600,800,portrait}.{avif,webp}   graded first frames
 *   stills   /media/graded/still/<file>.{avif,webp}                 graded 1200w stills
 *
 * Grading = per-channel `colorlevels` (the item's `look.levels`) → `lut3d` (its preset), the
 * same maths as the lens shader, so the canvas fades in over its poster without a jump.
 * Prints the byte sizes as JSON for lib/media.ts. Dev tool, never imported by the site:
 *
 *   npx vite-node components/site/stage/tools/build-media.ts -- [luts] [reel] [posters] [stills]
 *
 * (Relative imports: vite-node does not read the "@/" alias.)
 *
 * The P-bathy statics (/media/stage/bathy-*) are baked from the live shader instead: open
 * /stage-lab?bake=bathy&stage=1 at 1920×1200 (and 600×1067 at 1.5×), screenshot, then
 *   ffmpeg -i shot.png -vf format=yuv444p -c:v libaom-av1 -still-picture 1 -crf 28 -b:v 0 bathy-1920.avif
 *   ffmpeg -i shot.png -c:v libwebp -quality 75 -preset drawing bathy-1920.webp
 * (4:4:4 keeps the thin brass lines brass.)
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, statSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
// The shipped files (the Media library's uploads and links are graded live, not baked here).
import {
  shippedStills as stills,
  shippedVideos as videos,
  type StillImage,
  type VideoLoop,
  type VideoSlot,
} from "../../../../lib/media";
import { cubeLut, GRADE_PRESETS } from "../grades";

const ROOT = path.resolve(__dirname, "../../../../public");
const pub = (url: string) => path.join(ROOT, url);
const TMP = path.join(tmpdir(), "levanter-stage-media");
const LUT_SIZE = 17;

/** Clips the stage plays (V-* plates): they get graded posters. */
export const PLATE_SLOTS: VideoSlot[] = ["hero", "gas", "reel", "bosphorus", "night", "ocean"];

/** The V-reel edit: ships at sea → port cranes at dusk → Bosphorus by day → tanker at anchor. */
export const REEL_SHOTS: { slot: VideoSlot; from: number }[] = [
  { slot: "sea", from: 0.4 },
  { slot: "port", from: 0 },
  { slot: "bosphorus", from: 1 },
  { slot: "gas", from: 0 },
];
const SHOT_SECONDS = 5;

function ff(args: string[]) {
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...args], { stdio: "inherit" });
}
const bytes = (url: string) => statSync(pub(url)).size;

function gradeFilter(look: { grade: string; levels?: [number, number]; flipX?: boolean }) {
  const [lo, hi] = look.levels ?? [0, 1];
  const lv = `colorlevels=rimin=${lo}:gimin=${lo}:bimin=${lo}:rimax=${hi}:gimax=${hi}:bimax=${hi}`;
  const lut = `lut3d=file=${pub(`/media/lut/${look.grade}.cube`)}:interp=tetrahedral`;
  return ["format=rgb24", lv, lut, ...(look.flipX ? ["hflip"] : [])].join(",");
}

function encodeStill(srcPng: string, width: number, outBase: string, avifCrf = 30, webpQ = 74) {
  const scale = `scale=${width}:-2:flags=lanczos`;
  ff([
    "-i",
    srcPng,
    "-vf",
    `${scale},format=yuv420p`,
    "-c:v",
    "libaom-av1",
    "-still-picture",
    "1",
    "-crf",
    String(avifCrf),
    "-b:v",
    "0",
    "-cpu-used",
    "3",
    `${outBase}.avif`,
  ]);
  ff([
    "-i",
    srcPng,
    "-vf",
    scale,
    "-c:v",
    "libwebp",
    "-quality",
    String(webpQ),
    "-compression_level",
    "6",
    `${outBase}.webp`,
  ]);
}

function luts() {
  mkdirSync(pub("/media/lut"), { recursive: true });
  for (const p of GRADE_PRESETS) writeFileSync(pub(`/media/lut/${p}.cube`), cubeLut(p, LUT_SIZE));
  return Object.fromEntries(GRADE_PRESETS.map((p) => [p, `/media/lut/${p}.cube`]));
}

function reel() {
  const inputs: string[] = [];
  const chains: string[] = [];
  REEL_SHOTS.forEach((s, i) => {
    inputs.push(
      "-ss",
      String(s.from),
      "-t",
      String(SHOT_SECONDS),
      "-i",
      pub(videos[s.slot].mp4_1080)
    );
    chains.push(`[${i}:v]fps=24,scale=1920:1080:flags=lanczos,setsar=1[v${i}]`);
  });
  const concat = `${chains.join(";")};${REEL_SHOTS.map((_, i) => `[v${i}]`).join("")}concat=n=${REEL_SHOTS.length}:v=1:a=0[v]`;
  const master = path.join(TMP, "reel-master.mkv");
  ff([
    ...inputs,
    "-filter_complex",
    concat,
    "-map",
    "[v]",
    "-c:v",
    "libx264",
    "-crf",
    "12",
    "-preset",
    "fast",
    master,
  ]);
  const x264 = (w: number, h: number, crf: number, maxrate: string, out: string) =>
    ff([
      "-i",
      master,
      "-vf",
      `scale=${w}:${h}:flags=lanczos`,
      "-an",
      "-c:v",
      "libx264",
      "-profile:v",
      "high",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "veryslow",
      "-crf",
      String(crf),
      "-maxrate",
      maxrate,
      "-bufsize",
      "2M",
      "-g",
      "48",
      "-movflags",
      "+faststart",
      pub(out),
    ]);
  // 1600w is the high tier's video width (§6.5); the dusk grade hides what CRF 29 drops.
  x264(1600, 900, 29, "1300k", "/media/video/reel-1080.mp4");
  x264(1280, 720, 30, "750k", "/media/video/reel-720.mp4");
  const first = path.join(TMP, "reel-first.png");
  ff(["-i", master, "-frames:v", "1", first]);
  encodeStill(first, 1920, pub("/media/poster/reel-1920"), 34, 70);
  encodeStill(first, 720, pub("/media/poster/reel-720"), 34, 70);
  return {
    mp4_1080: bytes("/media/video/reel-1080.mp4"),
    mp4_720: bytes("/media/video/reel-720.mp4"),
  };
}

function firstFrame(url: string, out: string) {
  ff(["-i", pub(url), "-frames:v", "1", out]);
}

function posters() {
  mkdirSync(pub("/media/graded"), { recursive: true });
  const out: Record<string, unknown> = {};
  for (const slot of PLATE_SLOTS) {
    const v: VideoLoop = videos[slot];
    const src = path.join(TMP, `${slot}-first.png`);
    const graded = path.join(TMP, `${slot}-graded.png`);
    firstFrame(v.mp4_1080, src);
    ff(["-i", src, "-vf", gradeFilter(v.look), graded]);
    // The hero poster is the LCP: AVIF 1600w ≤ 90 KB, 800w ≤ 40 KB (§6.5).
    encodeStill(graded, 1600, pub(`/media/graded/${slot}-1600`), 30, 72);
    encodeStill(graded, 800, pub(`/media/graded/${slot}-800`), 32, 70);
    const entry: Record<string, number> = {
      avif: bytes(`/media/graded/${slot}-1600.avif`),
      webp: bytes(`/media/graded/${slot}-1600.webp`),
      avifSmall: bytes(`/media/graded/${slot}-800.avif`),
    };
    if (v.mp4_portrait) {
      const psrc = path.join(TMP, `${slot}-pfirst.png`);
      const pgraded = path.join(TMP, `${slot}-pgraded.png`);
      firstFrame(v.mp4_portrait, psrc);
      ff(["-i", psrc, "-vf", gradeFilter(v.look), pgraded]);
      encodeStill(pgraded, v.portraitWidth ?? 720, pub(`/media/graded/${slot}-portrait`), 32, 70);
      entry.avifPortrait = bytes(`/media/graded/${slot}-portrait.avif`);
    }
    out[slot] = entry;
  }
  return out;
}

function gradedStills() {
  mkdirSync(pub("/media/graded/still"), { recursive: true });
  const out: Record<string, unknown> = {};
  for (const [key, s] of Object.entries(stills) as [string, StillImage][]) {
    const name = path.basename(s.webp, ".webp");
    const src = path.join(TMP, `still-${name}.png`);
    ff(["-i", pub(s.webp), "-vf", gradeFilter(s.look), src]);
    encodeStill(src, 1200, pub(`/media/graded/still/${name}`), 32, 72);
    out[key] = {
      avif: bytes(`/media/graded/still/${name}.avif`),
      webp: bytes(`/media/graded/still/${name}.webp`),
    };
  }
  return out;
}

function main() {
  const steps = process.argv.slice(2).filter((a) => a !== "--");
  const want = (s: string) => steps.length === 0 || steps.includes(s);
  if (existsSync(TMP)) rmSync(TMP, { recursive: true });
  mkdirSync(TMP, { recursive: true });
  const report: Record<string, unknown> = {};
  if (want("luts")) report.luts = luts();
  if (want("reel")) report.reel = reel();
  if (want("posters")) report.posters = posters();
  if (want("stills")) report.stills = gradedStills();
  console.log(JSON.stringify(report, null, 2));
}

main();
