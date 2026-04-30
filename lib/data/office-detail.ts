import type { OfficeCity } from "@/lib/schemas";

export type OfficeDetail = {
  intro: string;
  services: string[];
  whatWeFix: string;
  team: { name: string; role: string }[];
  whyHere: string;
  founded: string;
};

export const OFFICE_DETAILS: Record<OfficeCity, OfficeDetail> = {
  ist: {
    intro:
      "LEVANTER's Istanbul office sits on the Bosphorus — the strait through which 3% of the world's seaborne oil flow passes daily. The headquarters runs the crude tanker desk, the Black Sea / CPC corridor, and the chemicals desk, with Suezmax and Aframax fixtures dominating the day-to-day workflow.",
    services: [
      "Crude tanker chartering — Suezmax (TD20, TD6), Aframax (TD7, TD19, BLK-MED), VLCC support",
      "Chemicals desk — IMO 2/3, stainless and coated parcels",
      "S&P advisory for tanker and bulker tonnage",
      "Compliance and screening (OFAC, OFSI, EU consolidated, G7 cap)",
    ],
    whatWeFix:
      "Roughly 38% of our YTD Suezmax fixtures touch CPC or Novorossiysk; the Bosphorus angle is structural. The desk runs spot voyages, COA programmes for CPC offtakers, and 3–12 month time charters for European refiners.",
    team: [
      { name: "Mehmet Aydın", role: "Senior Crude Broker · VLCC / Suezmax" },
      { name: "Anna Kowalski", role: "Head of Chemicals" },
      { name: "Elif Kaya", role: "Aframax Broker · Black Sea" },
      { name: "Tunç Demir", role: "S&P Broker · Bulkers" },
      { name: "Ahmed El-Sayed", role: "Crude Broker · Med" },
    ],
    whyHere:
      "The Bosphorus is not a marketing prop — it's the desk's edge. Every CPC Blend cargo, every Russian Urals barrel heading west, every Suezmax bound for Augusta or Trieste passes within sight of the office. We charter where the trade actually moves.",
    founded: "2024 — purpose-built around the Bosphorus / Black Sea corridor.",
  },
  lon: {
    intro:
      "The London desk runs LEVANTER's Atlantic Basin and Sale & Purchase work. From St Mary Axe in the City of London, it covers Suezmax and clean-products tanker chartering across WAF, UKC, and the US Gulf, plus the dry bulk desk and the bulk of S&P transactions.",
    services: [
      "Suezmax and clean tanker chartering — TD20 (WAF-UKC), TD6 (BLK-MED), TC2 (CONT-USAC)",
      "Dry bulk chartering — Capesize, Panamax, Supramax",
      "Sale & Purchase advisory — newbuilding, second-hand, demolition",
      "Atlantic Basin coverage — WAF programmes, UKC refiner relationships, North Sea operators",
    ],
    whatWeFix:
      "Atlantic basin Suezmax fixtures, MR clean-product flows on TC2 and TC14, and most of LEVANTER's S&P volume. The London team works alongside Baltic Exchange member firms, BIMCO clauses, and the standard charter party suite.",
    team: [
      { name: "Demetrios Pavlou", role: "Director, Clean Tankers" },
      { name: "Søren Hansen", role: "Suezmax Broker" },
      { name: "James Hutchins", role: "Senior Dry Bulk Broker" },
      { name: "Marta Costa", role: "S&P Broker — Tankers" },
      { name: "Léa Martin", role: "Specialised & Chemicals" },
    ],
    whyHere:
      "London remains the gravitational centre of the Atlantic basin tanker market and global S&P. The Baltic Exchange membership pool, the City's banking infrastructure, and the time-zone overlap with both NYC and Asia make it the natural anchor for the Atlantic and S&P desks.",
    founded: "2024 — opened alongside the Istanbul HQ.",
  },
  sg: {
    intro:
      "The Singapore desk runs LEVANTER's Asia coverage — VLCC, MR, and dry bulk across MEG-East, NoPac, Indonesia, and the East Coast India trades. Marina Boulevard puts the team in the same time zone as the major Asian refiners, charterers, and bunker hubs.",
    services: [
      "VLCC chartering — TD3C (MEG-CHN), TD15 (WAF-EAST), TD22 (USG-CHN)",
      "MR clean-products chartering — intra-Asia and MEG → East Africa",
      "Dry bulk chartering — Panamax (NoPac, ECSA), Supramax (Indo → ECI)",
      "Far East coverage — Chinese state buyers, Japanese and Korean charterers, Indian refiners",
    ],
    whatWeFix:
      "The bulk of LEVANTER's VLCC fixtures pass through this desk. Chinese state buyers (Sinopec, CNOOC, Unipec), Indian state refiners, and the Far East trading houses are the primary counterparties. Singapore is also the global bunker capital — proximity matters.",
    team: [
      { name: "Wei Zhang", role: "Asia Tanker Desk Lead" },
      { name: "Hiroshi Tanaka", role: "VLCC Broker — East" },
      { name: "Pranav Shah", role: "Panamax Broker" },
    ],
    whyHere:
      "Singapore is the operational centre of the East-of-Suez tanker and bulk markets. Bunker availability, Strait of Malacca proximity, and the time-zone overlap with Tokyo, Shanghai, and Mumbai make it the natural Asian hub.",
    founded: "2024 — opened to anchor the Asia tanker book.",
  },
  hou: {
    intro:
      "The Houston desk runs LEVANTER's US Gulf coverage. Travis Street in downtown Houston puts the team in the heart of the US energy capital, working with US refiner-blender-exporter charter pools and the Atlantic Basin clean-products trade.",
    services: [
      "USG crude chartering — Aframax, Suezmax, VLCC out of LOOP and STR",
      "MR clean-products chartering — TC14 (USG-UKC), TC17 (MEG-EAFR)",
      "Atlantic Basin coverage — Caribbean trans-shipment, USAC arbs",
      "Charter desk for US shale-driven crude exports",
    ],
    whatWeFix:
      "USG-driven clean-product fixtures (TC14, TC17) and rising US crude exports out of LOOP. Refiner-blender-exporter pool work; the desk prices Aframax and MR work alongside the long-haul VLCC USG → China relays.",
    team: [{ name: "Olivia Bennett", role: "Clean Products — Atlantic" }],
    whyHere:
      "US Gulf is the swing exporter for both crude and clean products. Houston puts the desk in the same building (figuratively) as the refiner-blender-exporter community, and the time-zone bridges the EU close and the Asia open.",
    founded: "2024 — opened to anchor US Gulf coverage.",
  },
};
