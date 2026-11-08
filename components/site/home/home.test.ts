import { describe, expect, it } from "vitest";
import { homeFileSchema } from "@/lib/content/schemas";
import { validateHomeLinks } from "@/lib/content/validate";
import { CURRENCY_PATTERN } from "@/lib/content/options";
import { HOME } from "@/lib/data/home";
import { LOCALES } from "@/lib/i18n";
import { MAP_COLS, MAP_ROWS, project } from "./reach-map";
import { HOME_SECTIONS, SECTION_IDS } from "./types";
import { SHIP_CARDS, englishHome, localizedHome, splitFor } from "./view";

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

describe("homepage content (content/home.json)", () => {
  it("rejects a hero headline over 48 characters or four lines", () => {
    const h = clone(HOME);
    h.hero.headline = "Tankers and gas carriers,\nbrokered every day from\nthe Bosphorus.";
    expect(homeFileSchema.safeParse(h).success).toBe(false);
    h.hero.headline = "A\nB\nC\nD";
    expect(homeFileSchema.safeParse(h).success).toBe(false);
  });

  it("rejects prices, rates and currency in counters (no stale numbers)", () => {
    for (const caption of ["$/day on TD3C", "WS 55 last week", "12% up", "€ per tonne"]) {
      const h = clone(HOME);
      h.reach.counters[0].caption = caption;
      expect(homeFileSchema.safeParse(h).success, caption).toBe(false);
    }
    for (const c of HOME.reach.counters) expect(CURRENCY_PATTERN.test(c.caption)).toBe(false);
  });

  it("keeps the statement and row leads inside their limits", () => {
    const h = clone(HOME);
    h.who.statement = "x".repeat(221);
    expect(homeFileSchema.safeParse(h).success).toBe(false);
    const r = clone(HOME);
    r.desks.rows[0].text = "x".repeat(141);
    expect(homeFileSchema.safeParse(r).success).toBe(false);
  });

  it("insists on an accent word that is in the headline", () => {
    const h = clone(HOME);
    h.hero.accent = "Bosporus";
    expect(homeFileSchema.safeParse(h).success).toBe(false);
  });

  it("links only to pages that exist", () => {
    expect(validateHomeLinks(HOME)).toEqual([]);
    const h = clone(HOME);
    h.reach.lanes[0].href = "/blog/no-such-post";
    h.desks.rows[1].href = "/lpg/no-such-class";
    expect(validateHomeLinks(h)).toHaveLength(2);
  });
});

describe("homepage view", () => {
  const en = englishHome();

  it("has nine sections with stable ids, the hero always shown", () => {
    expect(HOME_SECTIONS).toHaveLength(9);
    expect(new Set(Object.values(SECTION_IDS)).size).toBe(9);
    expect(en.show.hero).toBe(true);
  });

  it("links all nine ship classes as crawlable class guides", () => {
    expect(SHIP_CARDS.map((c) => c.slug)).toEqual([
      "vlcc",
      "suezmax",
      "aframax",
      "lr1",
      "mr",
      "vlgc",
      "mgc",
      "handysize",
      "pressurised",
    ]);
    for (const c of SHIP_CARDS) {
      expect(c.href).toMatch(/^\/(tankers|lpg)\/[a-z0-9-]+$/);
      expect(c.band).not.toMatch(CURRENCY_PATTERN);
      expect(c.routes.length).toBeGreaterThan(0);
    }
  });

  it("splits the hero by letter, CJK character or Arabic word", () => {
    expect(splitFor("en")).toBe("chars");
    expect(splitFor("zh-Hans")).toBe("cjk");
    expect(splitFor("ja")).toBe("cjk");
    expect(splitFor("ar")).toBe("words");
    expect(splitFor("ko")).toBe("chars");
  });

  it.each(LOCALES.map((l) => [l.code, l] as const))(
    "%s: same flow, translated copy, a hero of at most three lines",
    (_, locale) => {
      const v = localizedHome(locale);
      expect(v.lang).toBe(locale.hreflang);
      expect(v.dir).toBe(locale.dir);
      expect(v.linkLang).toBe("en");
      expect(v.show).toEqual(en.show);
      expect(v.plates).toEqual(en.plates);
      expect(v.hero.lines.length).toBeGreaterThan(0);
      expect(v.hero.lines.length).toBeLessThanOrEqual(3);
      if (v.hero.accent) expect(v.hero.lines.join(" ")).toContain(v.hero.accent.replace(/[.。]$/, ""));
      expect(v.who.facts).toHaveLength(4);
      expect(v.desks.rows).toHaveLength(4);
      expect(v.reach.counters).toHaveLength(4);
      expect(v.process.steps).toHaveLength(4);
      for (const s of HOME_SECTIONS) expect(v.rail.items[s]).toBeTruthy();
      for (const c of v.reach.counters) expect(c.caption).not.toMatch(CURRENCY_PATTERN);
      expect(v.letter.duty.text).not.toContain("{number}");
      // Translated, not the English copy.
      expect(v.who.statement).not.toBe(en.who.statement);
      expect(v.hero.lead).not.toBe(en.hero.lead);
    }
  );
});

describe("reach map", () => {
  it("places the three offices inside the map", () => {
    for (const [lon, lat] of [
      [28.98, 41.01],
      [-0.13, 51.5],
      [103.82, 1.29],
    ]) {
      const [x, y] = project(lon, lat);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(MAP_COLS);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(MAP_ROWS);
    }
  });
});
