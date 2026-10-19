import { siteConfig } from "@/lib/site";
import { BROKERS } from "@/lib/data/brokers";
import { LOCALES } from "@/lib/i18n";

export const dynamic = "force-static";
export const revalidate = false;

/**
 * Serves /humans.txt per https://humanstxt.org/: the people, offices and
 * stack behind the site.
 */
export function GET() {
  const body = `/* TEAM */
  Brokerage: ${siteConfig.legalEntity}
  Headquarters: ${siteConfig.address.locality}, Türkiye
  Brokers: ${BROKERS.length}, see ${siteConfig.url}/brokers
  Contact: ${siteConfig.email}

/* OFFICES */
${siteConfig.offices.map((o) => `  ${o.city}: ${o.role}`).join("\n")}

/* THANKS */
  UI components: Uiverse.io community (MIT), adapted to the navy & brass palette
  Open source: Next.js, React, Tailwind CSS, Zod, lucide-react

/* SITE */
  Last update: ${siteConfig.contentUpdated}
  Language: English; overview pages in ${LOCALES.map((l) => l.label).join(", ")}
  Doctype: HTML5
  Standards: WCAG 2.1 AA target, schema.org JSON-LD, RFC 9116 security.txt, llmstxt.org
  Software: Next.js 14 App Router, TypeScript, deployed on Vercel
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
