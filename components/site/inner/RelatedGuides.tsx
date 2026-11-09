import Link from "next/link";
import { LinkArrow, Sub } from "@/components/site/inner/ui";
import { FREIGHT_PATH } from "@/lib/freight/constants";

/**
 * The cross-links between the pages that answer one chartering question
 * together: the two desks, the Turkish Straits guide, the freight calculator,
 * compliance and the inquiry form. Each page leaves itself out.
 */
const RELATED = [
  { href: "/tankers", label: "Tanker chartering desk" },
  { href: "/lpg", label: "LPG & ammonia desk" },
  { href: "/turkish-straits", label: "Turkish Straits transit guide" },
  { href: FREIGHT_PATH, label: "Freight calculator" },
  { href: "/compliance", label: "Compliance screening" },
  { href: "/contact", label: "Send an inquiry" },
];

export function RelatedGuides({ current, className }: { current?: string; className?: string }) {
  return (
    <nav
      aria-label="Related pages"
      className={className ? `ip-related ${className}` : "ip-related"}
    >
      <Sub>Related</Sub>
      <ul>
        {RELATED.filter((l) => l.href !== current).map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="lv-link">
              <span>{l.label}</span>
              <LinkArrow />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
