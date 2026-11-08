"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { stills, videos } from "@/lib/media";
import { Card } from "../Card";
import { GRADE_PRESETS, GRADE_TABLE } from "../grades";
import { SHIP_CLASSES, SHIP_CLASS_SLUGS, type ShipClassSlug } from "../lines/classes";
import { PauseMotion } from "../PauseMotion";
import { PLATES } from "../plates";
import { ShipLines } from "../ShipLines";
import { StageAperture } from "../StageAperture";
import { StageProvider } from "../StageProvider";
import { StageRail } from "../StageRail";
import { StageWindow } from "../StageWindow";
import type { PlateId } from "../types";

const LAB_PLATES: PlateId[] = [
  "V-hero",
  "P-bathy",
  "P-lines",
  "V-reel",
  "V-gas",
  "V-strait",
  "V-night",
  "V-ocean",
];

const RAIL = [
  { id: "lab-hero", label: "V-hero · aperture" },
  { id: "lab-bathy", label: "P-bathy" },
  { id: "lab-grades", label: "Grades" },
  { id: "lab-lines", label: "P-lines" },
  { id: "lab-reel", label: "V-reel · aperture" },
  { id: "lab-gas", label: "V-gas → V-strait" },
  { id: "lab-night", label: "V-night" },
  { id: "lab-ocean", label: "V-ocean" },
];

const mono = "font-mono text-[12.5px] tracking-[0.02em]";
const label = "text-[11.5px] font-semibold uppercase tracking-[0.12em]";

function Debug() {
  const [text, setText] = useState("…");
  useEffect(() => {
    const id = window.setInterval(() => {
      const s = (window as unknown as { __stage?: { debug(): Record<string, unknown> } }).__stage;
      if (!s) return;
      const d = s.debug() as {
        tier: string;
        mode: string;
        plates: { a: string; b: string };
        composition: { edge: number } | null;
        info: { calls: number; fps: number; playing: string | null } | null;
      };
      setText(
        [
          `tier ${d.tier}`,
          `mode ${d.mode}`,
          `a ${d.plates.a || "–"}`,
          `b ${d.plates.b || "–"}`,
          d.composition ? `edge ${d.composition.edge.toFixed(2)}` : "",
          d.info ? `calls ${d.info.calls}` : "",
          d.info ? `fps ${d.info.fps.toFixed(0)}` : "",
          d.info?.playing ? `▶ ${d.info.playing}` : "",
        ]
          .filter(Boolean)
          .join(" · ")
      );
    }, 500);
    return () => window.clearInterval(id);
  }, []);
  return (
    <p
      className={`${mono} fixed bottom-3 right-3 z-40 rounded-full bg-[#051624]/80 px-4 py-2 text-[#F3EFE4] ring-1 ring-white/15`}
      aria-live="off"
    >
      {text}
    </p>
  );
}

function Tag({ plate }: { plate: PlateId }) {
  const def = PLATES[plate];
  return (
    <p className={`${mono} text-[#D9B071]`}>
      {plate} · {def.grade ?? "brand"} · {def.label}
    </p>
  );
}

/** Bake mode: one full-screen P-bathy window, no pin, no calm, no chrome (static fallback). */
function Bake() {
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-stage-bake", "");
    return () => document.documentElement.removeAttribute("data-stage-bake");
  }, []);
  return (
    <>
      <StageProvider plates={["P-bathy"]} frame={false} />
      <StageWindow plate="P-bathy" className="h-[100lvh]" />
    </>
  );
}

export function StageLab({ bake }: { bake: "bathy" | null }) {
  const [ship, setShip] = useState<ShipClassSlug>("vlgc");
  if (bake === "bathy") return <Bake />;
  return (
    <div className="text-[#F3EFE4]">
      <StageProvider plates={LAB_PLATES} />
      <StageRail items={RAIL} label="Stage lab" />
      <Debug />

      {/* 1 · V-hero in an aperture that opens up (inset 12 → 40, radius 28 → 36) as it leaves. */}
      <StageWindow
        id="lab-hero"
        plate="V-hero"
        className="lab-hero flex min-h-[100svh] flex-col justify-between px-[clamp(24px,5.25vw,80px)] pb-16 pt-40"
      >
        <StageAperture
          inset="calc(var(--stage-inset) + 28px * var(--stage-out))"
          radius="calc(var(--stage-radius) + 8px * var(--stage-out))"
        />
        <div data-calm="" className="max-w-[760px]">
          <Tag plate="V-hero" />
          <h1 className="mt-4 font-display text-[clamp(46px,8.6vw,128px)] font-bold leading-[0.9] tracking-[-0.046em]">
            Tankers &amp; gas, brokered from the <span className="text-[#D9B071]">Bosphorus.</span>
          </h1>
        </div>
        <div className="flex items-end justify-between gap-8">
          <p data-calm="0.5" className="max-w-[30em] text-[17px] leading-[1.62]">
            Calm zones sit under this lead and the headline: the lens pulls the footage toward
            navy-deep there, feathered 48px, and switches the flowmap off.
          </p>
          <PauseMotion />
        </div>
      </StageWindow>

      {/* 2 · P-bathy, touching the hero: the tide wipe runs across the boundary. */}
      <StageWindow
        id="lab-bathy"
        plate="P-bathy"
        className="relative min-h-[160vh] px-[clamp(24px,5.25vw,80px)] pt-40"
      >
        <div data-calm="0.4" className="max-w-[640px]">
          <Tag plate="P-bathy" />
          <p className="mt-6 font-display text-[clamp(26px,3.15vw,48px)] font-medium leading-[1.12] tracking-[-0.03em]">
            Liquid cargoes, nothing else. Contours drift at 0.004 uv/s; the pointer raises a soft
            bump; a sonar ping leaves the pin every six seconds.
          </p>
        </div>
        <span
          data-stage-pin=""
          className="absolute left-[30%] top-[62vh] block h-2 w-2 rounded-full bg-[#D9B071] shadow-[0_0_18px_6px_rgba(217,176,113,.35)]"
        />
        <p className={`${mono} absolute left-[calc(30%+18px)] top-[calc(62vh-6px)] text-[#B7C2CA]`}>
          41°02.6′N · Istanbul desk
        </p>
      </StageWindow>

      {/* 3 · Paper card: the five grades, as numbers and on graded stills. */}
      <Card id="lab-grades" className="px-[clamp(24px,5.25vw,80px)] py-24">
        <p className={`${label} text-[#8A6420]`}>Lens grades · §6.2</p>
        <h2 className="mt-3 font-display text-[clamp(38px,5.4vw,84px)] font-semibold leading-[0.95] tracking-[-0.044em]">
          Five grades, one shoot.
        </h2>
        <div className="mt-14 grid gap-8 md:grid-cols-5">
          {GRADE_PRESETS.map((g) => {
            const t = GRADE_TABLE[g];
            const still = Object.values(stills).find((s) => s.look.grade === g) ?? stills.openSea;
            return (
              <figure key={g} className="space-y-3">
                <div className="flex h-10 overflow-hidden rounded-full ring-1 ring-black/10">
                  {[t.shadow, t.mid, t.highlight].map((c) => (
                    <span key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element -- lab */}
                <img
                  src={still.graded.avif}
                  alt={still.alt}
                  width={still.graded.width}
                  height={still.graded.height}
                  className="aspect-[4/5] h-auto w-full rounded-[18px] object-cover"
                />
                <figcaption className={`${mono} text-[#4A5E6E]`}>
                  <b className="text-[#0A1F33]">{g}</b> · split {t.split * 100}% · chroma{" "}
                  {t.chroma * 100}% · exp {t.exposure}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </Card>

      {/* 4 · P-lines: the hull morphs between classes (700 ms). */}
      <StageWindow
        id="lab-lines"
        plate="P-lines"
        className="flex min-h-[100svh] flex-col px-[clamp(24px,5.25vw,80px)] pb-16 pt-36"
      >
        <div data-calm="0.35" className="max-w-[640px]">
          <Tag plate="P-lines" />
          <h2 className="mt-3 font-display text-[clamp(38px,5.4vw,84px)] font-semibold leading-[0.95] tracking-[-0.044em]">
            From VLCC to pressurised LPG.
          </h2>
        </div>
        <ShipLines ship={ship} className="my-6 min-h-[38vh] flex-1" />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Ship class">
          {SHIP_CLASS_SLUGS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setShip(s)}
              aria-pressed={s === ship}
              className="rounded-full px-4 py-2 text-sm ring-1 ring-white/20 aria-pressed:bg-[#B8893A] aria-pressed:text-[#051624]"
            >
              {SHIP_CLASSES[s].label}
            </button>
          ))}
        </div>
        <p aria-live="polite" className={`${mono} mt-3 text-[#B7C2CA]`}>
          {SHIP_CLASSES[ship].label} — {SHIP_CLASSES[ship].longName}
        </p>
      </StageWindow>

      {/* 5 · V-reel in a paper aperture, pinned 220vh: 62% wide → full bleed. */}
      <StageWindow id="lab-reel" plate="V-reel" ground="light" className="lab-reel h-[220vh]">
        <div className="sticky top-0 h-[100svh]">
          <StageAperture ground="light" className="lab-reel__ap" />
          <div
            className="absolute inset-x-0 top-28 px-[clamp(24px,5.25vw,80px)] text-[#0A1F33]"
            style={{ opacity: "calc(1 - var(--stage-pin) * 3)" }}
          >
            <p className={`${label} text-[#8A6420]`}>V-reel · dusk · 20 s edit</p>
            <h2 className="mt-3 font-display text-[clamp(38px,5.4vw,64px)] font-semibold leading-[0.95] tracking-[-0.044em]">
              Four steps, one broker throughout.
            </h2>
          </div>
          <ol
            data-calm="0.5"
            className="absolute inset-x-[clamp(24px,5.25vw,80px)] bottom-12 grid grid-cols-4 gap-6"
            style={{ opacity: "calc((var(--stage-pin) - 0.45) * 3)" }}
          >
            {["Brief", "Market", "Fix", "Post-fixture"].map((s, i) => (
              <li key={s} className="border-t border-white/30 pt-4">
                <span className={`${mono} text-[#D9B071]`}>0{i + 1}</span>
                <p className="mt-2 font-display text-2xl font-semibold">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </StageWindow>

      {/* 6 · V-gas and V-strait touch: a second tide wipe between two footage plates. */}
      <StageWindow
        id="lab-gas"
        plate="V-gas"
        className="flex min-h-[100svh] items-end px-[clamp(24px,5.25vw,80px)] pb-20"
      >
        <div data-calm="">
          <Tag plate="V-gas" />
          <p className="mt-2 max-w-[34em] text-[17px] leading-[1.62]">{videos.gas.subject}</p>
        </div>
      </StageWindow>
      <StageWindow
        plate="V-strait"
        className="flex min-h-[100svh] items-end px-[clamp(24px,5.25vw,80px)] pb-20"
      >
        <div data-calm="">
          <Tag plate="V-strait" />
          <p className="mt-2 max-w-[34em] text-[17px] leading-[1.62]">{videos.bosphorus.subject}</p>
        </div>
      </StageWindow>

      {/* 7 · Night card between two windows: the plate swaps while it covers the screen. */}
      <Card ground="night" className="flex min-h-[110vh] items-center px-[clamp(24px,5.25vw,80px)]">
        <h2 className="max-w-[16ch] font-display text-[clamp(38px,5.4vw,84px)] font-semibold leading-[0.95] tracking-[-0.044em]">
          A night card covers the stage; the plate swaps behind it.
        </h2>
      </Card>

      <StageWindow
        id="lab-night"
        plate="V-night"
        className="flex min-h-[100svh] items-center px-[clamp(24px,5.25vw,80px)]"
      >
        <div data-calm="0.5" className="max-w-[560px]">
          <Tag plate="V-night" />
          <p className="mt-4 font-serif text-[clamp(38px,4vw,60px)] font-semibold leading-[1.02]">
            Have a cargo or a ship to fix?
          </p>
          <div className="mt-8">
            <PauseMotion />
          </div>
        </div>
      </StageWindow>

      {/* 8 · Footer-shaped window on V-ocean. */}
      <StageWindow
        id="lab-ocean"
        plate="V-ocean"
        className="flex min-h-[100svh] items-end px-[clamp(24px,5.25vw,80px)] pb-24"
      >
        <StageAperture />
        <div data-calm="0.4">
          <Tag plate="V-ocean" />
          <p
            aria-hidden="true"
            className="font-display text-[12.4vw] font-semibold leading-none tracking-[0.3em] text-[#F3EFE4]/[0.085]"
          >
            LEVANTER
          </p>
        </div>
      </StageWindow>
    </div>
  );
}
