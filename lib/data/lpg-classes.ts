/**
 * LPG & ammonia carrier classes for /lpg and /lpg/[class].
 *
 * Size bands follow common industry segmentation (Clarksons-style):
 * VLGC 70k+ cbm, LGC 50–70k, MGC 25–50k, Handy 15–25k, small/coaster < 15k.
 * Figures are typical ranges for orientation, not vessel-specific specs.
 */

export type LpgClassData = {
  slug: string;
  name: string;
  longName: string;
  /** Noun phrase with its article for running copy: "Looking for an MGC?". */
  ctaNoun: string;
  capacity: string;
  containment: string;
  typicalCargo: string;
  cargoes: string[];
  intro: string;
  routes: { code: string; lane: string; note: string }[];
  trades: string[];
  watchpoints: { title: string; body: string }[];
  charterShape: string;
  /** Who on the LPG desk covers this size (shown next to charterShape). */
  desk: string;
  faq: { q: string; a: string }[];
};

export const LPG_CLASSES: LpgClassData[] = [
  {
    slug: "vlgc",
    name: "VLGC",
    longName: "Very Large Gas Carrier",
    ctaNoun: "a VLGC",
    capacity: "70,000 cbm and above — modern ships mostly 78,000–93,000 cbm",
    containment: "Fully refrigerated, prismatic tanks, atmospheric pressure (~−50 °C)",
    typicalCargo: "≈ 44,000–46,000 mt fully refrigerated propane/butane",
    cargoes: ["Propane", "Butane", "Propane/butane splits", "Ammonia (ammonia-capable VLGC/VLAC)"],
    intro:
      "The VLGC is the long-haul workhorse of seaborne LPG. Almost every trade-flow story — US Gulf exports to Asia, Middle East Gulf to India and the Far East, Panama Canal congestion — shows up first in VLGC freight. We fix VLGCs on spot, period and COA for traders, importers and end-users, and model every fixture on a Panama vs. Cape basis before we quote.",
    routes: [
      {
        code: "BLPG1",
        lane: "Ras Tanura → Chiba",
        note: "Baltic benchmark for Middle East Gulf to Japan; 44,000 mt fully refrigerated basis.",
      },
      {
        code: "BLPG2",
        lane: "Houston → Flushing",
        note: "US Gulf to North-West Europe — the transatlantic VLGC reference.",
      },
      {
        code: "BLPG3",
        lane: "Houston → Chiba",
        note: "US Gulf to Japan; routing via Panama or the Cape drives the round-trip economics.",
      },
    ],
    trades: [
      "US Gulf exports to Asia and Europe",
      "Middle East Gulf to India, China, Japan and Korea",
      "West Africa and North Sea exports",
      "Mediterranean and Türkiye imports",
    ],
    watchpoints: [
      {
        title: "Panama vs. Cape",
        body: "Transit slots, waiting time and canal cost decide whether a US Gulf–Asia voyage routes via Panama or the Cape. We price both and show the TCE difference before you commit.",
      },
      {
        title: "Arbitrage-driven demand",
        body: "VLGC demand follows the US–Asia propane spread. When the arb narrows, ballasters build in the US Gulf and rates soften quickly; when it opens, prompt tonnage disappears.",
      },
      {
        title: "Dual-fuel fleet split",
        body: "LPG dual-fuel ships burn part of their cargo and trade at a premium on fuel cost. We compare consumption and fuel basis before recommending a ship.",
      },
    ],
    charterShape:
      "Spot voyages are quoted in $/mt. Period business runs from 6 months to multi-year time charters, usually priced in $/month. COAs are common with importers and trading houses.",
    desk: "Istanbul (Elif Kaya) for the Med, Türkiye and Atlantic business, Singapore (Hiroshi Tanaka) for BLPG1 and BLPG3 lanes East.",
    faq: [
      {
        q: "How much LPG does a VLGC carry?",
        a: "A modern VLGC of around 84,000 cbm typically lifts about 44,000–46,000 metric tonnes of fully refrigerated propane/butane, depending on cargo grade, density and filling limits.",
      },
      {
        q: "Which benchmarks track VLGC freight?",
        a: "The Baltic Exchange publishes BLPG1 (Ras Tanura–Chiba), BLPG2 (Houston–Flushing) and BLPG3 (Houston–Chiba). They are the reference points most VLGC spot fixtures are compared against.",
      },
    ],
  },
  {
    slug: "mgc",
    name: "MGC",
    longName: "Midsize Gas Carrier",
    ctaNoun: "an MGC",
    capacity: "25,000–50,000 cbm — the core of the fleet is 35,000–40,000 cbm",
    containment: "Fully refrigerated; most ships are certified for ammonia",
    typicalCargo: "≈ 20,000–25,000 mt LPG or ammonia",
    cargoes: ["Ammonia", "Propane", "Butane", "Propylene"],
    intro:
      "MGCs are the most versatile fully refrigerated gas ships. They are the backbone of seaborne ammonia, move LPG into ports that cannot take a VLGC, and swing between the two depending on which pays more. That flexibility is exactly why MGC fixtures need a broker who follows both markets.",
    routes: [
      {
        code: "NH3",
        lane: "Middle East / North Africa → Med & India",
        note: "Ammonia flows to fertiliser and industrial buyers; port and terminal compatibility matter.",
      },
      {
        code: "LPG",
        lane: "North Sea / Med → West Africa & Türkiye",
        note: "Mid-sized parcels into receiving terminals with draft or berth limits.",
      },
      {
        code: "NH3",
        lane: "Caribbean → US Gulf & Europe",
        note: "Established ammonia lanes with long-standing COA business.",
      },
    ],
    trades: [
      "Ammonia for fertiliser and industrial users",
      "LPG into draft-restricted terminals",
      "Mediterranean, Black Sea and West Africa distribution",
      "Emerging low-carbon ammonia projects",
    ],
    watchpoints: [
      {
        title: "Ammonia vs. LPG switching",
        body: "Switching cargo grades needs gas-freeing or careful tank preparation. We price the time and cost of cleaning into every switch decision.",
      },
      {
        title: "Energy-transition orderbook",
        body: "Low-carbon ammonia projects are behind a large share of new MGC orders. We follow project timelines because they set long-term period demand.",
      },
      {
        title: "Terminal compatibility",
        body: "Manifold, reliquefaction and shore-tank limits decide which ships work. We check compatibility before an MGC is offered, not after.",
      },
    ],
    charterShape:
      "A mix of spot, 1–3 year time charters and long ammonia COAs. Period rates are usually quoted in $/month.",
    desk: "Istanbul (Elif Kaya) for ammonia and LPG, with London (Léa Martin) on petrochemical parcels.",
    faq: [
      {
        q: "What is the difference between an MGC and an LGC?",
        a: "MGCs are typically 25,000–50,000 cbm, with the core fleet around 35,000–40,000 cbm. Large Gas Carriers (LGCs) sit between 50,000 and 70,000 cbm, just below the VLGC band.",
      },
      {
        q: "Can every MGC carry ammonia?",
        a: "Most modern MGCs are ammonia-certified, but not all. Tank materials, cargo history and terminal requirements need checking ship by ship before fixing an ammonia cargo.",
      },
    ],
  },
  {
    slug: "handysize",
    name: "Handysize",
    longName: "Handysize gas carrier",
    ctaNoun: "a Handysize gas carrier",
    capacity: "15,000–25,000 cbm",
    containment: "Semi-refrigerated or fully refrigerated; some ships are ethylene-capable",
    typicalCargo: "Parcels from 5,000 to 15,000 mt, often multi-grade",
    cargoes: ["Propylene", "Butadiene", "VCM", "Propane", "Butane", "Ammonia"],
    intro:
      "Handysize gas carriers connect the petrochemical world: propylene, butadiene and VCM parcels between crackers, plus LPG and ammonia where a larger ship does not fit. Semi-refrigerated ships can load from pressurised and refrigerated terminals, which makes them flexible and valuable for regional trades.",
    routes: [
      {
        code: "PCG",
        lane: "North-West Europe ⇄ Mediterranean",
        note: "Petrochemical gases between cracker hubs; multi-grade and part-cargo voyages are common.",
      },
      {
        code: "LPG",
        lane: "Black Sea & East Med → Türkiye",
        note: "Regional LPG imports and relets; the Turkish Straits shape scheduling.",
      },
      {
        code: "PCG",
        lane: "US Gulf → Europe / Asia",
        note: "Transatlantic and long-haul petrochemical parcels on semi-refrigerated tonnage.",
      },
    ],
    trades: [
      "Petrochemical gases between cracker and derivative plants",
      "Regional LPG distribution",
      "Ammonia part-cargoes",
      "Ethylene on ethylene-capable ships",
    ],
    watchpoints: [
      {
        title: "Grade segregation",
        body: "Multi-grade voyages need segregated tanks and compatible previous cargoes. We plan stowage and cleaning before the ship is offered.",
      },
      {
        title: "Turkish Straits timing",
        body: "Black Sea voyages carry Bosphorus and Dardanelles transit risk. Our Istanbul desk prices waiting time realistically.",
      },
      {
        title: "Inhibitor and purity specs",
        body: "Butadiene and VCM come with strict inhibitor and oxygen limits. We confirm the ship's experience with the grade before fixing.",
      },
    ],
    charterShape:
      "Spot voyages, part-cargo combinations and 6–24 month time charters with petrochemical producers and traders.",
    desk: "Istanbul (Kerem Yılmaz) for LPG and ammonia, London (Léa Martin) for propylene, butadiene and VCM.",
    faq: [
      {
        q: "What is a semi-refrigerated gas carrier?",
        a: "A semi-refrigerated ship carries gas under moderate pressure and partial cooling, so it can load from both pressurised and refrigerated terminals. Many Handysize ships are semi-refrigerated for this flexibility.",
      },
      {
        q: "Which cargoes do Handysize gas carriers move?",
        a: "LPG and ammonia, plus petrochemical gases such as propylene, butadiene and VCM. Ethylene-capable ships can also carry ethylene at around −104 °C.",
      },
    ],
  },
  {
    slug: "pressurised",
    name: "Pressurised LPG",
    longName: "Pressurised & semi-ref coasters",
    ctaNoun: "a pressurised LPG carrier",
    capacity: "Coasters below 15,000 cbm — most fully pressurised ships are much smaller",
    containment:
      "Fully pressurised cylindrical tanks at ambient temperature, or small semi-refrigerated",
    typicalCargo: "Parcels from 1,500 to 7,000 mt",
    cargoes: ["Propane", "Butane", "Propylene", "Ammonia (where certified)"],
    intro:
      "Small pressurised ships are the last mile of the LPG chain: from import terminals and refineries to regional depots, islands and river ports. In the Mediterranean, Black Sea and Türkiye — one of the world's largest autogas markets — this is where the volume of fixtures lives, and where local knowledge of berths and terminals matters most.",
    routes: [
      {
        code: "MED",
        lane: "Cross-Mediterranean distribution",
        note: "Short voyages between refineries, import terminals and island depots.",
      },
      {
        code: "BLK",
        lane: "Black Sea → Marmara & Aegean",
        note: "Turkish coastal and import trades; Straits transit planning is part of every voyage.",
      },
      {
        code: "NWE",
        lane: "ARA / North Sea coastal",
        note: "Coastal LPG distribution in North-West Europe.",
      },
    ],
    trades: [
      "Coastal distribution from import terminals",
      "Refinery LPG to regional depots",
      "Island and small-port supply",
      "Türkiye domestic and import trades",
    ],
    watchpoints: [
      {
        title: "Terminal and berth limits",
        body: "Length, draft and manifold limits vary terminal by terminal. Our Istanbul desk keeps the details on Turkish and East Med berths current.",
      },
      {
        title: "Short-voyage economics",
        body: "On short voyages, port time and waiting time drive earnings more than the freight rate. We quote with realistic port days.",
      },
      {
        title: "Fleet age and vetting",
        body: "The small pressurised fleet is older than the deep-sea fleet. Vetting status and SIRE/CDI history are checked before every fixture.",
      },
    ],
    charterShape:
      "Spot and relet voyages, contracts of affreightment for regular distribution, and period time charters with importers and distributors.",
    desk: "Istanbul (Kerem Yılmaz) for the Med, Black Sea and Türkiye.",
    faq: [
      {
        q: "What is a fully pressurised LPG carrier?",
        a: "A fully pressurised ship carries LPG in cylindrical tanks under pressure at ambient temperature, so no reliquefaction plant is needed. These ships are small and suit coastal distribution and short-sea trades.",
      },
      {
        q: "Do you fix small LPG ships in the Mediterranean and Black Sea?",
        a: "Yes. Small pressurised and semi-refrigerated LPG in the Mediterranean, Black Sea and Türkiye is a core focus of our Istanbul LPG desk.",
      },
    ],
  },
];

export function getLpgClassBySlug(slug: string): LpgClassData | undefined {
  return LPG_CLASSES.find((c) => c.slug === slug);
}

/**
 * Liquid density at atmospheric boiling point (t/m³). Used by the cbm ↔ mt
 * converter on /lpg. Indicative — always use the terminal's figures.
 */
export const LPG_CARGO_DENSITY = [
  { key: "propane", label: "Propane", density: 0.582 },
  { key: "butane", label: "n-Butane", density: 0.601 },
  { key: "ammonia", label: "Ammonia", density: 0.682 },
  { key: "propylene", label: "Propylene", density: 0.612 },
  { key: "butadiene", label: "Butadiene", density: 0.65 },
  { key: "vcm", label: "VCM", density: 0.969 },
] as const;

export type LpgCargoKey = (typeof LPG_CARGO_DENSITY)[number]["key"];
