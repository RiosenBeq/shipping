/**
 * Sanctions and compliance screening (/compliance). Describes the workflow,
 * not cap levels or list contents, which change too often to publish.
 */

export const COMPLIANCE_UPDATED = "2026-10-19";

export const SCREENING: { title: string; intro: string; checks: string[] }[] = [
  {
    title: "Counterparties",
    intro: "Every company on both sides of the fixture, and the people who own or control them.",
    checks: [
      "Owners, disponent owners, managers, charterers, shippers and receivers",
      "OFAC (US), OFSI and the UK consolidated list, the EU consolidated list and UN Security Council lists",
      "Ownership and control: companies owned 50% or more by listed parties are treated as listed",
      "Adverse media and links to sanctioned jurisdictions",
    ],
  },
  {
    title: "The ship",
    intro: "Ship-specific designations and the warning signs of deceptive shipping practices.",
    checks: [
      "IMO number against ship designation lists, including recent shadow-fleet listings",
      "Flag, name and ownership history, and recent flag changes",
      "Class society and P&I cover, and whether the insurer is reputable and able to pay",
      "AIS gaps, unexplained ship-to-ship transfers and calls in high-risk areas",
    ],
  },
  {
    title: "The cargo",
    intro: "Where the cargo comes from, and what the price-cap and origin rules require.",
    checks: [
      "Origin of the crude, product or gas, and of the crude behind a refined product",
      "Price-cap attestations under every regime that applies to the parties",
      "Contract dates, for transition periods when a cap level changes",
      "Bills of lading and certificates of origin consistent with the voyage",
    ],
  },
  {
    title: "The voyage",
    intro: "Ports, routes and areas that change the legal or insurance position.",
    checks: [
      "Load and discharge ports in sanctioned or restricted locations",
      "War-risk listed areas, such as the Gulf and Strait of Hormuz and parts of the Black Sea",
      "Additional insurance and documents needed for the route, including the Turkish Straits",
      "Clauses that allocate sanctions, war-risk and regulatory costs",
    ],
  },
];

export const COMPLIANCE_STEPS = [
  {
    title: "Screen before we offer",
    text: "Screening runs before a ship or cargo is offered to the other side, not after main terms.",
  },
  {
    title: "Re-screen on the day",
    text: "Lists change several times a month, so we screen again on the day of fixing and before loading.",
  },
  {
    title: "Ask for documents",
    text: "Where a check needs evidence, such as an attestation or voyage history, we ask for it in writing.",
  },
  {
    title: "Decline what fails",
    text: "If a party, ship or cargo fails review, we do not work the inquiry, and we tell you why where the law allows.",
  },
];

export const COMPLIANCE_FAQ = [
  {
    q: "Which sanctions lists do you screen against?",
    a: "The US OFAC lists, the UK consolidated list maintained by OFSI, the EU consolidated list and UN Security Council lists, together with ship designations and price-cap rules in each regime that applies to the parties.",
  },
  {
    q: "Do you screen ships as well as companies?",
    a: "Yes. We check the IMO number against ship designations and look at flag, name and ownership history, insurance, AIS gaps and ship-to-ship transfers, because a clean company can still offer a ship that is listed or high risk.",
  },
  {
    q: "How do you handle the oil price cap?",
    a: "We collect attestations for every price-cap regime that applies, record the contract date for transition periods, and confirm the cap level in force on the day of fixing instead of relying on a published figure.",
  },
  {
    q: "Does screening slow down my inquiry?",
    a: "For known counterparties and ships, screening runs within our 60-minute first reply. New counterparties, or cases that need documents, can take longer; we tell you what is outstanding.",
  },
  {
    q: "What happens if a party fails screening?",
    a: "We do not work the inquiry. Where the law allows, we explain which check failed so you can decide how to proceed.",
  },
];
