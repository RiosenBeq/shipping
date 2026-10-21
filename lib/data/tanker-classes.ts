/**
 * Per-class deep-dive data for /tankers/[class]. Independent of the
 * voyage-estimator's internal vessel data so we can keep marketing
 * detail separate from calculator inputs.
 */

import type { VesselClassFilter } from "@/lib/schemas";

export type TankerClassData = {
  slug: string;
  name: string;
  shortName: string;
  longName: string;
  /** Page title (before the "— LEVANTER" suffix); keep it under ~50 characters. */
  title: string;
  /** Meta description, ≤155 characters. */
  description: string;
  h1: string;
  /** Broker-directory class used to list the brokers who cover this class. */
  brokerClass?: VesselClassFilter;
  /** Slugs of research notes about this class. */
  related: string[];
  family: "crude" | "clean";
  dwtRange: string;
  cargoCapacity: string;
  loa: string;
  beam: string;
  draft: string;
  speed: string;
  consumption: string;
  intro: string;
  routes: { code: string; lane: string; note: string }[];
  marketsServed: string[];
  keyTrends: { title: string; body: string }[];
  charterShape: string;
  desk: string;
};

export const TANKER_CLASSES: TankerClassData[] = [
  {
    slug: "vlcc",
    description:
      "VLCC chartering for 270–320k dwt crude carriers: TD3C MEG–China, TD15 WAF–China and TD22 USG–China. Spot, time charter and COA with the LEVANTER crude desk.",
    title: "VLCC Chartering — Very Large Crude Carrier",
    h1: "VLCC chartering — the Very Large Crude Carrier",
    brokerClass: "VLCC",
    related: [
      "td3c-demystified-meg-to-china-end-to-end",
      "waf-east-the-slow-re-rating",
      "vlcc-newbuild-slot-pricing-the-slow-squeeze",
    ],
    name: "VLCC",
    shortName: "VLCC",
    longName: "Very Large Crude Carrier",
    family: "crude",
    dwtRange: "270,000 – 320,000 dwt",
    cargoCapacity: "~2 million bbl crude",
    loa: "330 m",
    beam: "60 m",
    draft: "22.5 m",
    speed: "13.5 kn (laden) / 14.0 kn (ballast)",
    consumption: "70–80 mt/d VLSFO at sea, ~5 mt/d in port",
    intro:
      "The VLCC is the workhorse of the long-haul crude trade, and the Middle East Gulf to China voyage (TD3C) is its benchmark route. Newbuildings increasingly come scrubber-fitted or dual-fuel ready (LNG or methanol), so specification and vetting history matter as much as age when a VLCC is fixed.",
    routes: [
      {
        code: "TD3C",
        lane: "MEG → China",
        note: "The single most-fixed long-haul tanker route. ~6,300 nm, 19–21 days laden via Strait of Malacca.",
      },
      {
        code: "TD15",
        lane: "WAF → East",
        note: "West Africa to China / India. Ton-mile heavy; ~9,800 nm via the Cape.",
      },
      {
        code: "TD22",
        lane: "USG → China",
        note: "US Gulf to China crude. ~11,800 nm via the Cape; rose with US shale exports.",
      },
    ],
    marketsServed: [
      "Middle East Gulf producers' term and spot programmes",
      "Indian refiners",
      "Chinese refiners and state traders",
      "Atlantic Basin majors and trading houses",
    ],
    keyTrends: [
      {
        title: "Newbuilding capacity squeeze",
        body: "Korean yards (HHI, SHI, HSHI) are largely committed to 2028 for VLCC slots. Chinese yards have more 2027 availability but pricing has caught up.",
      },
      {
        title: "Second-hand parity argument",
        body: "5-year-old VLCC values are pushing toward replacement cost as the orderbook stays tight and scrapping near multi-year lows.",
      },
      {
        title: "Eastward arb sensitivity",
        body: "VLCC ballast strategy now blends round-trip TCE rather than single-leg; on the desk's read, TD15 has been running at roughly 70–80% of TD3C laden TCE.",
      },
    ],
    charterShape:
      "Spot voyages dominate. Time charters of 6–24 months and multi-year COAs are common with state buyers and trading houses. Co-loading (two charterers splitting one cargo) is routine for Chinese state buyers.",
    desk: "MEG, WAF, USG. Lead brokers in Singapore (Wei Zhang), Houston, and Istanbul.",
  },
  {
    slug: "suezmax",
    description:
      "Suezmax chartering for 130–160k dwt crude tankers: TD20 WAF–UKC, TD6 Black Sea–Med (via the Bosphorus) and TD23 MEG–Med. Spot, period and CPC COAs.",
    title: "Suezmax Chartering — 130–160k dwt Crude Tankers",
    h1: "Suezmax chartering — the Suez Canal-max crude tanker",
    brokerClass: "Suezmax",
    related: [
      "suezmax-tightness-sustains-as-cpc-volumes-rebound",
      "g7-price-cap-attestation-the-desk-level-workflow",
    ],
    name: "Suezmax",
    shortName: "Suezmax",
    longName: "Suez Canal-max crude tanker",
    family: "crude",
    dwtRange: "130,000 – 160,000 dwt",
    cargoCapacity: "~1 million bbl crude",
    loa: "275 m",
    beam: "48 m",
    draft: "≈17 m (laden)",
    speed: "14 kn (laden) / 14.5 kn (ballast)",
    consumption: "40–48 mt/d VLSFO at sea",
    intro:
      "Traditionally the largest tanker that can transit the Suez Canal fully laden — the practical light-crude workhorse. Suezmax fixtures cluster around West Africa, the Black Sea / CPC and the Mediterranean, with Kazakh CPC Blend moving west through the Turkish Straits and long-haul WAF → UKC business alongside.",
    routes: [
      {
        code: "TD20",
        lane: "WAF → UKC",
        note: "West Africa to UK Continent. ~5,200 nm; the benchmark Atlantic basin Suezmax route.",
      },
      {
        code: "TD6",
        lane: "Black Sea → Med",
        note: "Black Sea (CPC / Novorossiysk) to Augusta or Trieste. ~2,400 nm via the Bosphorus and Dardanelles; Turkish Straits waiting time and dues are part of the estimate.",
      },
      {
        code: "TD23",
        lane: "MEG → Med",
        note: "Middle East Gulf to Mediterranean via Suez. ~5,800 nm; growing share of West-of-Suez supply.",
      },
    ],
    marketsServed: [
      "Mediterranean and European refiners",
      "Integrated majors and trading houses",
      "CPC offtakers",
      "WAF programme charterers",
    ],
    keyTrends: [
      {
        title: "Persistent Atlantic basin tightness",
        body: "CPC programme rebound + thin Atlantic basin tonnage = WS 95–105 base case for TD20 through Q2 2026 on the desk's read.",
      },
      {
        title: "CPC volume gravity",
        body: "CPC Blend loadings near Novorossiysk are a core Suezmax and Aframax cargo stream, so Turkish Straits transit time and per-net-ton dues feed straight into TD6 economics. The Bosphorus angle is structural, not seasonal.",
      },
      {
        title: "Compliance overhead",
        body: "G7 price cap attestation, EU sanctions screening, and OFAC compliance are now standard pre-fixture workflow on every CPC/Russian-touching cargo.",
      },
    ],
    charterShape:
      "Spot voyages, COAs (especially CPC programmes), and 6–12 month time charters. Demurrage rates are fixed per charter party; indicatively $35–45k/day in recent markets.",
    desk: "Istanbul (Mehmet Aydın, Elif Kaya, Ahmed El-Sayed), London (Søren Hansen, Marta Costa).",
  },
  {
    slug: "aframax",
    description:
      "Aframax and LR2 chartering for 80–115k dwt tankers: TD7 North Sea, TD8 Kuwait–Singapore and TD19 Cross-Med. Spot and short time charters.",
    title: "Aframax & LR2 Chartering — 80–115k dwt Tankers",
    h1: "Aframax / LR2 chartering — short-haul crude and coated tonnage",
    brokerClass: "Aframax",
    related: [
      "td7-nsea-cont-short-haul-fast-turn-thin-margin",
      "aframax-5-year-old-market-14-deals-3-themes",
    ],
    name: "Aframax / LR2",
    shortName: "Aframax",
    longName: "Aframax / Long Range 2",
    family: "crude",
    dwtRange: "80,000 – 115,000 dwt",
    cargoCapacity: "~700,000 bbl",
    loa: "250 m",
    beam: "44 m",
    draft: "14.5 m",
    speed: "14.5 kn (laden)",
    consumption: "32–36 mt/d VLSFO at sea",
    intro:
      "The Aframax is the short-haul, fast-turn workhorse — Black Sea to Med, North Sea to Continent, Caribbean coastal. The LR2 is the coated sister, switchable into clean products. Margin on Aframax fixtures lives in port discipline and weather window selection, not headline Worldscale.",
    routes: [
      {
        code: "TD7",
        lane: "NSEA → CONT",
        note: "North Sea to Continent. Short round trips, so port-time discipline matters.",
      },
      { code: "TD8", lane: "Kuwait → Singapore", note: "Aframax MEG → SE Asia; ~4,500 nm." },
      { code: "TD19", lane: "C. Med → Med", note: "Cross-Med Aframax; CPC, Black Sea relay." },
    ],
    marketsServed: [
      "European refiners",
      "North Sea integrated majors",
      "Mediterranean blenders",
      "Caribbean-USEC arbitrage traders",
    ],
    keyTrends: [
      {
        title: "Vetting drives second-hand values",
        body: "In the 5-year-old Aframax market, vetting-clean tonnage typically commands a premium over equivalent ships that need work — build year alone no longer sets the price.",
      },
      {
        title: "LR2 optionality compressed",
        body: "Coated Aframax (LR2-capable) is trading in line with regular Aframax — unusually thin premium for the clean optionality.",
      },
      {
        title: "Black Sea relay weight",
        body: "Aframax remains the dominant short-haul Black Sea / Med tanker; CPC programme tightness keeps utilisation high.",
      },
    ],
    charterShape:
      "Spot voyages dominate; time charters short (3–6 months) common. Coated Aframax sometimes traded clean on a 6-month CP for switching optionality.",
    desk: "Istanbul (Elif Kaya), London (Søren Hansen).",
  },
  {
    slug: "lr1",
    description:
      "LR1 tanker chartering for 55–80k dwt clean products ships: naphtha, gasoil and jet on TC5 MEG–Japan and TC8 MEG–UKC. Spot and 6–12 month charters.",
    title: "LR1 Tanker Chartering — 55–80k dwt Clean Products",
    h1: "LR1 chartering — Long Range 1 clean products tankers",
    related: ["eu-ets-phase-2-cargo-allocation-who-actually-pays"],
    name: "LR1",
    shortName: "LR1",
    longName: "Long Range 1 (clean products)",
    family: "clean",
    dwtRange: "55,000 – 80,000 dwt",
    cargoCapacity: "Clean products (gasoil, jet, naphtha)",
    loa: "228 m",
    beam: "32 m",
    draft: "14 m",
    speed: "14 kn (laden)",
    consumption: "26–30 mt/d VLSFO at sea",
    intro:
      "The LR1 sits between the LR2 and MR — bigger than the products workhorse but more flexible than the long-range coated Aframax. The clean product trade flows it dominates run MEG to East Africa, MEG to Europe, and intra-Asia.",
    routes: [
      { code: "TC5", lane: "MEG → Japan", note: "Naphtha and gasoil MEG to Far East." },
      { code: "TC8", lane: "MEG → UK Continent", note: "MEG → UKC clean products via Suez." },
    ],
    marketsServed: ["Asian refiners", "Indian product traders", "Mediterranean blenders"],
    keyTrends: [
      {
        title: "Eastward clean-product flow",
        body: "MEG → East Africa and MEG → India clean trades are the LR1 bread and butter; tightness here pulls clean-product TCE up across the curve.",
      },
      {
        title: "Class-switch optionality",
        body: "LR1 sometimes trades dirty (crude) on opportunistic basis — typically CPP economics need to weaken sharply for the switch.",
      },
    ],
    charterShape:
      "Spot voyages and 6–12 month time charters. Less common in COA programmes than VLCC or Suezmax.",
    desk: "Singapore (Wei Zhang), London (Demetrios Pavlou).",
  },
  {
    slug: "mr",
    description:
      "MR tanker chartering for 40–55k dwt clean products ships on TC2, TC14 and TC17 — the Atlantic and US Gulf workhorse. Spot voyages and 1–3 year time charters.",
    title: "MR Tanker Chartering — 40–55k dwt Clean Products",
    h1: "MR chartering — Medium Range clean products tankers",
    brokerClass: "MR",
    related: ["eu-ets-phase-2-cargo-allocation-who-actually-pays"],
    name: "MR",
    shortName: "MR",
    longName: "Medium Range (clean products)",
    family: "clean",
    dwtRange: "40,000 – 55,000 dwt",
    cargoCapacity: "Clean products (gasoline, diesel, jet, naphtha)",
    loa: "183 m",
    beam: "32 m",
    draft: "13 m",
    speed: "14 kn (laden)",
    consumption: "22–26 mt/d VLSFO at sea",
    intro:
      "The dominant clean-products class on the Atlantic and US Gulf trades. Almost every refined product moving CONT → USAC, USG → UKC, or USG → ECSA is on an MR. Three-way trading dynamics — Atlantic basin vs Asia vs MEG — drive MR TCE.",
    routes: [
      {
        code: "TC2",
        lane: "CONT → USAC",
        note: "Continental Europe to US East Coast. ~3,200 nm; the benchmark MR Atlantic route.",
      },
      {
        code: "TC14",
        lane: "USG → UKC",
        note: "US Gulf to UK Continent. ~4,800 nm; reverse Atlantic flow.",
      },
      {
        code: "TC17",
        lane: "MEG → East Africa",
        note: "MR clean products to East African coastal refiners.",
      },
    ],
    marketsServed: [
      "Atlantic basin product traders",
      "Caribbean refiners",
      "European integrated majors",
      "US blender / exporter pool",
    ],
    keyTrends: [
      {
        title: "USG export elasticity",
        body: "US Gulf clean-product exports remain the dominant supply force on TC14 / TC17 economics; refinery utilisation and turnaround timing move the curve.",
      },
      {
        title: "Atlantic-Pacific arb",
        body: "When the Atlantic-Pacific clean-product arb opens, MRs reposition — TCE moves materially on relatively small absolute fleet shifts.",
      },
    ],
    charterShape:
      "Spot voyages and 1–3 year time charters. COA programmes common with major US refiners and Atlantic basin traders.",
    desk: "Houston (Olivia Bennett), Singapore (Wei Zhang), London (Demetrios Pavlou).",
  },
];

export function getTankerClassBySlug(slug: string): TankerClassData | undefined {
  return TANKER_CLASSES.find((t) => t.slug === slug);
}
