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
  | { kind: "callout"; label: string; text: string };

export type ReportBody = {
  /** One-sentence dek under the title. */
  dek: string;
  /** Summary shown on the site for gated reports. */
  summary?: string;
  blocks: ReportBlock[];
};

export const REPORT_BODIES: Record<string, ReportBody> = {
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
        kind: "p",
        text: "TD3C — the Worldscale code for the MEG → China VLCC voyage — is the single most-fixed long-haul tanker route in the world. Roughly 38% of all VLCC fixtures touch some version of this lane on a typical month. And yet a surprising number of charterers we work with don't have a clean handle on the four loading patterns and how each one prices.",
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
    ],
  },

  // Gated reports — summary only on the site; full report on request.
  "eu-ets-phase-2-cargo-allocation-who-actually-pays": {
    dek: "With 70% phasing in 2026, the contractual fight has begun. Standard clauses, charterer pushback, and what a fair split looks like.",
    summary:
      "Full report covering the post-phase-2 contractual landscape: BIMCO ETSA clause adoption, the three main allocation models (charterer-pays, owner-pays-with-pass-through, time-weighted split), real-world charterer pushback patterns, and our framework for what a defensible split actually looks like for spot, TC, and COA structures.",
    blocks: [],
  },
};
