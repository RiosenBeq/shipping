import { describe, expect, it } from "vitest";
import media from "@/content/media.json";
import { mediaFileSchema, type MediaFile, type PlateMedia } from "@/lib/content/home-schema";
import { validateMediaFiles } from "@/lib/content/validate";
import { GRADES, LUMA, gradeRgb, type Rgb } from "@/components/site/stage/grades";
import { gradeTable } from "@/components/site/stage/GradeFilters";
import { PLATES } from "@/components/site/stage/plates";
import {
  PLATE_SLOTS,
  applyPlateMedia,
  applyStillMedia,
  gradeFragment,
  needsCssGrade,
  shippedStills,
  shippedVideos,
  stills,
  videos,
} from "./media";

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const file = media as MediaFile;
const entry = (over: Partial<PlateMedia> = {}): PlateMedia => ({
  grade: "dawn",
  flipX: "auto",
  ...over,
});
const issues = (m: unknown) => {
  const r = mediaFileSchema.safeParse(m);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
};

describe("media library (content/media.json)", () => {
  it("is valid and, as shipped, changes nothing: the licensed files play", () => {
    expect(issues(file)).toEqual([]);
    expect(validateMediaFiles(file)).toEqual([]);
    expect(videos).toEqual(shippedVideos);
    expect(stills).toEqual(shippedStills);
    for (const id of Object.keys(PLATE_SLOTS) as (keyof typeof PLATE_SLOTS)[]) {
      expect(PLATES[id].video, id).toBeUndefined();
      expect(PLATES[id].poster?.css, id).toBeUndefined();
    }
    // …so pages carry no SVG grade filters.
    expect(needsCssGrade).toBe(false);
  });

  it("has one entry per footage plate and per still, in the grade the build baked", () => {
    expect(Object.keys(file.plates).sort()).toEqual(Object.keys(PLATE_SLOTS).sort());
    expect(Object.keys(file.stills).sort()).toEqual(Object.keys(shippedStills).sort());
    for (const [id, slot] of Object.entries(PLATE_SLOTS))
      expect(file.plates[id as keyof typeof PLATE_SLOTS].grade).toBe(
        shippedVideos[slot].look.grade
      );
    for (const [k, s] of Object.entries(shippedStills))
      expect(file.stills[k as keyof typeof shippedStills].grade).toBe(s.look.grade);
  });

  it("accepts direct https links to video and image files only", () => {
    const ok = clone(file);
    ok.plates["V-hero"].videoUrl = "https://cdn.example.com/clips/hero.mp4?token=abc";
    ok.plates["V-hero"].posterUrl = "https://cdn.example.com/clips/hero.jpg";
    ok.plates["V-night"].videoUrl = "https://videos.example.org/night.webm";
    expect(issues(ok)).toEqual([]);
    for (const bad of [
      "http://cdn.example.com/hero.mp4",
      "https://www.youtube.com/watch?v=abc123",
      "https://vimeo.com/123456",
      "https://cdn.example.com/hero.mp4 extra",
      "ftp://cdn.example.com/hero.mp4",
      "/media/uploads/hero.mp4",
    ]) {
      const m = clone(file);
      m.plates["V-hero"].videoUrl = bad;
      expect(issues(m).length, bad).toBeGreaterThan(0);
    }
    const img = clone(file);
    img.stills.galata.imageUrl = "https://cdn.example.com/galata.gif";
    img.stills.galata.alt = "Galata";
    expect(issues(img).length).toBeGreaterThan(0);
  });

  it("rejects an upload and a link together, half a focal point, and a new still without alt", () => {
    const both = clone(file);
    both.plates["V-gas"].videoFile = "/media/uploads/plates/V-gas/videoFile.mp4";
    both.plates["V-gas"].videoUrl = "https://cdn.example.com/gas.mp4";
    expect(issues(both).join("\n")).toMatch(/not both/);
    const half = clone(file);
    half.plates["V-gas"].focalX = 40;
    expect(issues(half).join("\n")).toMatch(/both focal/);
    const noAlt = clone(file);
    noAlt.stills.portDusk.imageUrl = "https://cdn.example.com/port.jpg";
    expect(issues(noAlt).join("\n")).toMatch(/alt text/);
    const out = clone(file);
    out.plates["V-ocean"].horizon = 140;
    expect(issues(out).length).toBeGreaterThan(0);
  });

  it("reports uploads that are missing from public/", () => {
    const m = clone(file);
    m.plates["V-reel"].videoFile = "/media/uploads/plates/V-reel/videoFile.mp4";
    expect(validateMediaFiles(m)).toEqual([
      "content/media.json: plates.V-reel.videoFile: /media/uploads/plates/V-reel/videoFile.mp4 is missing from public/",
    ]);
  });
});

describe("applying an entry to a plate", () => {
  const hero = shippedVideos.hero;

  it("plays a link with neutral framing, no mirror, no horizon, graded live", () => {
    const v = applyPlateMedia(hero, entry({ videoUrl: "https://cdn.example.com/a.mp4" }));
    expect(v.mp4_1080).toBe("https://cdn.example.com/a.mp4");
    expect(v.mp4_720).toBe("https://cdn.example.com/a.mp4");
    expect(v.mp4_portrait).toBeUndefined();
    expect(v.source).toEqual({ kind: "url", remote: true });
    expect(v.look).toMatchObject({
      grade: "dawn",
      focal: { x: 0.5, y: 0.5 },
      flipX: false,
      horizon: null,
      levels: [0, 1],
    });
    // No poster given: none (the stage shows the clip's first frame), never the old clip's.
    expect(v.graded).toBeUndefined();
    expect(v.poster_webp).toBe("");
  });

  it("uses an uploaded phone file, focal points in percent and the poster through the CSS grade", () => {
    const v = applyPlateMedia(
      hero,
      entry({
        videoFile: "/media/uploads/plates/V-hero/videoFile.mp4",
        phoneUrl: "https://cdn.example.com/a-portrait.mp4",
        posterUrl: "https://cdn.example.com/a.jpg",
        grade: "dusk",
        focalX: 70,
        focalY: 40,
        flipX: "on",
        horizon: 30,
      })
    );
    expect(v.source).toEqual({ kind: "upload", remote: false });
    expect(v.mp4_portrait).toBe("https://cdn.example.com/a-portrait.mp4");
    expect(v.look.focal).toEqual({ x: 0.7, y: 0.4 });
    expect(v.look.focalPhone).toEqual({ x: 0.7, y: 0.4 });
    expect(v.look.flipX).toBe(true);
    expect(v.look.horizon).toBeCloseTo(0.3);
    expect(v.graded?.css).toBe("dusk");
    expect(v.graded?.webp).toBe(`https://cdn.example.com/a.jpg${gradeFragment("dusk")}`);
    const plate = PLATES["V-hero"];
    expect(plate.kind).toBe("video");
  });

  it("regrades the shipped clip from its ungraded first frames", () => {
    const same = applyPlateMedia(hero, entry({ grade: hero.look.grade }));
    expect(same.graded).toBe(hero.graded);
    const v = applyPlateMedia(hero, entry({ grade: "night" }));
    expect(v.mp4_1080).toBe(hero.mp4_1080);
    expect(v.source).toBeUndefined();
    expect(v.look.grade).toBe("night");
    expect(v.look.focal).toEqual(hero.look.focal);
    expect(v.graded?.css).toBe("night");
    expect(v.graded?.webp).toBe(`${hero.poster_webp}#lv-grade-night`);
    expect(v.graded?.avifPortrait).toBe(`${hero.posterPortrait_avif}#lv-grade-night`);
  });
});

describe("grade none (testing other clips in their own colours)", () => {
  it("shows a plate's video and poster as they are, and a still without the CSS grade", () => {
    const v = applyPlateMedia(
      shippedVideos.night,
      entry({
        grade: "none",
        videoUrl: "https://cdn.example.com/n.mp4",
        posterUrl: "https://cdn.example.com/n.jpg",
      })
    );
    expect(v.look.ungraded).toBe(true);
    expect(v.graded?.css).toBeUndefined();
    expect(v.graded?.webp).toBe("https://cdn.example.com/n.jpg");
    const shipped = applyPlateMedia(shippedVideos.night, entry({ grade: "none" }));
    expect(shipped.graded?.webp).toBe(shippedVideos.night.poster_webp);
    const still = applyStillMedia(shippedStills.portDusk, { grade: "none" });
    expect(still.graded.webp).toBe(shippedStills.portDusk.webp);
    expect(still.graded.css).toBeUndefined();
  });
});

describe("applying an entry to a still", () => {
  const s = shippedStills.galata;
  it("keeps the baked still in its own grade, regrades or replaces it otherwise", () => {
    expect(applyStillMedia(s, { grade: s.look.grade }).graded).toBe(s.graded);
    const regraded = applyStillMedia(s, { grade: "night" });
    expect(regraded.graded.webp).toBe(`${s.webp}#lv-grade-night`);
    const replaced = applyStillMedia(s, {
      grade: "day",
      imageFile: "/media/uploads/stills/galata/imageFile.jpg",
      alt: "Ferry at Karaköy",
      focalX: 30,
      focalY: 60,
    });
    expect(replaced.graded.webp).toBe("/media/uploads/stills/galata/imageFile.jpg#lv-grade-day");
    expect(replaced.alt).toBe("Ferry at Karaköy");
    expect(replaced.look.focal).toEqual({ x: 0.3, y: 0.6 });
    expect(replaced.source).toEqual({ kind: "upload", remote: false });
  });
});

describe("the CSS grade (SVG filter) follows the lens grade", () => {
  const lerp = (t: number[], x: number) => {
    const p = x * (t.length - 1);
    const i = Math.min(t.length - 2, Math.floor(p));
    return t[i] + (t[i + 1] - t[i]) * (p - i);
  };
  it.each(Object.keys(GRADES))("%s", (id) => {
    const g = GRADES[id as keyof typeof GRADES];
    const tables = [0, 1, 2].map((i) => gradeTable(g, i as 0 | 1 | 2));
    const e = Math.pow(2, g.exposure);
    for (const c of [
      [0.05, 0.08, 0.12],
      [0.3, 0.42, 0.5],
      [0.62, 0.6, 0.55],
      [0.9, 0.92, 0.88],
    ] as Rgb[]) {
      const exposed = c.map((v) => v * e);
      const l = exposed[0] * LUMA[0] + exposed[1] * LUMA[1] + exposed[2] * LUMA[2];
      const want = gradeRgb(c, g);
      for (let i = 0; i < 3; i++) {
        const got = lerp(tables[i], Math.min(1, l)) * (1 - g.chroma) + exposed[i] * g.chroma;
        expect(Math.abs(got - want[i])).toBeLessThan(0.02);
      }
    }
  });
});
