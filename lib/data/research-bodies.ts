/**
 * Long-form editorial bodies for each research report. Keyed by the report slug.
 * Plain markdown-ish blocks so the renderer stays simple.
 *
 * Gated reports show only their `summary` on the site; the full report is sent
 * on request by the research desk.
 */

export type ReportBlock =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "ul"; items: string[] }
  /** Numbered list, for checklists and sequences. */
  | { kind: "ol"; items: string[] }
  /** `link` points to a related page on this site. */
  | { kind: "callout"; label: string; text: string; link?: { href: string; label: string } }
  | { kind: "table"; caption: string; head: string[]; rows: string[][] };

export type ReportBody = {
  /** One-sentence dek under the title. */
  dek: string;
  /** Summary shown on the site for gated reports. */
  summary?: string;
  blocks: ReportBlock[];
};

export const REPORT_BODIES: Record<string, ReportBody> = {
  "strait-of-hormuz-disruption-checklist-for-tanker-and-lpg-charterers": {
    dek: "What the 2026 Hormuz crisis changes in a fixture: war-risk cover, clauses, routing, laytime and sanctions checks to agree before you fix.",
    blocks: [
      {
        kind: "p",
        text: "Since early March 2026, commercial traffic through the Strait of Hormuz has been severely disrupted. The Joint War Committee of the London insurance market lists the Gulf, the Strait and the Gulf of Oman as a listed area, so every call needs additional war-risk cover, and many owners will not send ships in at all. Ships that do trade the area face escort or routing instructions, long waits at anchor and a real risk of attack or mines.",
      },
      {
        kind: "p",
        text: "This brief does not forecast when the Strait reopens. It sets out what changes in a tanker or LPG fixture while the disruption lasts, and the points we agree with both sides before a ship is fixed. The situation changes daily: treat it as a checklist, not legal advice.",
      },
      { kind: "h2", text: "What the disruption has done to the market" },
      {
        kind: "ul",
        items: [
          "Middle East Gulf loadings of crude, clean products and LPG are sharply lower, and buyers in Asia and India have turned to Atlantic-basin supply. Longer voyages tie up more ships for the same cargo, which supports tanker and VLGC freight.",
          "US Gulf LPG exports reached record levels in spring 2026 as Asian buyers replaced Gulf cargoes, and US Gulf–Asia VLGC freight (the BLPG3 lane) set new highs in May.",
          "Ships that would normally ballast back to the Gulf are repositioning to the US Gulf, West Africa and Brazil instead, so the Panama-or-Cape and ballast-leg decisions matter more than ever.",
          "Bypass routes have gained weight: Red Sea loadings fed by Saudi Arabia's East–West pipeline, Fujairah outside the Strait, and Iraqi and Kurdish crude via the pipeline to Ceyhan on Türkiye's Mediterranean coast.",
          "Red Sea and Bab el-Mandeb risk remains elevated, so Suez routings for these cargoes need their own war-risk review.",
        ],
      },
      { kind: "h2", text: "Checklist before you fix" },
      {
        kind: "ol",
        items: [
          "War clause: check which clause applies. BIMCO VOYWAR (voyage charters) and CONWARTIME (time charters) let owners refuse to enter areas that become dangerous and pass additional war-risk costs to charterers. Many charterers' forms amend these clauses, so read the version in your charter party.",
          "Additional premium: agree who pays the additional war-risk premium (AP), any kidnap and ransom cover and crew war bonuses, whether they are capped, and when the premium is charged (per entry, per call, per period).",
          "Laycan and notice of readiness: if ships wait for escorts or clearance before entering, agree whether that time counts as laytime or is treated as a deviation. Write it down; do not rely on general exceptions.",
          "Alternative ports: name the substitute load or discharge options and the freight difference in advance, so the ship can be redirected without a new negotiation.",
          "Sanctions and AIS: ships that turn off AIS or carry out unplanned ship-to-ship transfers in the region are compliance red flags. We ask for voyage history and documents before an offer goes to the charterer.",
          "Insurance: confirm that hull and machinery, P&I and war-risk underwriters have accepted the voyage, and that the cover matches the route actually being sailed.",
        ],
      },
      { kind: "h2", text: "LPG and ammonia: specific points" },
      {
        kind: "p",
        text: "Ras Tanura, Ju'aymah, Ruwais, Mina al-Ahmadi and the Qatari terminals normally supply a large share of the world's seaborne LPG, and the Gulf is also a major ammonia export region. With those cargoes constrained, VLGC demand has shifted to the US Gulf and other Atlantic exporters, and MGC ammonia buyers have been looking for replacement sources. For a VLGC voyage to Asia we now price Panama, the Cape and, where relevant, Suez side by side, with war-risk and waiting costs as separate lines.",
      },
      { kind: "h2", text: "How we quote while the disruption lasts" },
      {
        kind: "p",
        text: "Every freight idea we send shows the base freight, the assumed waiting days and the war-risk costs on separate lines, together with the clause that allocates them. Charterers can then compare an offer that includes the risk with one that leaves it open, instead of finding out after loading.",
      },
      {
        kind: "callout",
        label: "Talk to the desk",
        text: "If you have a Gulf-origin stem, or a ship that could be ordered into the area, send us the details. We will come back with available ships, the clauses owners are accepting and the costs they are quoting, within 60 minutes during business hours.",
        link: { href: "/compliance", label: "How we screen every fixture" },
      },
    ],
  },

  "laytime-and-demurrage-a-practical-guide-for-tanker-and-lpg-charters": {
    dek: "When laytime starts, what stops the clock, how demurrage is calculated and the documents that win or lose a claim.",
    blocks: [
      {
        kind: "p",
        text: "On many tanker and LPG voyages, port time costs more than any argument about the freight rate. Laytime and demurrage decide who pays for that time. Most disputes are not about the law: they come from loose wording in the fixture and missing times in the port documents. This guide covers the points we check on every voyage charter.",
      },
      { kind: "h2", text: "The terms" },
      {
        kind: "ul",
        items: [
          "Laycan: the window in which the ship must arrive and tender notice of readiness. If the ship misses the cancelling date, the charterer may cancel.",
          "Laytime: the time the charterer may use to load and discharge without paying extra. Tanker charters usually give a total in running hours for loading and discharging together; LPG charters may set it per port or per operation.",
          "Notice of readiness (NOR): the master's notice that the ship has arrived and is ready to load or discharge. A valid NOR is what starts the clock.",
          "Demurrage: an agreed daily rate, paid pro rata, for time used beyond laytime. It is liquidated damages, so the rate is not re-argued later.",
          "Detention: damages for delay that is not covered by the demurrage clause, for example before laytime could start.",
        ],
      },
      { kind: "h2", text: "When the clock starts" },
      {
        kind: "p",
        text: "Under common tanker forms such as ASBATANKVOY, laytime starts a fixed number of hours (often six) after a valid NOR, or when the ship is all fast at berth, whichever comes first. The notice must be given at the right place and at a time the charter party allows, and the ship must really be ready. An invalid NOR is the most common reason a demurrage claim fails, so we confirm the arrival location and NOR rules before the ship arrives.",
      },
      { kind: "h2", text: "What stops the clock" },
      {
        kind: "ul",
        items: [
          "Shifting from the anchorage to the berth, usually excluded even when the ship is already on demurrage.",
          "Delays caused by the ship: breakdowns, crew problems, or failing to discharge at the warranted pumping rate or pressure.",
          "Time spent on the owners' own business, such as bunkering or tank cleaning, unless done in the charterer's time.",
          "Events named in the charter party. Some forms pay only half the demurrage rate for delays from weather, fire, explosion or strikes.",
          "For gas carriers: cooling down, gassing up and purging. Check whether this time counts, and who pays the cargo or nitrogen used.",
        ],
      },
      { kind: "h2", text: "A worked example" },
      {
        kind: "table",
        caption: "Illustrative laytime calculation, round numbers only",
        head: ["Item", "Hours"],
        rows: [
          ["Laytime allowed (load + discharge, running hours)", "72"],
          ["Time counted at load port", "40"],
          ["Time counted at discharge port, after exceptions", "56"],
          ["Total time counted", "96"],
          ["Time on demurrage (96 − 72)", "24 = 1.0 day"],
        ],
      },
      {
        kind: "p",
        text: "If the agreed demurrage rate is X dollars per day, the claim is 1.0 × X, pro rata for part days. In practice the calculation also tracks NOR times, hoses connected and disconnected, documents on board and every interruption, port by port.",
      },
      { kind: "h2", text: "Documents that decide claims" },
      {
        kind: "ol",
        items: [
          "Statement of facts, signed by the terminal or agent, with every time stamp.",
          "Notice of readiness and the time it was accepted.",
          "Pumping logs and manifold pressure records for any claim that the ship pumped slowly.",
          "Letters of protest for delays, short loading or disputed times.",
          "The claim itself, submitted with all supporting documents before the time bar. Many tanker forms set 90 days, some fewer; a claim sent late, or without the papers, can be lost completely.",
        ],
      },
      {
        kind: "callout",
        label: "Post-fixture support",
        text: "Our post-fixture team prepares laytime calculations, checks the other side's figures and keeps an eye on time bars, for owners and charterers. Ask the desk that fixed your ship.",
        link: { href: "/glossary", label: "Chartering glossary" },
      },
    ],
  },

  "spot-time-charter-or-coa-how-to-charter-an-lpg-carrier": {
    dek: "Voyage, time charter and contract of affreightment compared for LPG and ammonia: who carries which cost and risk, and when each fits.",
    blocks: [
      {
        kind: "p",
        text: "LPG importers, traders and end users ask us the same first question: should we fix this cargo on the spot market, take a ship on time charter, or sign a contract of affreightment (COA)? The answer depends on how regular your volumes are, how much freight risk you want to carry, and how specific your terminals are.",
      },
      { kind: "h2", text: "The three structures side by side" },
      {
        kind: "table",
        caption: "How costs and risks are split under each structure",
        head: ["", "Voyage (spot)", "Time charter", "COA"],
        rows: [
          [
            "Price",
            "$ per tonne, per voyage",
            "Hire per day or month",
            "$ per tonne, fixed or index-linked",
          ],
          ["Bunkers and port costs", "Owner", "Charterer", "Owner"],
          ["Speed and waiting risk", "Owner, except laytime", "Charterer", "Owner, except laytime"],
          ["Ship choice", "Each voyage", "One named ship", "Owner nominates approved ships"],
          [
            "Typical forms",
            "GASVOY or charterer's form",
            "GASTIME or Shelltime-based",
            "Voyage terms plus COA clauses",
          ],
        ],
      },
      { kind: "h2", text: "When spot fits" },
      {
        kind: "p",
        text: "Spot suits irregular cargoes, trading opportunities and first-time lanes. You pay the market of the day and the owner carries voyage costs and speed risk, but you have no guarantee of a ship when you need one. In the small pressurised market a ship can be the only suitable one in the region for weeks, so we start looking before your laycan is final.",
      },
      { kind: "h2", text: "When a time charter fits" },
      {
        kind: "p",
        text: "A time charter gives you a named ship for 6 months to several years. You pay hire and take on bunkers, port costs and the commercial employment of the ship, so you profit when you use it well and pay for idle days. It suits regular programmes, terminals with strict ship approvals, and buyers who want the same crew and ship at their berths every time.",
      },
      { kind: "h2", text: "When a COA fits" },
      {
        kind: "p",
        text: "A COA commits the owner to carry an agreed volume over a period, such as 24 cargoes a year with a tolerance either side, without naming a single ship. It suits regular distribution into Türkiye, the Med or West Africa when you want predictable freight but not a ship of your own. The details that matter are nomination periods, volume tolerances, ship approval, and the freight adjustment for bunkers or a market index.",
      },
      { kind: "h2", text: "Ammonia and petrochemical gases" },
      {
        kind: "p",
        text: "Ammonia needs ships with suitable tank materials and certification, and terminals often restrict previous cargoes. Petrochemical gases such as propylene and butadiene have their own quality and inhibitor requirements. On any structure, write the cargo grades, previous-cargo rules and who pays for grade changes into the fixture.",
      },
      {
        kind: "callout",
        label: "Practical takeaway",
        text: "Map one year of expected cargoes before choosing. If more than half are predictable in size and timing, a COA or time charter usually beats fixing every cargo spot; keep the rest on the spot market for flexibility.",
        link: { href: "/lpg", label: "LPG & ammonia desk" },
      },
    ],
  },

  "worldscale-and-tce-explained-how-tanker-freight-is-quoted": {
    dek: "Flat rates, Worldscale points, overage and commissions, and how to turn any freight offer into a comparable time-charter equivalent.",
    blocks: [
      {
        kind: "p",
        text: "Most spot tanker freight is negotiated in Worldscale points, not dollars. That is efficient for brokers and confusing for everyone else. This guide explains how a Worldscale rate turns into a freight bill, and how we convert any offer into a time-charter equivalent (TCE) so different voyages and ships can be compared.",
      },
      { kind: "h2", text: "Flat rates and Worldscale points" },
      {
        kind: "p",
        text: "Each year the Worldscale Associations in London and New York publish a flat rate, in US dollars per tonne, for thousands of port-to-port voyages. The flat rate is what a standard notional tanker would need to earn to cover its voyage costs and a fixed daily hire. It is called Worldscale 100 (WS 100). The market then trades as a percentage of that: WS 80 means 80% of the flat rate. Flat rates are reset every 1 January, so compare Worldscale levels across years with care.",
      },
      { kind: "h2", text: "From Worldscale to a freight bill" },
      {
        kind: "table",
        caption: "Illustrative freight calculation, made-up numbers",
        head: ["Step", "Value"],
        rows: [
          ["Flat rate for the voyage (WS 100)", "$20.00 per tonne"],
          ["Agreed rate", "WS 75"],
          ["Freight rate (20.00 × 75%)", "$15.00 per tonne"],
          ["Cargo on bill of lading", "130,000 tonnes"],
          ["Gross freight", "$1,950,000"],
        ],
      },
      {
        kind: "p",
        text: "Charter parties add details. Cargo above the agreed minimum (overage) is often paid at a reduced rate, commonly half. Extra load or discharge ports carry a fixed charge or a Worldscale addition. Smaller or unusual voyages are often fixed as a lump sum instead.",
      },
      { kind: "h2", text: "Commissions" },
      {
        kind: "p",
        text: "Freight is usually paid less an address commission to the charterer and brokerage to the brokers, each a percentage set in the fixture. Always compare offers on the same commission basis, or the cheaper-looking offer may not be.",
      },
      { kind: "h2", text: "Time-charter equivalent" },
      {
        kind: "p",
        text: "TCE expresses a voyage as daily earnings: freight revenue, less commissions and voyage costs (bunkers, port costs, canal tolls, war-risk premiums), divided by the total voyage days including the ballast leg. It is the only fair way to compare a short voyage with a long one, a spot voyage with a time charter, or an eco ship with an older one.",
      },
      {
        kind: "ul",
        items: [
          "Count the ballast days. A high Worldscale on a voyage that ends far from the next cargo can earn less than a lower rate that ends in a busy loading area.",
          "Use the ship's real speed and consumption, not the brochure figures.",
          "Include port time and waiting days, such as the Turkish Straits or canal queues, at realistic levels.",
          "Show regulatory costs, such as EU ETS allowances, as a separate line and agree who pays them.",
        ],
      },
      {
        kind: "callout",
        label: "How we quote",
        text: "Every freight idea from our tanker desk comes with the TCE and the assumptions behind it: speed, consumption, port days, routing and costs. You can check each line and change any assumption you disagree with.",
        link: { href: "/tankers", label: "Tanker desk" },
      },
    ],
  },

  "vlgc-routing-us-gulf-asia-panama-or-the-cape": {
    dek: "How we compare canal cost, waiting time and extra sea days before quoting a BLPG3-type voyage.",
    blocks: [
      {
        kind: "p",
        text: "US Gulf to Japan is the longest regular VLGC trade, and the Baltic's BLPG3 (Houston–Chiba) is its benchmark. Every voyage on this lane starts with the same question: go through the Panama Canal, or take the long way round the Cape of Good Hope? The answer changes from month to month, so we never quote one without pricing both.",
      },
      { kind: "h2", text: "What goes into the comparison" },
      {
        kind: "ul",
        items: [
          "Sea days: the Panama route is much shorter, so it uses fewer days and less bunker fuel.",
          "Canal cost: tolls, slot-auction premiums and agency fees for the transit.",
          "Waiting time: queue days at the canal, which can wipe out the distance saving when congestion builds.",
          "Repositioning: where the ship opens after discharge, and how long the ballast leg back to the US Gulf will take.",
          "Fuel basis: dual-fuel LPG ships and conventional ships burn different fuels at different costs.",
        ],
      },
      { kind: "h2", text: "How we present it" },
      {
        kind: "p",
        text: "For each inquiry we show the round-trip time-charter equivalent (TCE) for both routings side by side, with the canal assumptions spelled out. Charterers see exactly which variable drives the decision, so a freight idea can be checked line by line rather than taken on trust.",
      },
      {
        kind: "callout",
        label: "Practical takeaway",
        text: "If your laycan is flexible by a few days, ask us to price both routes. Small timing shifts can move a voyage from one side of the Panama/Cape break-even to the other.",
      },
      {
        kind: "callout",
        label: "Update, October 2026",
        text: "With Middle East Gulf LPG exports disrupted since March 2026, Asian buyers have leaned harder on US Gulf cargoes and the Houston–Chiba lane has carried more of the world's VLGC demand. That makes the Panama-or-Cape choice, and the ballast leg back to the US Gulf, even more important to the round-trip result.",
        link: {
          href: "/research/strait-of-hormuz-disruption-checklist-for-tanker-and-lpg-charterers",
          label: "Hormuz checklist for charterers",
        },
      },
    ],
  },

  "chartering-small-lpg-ships-in-the-med-and-black-sea": {
    dek: "Pressurised and semi-refrigerated tonnage, terminal limits and Turkish Straits timing — a practical guide for importers.",
    blocks: [
      {
        kind: "p",
        text: "Most LPG fixtures in the Mediterranean and Black Sea are not VLGC deals. They are small pressurised and semi-refrigerated ships moving 1,500–7,000 mt parcels between refineries, import terminals and depots. Türkiye, one of the world's largest autogas markets, sits in the middle of this network, and the Turkish Straits link the Black Sea to everything else.",
      },
      { kind: "h2", text: "Pick the right containment" },
      {
        kind: "ul",
        items: [
          "Fully pressurised ships carry LPG at ambient temperature and suit short voyages into pressurised terminals.",
          "Semi-refrigerated ships can load from both pressurised and refrigerated terminals, which widens your options.",
          "Check the receiving terminal first: tank type, manifold size and temperature limits decide which ships can discharge.",
        ],
      },
      { kind: "h2", text: "Price the port time, not just the freight" },
      {
        kind: "p",
        text: "On a short voyage, two extra days at anchor can matter more than the freight rate. We quote with realistic port days for each terminal and flag berths with known congestion or draft limits before the ship is fixed.",
      },
      { kind: "h2", text: "Plan the Straits transit" },
      {
        kind: "p",
        text: "Black Sea voyages pass the Bosphorus and the Dardanelles. Transit rules for vessels carrying dangerous cargo, daylight restrictions and weather all affect timing. Our Istanbul desk follows transit conditions daily and builds realistic waiting time into every estimate.",
      },
      {
        kind: "callout",
        label: "Before you fix",
        text: "Send us the terminal names, parcel size and laycan. We will come back with suitable ships, realistic port days and a freight idea within 60 minutes during business hours.",
      },
    ],
  },

  "ammonia-on-mgcs-switching-grades-without-losing-a-voyage": {
    dek: "What changes when a midsize gas carrier moves between LPG and ammonia — and how to price it.",
    blocks: [
      {
        kind: "p",
        text: "Midsize gas carriers (MGCs) earn their premium by being able to carry both LPG and ammonia. The switch is not free: cargo tanks need to be prepared, and some terminals have strict requirements on previous cargoes. Getting this right is the difference between a smooth voyage and a ship sitting idle while it is cleaned.",
      },
      { kind: "h2", text: "What a grade change involves" },
      {
        kind: "ul",
        items: [
          "Tank preparation: depending on the previous cargo, tanks may need warming, gas-freeing, purging or inerting before loading.",
          "Time: preparation can add days to the voyage, which belongs in the TCE calculation from the start.",
          "Terminal acceptance: some load ports set limits on the last cargoes or require specific inspection results.",
          "Ship suitability: tank materials and certification must allow ammonia, so not every MGC is a candidate.",
        ],
      },
      { kind: "h2", text: "How we price it" },
      {
        kind: "p",
        text: "We treat cleaning time and cost as part of the voyage, not an afterthought. When an owner offers an MGC after an LPG cargo for an ammonia stem, we confirm the preparation plan, the time it needs and who pays for it before the freight idea goes to the charterer.",
      },
      {
        kind: "callout",
        label: "Desk note",
        text: "Long-term ammonia demand is tied to fertiliser markets and to new low-carbon ammonia projects. We follow both because they decide period demand for MGCs.",
      },
    ],
  },

  "suezmax-tightness-sustains-as-cpc-volumes-rebound": {
    dek: "Black Sea exports are tracking Q1 highs while Atlantic Basin tonnage thins. Where the squeeze holds — and where it breaks.",
    blocks: [
      {
        kind: "p",
        text: "The Suezmax market entered Q2 with the kind of structural tightness that doesn't reverse on a single bearish week. CPC programme nominations through April have run within 3% of January's record schedule, and the Atlantic Basin position list — the running tally of available tonnage in the region — has not exceeded 26 ships at any point this month. For context, the Q4 2024 average was 41.",
      },
      { kind: "h2", text: "What's driving the squeeze" },
      {
        kind: "ul",
        items: [
          "CPC Blend exports recovering off the Q4 maintenance dip; April nominations imply ~5.0 m t for the month vs the 4.4 m t seasonal average.",
          "WAF programme staying full despite Nigerian crude differentials weakening — Atlantic-Atlantic ton-mile holding steady.",
          "Eastward arbitrage thin: with Brent–Dubai spreads narrow, fewer Suezmax cargoes are being pulled to Asia, capping the West-of-Suez safety valve.",
          "Order-book delivery pace into the segment has slowed — 18 deliveries scheduled for full year 2026 vs 27 in 2025.",
        ],
      },
      { kind: "h2", text: "TD20 base / bear / bull: what moves it" },
      {
        kind: "p",
        text: "We frame TD20 (WAF → UKC) by drivers rather than levels, because the levels move weekly. The base case holds while CPC and West African programmes stay full and the Atlantic position list stays short. The bear case is a combination — an OPEC+ supply pause and a CPC programme slip together — that lengthens the list and softens rates. The bull case is sustained CPC volume plus a Russia–India arbitrage that keeps tightening East-of-Suez supply, drawing ships out of the Atlantic.",
      },
      {
        kind: "callout",
        label: "Practical takeaway",
        text: "If you hold a WAF or CPC charter window, watch the CPC programme and the Atlantic position list first. When both point to a tight market, it is worth covering part of the programme exposure on time-charter or COA terms rather than leaving it all to the spot market. Ask the desk for the current numbers before you fix.",
      },
      { kind: "h2", text: "Where the call could break" },
      {
        kind: "p",
        text: "Three watch items: (1) CPC infrastructure — any unscheduled maintenance at Yuzhnaya Ozereyevka pulls 200–300 k bbl/d off the schedule overnight; (2) Atlantic Basin newbuilding deliveries clustering in Q3 — the 18-ship 2026 figure is back-end-loaded; (3) US sanctions calibration on Russian crude — looser enforcement re-opens grey-market tonnage at the margin.",
      },
    ],
  },

  "td3c-demystified-meg-to-china-end-to-end": {
    dek: "Loading windows, transit math, demurrage triggers, and the four laycan patterns charterers actually run.",
    blocks: [
      {
        kind: "callout",
        label: "Update, October 2026",
        text: "This note describes TD3C in normal conditions. Since March 2026, traffic through the Strait of Hormuz has been severely disrupted, Middle East Gulf loadings are sharply lower and every call needs additional war-risk cover. Read it as a guide to how the lane works, and ask the desk for current loading options before fixing.",
        link: {
          href: "/research/strait-of-hormuz-disruption-checklist-for-tanker-and-lpg-charterers",
          label: "Hormuz checklist for charterers",
        },
      },
      {
        kind: "p",
        text: "TD3C — the Baltic Exchange route code for the MEG → China VLCC voyage — is the single most-fixed long-haul tanker route in the world. In a normal month, a large share of all VLCC fixtures touch some version of this lane. And yet a surprising number of charterers we work with don't have a clean handle on the four loading patterns and how each one prices.",
      },
      { kind: "h2", text: "The voyage in numbers" },
      {
        kind: "ul",
        items: [
          "Distance: 6,300 nm (Ras Tanura → Ningbo, via Strait of Malacca). Add ~600 nm if discharging at Caofeidian or QHD; subtract ~400 nm for Singapore.",
          "Sea time at 13.5 kn laden / 14.0 kn ballast: 19.5–21 days each way.",
          "Bunker burn (typical scrubber-fitted VLCC): 70–75 mt/d VLSFO at sea, 5 mt/d in port.",
          "Port days: 3.0–3.5 at load (Ras Tanura), 3.5–4.0 at discharge (Ningbo, Qingdao, Caofeidian).",
          "Round trip including ballast: 47–52 days.",
        ],
      },
      { kind: "h2", text: "The four loading patterns" },
      {
        kind: "p",
        text: "Charterers tend to book TD3C in one of four shapes, and the freight idea moves with each: (a) clean spot — single-cargo, narrow laycan, owner-friendly; (b) program lift — part of a 6/12-month flow with a Saudi NOC, typically discounted vs spot WS; (c) co-loading — two charterers splitting one VLCC cargo, common for Chinese state buyers; (d) ballast bonus structures — owner gets a top-up to position back to MEG, used in shoulder seasons.",
      },
      { kind: "h2", text: "Where demurrage triggers" },
      {
        kind: "p",
        text: "The biggest avoidable demurrage exposure on TD3C sits at discharge, not load. Ras Tanura runs on a tight slot system and rarely overruns. Discharge ports in China — particularly Ningbo and Qingdao during October–February congestion — routinely produce 24–60 hours of waiting time. Building 1.5 days of contingency into your laycan tail (charterer's option) typically pays for itself.",
      },
      {
        kind: "callout",
        label: "Desk note",
        text: "If you're new to TD3C and pricing a one-off lift, ask for a ballast-bonus structure rather than a clean voyage WS. Owners often quote tighter on the all-in package when they don't have to take the ballast risk on the back end.",
      },
    ],
  },

  "wafeast-the-slow-re-rating": {
    dek: "Asian buying for crude diet has shifted. What that means for VLCC ballast economics through Q2.",
    blocks: [
      {
        kind: "p",
        text: "The structural change in WAF–East crude flows over the last 18 months is one of those quiet re-ratings the headline TCE numbers don't fully capture. Indian state refiners have absorbed an increasing share of WAF crude — Bonny Light, Forcados, Qua Iboe — at the expense of traditional Mediterranean buyers, and Chinese teapots have re-engaged on heavier WAF grades whenever Atlantic basin diffs widen.",
      },
      { kind: "h2", text: "What this does to ballast economics" },
      {
        kind: "p",
        text: "TD15 (WAF → East) is now reliably running 70–80% of TD3C laden TCE — a ratio that would have looked rich in 2022. The implication for VLCC ballast strategy: the case for ballasting back to MEG after a WAF lift versus repositioning via Singapore is no longer a no-brainer. Owners with flexibility on the next stem are pricing the round-trip blended TCE, not the single-leg.",
      },
      { kind: "h2", text: "Three things to watch" },
      {
        kind: "ul",
        items: [
          "Indian crude slate composition — the Reliance Jamnagar shift toward heavier crude is the single biggest demand pull for WAF in 2026.",
          "Brent–Dubai differential — anything wider than $4 reopens the eastward arb decisively.",
          "Cape route economics — TD15 routes via Cape (vs Suez) are weather-routed; Q2/Q3 Indian Ocean monsoon adds 1.5–2.5 days.",
        ],
      },
    ],
  },

  "td7-nsea-cont-shorthaul-fast-turn-thin-margin": {
    dek: "How Aframax desks build TCE on routes where you live or die on portage and weather windows.",
    blocks: [
      {
        kind: "p",
        text: "TD7 — North Sea → Continent — looks unremarkable on paper: a 14-day round-trip Aframax run at Worldscale levels that rarely make headlines. But this is where short-haul Aframax desks earn their keep. The TCE differential between a smartly-fixed TD7 voyage and a clumsily-fixed one can be $8–12k/day, almost entirely on portage cost discipline and weather window selection.",
      },
      { kind: "h2", text: "Where the margin lives" },
      {
        kind: "ul",
        items: [
          "Portage: Mongstad and Sture pilotage windows are tide-dependent. Missing the slot adds 8–14 hours.",
          "Weather routing: the North Sea–English Channel transit takes 3–5% longer in Q4/Q1 with prevailing wind/sea against.",
          "Discharge sequencing: Rotterdam vs Antwerp vs Wilhelmshaven — pilotage and tug pricing varies materially.",
          "Demurrage: short laytime regimes mean any port slip hits hard.",
        ],
      },
      { kind: "h2", text: "The desk approach" },
      {
        kind: "p",
        text: "We start every TD7 fix with the weather window question, not the WS quote. If the laycan straddles a major weather front, the 12 extra hours of contingency cost almost nothing on the freight idea but eliminate the demurrage exposure. Pair that with a tight discharge port nomination and the TCE/day comes out 10–15% above the published market average.",
      },
    ],
  },

  "g7-price-cap-attestation-the-desklevel-workflow": {
    dek: "What we actually check, what we ask for, and the documentation chain we run on every cap-eligible fixture.",
    blocks: [
      {
        kind: "p",
        text: "The G7 oil price cap regime — in force on Russian-origin crude since December 2022 and on petroleum products since February 2023 — has shifted from a high-level compliance topic to a deck-level workflow item. Every fixture our desk runs that touches Russian molecules requires a documented attestation chain. Here's what that chain looks like in practice.",
      },
      { kind: "h2", text: "What we collect, in order" },
      {
        kind: "ul",
        items: [
          "Tier-1 attestation from the seller — confirming the cargo was acquired at or below the applicable cap.",
          "Letter of attestation in the charter party — owner / disponent owner attests that no Russian-origin cargo above the cap will be carried.",
          "Bill of lading evidencing port of loading and crude grade.",
          "Insurance binder confirming P&I and H&M cover is being provided by an OFAC/OFSI-authorised club / underwriter.",
          "If price evidence is requested by the regulator: invoice or transfer documentation from the seller.",
        ],
      },
      { kind: "h2", text: "Where it goes wrong" },
      {
        kind: "p",
        text: "The two most common failure modes we see: (1) attestation chain gaps when a cargo changes hands intra-voyage — every transfer needs its own attestation, not a re-flagged copy of the original; (2) ambiguous origin documentation on blended grades — CPC Blend, for example, contains Russian-origin volume that the cap regime treats specifically.",
      },
      {
        kind: "callout",
        label: "Desk discipline",
        text: "We don't act on inquiries that fail compliance review. Counterparty screening (OFAC, UK OFSI, EU consolidated, G7 cap eligibility) runs before a freight idea goes back to the charterer.",
      },
      { kind: "h2", text: "What changed in 2025–2026" },
      {
        kind: "ul",
        items: [
          "Cap levels now differ by jurisdiction. The EU and the UK moved to a lower crude cap with an automatic, dynamic mechanism that resets it periodically below the market average, while other G7 members kept their own levels. The attestation must refer to the cap of every regime that applies to the parties involved, at the date of loading.",
          "Transition periods matter. When a cap is lowered, contracts concluded before the change can usually be performed for a limited period. We record the contract date with the attestation so the right cap is applied.",
          "Refined products made from Russian crude are restricted further. From 21 January 2026 the EU also limits imports of products refined from Russian crude in third countries, so clean cargoes bound for Europe need origin evidence for the crude, not only the product.",
          "Shadow-fleet listings keep growing. Each new sanctions package designates more tankers, so we re-screen the ship, not only the counterparties, on the day of fixing.",
        ],
      },
      {
        kind: "callout",
        label: "Before you fix",
        text: "Cap levels and listings change several times a year. We check the current level and the latest designations on the day of each fixture rather than relying on a figure in a note like this one.",
        link: { href: "/compliance", label: "Our compliance screening" },
      },
    ],
  },

  // Gated reports — summary only on the site; full report on request.
  "eu-ets-phase-2-cargo-allocation-who-actually-pays": {
    dek: "With 70% phasing in 2026, the contractual fight has begun. Standard clauses, charterer pushback, and what a fair split looks like.",
    summary:
      "Full report covering the post-phase-2 contractual landscape: BIMCO ETS clause adoption, the three main allocation models (charterer-pays, owner-pays-with-pass-through, time-weighted split), real-world charterer pushback patterns, and our framework for what a defensible split actually looks like for spot, TC, and COA structures.",
    blocks: [
      { kind: "h2", text: "Where the EU ETS stands in 2026" },
      {
        kind: "ul",
        items: [
          "Scope: ships of 5,000 gross tonnage and above carrying cargo or passengers to, from or between EU and EEA ports.",
          "Coverage: 100% of emissions on voyages between EU ports and at berth in EU ports, and 50% of emissions on voyages into or out of the EU.",
          "Phase-in: allowances were due for 40% of 2024 emissions and 70% of 2025 emissions. From 2026, 100% of emissions are covered.",
          "Gases: methane and nitrous oxide are added to CO₂ from 2026, which matters for LNG-fuelled ships.",
          "Deadline: allowances for a year's emissions are surrendered by 30 September of the following year.",
        ],
      },
      { kind: "h2", text: "Who pays" },
      {
        kind: "p",
        text: "The legal obligation sits with the shipping company responsible under the ISM Code, usually the owner or manager. The commercial cost is passed on through the charter party. Under time charters, BIMCO's ETS clause makes the charterer, who decides where the ship goes and how fast, provide the allowances for the emissions during the charter. On voyage charters the cost is normally priced into the freight or charged as a separate surcharge. COAs need a clause that works for every cargo, including ones nominated after the price of allowances has moved.",
      },
      { kind: "h2", text: "FuelEU Maritime" },
      {
        kind: "p",
        text: "Since 1 January 2025, FuelEU Maritime also limits the greenhouse-gas intensity of the energy ships use on EU voyages, with penalties for ships above the limit and the option to pool ships. It is a separate regime from the ETS and needs its own clause; the two should not be handled with one surcharge.",
      },
    ],
  },
};

/** Plain text of a note (dek, summary and blocks) for llms-full.txt, RSS and word counts. */
export function bodyText(body: ReportBody): string {
  const parts: string[] = [];
  if (body.summary) parts.push(body.summary);
  for (const b of body.blocks) {
    switch (b.kind) {
      case "p":
        parts.push(b.text);
        break;
      case "h2":
        parts.push(`## ${b.text}`);
        break;
      case "ul":
        parts.push(b.items.map((i) => `- ${i}`).join("\n"));
        break;
      case "ol":
        parts.push(b.items.map((item, i) => `${i + 1}. ${item}`).join("\n"));
        break;
      case "callout":
        parts.push(`${b.label}: ${b.text}`);
        break;
      case "table":
        parts.push(
          [
            b.caption,
            `| ${b.head.join(" | ")} |`,
            `| ${b.head.map(() => "---").join(" | ")} |`,
            ...b.rows.map((r) => `| ${r.join(" | ")} |`),
          ].join("\n")
        );
        break;
    }
  }
  return parts.join("\n\n");
}
