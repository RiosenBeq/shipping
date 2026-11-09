"use client";

import { useEffect } from "react";

/** The night glass that follows the pointer (app/patterns.css, P1). */
const GLASS = ".ship-card, .member, .ip-glass:not(.ip-duty)";

/**
 * Spotlight glass (P1; idea: Magic UI's "magic card", MIT, re-done on our tokens): one
 * delegated, passive `pointermove` writes the pointer's position on the night glass card under
 * it (`--mx` / `--my`, once per frame); the brass glow and the brighter ring are CSS. Fine
 * pointers only — touch screens keep the static top-right glow — and nothing on paper.
 */
export function Spotlight() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      frame = 0;
      const e = last;
      const card = (e?.target as Element | null)?.closest?.<HTMLElement>(GLASS);
      if (!e || !card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${Math.round(e.clientX - r.left)}px`);
      card.style.setProperty("--my", `${Math.round(e.clientY - r.top)}px`);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      last = e;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    const sync = () => {
      document.removeEventListener("pointermove", onMove);
      if (fine.matches) document.addEventListener("pointermove", onMove, { passive: true });
    };
    sync();
    fine.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      document.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
