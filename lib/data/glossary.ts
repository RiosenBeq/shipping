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
  {
    group: "freight",
    term: "Overage",
    def: "Cargo loaded above the minimum quantity in the charter party. Tanker charters often pay overage at a reduced rate, commonly half the agreed freight rate.",
  },
  {
    group: "freight",
    term: "Address commission",
    def: "A percentage of freight or hire returned to the charterer, set in the charter party. Compare offers on the same commission basis.",
  },
  {
    group: "freight",
    term: "Ballast bonus",
    def: "A lump sum paid to the owner to position a ship from a distant area to the load port, used when the ship would otherwise not ballast there.",
  },
  {
    group: "freight",
    term: "Ton-mile demand",
    def: "Cargo volume multiplied by distance sailed. Longer voyages for the same cargo, such as Atlantic crude replacing Gulf crude in Asia, tie up more ships and support freight.",
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
    term: "Cooling down & gassing up",
    def: "Preparing gas carrier tanks for a new cargo: replacing inert gas with cargo vapour, then cooling tanks to loading temperature. It takes time and cargo, so the charter party should say whether it counts as laytime and who pays.",
  },
  {
    group: "gas",
    term: "Ammonia carrier (NH₃)",
    def: "A gas carrier certified for ammonia, usually a fully refrigerated MGC or Handysize ship carrying it at about −33 °C. Ammonia needs suitable tank materials, and terminals often restrict previous cargoes.",
  },
  {
    group: "gas",
    term: "Dual-fuel LPG",
    def: "A gas carrier that can burn LPG from its cargo as fuel as well as conventional fuel oil. It changes the fuel cost in a TCE comparison and is common on newer VLGCs.",
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
    def: "Cap on the price of Russian-origin crude (since Dec 2022) and petroleum products (since Feb 2023). Service providers such as insurers, financiers and brokers may only support cargoes bought at or below the cap. The EU and UK now apply a lower crude cap that resets periodically, so the level differs by jurisdiction; check it on the day of fixing.",
  },
  {
    group: "regulatory",
    term: "OFAC / OFSI",
    def: "Office of Foreign Assets Control (US) and Office of Financial Sanctions Implementation (UK). Counterparty and vessel screening against their sanctions lists is standard practice on every fixture.",
  },
  {
    group: "regulatory",
    term: "FuelEU Maritime",
    def: "EU rule in force since 1 January 2025 limiting the greenhouse-gas intensity of energy used by ships on EU voyages, with penalties above the limit and pooling between ships. Separate from the EU ETS and needs its own clause.",
  },
  {
    group: "regulatory",
    term: "Shadow fleet",
    def: "Tankers trading outside mainstream insurance, class and ownership transparency, often to move sanctioned cargo. Signs include recent flag and name changes, AIS gaps and unexplained ship-to-ship transfers.",
  },
  {
    group: "regulatory",
    term: "AIS (Automatic Identification System)",
    def: "Transponder that broadcasts a ship's identity, position and course. Gaps in AIS data are a standard red flag in sanctions screening.",
  },
  {
    group: "regulatory",
    term: "War-risk additional premium (AP)",
    def: "Extra insurance premium charged for each call or transit in a war-risk listed area. Charter parties decide whether owners or charterers pay it, together with crew war bonuses.",
  },
  {
    group: "regulatory",
    term: "JWC listed area",
    def: "An area listed by the Joint War Committee of the London insurance market as high risk. Ships entering need to notify underwriters and usually pay additional war-risk premium. In 2026 the list includes the Gulf, the Strait of Hormuz and parts of the Black Sea.",
  },
  {
    group: "regulatory",
    term: "VOYWAR / CONWARTIME",
    def: "BIMCO war risks clauses for voyage charters (VOYWAR) and time charters (CONWARTIME). They let owners refuse to enter areas that become dangerous and pass additional war-risk costs to charterers.",
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
    def: "The Turkish Straits, Türkiye: the Black Sea's only sea link, roughly 160 nm through the Bosphorus, the Sea of Marmara and the Dardanelles. No toll; ships pay Montreux dues plus pilotage and tugs if used. Tankers of 200 m and above pass the Bosphorus in daylight, so waiting time, not steaming time, drives Black Sea estimates.",
  },
  {
    group: "ports",
    term: "Strait of Malacca",
    def: "Singapore / Indonesia / Malaysia. No transit fee; ~12 hours through. Carries ~1/4 of seaborne trade and most MEG → East crude.",
  },
  {
    group: "ports",
    term: "Strait of Hormuz",
    def: "The chokepoint between the Gulf and the Gulf of Oman through which Middle East Gulf crude, product, LPG and ammonia exports normally sail. Traffic has been severely disrupted since March 2026.",
  },
  {
    group: "ports",
    term: "Montreux Convention",
    def: "The 1936 treaty that guarantees merchant ships freedom of passage through the Turkish Straits in peacetime and sets the only dues Türkiye may charge for a transit without a port call: lighthouse, health and life-saving services.",
  },
  {
    group: "ports",
    term: "STS (ship-to-ship transfer)",
    def: "Moving cargo between two ships alongside each other, at anchor or under way. Routine in lightering and LPG distribution, but unexplained STS transfers are a sanctions red flag.",
  },

  // Commercial / contract
  {
    group: "commercial",
    term: "COA (Contract of Affreightment)",
    def: "Multi-shipment contract committing the owner to lift a series of cargoes at agreed terms over a defined period, without naming one ship. Common for refinery crude programmes, LPG distribution and ammonia supply.",
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
    term: "NOR (Notice of Readiness)",
    def: "The master's notice that the ship has arrived and is ready to load or discharge. A valid NOR, tendered where and when the charter party allows, starts the laytime clock.",
  },
  {
    group: "commercial",
    term: "Statement of facts (SOF)",
    def: "The agent's or terminal's record of every time in port: arrival, NOR, berthing, hoses on and off, documents. The basis of every laytime and demurrage calculation.",
  },
  {
    group: "commercial",
    term: "Detention",
    def: "Damages for delay to the ship that the demurrage clause does not cover, for example before laytime could start. Usually harder to claim than demurrage.",
  },
  {
    group: "commercial",
    term: "Off-hire",
    def: "Time under a time charter for which the charterer does not pay hire, because the ship is not fully working: breakdowns, crew problems or deficiencies, as defined in the off-hire clause.",
  },
  {
    group: "commercial",
    term: "Time bar",
    def: "A deadline in the charter party for presenting a claim, such as demurrage, with all supporting documents. Many tanker forms set 90 days; a late or incomplete claim can be lost entirely.",
  },
  {
    group: "commercial",
    term: "Turkish Straits clause",
    def: "A charter party clause that decides who bears time and cost waiting to transit the Bosphorus and Dardanelles: laytime, demurrage or owners' account.",
  },
  {
    group: "commercial",
    term: "Charter party (C/P)",
    def: "The contract between owner and charterer. Usually a standard form, such as ASBATANKVOY, Shellvoy, GASVOY or Shelltime, with typed additional clauses.",
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
    def: "Baltic Exchange tanker route codes, priced in Worldscale or $/mt. TD = dirty (crude and fuel oil), TC = clean (products). e.g. TD3C MEG→China, TD20 WAF→UKC, TC2 CONT→USAC, TC14 USG→UKC.",
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
