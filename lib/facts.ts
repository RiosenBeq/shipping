import { siteConfig } from "./site";
import { TANKER_CLASSES } from "./data/tanker-classes";
import { LPG_CLASSES } from "./data/lpg-classes";

/**
 * "OBM Shipping at a glance": short question-and-answer facts that /about shows
 * and llms.txt / llms-full.txt repeat word for word, so people, search engines
 * and AI answer engines read the same statements. Every fact comes from
 * content/*.json (Site settings, the class pages); nothing here is invented.
 */
export type CompanyFact = { q: string; a: string; href?: string };

const country = (code: string) => (code === "TR" ? "Türkiye" : code);

export function companyFacts(): CompanyFact[] {
  const { name, founded, address, offices, email, desks, phone, whatsappDisplay, hours } =
    siteConfig;
  const branches = offices.filter((o) => o.city !== address.locality);
  return [
    {
      q: `What is ${name}?`,
      a: `${name} is a tanker and LPG shipbroker (chartering broker) founded in ${address.locality} in ${founded}. It has two desks: tankers (crude oil and clean petroleum products) and LPG & ammonia (LPG, ammonia and petrochemical gases).`,
      href: "/about",
    },
    {
      q: `Where is ${name} based?`,
      a: `Headquarters: ${address.street}, ${address.postalCode} ${address.locality}, ${country(address.country)}.${
        branches.length
          ? ` Brokers also work from ${branches.map((o) => `${o.city} (${o.role})`).join(" and ")}.`
          : ""
      }`,
      href: "/contact",
    },
    {
      q: "What does it charter, and on which terms?",
      a: "Spot voyages, time charters and contracts of affreightment (COA), plus post-fixture work (laytime, demurrage and claims), for charterers and shipowners.",
      href: "/tankers",
    },
    {
      q: "Which ship classes does it cover?",
      a: `Tankers: ${TANKER_CLASSES.map((t) => t.shortName).join(", ")}. Gas carriers: ${LPG_CLASSES.map((c) => c.name).join(", ")}.`,
      href: "/lpg",
    },
    {
      q: "Which markets is it strongest in?",
      a: "It fixes worldwide. Its specialities are the Turkish Straits and the Black Sea, and small pressurised and semi-refrigerated LPG carriers in the Mediterranean and Türkiye.",
      href: "/turkish-straits",
    },
    {
      q: "How do I reach the desk?",
      a: `Email ${email} (tankers: ${desks.tankers.email}; LPG & ammonia: ${desks.lpg.email}), call ${phone} or WhatsApp ${whatsappDisplay}. A broker replies within 60 minutes during business hours (${hours}).`,
      href: "/contact",
    },
  ];
}
