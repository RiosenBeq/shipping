import type { OfficeCity } from "@/lib/schemas";

export type OfficeDetail = {
  /** Page title (before the "— LEVANTER" suffix). */
  title: string;
  /** Meta description, ≤155 characters. */
  description: string;
  h1: string;
  intro: string;
  services: string[];
  /** What the desk concentrates on day to day. */
  focus: string;
  team: { name: string; role: string }[];
  whyHere: string;
  founded: string;
};

export const OFFICE_DETAILS: Record<OfficeCity, OfficeDetail> = {
  istanbul: {
    description:
      "LEVANTER's Istanbul headquarters on the Bosphorus: crude tanker, Black Sea / CPC and chemicals desks, open 07:00–21:00 daily. Direct line and address.",
    title: "Istanbul Shipbrokers — Bosphorus Headquarters",
    h1: "LEVANTER Istanbul — shipbroking headquarters on the Bosphorus",
    intro:
      "LEVANTER's Istanbul headquarters sits on the Bosphorus, one half of the Turkish Straits that carried about 3.7 million barrels of oil a day in the first half of 2025 (US EIA). The office runs the crude tanker desk, the Black Sea / CPC corridor and the chemicals desk, with Suezmax and Aframax business at the core of the day-to-day workflow.",
    services: [
      "Crude tanker chartering — Suezmax (TD20, TD6), Aframax (TD7, TD19, Black Sea–Med), VLCC support",
      "Chemicals desk — IMO 2/3, stainless and coated parcels",
      "S&P advisory for tanker and bulker tonnage",
      "Compliance and screening (OFAC, OFSI, EU consolidated lists, G7 price cap)",
    ],
    focus:
      "Suezmax and Aframax business out of the Black Sea and CPC: spot voyages, COA programmes for CPC offtakers, and 3–12 month time charters for Mediterranean refiners. Turkish Straits transit planning — waiting times, daylight restrictions and per-net-ton dues — is built into every Black Sea estimate.",
    team: [
      { name: "Mehmet Aydın", role: "Senior Crude Broker · VLCC / Suezmax" },
      { name: "Anna Kowalski", role: "Head of Chemicals" },
      { name: "Elif Kaya", role: "Aframax Broker · Black Sea" },
      { name: "Tunç Demir", role: "S&P Broker · Bulkers" },
      { name: "Ahmed El-Sayed", role: "Crude Broker · Med" },
    ],
    whyHere:
      "The Bosphorus is the desk's working environment, not a backdrop. Black Sea crude and product exports — CPC Blend among them — transit the strait within sight of the office, and around 40,000 vessels passed through it in 2025 (Türkiye's Directorate General of Maritime Affairs). Being here means first-hand knowledge of transit queues, pilotage and the cost of delay on Black Sea voyages.",
    founded: "2024 — set up around the Bosphorus / Black Sea corridor.",
  },
  london: {
    description:
      "LEVANTER London: Suezmax and clean tanker chartering, dry bulk and S&P from the City of London, 06:30–19:30 on weekdays. Direct line and address.",
    title: "London Shipbroking Desk — Atlantic & S&P",
    h1: "LEVANTER London — Atlantic Basin chartering and S&P",
    intro:
      "The London desk runs LEVANTER's Atlantic Basin and Sale & Purchase work. From the City of London it covers Suezmax and clean-products tanker chartering across WAF, UKC and the US Gulf, the dry bulk desk, and S&P.",
    services: [
      "Suezmax and clean tanker chartering — TD20 (WAF–UKC), TD6 (Black Sea–Med), TC2 (CONT–USAC)",
      "Dry bulk chartering — Capesize, Panamax / Kamsarmax, Supramax / Ultramax",
      "Sale & Purchase advisory — newbuilding, second-hand, recycling",
      "Atlantic Basin coverage — WAF programmes, UKC refiners, North Sea operators",
    ],
    focus:
      "Atlantic Basin Suezmax business, MR clean-product flows on TC2 and TC14, dry bulk, and the S&P desk — working on standard BIMCO and industry charter-party and sale forms.",
    team: [
      { name: "Demetrios Pavlou", role: "Director, Clean Tankers" },
      { name: "Søren Hansen", role: "Suezmax Broker" },
      { name: "James Hutchins", role: "Senior Dry Bulk Broker" },
      { name: "Marta Costa", role: "S&P Broker — Tankers" },
      { name: "Léa Martin", role: "Specialised & Chemicals" },
    ],
    whyHere:
      "London remains a centre of gravity for Atlantic Basin chartering, ship finance and S&P. Its time zone overlaps with both the Americas and Asia, which makes it the natural anchor for the Atlantic and S&P desks.",
    founded: "2024 — opened alongside the Istanbul headquarters.",
  },
  singapore: {
    description:
      "LEVANTER Singapore: VLCC, MR and dry bulk chartering East of Suez from Marina Boulevard, 07:00–20:00 on weekdays. Direct line and address.",
    title: "Singapore Shipbroking Desk — Asia Tankers & Bulk",
    h1: "LEVANTER Singapore — Asia tanker and dry bulk desk",
    intro:
      "The Singapore desk runs LEVANTER's Asia coverage — VLCC, MR and dry bulk across MEG–East, the Pacific, Indonesia and the East Coast India trades — in the same time zone as the major Asian refiners, charterers and bunker suppliers.",
    services: [
      "VLCC chartering — TD3C (MEG–China), TD15 (WAF–East), TD22 (USG–China)",
      "MR clean-products chartering — intra-Asia and MEG–East Africa",
      "Dry bulk chartering — Panamax / Kamsarmax (Pacific rounds), Supramax / Ultramax (S. China–Indonesia–ECI)",
      "Far East coverage — Chinese, Japanese, Korean and Indian charterers",
    ],
    focus:
      "VLCC business East of Suez with Chinese and Indian refiners and Far East trading houses, plus intra-Asia MR and Pacific dry bulk. Singapore is also the world's largest bunkering port, so bunker planning sits next to the desk.",
    team: [
      { name: "Wei Zhang", role: "Asia Tanker Desk Lead" },
      { name: "Hiroshi Tanaka", role: "VLCC Broker — East" },
      { name: "Pranav Shah", role: "Panamax Broker" },
    ],
    whyHere:
      "Singapore is the operational centre of the East-of-Suez tanker and bulk markets. Bunker availability, Strait of Malacca proximity and the overlap with Tokyo, Shanghai and Mumbai business hours make it the natural Asian hub.",
    founded: "2024 — opened to anchor the Asia tanker book.",
  },
  houston: {
    description:
      "LEVANTER Houston: US Gulf crude exports and clean products chartering from downtown Houston, 06:00–18:00 on weekdays. Direct line and address.",
    title: "Houston Shipbroking Desk — US Gulf Tankers",
    h1: "LEVANTER Houston — US Gulf crude and clean tankers",
    intro:
      "The Houston desk runs LEVANTER's US Gulf coverage — crude exports, the clean-products trade out of the Gulf Coast refining system, and the Atlantic Basin relays that connect them.",
    services: [
      "USG crude chartering — Aframax, Suezmax and VLCC out of the US Gulf, including LOOP and Corpus Christi",
      "MR clean-products chartering — TC14 (USG–UKC) and USG–Latin America",
      "Atlantic Basin coverage — Caribbean trans-shipment, USAC arbitrage",
      "Charter desk for US crude exports",
    ],
    focus:
      "USG clean-product fixtures and US crude exports. The desk prices Aframax and MR business alongside long-haul VLCC USG–China voyages.",
    team: [{ name: "Olivia Bennett", role: "Clean Products — Atlantic" }],
    whyHere:
      "The US Gulf is the swing exporter for both crude and clean products. Houston keeps the desk close to the refiner, blender and exporter community, and its time zone bridges the European close and the Asian open.",
    founded: "2024 — opened to anchor US Gulf coverage.",
  },
};
