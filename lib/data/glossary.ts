/**
 * Chartering glossary — extended version of the Reference tab list,
 * grouped by topic for the dedicated /glossary page.
 */

export type GlossaryTerm = {
  term: string;
  def: string;
  group: "freight" | "vessels" | "regulatory" | "ports" | "commercial";
};

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // Freight & rates
  {
    group: "freight",
    term: "WS (Worldscale)",
    def: "Standard freight index — 100 = the published 'flat rate' (USD/mt) for that lane. WS 75 means 75% of flat. Recalibrated annually each January.",
  },
  {
    group: "freight",
    term: "Flat rate",
    def: "The base USD/mt rate against which Worldscale percentages are applied. Set lane-by-lane and updated yearly to reflect current vessel costs and bunker prices.",
  },
  {
    group: "freight",
    term: "TCE (Time-Charter Equivalent)",
    def: "Daily earnings of a voyage on a time-charter basis. (Voyage revenue − voyage costs) ÷ total voyage days. The standard apples-to-apples metric across spot and TC.",
  },
  {
    group: "freight",
    term: "Lump sum",
    def: "A fixed total freight figure agreed upfront, regardless of the cargo quantity actually loaded. Common on smaller parcels and chemical lifts.",
  },
  {
    group: "freight",
    term: "Hi-5 spread",
    def: "VLSFO − HSFO price differential. Wider spread improves scrubber payback economics; narrower spread weakens the case for retrofits.",
  },

  // Vessels & classes
  {
    group: "vessels",
    term: "VLCC",
    def: "Very Large Crude Carrier. 270–320,000 dwt; carries ~2 m bbl of crude. Workhorse for MEG → East and WAF → East long-hauls.",
  },
  {
    group: "vessels",
    term: "Suezmax",
    def: "Largest tanker that can transit the Suez Canal fully laden. 130–160,000 dwt; ~1 m bbl of crude. Common on TD20 (WAF → UKC) and TD6 (Black Sea → Med).",
  },
  {
    group: "vessels",
    term: "Aframax / LR2",
    def: "Average Freight Rate Assessment-class. 80–115,000 dwt; ~700 k bbl. LR2 is the Long Range 2 sister, coated for clean products.",
  },
  {
    group: "vessels",
    term: "MR (Medium Range)",
    def: "Clean-products workhorse. 40–55,000 dwt. The dominant class on TC2 (CONT → USAC) and TC14 (USG → UKC).",
  },
  {
    group: "vessels",
    term: "Capesize",
    def: "180,000 dwt+ bulker, too large for the old Panama locks (hence 'Cape' route via the Cape of Good Hope). Carries iron ore and coal on long-haul.",
  },
  {
    group: "vessels",
    term: "Panamax / Kamsarmax",
    def: "75–85,000 dwt bulker. Panamax sized for old Panama locks (beam ≤ 32.31 m). Kamsarmax extends LOA to 229 m for Port Kamsar bauxite trade.",
  },
  {
    group: "vessels",
    term: "Supramax / Ultramax",
    def: "55–65,000 dwt geared bulkers. The flexible workhorse for grains, fertilisers, and minor bulks; 4 × 30 t cranes typical.",
  },

  // Bunkers
  {
    group: "vessels",
    term: "VLSFO",
    def: "Very Low Sulphur Fuel Oil — sulphur ≤ 0.5%. The post-IMO 2020 default for non-scrubber vessels.",
  },
  {
    group: "vessels",
    term: "HSFO",
    def: "High Sulphur Fuel Oil — sulphur 3.5%. Burned only by scrubber-fitted vessels in compliance.",
  },
  {
    group: "vessels",
    term: "MGO / LSMGO",
    def: "Marine Gas Oil and Low-Sulphur MGO. Distillate fuels used in port (auxiliary engines) and within Emission Control Areas.",
  },

  // Regulatory
  {
    group: "regulatory",
    term: "EU ETS",
    def: "EU Emissions Trading System. Vessels surrender EUAs (1 per t CO₂) for emissions on EEA-touching voyages. Phase-in: 40% (2024) → 70% (2025) → 100% (2026). CH₄ and N₂O included from 2026.",
  },
  {
    group: "regulatory",
    term: "EUA (EU Allowance)",
    def: "A tradable permit to emit one tonne of CO₂. Owners or charterers procure EUAs and surrender them annually; pricing tracked on EEX.",
  },
  {
    group: "regulatory",
    term: "CII (Carbon Intensity Indicator)",
    def: "IMO operational efficiency metric, rated A–E. Vessels rated D for 3 consecutive years or E in any year must submit a corrective action plan.",
  },
  {
    group: "regulatory",
    term: "EEXI",
    def: "Energy Efficiency Existing Ship Index. One-time technical certification of in-service vessels' design efficiency. Forces engine power limits on older / less-efficient tonnage.",
  },
  {
    group: "regulatory",
    term: "G7 price cap",
    def: "Coordinated G7 cap on Russian-origin crude (since Dec 2022) and petroleum products (since Feb 2023). Service providers (insurers, brokers) may only support transactions priced at or below the cap.",
  },
  {
    group: "regulatory",
    term: "OFAC / OFSI",
    def: "Office of Foreign Assets Control (US) and Office of Financial Sanctions Implementation (UK). Counterparty and vessel screening against their sanctions lists is standard practice on every fixture.",
  },
  {
    group: "regulatory",
    term: "HKC (Hong Kong Convention)",
    def: "International convention on safe and environmentally sound recycling of ships. Came into force June 2025; 'HKC-aligned' recyclers are preferred for green-recycling clauses.",
  },

  // Ports & chokepoints
  {
    group: "ports",
    term: "DA (Disbursement Account)",
    def: "Itemised port costs for one call: dues, pilotage, towage, mooring, agency, statutory fees. Typically $60k–$100k for a Suezmax.",
  },
  {
    group: "ports",
    term: "Suez Canal",
    def: "Egypt. Laden Suezmax dues ≈ $525k; ballast ≈ $365k. Average transit 14–16 hours. The single biggest canal expense in tanker chartering.",
  },
  {
    group: "ports",
    term: "Panama Canal (Neopanamax)",
    def: "Laden Suezmax-equivalent dues ≈ $485k; ballast ≈ $320k. Transit 8–10 hours. Slot booking system; congestion pricing during dry seasons.",
  },
  {
    group: "ports",
    term: "Bosphorus + Dardanelles",
    def: "Türkiye. Tonnage-based dues ≈ $28.5k flat (laden or ballast). Transit 10–14 hours. Critical for Black Sea exports — CPC, Russian Urals, Kazakh crude.",
  },
  {
    group: "ports",
    term: "Strait of Malacca",
    def: "Singapore / Indonesia / Malaysia. No transit fee; ~12 hours through. Carries ~1/4 of seaborne trade and most MEG → East crude.",
  },

  // Commercial / contract
  {
    group: "commercial",
    term: "COA (Contract of Affreightment)",
    def: "Multi-shipment contract committing the owner to lift a series of cargoes at agreed terms over a defined period. Common in steel-mill iron ore programmes and refiner crude flows.",
  },
  {
    group: "commercial",
    term: "Time charter (TC)",
    def: "Charterer takes commercial control of the vessel for a fixed period (3 / 6 / 12 / 24 months) and pays a daily hire. Owner remains responsible for crew, maintenance, and bunker is typically charterer's account.",
  },
  {
    group: "commercial",
    term: "Voyage charter (Spot)",
    def: "Single-cargo contract from load to discharge. Owner controls the vessel and pays voyage costs; freight is per ton.",
  },
  {
    group: "commercial",
    term: "Demurrage",
    def: "Daily compensation paid by the charterer to the owner for time used at port beyond the agreed laytime. Typical Suezmax demurrage: $35–45k/day.",
  },
  {
    group: "commercial",
    term: "Laytime",
    def: "The time allowed for loading and discharge under the charter party, free of demurrage. Usually expressed in running hours or running days.",
  },
  {
    group: "commercial",
    term: "Laycan",
    def: "Window during which the vessel must arrive and tender notice of readiness. Outside the window, the charterer can reject the vessel. Typically 5–7 days.",
  },
  {
    group: "commercial",
    term: "Laden / Ballast",
    def: "Loaded with cargo (laden) / sailing empty between loads (ballast). Ballast legs eat into TCE because they earn no freight.",
  },
  {
    group: "commercial",
    term: "MOA (Memorandum of Agreement)",
    def: "Standard sale & purchase contract for ships. Norwegian Saleform 2012 is the dominant template; sets out price, deposit, inspection, delivery, and class transfer.",
  },
  {
    group: "commercial",
    term: "BIMCO",
    def: "Baltic and International Maritime Council. Publishes industry-standard charter party forms (e.g. SHELLVOY, ASBATANKVOY) and clauses (e.g. ETSA for EU ETS allocation).",
  },
  {
    group: "commercial",
    term: "TD / TC lanes",
    def: "Worldscale lane codes. TD = Dirty (crude). TC = Clean (products). e.g. TD3C MEG→China, TD20 WAF→UKC, TC2 CONT→USAC, TC14 USG→UKC.",
  },
];

export const GROUP_LABELS: Record<GlossaryTerm["group"], string> = {
  freight: "Freight & rates",
  vessels: "Vessels & bunkers",
  regulatory: "Regulatory & compliance",
  ports: "Ports & chokepoints",
  commercial: "Commercial & contracts",
};
