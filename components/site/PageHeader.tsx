import Link from "next/link";
import {
  PauseMotion,
  StageAperture,
  StageWindow,
  calm,
  type PlateId,
} from "@/components/site/stage";
import { proceduralStatics } from "@/lib/media";
import { breadcrumbsLd, type Crumb } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { JsonLd } from "./JsonLd";
import { Glows, Sub } from "./inner/ui";

/** Breadcrumb trail (mono, DESIGN-V2 §10) plus its BreadcrumbList JSON-LD. Home is prepended. */
export function Crumbs({ crumbs, className }: { crumbs: Crumb[]; className?: string }) {
  const trail: Crumb[] = [{ name: "Home", path: "/" }, ...crumbs];
  return (
    <>
      <JsonLd data={breadcrumbsLd(trail)} />
      <nav aria-label="Breadcrumb" className={cn("ip-crumbs print:hidden", className)}>
        <ol>
          {trail.map((c, i) => (
            <li key={c.path + i}>
              {i < trail.length - 1 ? (
                <Link href={c.path}>{c.name}</Link>
              ) : (
                <span aria-current="page">{c.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

/** The P-bathy plate at rest: the static contour field baked from the live shader. */
export function BathyPicture({ className }: { className?: string }) {
  const b = proceduralStatics.bathy;
  return (
    <picture className={className}>
      <source media="(max-aspect-ratio: 4/5)" type="image/avif" srcSet={b.avifPortrait} />
      <source media="(max-aspect-ratio: 4/5)" type="image/webp" srcSet={b.webpPortrait} />
      <source type="image/avif" srcSet={b.avif} />
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative static plate */}
      <img src={b.webp} alt="" width={b.width} height={b.height} decoding="async" />
    </picture>
  );
}

type Props = {
  /** The "— Sub" line above the h1. */
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** Breadcrumb trail, excluding Home. Also emitted as BreadcrumbList JSON-LD. */
  crumbs?: Crumb[];
  /** Kept for older callers: the masthead is always night now. */
  tone?: "light" | "dark";
  /** A row under the heading (chips, a date pill, buttons). */
  children?: React.ReactNode;
  childrenClassName?: string;
  /** Replaces the lead column on the end side (desktop). */
  aside?: React.ReactNode;
  /** One size down for long titles. */
  long?: boolean;
  className?: string;
};

/**
 * Small night masthead over static contours (DESIGN-V2 §10: glossary, compliance, privacy,
 * terms, team): breadcrumbs, "— Sub", the page's only <h1>, the lead on the end side. The
 * paper card that follows (`<Card className="ip-card ip-card--over">`) rides up over its
 * bottom edge. No stage: these pages load no video and no WebGL.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  crumbs,
  children,
  childrenClassName,
  aside,
  long = false,
  className,
}: Props) {
  const end = aside ?? (lead ? <p className="t-lead">{lead}</p> : null);
  return (
    <section
      data-ground="dark"
      data-header-overlay=""
      aria-labelledby="page-title"
      className={cn("ip-mast", className)}
    >
      <BathyPicture className="ip-mast__art" />
      <Glows />
      <div className="ip-wrap">
        {crumbs && crumbs.length > 0 && <Crumbs crumbs={crumbs} />}
        <div className={cn("ip-mast__grid", !end && "ip-mast__grid--solo")}>
          <div>
            {eyebrow && <Sub className="ip-rise">{eyebrow}</Sub>}
            <h1
              id="page-title"
              className={cn("t-display ip-rise ip-rise--2", long && "ip-display--long")}
            >
              {title}
            </h1>
          </div>
          {end && <div className="ip-rise ip-rise--3 pb-1">{end}</div>}
        </div>
        {children && (
          <div className={cn("ip-mast__after ip-rise ip-rise--4", childrenClassName)}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

/** Aperture geometry: inset 12 → 38px and radius 28 → 36px as the next card rises. */
const OUT = "max(0, (var(--stage-out, 0) - 0.25) / 0.75)";
const AP_INSET = `calc(var(--ip-inset) + 26px * ${OUT})`;
const AP_RADIUS = `calc(var(--ip-r) + 8px * ${OUT})`;

/**
 * Window hero over a stage plate (DESIGN-V2 §10: desk hubs, Turkish Straits): an aperture
 * inset 12px / radius 28px that opens wider as the page scrolls on, mono breadcrumbs, "— Sub",
 * the h1, then the lead and actions bottom-left and the scene label + Pause motion
 * bottom-right. Copy blocks are calm zones. Mount `<StageProvider plates={[plate, …]}/>` first.
 */
export function StageHero({
  plate,
  id = "hero",
  crumbs,
  sub,
  title,
  long = false,
  lead,
  actions,
  meta,
  tall = false,
  bright = false,
  className,
}: {
  plate: PlateId;
  id?: string;
  crumbs?: Crumb[];
  sub?: string;
  title: React.ReactNode;
  long?: boolean;
  lead?: React.ReactNode;
  actions?: React.ReactNode;
  /** Bottom-right scene label, e.g. { label: "Tanker desk", coords: "41°02.6′N 029°00.5′E" }. */
  meta?: { label: string; coords?: string };
  tall?: boolean;
  /** A bright plate (V-strait's day grade): stronger calm zones and scrim, a calm under the label. */
  bright?: boolean;
  className?: string;
}) {
  const k = bright ? 0.55 : undefined;
  return (
    <StageWindow
      plate={plate}
      id={id}
      aria-labelledby="page-title"
      data-header-overlay=""
      className={cn("ip-hero", tall && "ip-hero--tall", className)}
    >
      <StageAperture inset={AP_INSET} radius={AP_RADIUS} />
      <div
        className={cn("ip-hero__scrim", bright && "ip-hero__scrim--strong")}
        aria-hidden="true"
        style={{ inset: AP_INSET, borderRadius: AP_RADIUS }}
      />
      <div className="ip-wrap">
        {/* One calm zone per line group, each hugging its words: a single zone round the
            whole head would darken the empty plate beside the short crumbs and sub line. */}
        <div className="ip-hero__head">
          {crumbs && crumbs.length > 0 && (
            <div {...calm(k)} className="ip-hero__calm ip-hero__crumbs">
              <Crumbs crumbs={crumbs} />
            </div>
          )}
          {sub && (
            <div {...calm(k)} className="ip-hero__calm">
              <Sub className="ip-rise">{sub}</Sub>
            </div>
          )}
          <h1
            {...calm(k)}
            id="page-title"
            className={cn("t-display ip-rise ip-rise--2", long && "ip-display--long")}
          >
            {title}
          </h1>
        </div>
        <div className="ip-hero__foot">
          <div {...calm(k ?? 0.5)} className="ip-hero__copy ip-rise ip-rise--3">
            {lead && <p className="t-lead">{lead}</p>}
            {actions && <div className="ip-actions ip-actions--stack">{actions}</div>}
          </div>
          <div {...(bright ? calm(k) : {})} className="ip-hero__meta ip-rise ip-rise--4">
            {meta && (
              <p className="t-data">
                <b>{meta.label}</b>
                {meta.coords && (
                  <>
                    <br className="max-md:hidden" />
                    <span className="md:hidden"> · </span>
                    {meta.coords}
                  </>
                )}
              </p>
            )}
            <PauseMotion />
          </div>
        </div>
      </div>
    </StageWindow>
  );
}
