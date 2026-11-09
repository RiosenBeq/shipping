"use client";

import { useEffect } from "react";

let mounts = 0;
let io: IntersectionObserver | null = null;

/** Sizes each layer's dash to its longest stroke as drawn on screen (px), then lets it draw. */
function arm(el: HTMLElement) {
  el.querySelectorAll<SVGSVGElement>("svg[data-dl]").forEach((svg) => {
    const vb = svg.viewBox.baseVal;
    const k = vb && vb.width ? svg.getBoundingClientRect().width / vb.width : 1;
    const [o, d, m] = (svg.dataset.dl ?? "").split(" ").map(Number);
    // On the drawing's own box, so a drawing swapped in later (a new class) inherits them.
    const box = svg.parentElement ?? svg;
    box.style.setProperty("--dlo", `${Math.ceil((o || 0) * k) + 2}px`);
    box.style.setProperty("--dld", `${Math.ceil((d || 0) * k) + 2}px`);
    box.style.setProperty("--dlm", `${Math.ceil((m || 0) * k) + 2}px`);
  });
  el.dataset.in = "draw";
}

/**
 * The drawings' draw-in (app/drawings.css), progressive enhancement only: once mounted with
 * motion allowed, `html[data-draw="on"]`; drawings already on screen are marked `data-in="seen"`
 * first (served as they are, nothing blinks); the others draw in when they come into view —
 * outline, then details, then marks and labels, on the tide ease. Reduced motion, no
 * JavaScript and print: the drawings as served. Pause motion stops a draw-in in CSS. One
 * observer however many instances mount.
 */
export function DrawIn() {
  useEffect(() => {
    const html = document.documentElement;
    mounts += 1;
    if (mounts === 1) {
      const motion = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
      if (motion && "IntersectionObserver" in window) {
        const vh = window.innerHeight;
        document.querySelectorAll<HTMLElement>("[data-draw]:not([data-in])").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < vh && r.bottom > 0) el.dataset.in = "seen";
        });
        io = new IntersectionObserver(
          (entries) =>
            entries.forEach((e) => {
              if (!e.isIntersecting) return;
              io?.unobserve(e.target);
              arm(e.target as HTMLElement);
            }),
          { rootMargin: "0px 0px -8% 0px", threshold: 0.15 }
        );
        html.dataset.draw = "on";
      }
    }
    document
      .querySelectorAll<HTMLElement>("[data-draw]:not([data-in])")
      .forEach((el) => io?.observe(el));
    return () => {
      mounts -= 1;
      if (mounts === 0) {
        io?.disconnect();
        io = null;
        delete html.dataset.draw;
      }
    };
  }, []);
  return null;
}
