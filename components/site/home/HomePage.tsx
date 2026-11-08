import { StageProvider, StageRail, type PlateId } from "@/components/site/stage";
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
import { HOME_SECTIONS, SECTION_IDS, type HomeSection, type HomeView } from "./types";
import "./home.css";

/**
 * The homepage (DESIGN-V2 §7): one stage behind nine sections — windows on
 * the plates (hero, who, ships, process, letter), paper and night cards
 * between them (desks, reach, team, notes) — then the footer on the ocean
 * plate (SiteShell). Shared by the English and the ten localized homepages;
 * sections switched off in the CMS drop out of the page, the rail and the
 * scene numbering.
 */
export function HomePage({ view }: { view: HomeView }) {
  const shown = HOME_SECTIONS.filter((s) => view.show[s]);
  const n = (s: HomeSection) => shown.indexOf(s) + 1;
  const total = shown.length;
  const id = SECTION_IDS;

  // Every plate the windows use, in page order; the hero's poster is the LCP image.
  const plates: PlateId[] = [view.plates.hero];
  if (view.show.who) plates.push("P-bathy");
  if (view.show.ships) plates.push("P-lines");
  if (view.show.process) plates.push(view.plates.process);
  if (view.show.letter) plates.push(view.plates.letter);
  plates.push("V-ocean"); // the footer (components/site/Footer.tsx)

  const stack = view.show.reach && view.show.team;

  return (
    // data-fab-hide: no floating WhatsApp button on the homepage (the header, hero and letter carry the CTAs).
    <div className="home" data-fab-hide="">
      <StageProvider plates={plates} />
      <HomeMotion />

      <Hero view={view} id={id.hero} plate={view.plates.hero} total={total} />
      {view.show.who && <Who view={view} id={id.who} n={n("who")} total={total} />}
      {view.show.desks && <Desks view={view} id={id.desks} />}
      {view.show.ships && <Ships view={view} id={id.ships} />}
      {view.show.process && <Process view={view} id={id.process} plate={view.plates.process} />}
      {stack ? (
        <div className="h-stack">
          <Reach view={view} id={id.reach} stackOver={id.team} />
          <Team view={view} id={id.team} />
        </div>
      ) : (
        <>
          {view.show.reach && <Reach view={view} id={id.reach} />}
          {view.show.team && <Team view={view} id={id.team} />}
        </>
      )}
      {view.show.notes && <Notes view={view} id={id.notes} />}
      {view.show.letter && <Letter view={view} id={id.letter} plate={view.plates.letter} />}

      <StageRail
        label={view.rail.label}
        items={shown.map((s) => ({ id: id[s], label: view.rail.items[s] }))}
      />
    </div>
  );
}
