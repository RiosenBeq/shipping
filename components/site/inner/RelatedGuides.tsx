import Link from "next/link";
import { LinkArrow, Sub } from "@/components/site/inner/ui";
import { FREIGHT_PATH } from "@/lib/freight/constants";

/**
 * The cross-links between the pages that answer one chartering question
 * together: the two desks, the Turkish Straits guide, the freight calculator,
 * compliance, the guides and the inquiry form. Each page leaves itself out.
 * `guides`: contextual links to guides that name this page (lib/guides →
 * guideLinksFor), listed first; a Turkish guide's link carries hrefLang/lang.
 */
const RELATED = [
  { href: "/tankers", label: "Tanker chartering desk" },
  { href: "/lpg", label: "LPG & ammonia desk" },
  { href: "/turkish-straits", label: "Turkish Straits transit guide" },
  { href: FREIGHT_PATH, label: "Freight calculator" },
  { href: "/guides", label: "Chartering guides" },
  { href: "/compliance", label: "Compliance screening" },
  { href: "/contact", label: "Send an inquiry" },
];

export type RelatedLink = { href: string; label: string; lang?: string };

export function RelatedGuides({
  current,
  className,
  guides = [],
}: {
  current?: string;
  className?: string;
  guides?: RelatedLink[];
}) {
  const links: RelatedLink[] = [...guides, ...RELATED].filter((l) => l.href !== current);
  return (
    <nav
      aria-label="Related pages"
      className={className ? `ip-related ${className}` : "ip-related"}
    >
      <Sub>Related</Sub>
      <ul>
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="lv-link"
              {...(l.lang && l.lang !== "en" ? { hrefLang: l.lang, lang: l.lang } : {})}
            >
              <span>{l.label}</span>
              <LinkArrow />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
