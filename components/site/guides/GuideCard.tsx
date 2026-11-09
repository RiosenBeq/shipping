import Link from "next/link";
import { formatGuideDate, GUIDE_UI } from "@/lib/guides/meta";
import type { Guide } from "@/lib/guides/guides";

/** A guide on the hub or under "Related guides": title (the link), lead and meta line. */
export function GuideCard({ guide, headingLevel = 3 }: { guide: Guide; headingLevel?: 2 | 3 }) {
  const ui = GUIDE_UI[guide.lang];
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <li className="ip-panel gd-card" lang={guide.lang}>
      <p className="t-label acc">{guide.kind === "landing" ? ui.landing : ui.guide}</p>
      <H>
        <Link href={guide.href} hrefLang={guide.lang}>
          {guide.title}
        </Link>
      </H>
      <p>{guide.dek}</p>
      <p className="gd-card__meta">
        <span>
          {ui.reviewed}{" "}
          <time dateTime={guide.updated}>{formatGuideDate(guide.updated, guide.lang)}</time>
        </span>
        <span>
          {guide.readingTime} {ui.read}
        </span>
      </p>
    </li>
  );
}
