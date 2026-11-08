import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Crumbs } from "@/components/site/PageHeader";
import { CtaBand } from "@/components/site/CtaBand";
import { Faq, type FaqItem } from "@/components/site/Faq";
import { HormuzBadge, HormuzNote } from "@/components/site/HormuzNote";
import { NotesStrip } from "@/components/site/blog/NotesStrip";
import {
  Card,
  PauseMotion,
  ShipLines,
  StageWindow,
  type ShipClassSlug,
} from "@/components/site/stage";
import { BLOG_PATH, type PostCardData } from "@/lib/blog/meta";
import type { StillKey } from "@/lib/media";
import type { Crumb } from "@/lib/seo";
import { Toc, TocMobile } from "./Toc";
import { BtnLabel, Glows, LinkArrow, StillFigure, Sub } from "./ui";

type Route = { code: string; lane: string; note: string; hormuz?: boolean };

export type ClassGuideProps = {
  slug: ShipClassSlug;
  crumbs: Crumb[];
  /** The class's long name ("Very Large Crude Carrier"): the "— Sub" line. */
  sub: string;
  /** The page's h1, e.g. "VLCC chartering". */
  title: string;
  /** Size band in mono under the h1. */
  band: string;
  lead: string;
  actions: React.ReactNode;
  /** Short name for running copy ("VLCC", "MGC"). */
  name: string;
  /** Seacon facts: size, cargoes, main routes, what to watch. */
  facts: { label: string; value: string; small?: string }[];
  /** "At a glance" specifications in the aside. */
  specs: { k: string; v: string }[];
  /** VesselArt for the aside (decorative). */
  art: React.ReactNode;
  routesTitle: string;
  routes: Route[];
  chipsTitle: string;
  chips: string[];
  watch: { title: string; body: string }[];
  charterShape: string;
  desk: string;
  still: StillKey;
  stillCaption: string;
  faqTitle: string;
  faq: FaqItem[];
  notesTitle: string;
  notes: PostCardData[];
  othersTitle: string;
  others: { href: string; name: string; size: string }[];
  next: { href: string; name: string };
  inquiry: string;
  letter: { title: string; text: string; email: string };
};

const TOC = [
  { id: "lanes", label: "Key lanes" },
  { id: "watch", label: "What we watch" },
  { id: "fixing", label: "How it is fixed" },
  { id: "faq", label: "Questions" },
];

/**
 * A class guide (DESIGN-V2 §10: /tankers/[class], /lpg/[class]): a night window over the
 * P-lines plate drawing this class's lines plan, then on paper the Seacon facts grid, the
 * article (sticky contents rail · column · "at a glance" aside) with the route table, the
 * desk view and a graded still, the FAQ, related notes, the other sizes and a huge
 * "Next class →" link, and the mini letter. Mount `<StageProvider plates={["P-lines"]}/>`.
 */
export function ClassGuide(p: ClassGuideProps) {
  return (
    <>
      <StageWindow
        plate="P-lines"
        id="hero"
        aria-labelledby="page-title"
        data-header-overlay=""
        className="ip-hero ip-lines-hero"
      >
        <Glows tide={false} />
        <div className="ip-wrap">
          <Crumbs crumbs={p.crumbs} className="ip-hero__crumbs" />
          <div className="ip-lines-hero__grid">
            <div className="ip-lines-hero__head">
              <Sub className="ip-rise">{p.sub}</Sub>
              <h1 id="page-title" className="t-display ip-rise ip-rise--2">
                {p.title}
              </h1>
              <p className="t-data ip-lines-hero__band ip-rise ip-rise--2">{p.band}</p>
            </div>
            <div className="ip-lines-hero__body">
              <p className="t-lead ip-rise ip-rise--3">{p.lead}</p>
              <div className="ip-actions ip-actions--stack ip-rise ip-rise--4">{p.actions}</div>
            </div>
            <div className="ip-lines-hero__ship">
              <ShipLines ship={p.slug} className="ip-lines-hero__lines" />
              <p className="t-data ip-lines-hero__caption" aria-hidden="true">
                <b>{p.name}</b> · lines plan · stations × waterlines
              </p>
            </div>
          </div>
          <div className="ip-lines-hero__foot">
            <PauseMotion />
          </div>
        </div>
      </StageWindow>

      <Card ground="paper" id="guide" aria-label={`${p.name} guide`} className="ip-card">
        <div className="ip-wrap">
          <dl className="ip-facts ip-reveal">
            {p.facts.map((f, i) => (
              <div key={f.label}>
                <dt>
                  <span className="t-label">{f.label}</span>
                  <span className="t-data" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </dt>
                <dd>
                  {f.value}
                  {f.small && <small>{f.small}</small>}
                </dd>
              </div>
            ))}
          </dl>

          <div className="ip-article mt-[clamp(56px,7vw,96px)]">
            <Toc items={TOC} articleId="guide-body" />

            <article id="guide-body" aria-labelledby="page-title">
              <TocMobile items={TOC} />
              <section id="lanes" className="ip-art-section" aria-labelledby="lanes-title">
                <h2 id="lanes-title" className="ip-art-h2">
                  {p.routesTitle}
                </h2>
                <div className="ip-table-wrap">
                  <table className="ip-table">
                    <caption className="sr-only">
                      Key {p.name} routes, with benchmark code, lane and notes
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Code</th>
                        <th scope="col">Lane</th>
                        <th scope="col" className="max-md:hidden">
                          Note
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.routes.map((r) => (
                        <tr key={r.code + r.lane}>
                          <th scope="row">
                            <span className="ip-chip ip-chip--mono ip-chip--dot">{r.code}</span>
                          </th>
                          <td>
                            <span className="ip-table__lane">{r.lane}</span>
                            {r.hormuz && <HormuzBadge />}
                            <p className="ip-table__note md:hidden">{r.note}</p>
                          </td>
                          <td className="ip-table__note max-md:hidden">{r.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {p.routes.some((r) => r.hormuz) && <HormuzNote />}
                <h3 id="chips-title" className="t-label !mt-10">
                  {p.chipsTitle}
                </h3>
                <ul aria-labelledby="chips-title" className="ip-chips mt-4">
                  {p.chips.map((m) => (
                    <li key={m}>
                      <span className="ip-chip ip-chip--wrap">{m}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <StillFigure still={p.still} caption={p.stillCaption} className="mt-14" />

              <section id="watch" className="ip-art-section" aria-labelledby="watch-title">
                <Sub>Desk view</Sub>
                <h2 id="watch-title" className="ip-art-h2">
                  What we watch before fixing.
                </h2>
                <ol className="ip-steps !gap-8 [--cols:1]">
                  {p.watch.map((k, i) => (
                    <li key={k.title}>
                      <span aria-hidden="true" className="t-data">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3>{k.title}</h3>
                      <p>{k.body}</p>
                    </li>
                  ))}
                </ol>
              </section>

              <section id="fixing" className="ip-art-section" aria-labelledby="fixing-title">
                <h2 id="fixing-title" className="ip-art-h2">
                  How {p.name} business is fixed
                </h2>
                <p className="ip-art-text">{p.charterShape}</p>
                <h3 className="ip-art-h3 mt-10">Who covers it</h3>
                <p className="ip-art-text mt-3">{p.desk}</p>
              </section>
            </article>

            <aside className="ip-article__aside ip-article__aside--sticky" aria-label="At a glance">
              <div className="ip-panel">
                <p className="t-label acc">At a glance</p>
                <div className="ip-panel__art" aria-hidden="true">
                  {p.art}
                </div>
                <dl className="ip-specs">
                  {p.specs.map((s) => (
                    <div key={s.k}>
                      <dt>{s.k}</dt>
                      <dd>{s.v}</dd>
                    </div>
                  ))}
                </dl>
                <Link href={p.inquiry} className="lv-btn lv-btn--ink lv-btn--sm lv-btn--block mt-6">
                  <BtnLabel>Request {p.name} tonnage</BtnLabel>
                </Link>
              </div>
            </aside>
          </div>

          <section id="faq" aria-labelledby="faq-title" className="ip-block">
            <div className="ip-faq-block">
              <div className="ip-faq-block__head">
                <div>
                  <Sub>FAQ</Sub>
                  <h2 id="faq-title" className="ip-h2">
                    {p.faqTitle}
                  </h2>
                </div>
                <Link href={p.inquiry} className="lv-link">
                  <span>Ask the desk</span>
                  <LinkArrow />
                </Link>
              </div>
              <Faq items={p.faq} />
            </div>
          </section>
        </div>
      </Card>

      <Card ground="paper" id="more" aria-label="More from the desk" className="ip-card">
        <div className="ip-wrap">
          {p.notes.length > 0 && (
            <NotesStrip
              posts={p.notes}
              id="notes"
              sub="Research"
              title={p.notesTitle}
              allHref={BLOG_PATH}
              allLabel="All posts"
            />
          )}

          <nav
            aria-labelledby="others-title"
            className={p.notes.length > 0 ? "ip-block" : undefined}
          >
            <Sub>{p.othersTitle}</Sub>
            <h2 id="others-title" className="ip-h2 mb-10">
              Compare segments.
            </h2>
            <ul className="ip-others">
              {p.others.map((o) => (
                <li key={o.href}>
                  <Link href={o.href}>
                    <b>{o.name}</b>
                    <span>{o.size}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={p.next.href} className="ip-next">
              <span className="t-label">Next class</span>
              <span className="ip-next__name">
                {p.next.name}
                <ArrowUpRight aria-hidden="true" />
              </span>
            </Link>
          </nav>
        </div>
      </Card>

      <CtaBand
        title={p.letter.title}
        text={p.letter.text}
        email={p.letter.email}
        inquiryHref={p.inquiry}
      />
    </>
  );
}
