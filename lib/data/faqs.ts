/**
 * FAQ lists for the home and desk pages. Kept here (not in the pages) so
 * llms-full.txt can publish the same answers the pages show.
 */

export type FaqEntry = { q: string; a: string };

export const HOME_FAQ: FaqEntry[] = [
  {
    q: "What does a tanker or LPG shipbroker do?",
    a: "A shipbroker matches cargoes with ships. We find suitable tonnage (or cargo), negotiate freight and charter party terms for our client, and follow the voyage through to laytime, demurrage and claims settlement.",
  },
  {
    q: "Which ships do you charter?",
    a: "Crude tankers (VLCC, Suezmax, Aframax), product tankers (LR2, LR1, MR) and LPG/ammonia carriers from VLGCs and MGCs down to Handysize and small pressurised ships.",
  },
  {
    q: "Do you broker ammonia and petrochemical gases?",
    a: "Yes. Our LPG desk covers ammonia on MGCs and Handysize ships, and petrochemical gases such as propylene, butadiene and VCM on semi-refrigerated tonnage.",
  },
  {
    q: "How quickly will I hear back?",
    a: "A broker replies within 60 minutes during business hours (Istanbul, London and Singapore). Outside these hours, WhatsApp the desk for live fixtures.",
  },
  {
    q: "Who pays the brokerage commission?",
    a: "Brokerage is normally paid by the shipowner as a percentage of freight or hire, agreed in the charter party. There is no charge to send us an inquiry.",
  },
  {
    q: "Do you act for shipowners or charterers?",
    a: "Both. Our brokers work for charterers, traders and importers looking for ships, and for owners and operators looking for cargoes. On each fixture we make clear which side we represent.",
  },
  {
    q: "Where are your offices?",
    a: "Our headquarters and both desks are in Istanbul, on the Bosphorus. Brokers in London cover the Atlantic basin and brokers in Singapore cover East of Suez, so a desk is open across Asian, European and US Gulf hours.",
  },
];

export const TANKERS_FAQ: FaqEntry[] = [
  {
    q: "Which tanker sizes do you broker?",
    a: "Crude: VLCC (270,000–320,000 dwt), Suezmax (130,000–160,000 dwt) and Aframax/LR2 (80,000–115,000 dwt). Clean: LR1 (55,000–80,000 dwt) and MR (40,000–55,000 dwt).",
  },
  {
    q: "Why use an Istanbul-based tanker broker?",
    a: "Black Sea and CPC cargoes transit the Bosphorus and Dardanelles. Being on the Straits means we price transit timing and waiting realistically and follow the regional charterers and owners every day.",
  },
  {
    q: "How do you handle sanctions and the G7 price cap?",
    a: "Counterparty screening and price-cap attestation checks run before a freight idea goes back to the charterer. We do not work inquiries that fail compliance review.",
  },
  {
    q: "How are tanker freight rates quoted?",
    a: "Spot crude and product voyages are usually quoted in Worldscale points (WS) or as a lump sum. We always show the time-charter equivalent (TCE) so offers can be compared.",
  },
  {
    q: "How do you price Turkish Straits delays on Black Sea voyages?",
    a: "Every Black Sea estimate states the transit waiting days we assume for that ship size, direction and season, plus pilotage, tugs and Montreux dues as separate lines. We also check how the charter party allocates waiting time before you fix.",
  },
  {
    q: "How has the Strait of Hormuz disruption changed tanker chartering?",
    a: "Since March 2026, Middle East Gulf loadings have been severely disrupted and calls need additional war-risk cover. Asian buyers have turned to Atlantic-basin crude, which lengthens voyages. We price war-risk costs, waiting and routing as separate lines and check the war clause on every Gulf-related fixture.",
  },
];

export const LPG_FAQ: FaqEntry[] = [
  {
    q: "What size LPG carriers do you charter?",
    a: "The full range: VLGCs (70,000 cbm and above), MGCs (25,000–50,000 cbm), Handysize gas carriers (15,000–25,000 cbm) and small pressurised or semi-refrigerated ships below 15,000 cbm.",
  },
  {
    q: "How is LPG freight quoted?",
    a: "Spot voyages are usually quoted in US dollars per metric tonne ($/mt). Time charters are quoted per month or per day. We always show the equivalent time-charter earnings (TCE) so offers can be compared.",
  },
  {
    q: "Do you handle ammonia cargoes?",
    a: "Yes. Ammonia moves mainly on fully refrigerated MGCs and on suitable Handysize ships. We check ammonia certification, previous cargoes and terminal requirements before fixing.",
  },
  {
    q: "Can you help with LPG imports into Türkiye?",
    a: "Yes. Our Istanbul LPG desk works with importers and distributors on small and mid-size ships into Turkish terminals, including Bosphorus and Dardanelles transit planning.",
  },
  {
    q: "What is the difference between pressurised, semi-refrigerated and fully refrigerated gas carriers?",
    a: "Fully pressurised ships carry LPG at ambient temperature in pressure tanks and suit small parcels. Semi-refrigerated ships combine pressure and cooling, so they can load from both pressurised and refrigerated terminals and carry petrochemical gases. Fully refrigerated ships, such as MGCs and VLGCs, carry cargo at atmospheric pressure at its boiling point (about −42 °C for propane, −33 °C for ammonia) and move the largest volumes.",
  },
  {
    q: "How do I convert LPG from cubic metres to tonnes?",
    a: "Multiply the volume in cbm by the liquid density of the cargo and by the filling limit. For example, 84,000 cbm of propane at about 0.582 t/m³ and a 98% filling limit is roughly 47,900 tonnes. The free converter on this page does the calculation for propane, butane, ammonia and petrochemical gases.",
  },
];

export const ABOUT_FAQ: FaqEntry[] = [
  {
    q: "When and where was LEVANTER founded?",
    a: "LEVANTER was founded in Istanbul in 2024 by tanker and LPG brokers who wanted a desk built around the Black Sea, the Mediterranean and the Turkish Straits. It now has brokers in Istanbul, London and Singapore.",
  },
  {
    q: "How is a shipbroker paid?",
    a: "Brokers earn a commission, usually a percentage of the freight or hire, which is set out in the charter party and normally paid by the shipowner. Charterers often also receive an address commission. Sending us an inquiry costs nothing.",
  },
  {
    q: "Which languages do your brokers speak?",
    a: "English across the team, and between us Turkish, Russian, Greek, Arabic, French, Danish, Mandarin and Japanese. The site has overview pages in ten languages; detailed pages and the inquiry form are in English.",
  },
  {
    q: "Do you broker dry bulk or containers?",
    a: "No. We broker tankers and gas carriers only: crude and product tankers, and LPG, ammonia and petrochemical gas carriers. Staying narrow is how we keep depth in those markets.",
  },
];
