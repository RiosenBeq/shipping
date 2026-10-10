/**
 * Chartering glossary — extended version of the Reference tab list,
 * grouped by topic for the dedicated /glossary page.
 */

export type GlossaryTerm = {
  term: string;
  def: string;
  group: "freight" | "vessels" | "gas" | "regulatory" | "ports" | "commercial";
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

  // LPG & gas carriers
  {
    group: "gas",
    term: "VLGC (Very Large Gas Carrier)",
    def: "Fully refrigerated LPG carrier of 70,000 cbm and above; modern ships are mostly 78,000–93,000 cbm and lift about 44,000–46,000 mt. The long-haul LPG workhorse.",
  },
  {
    group: "gas",
    term: "LGC (Large Gas Carrier)",
    def: "Fully refrigerated gas carrier of roughly 50,000–70,000 cbm, sitting between the MGC and VLGC bands.",
  },
  {
    group: "gas",
    term: "MGC (Midsize Gas Carrier)",
    def: "Fully refrigerated gas carrier of 25,000–50,000 cbm, with the core fleet around 35,000–40,000 cbm. The backbone of seaborne ammonia and flexible on LPG.",
  },
  {
    group: "gas",
    term: "Handysize gas carrier",
    def: "15,000–25,000 cbm, usually semi-refrigerated or fully refrigerated. Carries LPG, ammonia and petrochemical gases such as propylene, butadiene and VCM.",
  },
  {
    group: "gas",
    term: "Fully pressurised",
    def: "Containment that keeps LPG liquid by pressure alone, at ambient temperature, in cylindrical tanks. Used on small coastal ships; no reliquefaction plant needed.",
  },
  {
    group: "gas",
    term: "Semi-refrigerated",
    def: "Containment that combines moderate pressure with partial cooling, so the ship can load from both pressurised and refrigerated terminals.",
  },
  {
    group: "gas",
    term: "Fully refrigerated",
    def: "Containment that keeps cargo liquid by cooling it to its boiling point at near-atmospheric pressure (around −42 °C for propane, −33 °C for ammonia). Standard on VLGCs and MGCs.",
  },
  {
    group: "gas",
    term: "cbm",
    def: "Cubic metres — the standard measure of gas carrier cargo capacity. Converting cbm to tonnes needs the cargo's liquid density (about 0.58 t/m³ for propane).",
  },
  {
    group: "gas",
    term: "Boil-off & reliquefaction",
    def: "Heat leaking into the tanks makes some cargo evaporate (boil-off). On LPG carriers a reliquefaction plant turns the vapour back into liquid and returns it to the tanks.",
  },
  {
    group: "gas",
    term: "Gas-freeing & purging",
    def: "Tank preparation between cargo grades or before dry-dock: removing cargo vapour, then replacing it with inert gas or air. Takes time that belongs in the voyage estimate.",
  },
  {
    group: "gas",
    term: "Petrochemical gases (PCG)",
    def: "Gases such as propylene, butadiene and vinyl chloride monomer (VCM), traded mainly on Handysize semi-refrigerated ships. Specs on purity and inhibitors are strict.",
  },
  {
    group: "gas",
    term: "BLPG1 / BLPG2 / BLPG3",
    def: "Baltic Exchange VLGC benchmarks: BLPG1 Ras Tanura–Chiba, BLPG2 Houston–Flushing, BLPG3 Houston–Chiba. Quoted in $/mt with a TCE equivalent.",
  },
  {
    group: "gas",
    term: "IGC Code",
    def: "IMO's International Code for the Construction and Equipment of Ships Carrying Liquefied Gases in Bulk. Sets containment, certification and filling-limit rules for gas carriers.",
  },
  {
    group: "gas",
    term: "Filling limit",
    def: "The maximum level a cargo tank may be filled to, leaving room for thermal expansion — typically 98% under the IGC Code. Used when converting tank capacity into cargo tonnes.",
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

  // Ports & chokepoints
  {
    group: "ports",
    term: "DA (Disbursement Account)",
    def: "Itemised port costs for one call: dues, pilotage, towage, mooring, agency, statutory fees. Varies widely with the port, the ship's size and the time alongside — the agent's pro-forma DA gives the estimate for a given call.",
  },
  {
    group: "ports",
    term: "Suez Canal",
    def: "Egypt. Dues scale with the ship's tonnage and laden or ballast status, and change each year — ask the desk for a current estimate. Average transit 14–16 hours. The single biggest canal expense in tanker chartering.",
  },
  {
    group: "ports",
    term: "Panama Canal (Neopanamax)",
    def: "Dues depend on the ship's size, laden or ballast status and slot booking, and change each year — ask the desk for a current estimate. Transit 8–10 hours. Slot booking system; congestion pricing during dry seasons.",
  },
  {
    group: "ports",
    term: "Bosphorus + Dardanelles",
    def: "Türkiye. Tonnage-based dues, the same laden or ballast, revised from time to time — ask the desk for a current figure. Transit 10–14 hours. Critical for Black Sea exports — CPC, Russian Urals, Kazakh crude.",
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
    def: "Daily compensation paid by the charterer to the owner for time used at port beyond the agreed laytime. The daily rate is agreed in the charter party and usually tracks the ship's size and the market at the time of fixing.",
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
    term: "BIMCO",
    def: "Baltic and International Maritime Council. Publishes standard charter party forms and clauses — e.g. GASVOY for gas carriers and the ETS allowance clauses used to allocate EU ETS costs.",
  },
  {
    group: "commercial",
    term: "TD / TC lanes",
    def: "Worldscale lane codes. TD = Dirty (crude). TC = Clean (products). e.g. TD3C MEG→China, TD20 WAF→UKC, TC2 CONT→USAC, TC14 USG→UKC.",
  },
];

export const GROUP_LABELS: Record<GlossaryTerm["group"], string> = {
  freight: "Freight & rates",
  vessels: "Tankers & bunkers",
  gas: "LPG & gas carriers",
  regulatory: "Regulatory & compliance",
  ports: "Ports & chokepoints",
  commercial: "Commercial & contracts",
};
