import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = false;

/**
 * Serves /humans.txt per https://humanstxt.org/
 * — credits the people, the stack, and the design language behind the site.
 */
export function GET() {
  const body = `/* TEAM */
  Brokerage: ${siteConfig.legalEntity}
  Headquarters: ${siteConfig.address.locality}, ${siteConfig.address.country}
  Site: ${siteConfig.url}
  Contact: ${siteConfig.email}

/* OFFICES */
${siteConfig.offices.map((o) => `  ${o.city} — ${o.role}`).join("\n")}

/* THANKS */
  Design system: Premium Maritime palette
  Voyage estimator engine: in-house calc + Worldscale flat rates
  Open source: Next.js, React, Radix UI, Tailwind CSS, Zod, lucide-react

/* SITE */
  Last update: ${new Date().toISOString().slice(0, 10)}
  Language: English
  Doctype: HTML5
  Standards: WCAG 2.1 AA target, RFC 9116 security.txt, llmstxt.org
  Components: shadcn/ui-style primitives on Radix UI
  Software: Next.js 14 App Router, TypeScript, deployed on Vercel
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
