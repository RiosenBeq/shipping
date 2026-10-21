/**
 * Turkish Straits transit guide (/turkish-straits): the Bosphorus and the
 * Dardanelles from a chartering point of view. Rules are summarised, not
 * quoted; figures are rounded and durable (no tariffs or live queue data).
 */

export const STRAITS_UPDATED = "2026-10-19";

export const STRAITS_FACTS = [
  { k: "Route", v: "Black Sea → Bosphorus → Sea of Marmara → Dardanelles → Aegean" },
  { k: "End to end", v: "Roughly 160 nautical miles" },
  { k: "Bosphorus", v: "About 17 nm long, about 700 m wide at its narrowest" },
  { k: "Dardanelles", v: "About 33 nm long, about 1.2 km wide at its narrowest" },
  { k: "Legal regime", v: "Montreux Convention (1936)" },
  { k: "Traffic control", v: "Turkish Straits Vessel Traffic Service (VTS)" },
] as const;

export const STRAITS_SECTIONS: { id: string; title: string; body: string[]; list?: string[] }[] = [
  {
    id: "why-it-matters",
    title: "Why the Straits matter to a charterer",
    body: [
      "The Bosphorus and the Dardanelles are the Black Sea's only sea link to the rest of the world. Crude from Novorossiysk and the CPC terminal, products from Black Sea refineries, and LPG and ammonia into Türkiye and the Med all pass through them. Every Black Sea voyage therefore carries a transit, usually two.",
      "The passage itself takes hours. The waiting can take days. For a Suezmax on the Black Sea–Med run (the TD6 lane) or a small LPG ship on a short Black Sea voyage, the time spent at anchor waiting to transit can decide whether the voyage makes money, so it belongs in the estimate from the start.",
    ],
  },
  {
    id: "rules",
    title: "The rules that shape a transit",
    body: [
      "Under the Montreux Convention, merchant ships have freedom of passage through the Straits in peacetime, whatever their flag or cargo. Türkiye regulates how they pass: traffic separation, reporting, pilotage and the order in which large ships go through are managed by the Turkish Straits VTS under the Straits' maritime traffic regulations.",
    ],
    list: [
      "Sailing plans: ships report to the VTS before arrival with a first sailing plan (SP-1), normally at least 24 hours ahead and earlier for the largest ships, then confirm with a second report (SP-2) shortly before entering.",
      "Daylight transits: tankers and ships carrying dangerous cargo of 200 m length overall and above pass the Bosphorus in daylight, which in practice covers every Aframax and larger tanker.",
      "Large-ship windows: the VTS can hold traffic, or run it in one direction, while the largest and most hazardous ships pass. Northbound and southbound ships therefore queue in turn.",
      "Pilotage and tugs: for ships in transit the Montreux Convention leaves pilotage and towage optional, but the Turkish authorities strongly recommend a pilot, and a tug escort for large tankers. Pilotage is compulsory for ships calling at or leaving ports in the Straits. Laden tankers almost always take a pilot, and large ones a tug escort.",
      "Suspensions: the VTS stops or restricts traffic in fog, strong currents and storms, and during incidents. Queues build quickly when it does.",
    ],
  },
  {
    id: "waiting",
    title: "What drives waiting time",
    body: [
      "Waiting time depends on the size and cargo of the ship, the direction of travel, the weather and the length of the queue of other large ships. A small ship without dangerous cargo may pass with little delay; a laden Suezmax can wait from several hours to several days.",
    ],
    list: [
      "Season: winter storms and spring and autumn fog cause the longest suspensions.",
      "Ship size and cargo: the daylight rule and one-way windows limit how many large tankers pass each day.",
      "Direction: the queue is often longer in one direction than the other, and the pattern changes daily.",
      "Events: incidents, groundings or security measures can close a strait at short notice.",
      "Paperwork: Türkiye has at times asked tankers for extra proof of insurance before transit, as in December 2022, which built long queues within days.",
    ],
  },
  {
    id: "costs",
    title: "What a transit costs",
    body: [
      "There is no toll for passage. Ships that transit without calling at a Turkish port pay only the dues set by the Montreux Convention for lighthouse, sanitary and life-saving services: a fixed number of gold francs per net ton, converted at a dollar value that Türkiye resets every 1 July. Pilotage, tugs and agency fees are added at the published tariffs when the ship uses them. We price these as separate lines rather than a lump sum, so they can be checked against the agent's account.",
    ],
  },
  {
    id: "charter-party",
    title: "The Straits in the charter party",
    body: [
      "Who pays for waiting time is a contract question, not a weather question. Tanker charters for Black Sea business often include a specific Turkish Straits clause that sets whether time waiting to transit counts as laytime, is paid at the demurrage rate, or is for owners' account. Read it before you fix: the same delay can be worth very different sums under different wordings.",
    ],
    list: [
      "Voyage charters: check whether Straits waiting is excluded from laytime, paid as a separate allowance, or treated as part of the voyage.",
      "Time charters: waiting is normally the charterer's time, so it belongs in the trip estimate and in the hire calculation.",
      "War risk: since the Joint War Committee's circular JWLA-035 of 16 September 2026, the listed area covers almost the whole Black Sea outside the territorial waters of Türkiye, Bulgaria, Romania and Georgia, so most Black Sea voyages must be declared to war-risk underwriters and can carry an additional premium. Attacks on shipping near the Bosphorus in 2026 have made underwriters stricter. Agree who pays the additional premium and crew bonuses.",
      "Documents: make sure insurance certificates and any confirmation letters the Turkish authorities may ask for are on board before the ship arrives.",
    ],
  },
  {
    id: "how-we-use-it",
    title: "How we build the Straits into an estimate",
    body: [
      "Our Istanbul desk sits on the Bosphorus and follows the Straits every day. Every Black Sea freight idea we send states the transit waiting days we have assumed for that ship, direction and season, together with the transit costs and the clause that allocates them. If the queue changes before you fix, we tell you and re-price.",
    ],
  },
];

export const STRAITS_FAQ = [
  {
    q: "How long does it take to transit the Turkish Straits?",
    a: "The passage from the Black Sea to the Aegean, roughly 160 nautical miles through the Bosphorus, the Sea of Marmara and the Dardanelles, takes well under a day of steaming. Waiting time is the variable: from little or none for a small ship to several days for a large laden tanker in bad weather or a long queue.",
  },
  {
    q: "Can large tankers transit the Bosphorus at night?",
    a: "No. Tankers and ships carrying dangerous cargo with a length overall of 200 m or more pass the Bosphorus in daylight, and the VTS may hold or run traffic one way while they pass.",
  },
  {
    q: "Is pilotage compulsory in the Turkish Straits?",
    a: "Not for ships in transit: the Montreux Convention leaves pilotage optional, though the Turkish authorities strongly recommend it. It is compulsory for ships calling at or leaving ports in the Straits. In practice laden tankers almost always take a pilot, and large tankers a tug escort as well.",
  },
  {
    q: "Is there a toll for passing the Bosphorus?",
    a: "There is no toll for passage. Ships transiting without calling at a Turkish port pay the dues set by the Montreux Convention for lighthouse, health and life-saving services, plus pilotage, tugs and agency fees if they use them.",
  },
  {
    q: "Who pays for time waiting to transit the Straits?",
    a: "It depends on the charter party. Many Black Sea tanker charters include a Turkish Straits clause that decides whether waiting time counts as laytime, is paid at the demurrage rate or is for owners' account. Under a time charter, waiting is normally the charterer's time.",
  },
  {
    q: "Does LEVANTER arrange the transit?",
    a: "The ship's agent and the master arrange the transit with the VTS. As brokers, we price the expected waiting and costs into the freight idea, check the charter party clause, and follow the queue from our Istanbul office until the ship is through.",
  },
];
