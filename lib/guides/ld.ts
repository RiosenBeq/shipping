/**
 * JSON-LD for the guides (/guides and /guides/[slug]), built here so the pages
 * and the tests use the same objects. The page components add the rest:
 * BreadcrumbList (PageHeader → Crumbs) and FAQPage (Faq).
 */
import { getBroker } from "@/lib/data/brokers";
import { articleLd, serviceLd, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import type { Guide } from "./guides";
import { GUIDES_PATH } from "./meta";

const SERVICE_TYPE = {
  tankers: "Tanker chartering (shipbroking)",
  lpg: "LPG and ammonia carrier chartering (shipbroking)",
} as const;

export const guideSection = (g: Pick<Guide, "kind">) =>
  g.kind === "landing" ? "Chartering desk" : "Chartering guide";

/** WebPage + Article (TechArticle for how-to guides) + Service on desk landing pages. */
export function guideJsonLd(g: Guide): object[] {
  const article = articleLd({
    title: g.title,
    description: g.description,
    path: g.href,
    datePublished: g.published,
    dateModified: g.updated,
    section: guideSection(g),
    author: g.author ? getBroker(g.author.name) : undefined,
    keywords: [g.query, ...g.keywords],
    text: g.text,
    type: g.kind === "guide" ? "TechArticle" : "Article",
  });
  return [
    webPageLd({
      title: g.seoTitle ?? g.title,
      description: g.description,
      path: g.href,
      lang: g.lang,
      dateModified: g.updated,
    }),
    { ...article, inLanguage: g.lang },
    ...(g.kind === "landing"
      ? [
          serviceLd({
            name: g.title,
            description: g.description,
            serviceType: SERVICE_TYPE[g.desk],
            path: g.href,
          }),
        ]
      : []),
  ];
}

const url = (path: string) => new URL(path, siteConfig.url).toString();

/** The hub: a CollectionPage and an ItemList of every guide, in the order shown. */
export function guidesHubJsonLd(
  guides: Guide[],
  { title, description }: { title: string; description: string }
): object[] {
  return [
    webPageLd({
      title,
      description,
      path: GUIDES_PATH,
      type: "CollectionPage",
      ...(guides.length
        ? { dateModified: guides.reduce((max, g) => (g.updated > max ? g.updated : max), "") }
        : {}),
    }),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${url(GUIDES_PATH)}#guides`,
      itemListElement: guides.map((g, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: url(g.href),
        name: g.title,
      })),
    },
  ];
}
