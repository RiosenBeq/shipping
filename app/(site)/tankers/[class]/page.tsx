import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { ClassGuide } from "@/components/site/inner/ClassGuide";
import { BtnLabel, LinkArrow } from "@/components/site/inner/ui";
import { FREIGHT_PATH } from "@/lib/freight/constants";
import { StageProvider, type ShipClassSlug } from "@/components/site/stage";
import { getPost, toCard } from "@/lib/blog/posts";
import type { PostCardData } from "@/lib/blog/meta";
import { relatedReports } from "@/lib/data/research";
import {
  TANKER_CLASSES,
  getTankerClassBySlug,
  type TankerClassData,
} from "@/lib/data/tanker-classes";
import type { StillKey } from "@/lib/media";
import { DESK_EXTRAS, buildPageMetadata, fitDescription, serviceLd, webPageLd } from "@/lib/seo";
import { VESSEL_BY_CLASS, inquiryHref } from "@/lib/inquiry";
import { siteConfig } from "@/lib/site";
import { ICON_STROKE } from "@/components/site/iconStroke";

type Params = { params: { class: string } };

export function generateStaticParams() {
  return TANKER_CLASSES.map((t) => ({ class: t.slug }));
}
// Unknown slugs render on demand and hit notFound() (the styled 404); with two
// root layouts, `dynamicParams = false` would serve Next's unstyled default.

function copy(t: TankerClassData) {
  const family = t.family === "crude" ? "crude tanker" : "product tanker";
  return {
    title: `${t.shortName} Chartering — ${t.longName}`,
    description: fitDescription(
      `${t.shortName} ${family} chartering (${t.dwtRange}). Key routes ${t.routes
        .map((r) => r.code)
        .join(", ")}. Spot, time charter and COA from ${siteConfig.name}'s tanker desk.`,
      DESK_EXTRAS
    ),
  };
}

/** "an Aframax", "a VLCC": the class name with its article, for running copy. */
const withArticle = (t: TankerClassData) => `${t.article} ${t.shortName}`;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function faqFor(t: TankerClassData) {
  return [
    {
      q: `What size is ${withArticle(t)} tanker?`,
      a: `${capitalize(withArticle(t))} is typically ${t.dwtRange}, around ${t.loa} long with a ${t.draft} draft, carrying ${t.cargoCapacity}.`,
    },
    {
      q: `Which routes do ${t.plural} trade?`,
      a: `Key ${t.shortName} benchmarks include ${t.routes
        .map((r) => `${r.code} (${r.lane})`)
        .join(", ")}.`,
    },
    {
      q: `How are ${t.shortName} charters usually fixed?`,
      a: t.charterShape,
    },
  ];
}

export function generateMetadata({ params }: Params): Metadata {
  const t = getTankerClassBySlug(params.class);
  // Unknown slug: notFound() here too, so the head gets the not-found title and
  // noindex. Keep this route free of a loading.tsx (here or above): a Suspense
  // boundary over the page turns its notFound() into HTTP 200 instead of 404.
  if (!t) notFound();
  const { title, description } = copy(t);
  return buildPageMetadata({
    title,
    description,
    path: `/tankers/${t.slug}`,
    keywords: [
      `${t.shortName} chartering`,
      `${t.shortName} broker`,
      `${t.shortName} charter rates`,
      t.longName,
      ...t.routes.map((r) => `${r.code} ${r.lane}`),
    ],
  });
}

/**
 * A graded still per class (lib/media.ts), captioned with what is actually on screen — the
 * licensed footage shows tankers, not necessarily this size.
 */
const STILL: Record<string, { still: StillKey; caption: string }> = {
  vlcc: { still: "tankerFleet", caption: "Tankers at anchor, from the air" },
  suezmax: { still: "tankerBow", caption: "Tanker at anchor, more on the horizon" },
  aframax: { still: "tankerAtAnchor", caption: "Laden tanker at anchor" },
  lr1: { still: "portDusk", caption: "Harbour basin at dusk" },
  mr: { still: "tankerBow", caption: "Tanker at anchor, more on the horizon" },
};

export default function TankerClassPage({ params }: Params) {
  const t = getTankerClassBySlug(params.class);
  if (!t) notFound();
  const { title, description } = copy(t);
  const i = TANKER_CLASSES.findIndex((o) => o.slug === t.slug);
  const next = TANKER_CLASSES[(i + 1) % TANKER_CLASSES.length];
  const others = TANKER_CLASSES.filter((o) => o.slug !== t.slug);
  // Inquiries from this page arrive with the cargo and ship size preselected.
  const inquiry = inquiryHref({ segment: t.family, vessel: VESSEL_BY_CLASS[t.slug] });
  const notes = relatedReports("tankers", [t.shortName, ...t.routes.map((r) => r.code)])
    .map((r) => getPost(r.slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map(toCard) satisfies PostCardData[];
  const still = STILL[t.slug] ?? STILL.vlcc;

  return (
    <div className="ip-page">
      <JsonLd
        data={[
          webPageLd({ title, description, path: `/tankers/${t.slug}` }),
          serviceLd({
            name: `${t.shortName} chartering`,
            description,
            serviceType:
              t.family === "crude" ? "Crude tanker chartering" : "Product tanker chartering",
            path: `/tankers/${t.slug}`,
          }),
        ]}
      />
      <StageProvider plates={["P-lines", "V-ocean"]} />

      <ClassGuide
        slug={t.slug as ShipClassSlug}
        crumbs={[
          { name: "Tankers", path: "/tankers" },
          { name: t.shortName, path: `/tankers/${t.slug}` },
        ]}
        sub={t.longName}
        title={`${t.shortName} chartering`}
        band={`${t.family === "crude" ? "Crude" : "Clean"} · ${t.dwtRange} · ${t.loa} LOA`}
        lead={t.intro}
        name={t.shortName}
        actions={
          <>
            <Link href={inquiry} className="lv-btn lv-btn--cta">
              <BtnLabel>Request {t.shortName} tonnage</BtnLabel>
            </Link>
            <a
              href={`mailto:${siteConfig.desks.tankers.email}?subject=${encodeURIComponent(`${t.shortName} inquiry`)}`}
              className="lv-btn lv-btn--ghost"
            >
              <Mail aria-hidden="true" strokeWidth={ICON_STROKE.inline} />
              <span>Email the tanker desk</span>
            </a>
            <Link href={`${FREIGHT_PATH}?class=${t.slug}`} className="lv-link">
              <span>Estimate a voyage for this class</span>
              <LinkArrow />
            </Link>
          </>
        }
        facts={[
          { label: "Size", value: t.dwtRange, small: t.cargoCapacity },
          {
            label: "Cargoes",
            value: t.family === "crude" ? "Crude oil and fuel oil" : "Clean products",
            small: t.family === "crude" ? "Dirty tanker" : "Coated tanker",
          },
          {
            label: "Main routes",
            value: t.routes.map((r) => r.code).join(" · "),
            small: t.routes[0]?.lane,
          },
          { label: "What to watch", value: t.keyTrends[0]?.title ?? "—" },
        ]}
        specs={[
          { k: "Deadweight", v: t.dwtRange },
          { k: "Cargo", v: t.cargoCapacity },
          { k: "LOA / beam", v: `${t.loa} / ${t.beam}` },
          { k: "Draft", v: t.draft },
          { k: "Speed", v: t.speed },
          { k: "Consumption", v: t.consumption },
        ]}
        routesTitle={`Key ${t.shortName} lanes.`}
        routes={t.routes}
        chipsTitle="Typical charterers"
        chips={t.marketsServed}
        watch={t.keyTrends}
        charterShape={t.charterShape}
        desk={t.desk}
        still={still.still}
        stillCaption={still.caption}
        faqTitle={`${t.shortName} questions.`}
        faq={faqFor(t)}
        notesTitle={`Notes for ${t.shortName} charterers.`}
        notes={notes}
        othersTitle="Other tanker sizes"
        others={others.map((o) => ({
          href: `/tankers/${o.slug}`,
          name: o.shortName,
          size: `${o.family === "crude" ? "Crude" : "Clean"} · ${o.dwtRange}`,
        }))}
        next={{ href: `/tankers/${next.slug}`, name: next.shortName }}
        inquiry={inquiry}
        letter={{
          title: `Looking for ${withArticle(t)}?`,
          text: "Send the cargo, ports and laycan — or your open position. The tanker desk replies within 60 minutes during business hours.",
          email: siteConfig.desks.tankers.email,
        }}
      />
    </div>
  );
}
