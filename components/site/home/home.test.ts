import { describe, expect, it } from "vitest";
import { homeFileSchema, type HomeFile } from "@/lib/content/home-schema";
import { validateHomeLinks } from "@/lib/content/validate";
import { CURRENCY_PATTERN, FREIGHT_CALCULATOR_PATH, HOME_BLOCK_KINDS } from "@/lib/content/options";
import { HOME, homeBlock, homeBlocks, homeOrder } from "@/lib/data/home";
import { LOCALES } from "@/lib/i18n";
import { MAP_COLS, MAP_ROWS, project } from "./reach-map";
import { HOME_SECTIONS, SECTION_IDS } from "./types";
import {
  SHIP_CARDS,
  calculatorHref,
  englishHome,
  localizedHome,
  pagePlates,
  splitFor,
} from "./view";

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const errors = (h: unknown) => {
  const r = homeFileSchema.safeParse(h);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
};

describe("homepage content (content/home.json)", () => {
  it("is valid as shipped, with every section once and the hero first", () => {
    expect(errors(HOME)).toEqual([]);
    expect(
      homeBlocks()
        .map((b) => b.discriminant)
        .sort()
    ).toEqual([...HOME_BLOCK_KINDS].sort());
  });

  it("rejects a hero headline over 48 characters or four lines", () => {
    const h = clone(HOME);
    h.hero.headline = "Tankers and gas carriers,\nbrokered every day from\nthe Bosphorus.";
    expect(errors(h).length).toBeGreaterThan(0);
    h.hero.headline = "A\nB\nC\nD";
    expect(errors(h).length).toBeGreaterThan(0);
  });

  it("rejects prices, rates and currency in counters and the calculator card", () => {
    for (const caption of ["$/day on TD3C", "WS 55 last week", "12% up", "€ per tonne"]) {
      const h = clone(HOME);
      const reach = homeBlock("reach", h)!;
      reach.counters[0].caption = caption;
      expect(errors(h).length, caption).toBeGreaterThan(0);
    }
    for (const c of homeBlock("reach")!.counters)
      expect(CURRENCY_PATTERN.test(c.caption)).toBe(false);
    const h = clone(HOME);
    homeBlock("desks", h)!.calculator.text = "TD3C at WS 55 this week";
    expect(errors(h).length).toBeGreaterThan(0);
  });

  it("keeps the statement and row leads inside their limits", () => {
    const h = clone(HOME);
    homeBlock("who", h)!.statement = "x".repeat(221);
    expect(errors(h).length).toBeGreaterThan(0);
    const r = clone(HOME);
    homeBlock("desks", r)!.rows[0].text = "x".repeat(141);
    expect(errors(r).length).toBeGreaterThan(0);
  });

  it("insists on an accent word that is in the headline", () => {
    const h = clone(HOME);
    h.hero.accent = "Bosporus";
    expect(errors(h)).toContain("hero.accent: The accent must be a word of the headline");
  });

  it("allows each section once, and rejects unknown kinds and stray fields", () => {
    const dup = clone(HOME);
    dup.sections.push(clone(dup.sections[0]));
    expect(errors(dup).join("\n")).toMatch(/appears twice/);
    const unknown = clone(HOME) as unknown as { sections: { discriminant: string }[] };
    unknown.sections[0].discriminant = "gallery";
    expect(errors(unknown).length).toBeGreaterThan(0);
    const stray = clone(HOME);
    (
      stray.sections.find((b) => b.discriminant === "team")!.value as Record<string, unknown>
    ).colour = "red";
    expect(errors(stray).length).toBeGreaterThan(0);
  });

  it("links only to pages that exist", () => {
    expect(validateHomeLinks(HOME)).toEqual([]);
    const h = clone(HOME);
    homeBlock("reach", h)!.lanes[0].href = "/blog/no-such-post";
    homeBlock("desks", h)!.rows[1].href = "/lpg/no-such-class";
    const found = validateHomeLinks(h);
    expect(found).toHaveLength(2);
    expect(found[0]).toMatch(/^content\/home\.json: sections\.\d \(desks\)\.rows\.1\.href/);
    homeBlock("desks", h)!.rows[1].href = FREIGHT_CALCULATOR_PATH;
    expect(validateHomeLinks(h)).toHaveLength(1);
  });
});

describe("section order and visibility", () => {
  it("follows the editor's order and drops hidden or repeated sections", () => {
    const h = clone(HOME);
    const kinds = h.sections.map((b) => b.discriminant);
    expect(homeOrder(h)).toEqual(kinds);
    // Move the letter up under the hero, hide the team.
    const letter = h.sections.splice(kinds.indexOf("letter"), 1)[0];
    h.sections.unshift(letter);
    homeBlock("team", h)!.show = false;
    h.sections.push(clone(h.sections[1]));
    const order = homeOrder(h);
    expect(order[0]).toBe("letter");
    expect(order).not.toContain("team");
    expect(new Set(order).size).toBe(order.length);
  });

  it("builds the view, the plates and the rail in that order", () => {
    const h = clone(HOME);
    h.sections.reverse();
    homeBlock("who", h)!.show = false;
    const v = englishHome(h);
    expect(v.order).toEqual(homeOrder(h));
    expect(v.who).toBeUndefined();
    expect(v.order[0]).toBe("letter");
    const plates = pagePlates(v);
    expect(plates[0]).toBe(v.hero.plate);
    expect(plates[1]).toBe(v.letter!.plate);
    expect(plates.at(-1)).toBe("V-ocean");
    expect(plates).not.toContain("P-bathy");
    expect(Object.keys(v.rail.items).sort()).toEqual(["hero", ...v.order].sort());
  });

  it("points How we work at the reel only while the page has it", () => {
    expect(englishHome().desks!.more.href).toBe("#process");
    const h = clone(HOME);
    homeBlock("process", h)!.show = false;
    expect(englishHome(h).desks!.more.href).toBe("/about");
  });
});

describe("homepage view", () => {
  const en = englishHome();

  it("has nine sections with stable ids", () => {
    expect(HOME_SECTIONS).toHaveLength(9);
    expect(new Set(Object.values(SECTION_IDS)).size).toBe(9);
    expect(en.order).toHaveLength(8);
  });

  it("links all nine ship classes as crawlable class guides, and to the calculator", () => {
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
      expect(c.estimateHref).toBe(`${FREIGHT_CALCULATOR_PATH}?class=${c.slug}`);
      expect(c.band).not.toMatch(CURRENCY_PATTERN);
      expect(c.routes.length).toBeGreaterThan(0);
    }
    expect(en.desks!.calculator?.href).toBe(FREIGHT_CALCULATOR_PATH);
    expect(calculatorHref("a b")).toBe(`${FREIGHT_CALCULATOR_PATH}?class=a%20b`);
  });

  it("feeds the tide ticker benchmark routes only: unique codes, tankers and gas, no rates", () => {
    const routes = en.reach!.routes;
    expect(routes.length).toBeGreaterThanOrEqual(6);
    expect(routes.length).toBeLessThanOrEqual(10);
    expect(new Set(routes.map((r) => r.code)).size).toBe(routes.length);
    for (const r of routes) {
      expect(r.code).toMatch(/^(TD|TC|BLPG)\d+[A-Z]?$/);
      expect(`${r.code} ${r.lane}`).not.toMatch(CURRENCY_PATTERN);
    }
    expect(routes.some((r) => r.code.startsWith("BLPG"))).toBe(true);
    // Localized homepages carry the same (English) list.
    expect(localizedHome(LOCALES.find((l) => l.code === "de")!).reach!.routes).toEqual(routes);
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
      expect(v.order).toEqual(en.order);
      expect(pagePlates(v)).toEqual(pagePlates(en));
      expect(v.hero.lines.length).toBeGreaterThan(0);
      expect(v.hero.lines.length).toBeLessThanOrEqual(3);
      if (v.hero.accent)
        expect(v.hero.lines.join(" ")).toContain(v.hero.accent.replace(/[.。]$/, ""));
      expect(v.who!.facts).toHaveLength(4);
      expect(v.desks!.rows).toHaveLength(4);
      expect(v.reach!.counters).toHaveLength(4);
      expect(v.process!.steps).toHaveLength(4);
      for (const s of HOME_SECTIONS) expect(v.rail.items[s]).toBeTruthy();
      for (const c of v.reach!.counters) expect(c.caption).not.toMatch(CURRENCY_PATTERN);
      expect(v.letter!.duty.text).not.toContain("{number}");
      // Translated, not the English copy.
      expect(v.who!.statement).not.toBe(en.who!.statement);
      expect(v.hero.lead).not.toBe(en.hero.lead);
      expect(v.desks!.calculator!.title).not.toBe(en.desks!.calculator!.title);
      expect(v.desks!.calculator!.href).toBe(FREIGHT_CALCULATOR_PATH);
      expect(v.ships!.estimate).not.toBe(en.ships!.estimate);
      for (const t of [v.desks!.calculator!.text, v.desks!.calculator!.title])
        expect(t).not.toMatch(CURRENCY_PATTERN);
    }
  );

  it("localized pages follow the English order and switches", () => {
    const h = clone(HOME);
    h.sections.reverse();
    homeBlock("notes", h)!.show = false;
    for (const l of LOCALES) {
      const v = localizedHome(l, h);
      expect(v.order).toEqual(homeOrder(h));
      expect(v.notes).toBeUndefined();
    }
  });
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
