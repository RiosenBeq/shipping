import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { GasCarrierArt, PressurisedGasArt } from "@/components/site/VesselArt";
import { ClassGuide } from "@/components/site/inner/ClassGuide";
import { BtnLabel, LinkArrow } from "@/components/site/inner/ui";
import { FREIGHT_PATH } from "@/lib/freight/constants";
import { StageProvider, type ShipClassSlug } from "@/components/site/stage";
import { getPost, toCard } from "@/lib/blog/posts";
import type { PostCardData } from "@/lib/blog/meta";
import { relatedReports } from "@/lib/data/research";
import { LPG_CLASSES, getLpgClassBySlug } from "@/lib/data/lpg-classes";
import type { StillKey } from "@/lib/media";
import { buildPageMetadata, serviceLd, webPageLd } from "@/lib/seo";
import { lpgClassInquiryHref } from "@/lib/inquiry";
import { siteConfig } from "@/lib/site";

type Params = { params: { class: string } };

export function generateStaticParams() {
  return LPG_CLASSES.map((c) => ({ class: c.slug }));
}
// Unknown slugs render on demand and hit notFound() (the styled 404); with two
// root layouts, `dynamicParams = false` would serve Next's unstyled default.

function copy(slug: string) {
  const c = getLpgClassBySlug(slug)!;
  return {
    title: `${c.name} Chartering — ${c.longName}`,
    description: `${c.name} chartering from LEVANTER's LPG desk: ${c.capacity.split(" — ")[0].toLowerCase()}; ${c.cargoes
      .slice(0, 3)
      .join(", ")
      .toLowerCase()}. Spot, time charter and COA.`,
  };
}

export function generateMetadata({ params }: Params): Metadata {
  const c = getLpgClassBySlug(params.class);
  // Unknown slug: notFound() here too, so the head gets the not-found title and
  // noindex. Keep this route free of a loading.tsx (here or above): a Suspense
  // boundary over the page turns its notFound() into HTTP 200 instead of 404.
  if (!c) notFound();
  const { title, description } = copy(c.slug);
  return buildPageMetadata({
    title,
    description,
    path: `/lpg/${c.slug}`,
    keywords: [
      `${c.name} chartering`,
      `${c.name} broker`,
      `${c.name} charter rates`,
      `${c.longName}`,
      "LPG shipbroker",
      ...c.cargoes.slice(0, 3).map((x) => `${x} shipping`),
    ],
  });
}

/**
 * A graded still per class (lib/media.ts), captioned with what is actually on screen — the
 * licensed footage has no gas carrier at sea, so the captions never claim one.
 */
const STILL: Record<string, { still: StillKey; caption: string }> = {
  vlgc: { still: "lpgDeck", caption: "Gas carrier deck: piping and vent masts" },
  mgc: { still: "lpgDeck", caption: "Gas carrier deck: piping and vent masts" },
  handysize: { still: "portDusk", caption: "Harbour basin at dusk" },
  pressurised: { still: "galata", caption: "Istanbul waterfront, Golden Horn" },
};

export default function LpgClassPage({ params }: Params) {
  const c = getLpgClassBySlug(params.class);
  if (!c) notFound();
  const { title, description } = copy(c.slug);
  const i = LPG_CLASSES.findIndex((o) => o.slug === c.slug);
  const next = LPG_CLASSES[(i + 1) % LPG_CLASSES.length];
  const others = LPG_CLASSES.filter((o) => o.slug !== c.slug);
  // Pressurised coasters carry cylindrical deck tanks, not a refrigerated trunk deck.
  const Art = c.slug === "pressurised" ? PressurisedGasArt : GasCarrierArt;
  // Inquiries from this page arrive with the ship size preselected, and the
  // cargo too where the class mainly trades LPG (MGC/Handysize: visitor picks).
  const inquiry = lpgClassInquiryHref(c.slug);
  const notes = relatedReports("lpg", [c.name, ...c.routes.map((r) => r.code)])
    .map((r) => getPost(r.slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map(toCard) satisfies PostCardData[];
  const still = STILL[c.slug] ?? STILL.vlgc;
  const [size, sizeNote] = c.capacity.split(" — ");

  return (
    <div className="ip-page">
      <JsonLd
        data={[
          webPageLd({ title, description, path: `/lpg/${c.slug}` }),
          serviceLd({
            name: `${c.name} chartering`,
            description,
            serviceType: `${c.longName} chartering`,
            path: `/lpg/${c.slug}`,
          }),
        ]}
      />
      <StageProvider plates={["P-lines", "V-ocean"]} />

      <ClassGuide
        slug={c.slug as ShipClassSlug}
        crumbs={[
          { name: "LPG & Ammonia", path: "/lpg" },
          { name: c.name, path: `/lpg/${c.slug}` },
        ]}
        sub={c.longName}
        title={`${c.name} chartering`}
        band={`LPG · ${size}`}
        lead={c.intro}
        name={c.name}
        actions={
          <>
            <Link href={inquiry} className="lv-btn lv-btn--cta">
              <BtnLabel>Request {c.name} tonnage</BtnLabel>
            </Link>
            <a
              href={`mailto:${siteConfig.desks.lpg.email}?subject=${encodeURIComponent(`${c.name} inquiry`)}`}
              className="lv-btn lv-btn--ghost"
            >
              <Mail aria-hidden="true" />
              <span>Email the LPG desk</span>
            </a>
            <Link href={`${FREIGHT_PATH}?class=${c.slug}`} className="lv-link">
              <span>Estimate a voyage for this class</span>
              <LinkArrow />
            </Link>
          </>
        }
        facts={[
          { label: "Size", value: size, ...(sizeNote ? { small: sizeNote } : {}) },
          { label: "Cargoes", value: c.cargoes.slice(0, 3).join(", "), small: c.typicalCargo },
          {
            label: "Main routes",
            value: c.routes.map((r) => r.code).join(" · "),
            small: c.routes[0]?.lane,
          },
          { label: "What to watch", value: c.watchpoints[0]?.title ?? "—" },
        ]}
        specs={[
          { k: "Capacity", v: c.capacity },
          { k: "Containment", v: c.containment },
          { k: "Typical cargo", v: c.typicalCargo },
          { k: "Cargoes", v: c.cargoes.join(", ") },
        ]}
        art={<Art />}
        routesTitle={`Key ${c.name} trades.`}
        routes={c.routes}
        chipsTitle="Main trades"
        chips={c.trades}
        watch={c.watchpoints}
        charterShape={c.charterShape}
        desk={c.desk}
        still={still.still}
        stillCaption={still.caption}
        faqTitle={`${c.name} questions.`}
        faq={c.faq}
        notesTitle={`Notes for ${c.name} charterers.`}
        notes={notes}
        othersTitle="Other gas carrier sizes"
        others={others.map((o) => ({
          href: `/lpg/${o.slug}`,
          name: o.name,
          size: o.capacity.split(" — ")[0],
        }))}
        next={{ href: `/lpg/${next.slug}`, name: next.name }}
        inquiry={inquiry}
        letter={{
          title: `Looking for ${c.ctaNoun}?`,
          text: "Send the cargo, ports and laycan — or your open position. The LPG desk replies within 60 minutes during business hours.",
          email: siteConfig.desks.lpg.email,
        }}
      />
    </div>
  );
}
