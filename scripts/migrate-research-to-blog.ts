/**
 * One-off migration (November 2026): the 13 research notes in the `research`
 * singleton (content/research.json) become posts in the blog's `posts`
 * collection, one file each: content/blog/<slug>.mdoc (YAML frontmatter +
 * Markdoc body), slugs unchanged.
 *
 *   npx vite-node --config vitest.config.ts scripts/migrate-research-to-blog.ts [--force]
 *
 * Reads content/research.json when it still exists, otherwise the frozen copy
 * in lib/blog/__fixtures__/research-legacy.json. Existing post files are left
 * alone unless --force is given. What it does to each note:
 *
 *   - body blocks → Markdoc: paragraphs, ## headings, lists, {% callout %},
 *     and tables as {% routeTable %} around a Markdoc table; text unchanged
 *     (lib/blog/blog.test.ts compares the rendered text with the original);
 *   - internal links /research/<slug> → /blog/<slug>;
 *   - cat → category (guide → chartering-guides, route → route-guides,
 *     reg → risk-and-regulation, weekly → market-notes), catLabel → format,
 *     iss → issue, label → tags, read → readingTime, author name → broker id;
 *   - adds the type-set cover (code + caption) and the key takeaways below,
 *     written from each note's own text.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import brokers from "../content/brokers.json";
import { legacyNoteToPostFile, type Editorial, type LegacyFile } from "../lib/blog/legacy";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "content/blog");

const EDITORIAL: Record<string, Editorial> = {
  "strait-of-hormuz-disruption-checklist-for-tanker-and-lpg-charterers": {
    cover: { code: "26°34′N", caption: "Strait of Hormuz · 56°15′E" },
    keyTakeaways: [
      "Agree who pays the additional war-risk premium, crew bonuses and kidnap and ransom cover — and whether they are capped — before you fix.",
      "Write down whether waiting for escorts or clearance counts as laytime; do not rely on general exceptions.",
      "Every freight idea shows base freight, waiting days and war-risk costs on separate lines, with the clause that allocates them.",
    ],
  },
  "laytime-and-demurrage-a-practical-guide-for-tanker-and-lpg-charters": {
    cover: { code: "NOR", caption: "Notice of readiness · laytime · demurrage" },
    keyTakeaways: [
      "A valid notice of readiness starts the clock; an invalid NOR is the most common reason a demurrage claim fails.",
      "Shifting berths, ship-caused delays and the owners' own business usually stop the clock — check the exceptions in your charter party.",
      "Claims are won on documents: statement of facts, NOR, pumping logs and protests, sent before the time bar.",
    ],
  },
  "spot-time-charter-or-coa-how-to-charter-an-lpg-carrier": {
    cover: { code: "COA", caption: "Voyage · time charter · contract of affreightment" },
    keyTakeaways: [
      "Spot suits irregular cargoes, a time charter suits regular programmes, and a COA gives predictable freight without a ship of your own.",
      "On a COA, the details that matter are nomination periods, volume tolerances, ship approval and the freight adjustment.",
      "If more than half of a year's cargoes are predictable, a COA or time charter usually beats fixing every cargo spot.",
    ],
  },
  "worldscale-and-tce-explained-how-tanker-freight-is-quoted": {
    cover: { code: "WS", caption: "Worldscale points → time-charter equivalent" },
    keyTakeaways: [
      "Worldscale points are a percentage of a published flat rate in US dollars per tonne, reset every 1 January.",
      "Compare offers on the same commission basis, or the cheaper-looking offer may not be.",
      "TCE — freight less commissions and voyage costs, divided by all voyage days including ballast — is the fair way to compare voyages.",
    ],
  },
  "vlgc-routing-us-gulf-asia-panama-or-the-cape": {
    cover: { code: "BLPG3", caption: "Houston → Chiba · Panama or the Cape" },
    keyTakeaways: [
      "BLPG3 (Houston–Chiba) is the benchmark for the longest regular VLGC trade.",
      "Sea days, canal cost, waiting time, repositioning and fuel basis decide the routing.",
      "We price both routes side by side; a few days of laycan flexibility can move a voyage across the break-even.",
    ],
  },
  "chartering-small-lpg-ships-in-the-med-and-black-sea": {
    cover: { code: "41°07′N", caption: "Bosphorus · 29°04′E" },
    keyTakeaways: [
      "Check the receiving terminal first: tank type, manifold size and temperature limits decide which ships can discharge.",
      "On a short voyage, two extra days at anchor can matter more than the freight rate.",
      "Black Sea estimates need realistic Turkish Straits waiting time built in.",
    ],
  },
  "ammonia-on-mgcs-switching-grades-without-losing-a-voyage": {
    cover: { code: "NH₃", caption: "Midsize gas carrier · grade change" },
    keyTakeaways: [
      "Switching an MGC between LPG and ammonia needs tank preparation that can add days to the voyage.",
      "Terminal rules on previous cargoes and the ship's tank materials decide whether an MGC is a candidate.",
      "Cleaning time and cost belong in the TCE from the start, with the payer agreed before the freight idea goes out.",
    ],
  },
  "suezmax-tightness-sustains-as-cpc-volumes-rebound": {
    cover: { code: "TD6", caption: "CPC · Black Sea → Mediterranean" },
    keyTakeaways: [
      "CPC nominations and a short Atlantic Basin position list kept the Suezmax market tight into Q2.",
      "We frame TD20 by its drivers — the CPC and West African programmes, the position list, the arbitrage — rather than by levels.",
      "When both indicators point tight, consider covering part of the programme on time charter or COA terms.",
    ],
  },
  "td3c-demystified-meg-to-china-end-to-end": {
    cover: { code: "TD3C", caption: "Ras Tanura → Ningbo · VLCC" },
    keyTakeaways: [
      "TD3C (MEG → China) is the most-fixed long-haul tanker route; a round trip including ballast takes 47–52 days.",
      "Charterers book it in four shapes: clean spot, programme lift, co-loading and ballast-bonus structures.",
      "The avoidable demurrage sits at the Chinese discharge ports, not at Ras Tanura.",
    ],
  },
  "wafeast-the-slow-re-rating": {
    cover: { code: "TD15", caption: "West Africa → China · VLCC" },
    keyTakeaways: [
      "Indian state refiners and Chinese teapots have absorbed a growing share of West African crude.",
      "With TD15 running at 70–80% of TD3C laden TCE, ballasting back to the MEG is no longer automatic.",
      "Watch India's crude slate, the Brent–Dubai differential and Cape-route weather.",
    ],
  },
  "eu-ets-phase-2-cargo-allocation-who-actually-pays": {
    cover: { code: "ETS", caption: "EU Emissions Trading System · shipping" },
    keyTakeaways: [
      "From 2026, 100% of covered emissions are in scope, and methane and nitrous oxide are added to CO₂.",
      "Under time charters, BIMCO's ETS clause makes the charterer provide the allowances.",
      "FuelEU Maritime is a separate regime and needs its own clause.",
    ],
  },
  "td7-nsea-cont-shorthaul-fast-turn-thin-margin": {
    cover: { code: "TD7", caption: "North Sea → Continent · Aframax" },
    keyTakeaways: [
      "On TD7 the margin lives in portage, weather routing, discharge sequencing and demurrage.",
      "Missing a tide-dependent pilotage slot at Mongstad or Sture adds 8–14 hours.",
      "We start every TD7 fix with the weather window, not the Worldscale quote.",
    ],
  },
  "g7-price-cap-attestation-the-desklevel-workflow": {
    cover: { code: "G7", caption: "Oil price cap · attestation" },
    keyTakeaways: [
      "Every fixture that touches Russian-origin cargo needs a documented attestation chain.",
      "Each transfer during the voyage needs its own attestation, and blended grades need clear origin documents.",
      "Cap levels now differ by jurisdiction, so we check the level and the designations on the day of fixing.",
    ],
  },
};

function main() {
  const force = process.argv.includes("--force");
  const source = existsSync(path.join(ROOT, "content/research.json"))
    ? "content/research.json"
    : "lib/blog/__fixtures__/research-legacy.json";
  const file = JSON.parse(readFileSync(path.join(ROOT, source), "utf8")) as LegacyFile;
  const idByName = new Map(brokers.brokers.map((b) => [b.name.name, b.name.slug]));

  mkdirSync(OUT, { recursive: true });
  let written = 0;
  for (const note of file.notes) {
    const authorId = idByName.get(note.author);
    if (!authorId)
      throw new Error(`${note.slug}: author "${note.author}" is not on the Brokers list`);
    const editorial = EDITORIAL[note.slug];
    if (!editorial) throw new Error(`${note.slug}: no cover/takeaways in EDITORIAL`);
    const target = path.join(OUT, `${note.slug}.mdoc`);
    if (existsSync(target) && !force) {
      console.log(`skip  content/blog/${note.slug}.mdoc (exists; --force to overwrite)`);
      continue;
    }
    writeFileSync(target, legacyNoteToPostFile(note, authorId, editorial));
    written++;
    console.log(`write content/blog/${note.slug}.mdoc`);
  }
  console.log(`${written} of ${file.notes.length} notes written from ${source}.`);
}

main();
