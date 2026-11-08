import { Fragment } from "react";
import { StageProvider, StageRail } from "@/components/site/stage";
import { Desks } from "./Desks";
import { Hero } from "./Hero";
import { HomeMotion } from "./HomeMotion";
import { Letter } from "./Letter";
import { Notes } from "./Notes";
import { Process } from "./Process";
import { Reach } from "./Reach";
import { Ships } from "./Ships";
import { Team } from "./Team";
import { Who } from "./Who";
import { SECTION_IDS, type HomeBlockSection, type HomeSection, type HomeView } from "./types";
import { pagePlates } from "./view";
import "./home.css";

/**
 * The homepage (DESIGN-V2 §7): one stage behind its sections — windows on the
 * plates (hero, who, ships, process, letter), paper and night cards between
 * them (desks, reach, team, notes) — then the footer on the ocean plate
 * (SiteShell). Shared by the English and the ten localized homepages.
 *
 * The hero always opens the page; the other sections follow in the order the
 * editor gave them in /keystatic (Pages → Homepage → Sections), and a section
 * switched off drops out of the page, the rail and the scene numbering. Team
 * stacks over Reach when it directly follows it (Penta's stacking).
 */
export function HomePage({ view }: { view: HomeView }) {
  const all: HomeSection[] = ["hero", ...view.order];
  const n = (s: HomeSection) => all.indexOf(s) + 1;
  const total = all.length;
  const id = SECTION_IDS;

  const section = (s: HomeBlockSection, stackOver?: string) => {
    switch (s) {
      case "who":
        return <Who view={view} id={id.who} n={n("who")} total={total} />;
      case "desks":
        return <Desks view={view} id={id.desks} />;
      case "ships":
        return <Ships view={view} id={id.ships} />;
      case "process":
        return <Process view={view} id={id.process} />;
      case "reach":
        return <Reach view={view} id={id.reach} stackOver={stackOver} />;
      case "team":
        return <Team view={view} id={id.team} />;
      case "notes":
        return <Notes view={view} id={id.notes} />;
      case "letter":
        return <Letter view={view} id={id.letter} />;
    }
  };

  const body: React.ReactNode[] = [];
  for (let i = 0; i < view.order.length; i++) {
    const s = view.order[i];
    if (s === "reach" && view.order[i + 1] === "team") {
      body.push(
        <div key="reach+team" className="h-stack">
          {section("reach", id.team)}
          {section("team")}
        </div>
      );
      i++;
      continue;
    }
    body.push(<Fragment key={s}>{section(s)}</Fragment>);
  }

  return (
    // data-fab-hide: no floating WhatsApp button on the homepage (the header, hero and letter carry the CTAs).
    <div className="home" data-fab-hide="">
      <StageProvider plates={pagePlates(view)} />
      <HomeMotion />

      <Hero view={view} id={id.hero} total={total} />
      {body}

      <StageRail
        label={view.rail.label}
        items={all.map((s) => ({ id: id[s], label: view.rail.items[s] ?? s }))}
      />
    </div>
  );
}
