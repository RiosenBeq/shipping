"use client";

import { useEffect } from "react";

/** The desktop pin layout's media query (home.css "Pins"): pins exist only here. */
export const PINNED_QUERY =
  "(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)";

const COUNT_MS = 1100;
const DIGIT_STAGGER = 70;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * P3 · the odometer: one clipped cell per digit holding a 0–9 strip (plus a second 0, so a
 * 0 turns a full revolution instead of standing still), parked at 0 until the roll.
 */
function buildOdometer(el: HTMLElement, value: string) {
  el.textContent = "";
  el.classList.add("odo");
  Array.from(value).forEach((d, i) => {
    const cell = document.createElement("span");
    cell.className = "odo__d";
    const strip = document.createElement("span");
    strip.className = "odo__s";
    strip.style.setProperty("--i", String(i));
    strip.dataset.to = d === "0" ? "10" : d;
    for (const n of "01234567890") {
      const digit = document.createElement("span");
      digit.textContent = n;
      strip.appendChild(digit);
    }
    cell.appendChild(strip);
    el.appendChild(cell);
  });
}

/**
 * The homepage's motion driver (DESIGN-V2 §5), progressive enhancement only:
 *
 * - `html[data-home-motion="on"]` once hidden states are safe to apply (motion
 *   allowed); elements already on screen are marked in first, so nothing blinks.
 * - `[data-reveal]` gets `data-in` the first time it crosses into view (rise,
 *   type, wipe, settle are CSS keyed to it); focus inside reveals at once.
 * - `[data-count]` numbers roll in as an odometer on first view (P3; idea: NumberFlow):
 *   served at their final value as text; counters below the fold are swapped for
 *   `aria-hidden` digit strips (the caption keeps the sr-only number) that rise from a
 *   waterline, 1100ms on the tide, digits 70ms apart, then go back to plain text.
 *   Reduced motion: the served number, untouched.
 * - `[data-ground-at]` windows switch their ground (header, rail, focus
 *   colours) once their pin passes that share — the process aperture is full
 *   bleed from 45%; without a pin they take `data-ground-to` outright.
 * - `[data-stack]` cards get `--stack` (0..1) as the next card slides over them
 *   (scale .965, dim 25% in CSS).
 * - `[data-pin-fit]` pins hold only what fits: when the sticky frame (which grows
 *   with its copy) is taller than the screen — narrow columns, a long locale, a
 *   short laptop — the section gets `data-pin="off"` and scrolls normally, so
 *   nothing waits below the fold for the length of the pin.
 *
 * Reduced motion: none of the above hides anything; pins are normal flow.
 */
export function HomeMotion() {
  useEffect(() => {
    const html = document.documentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const pinned = window.matchMedia(PINNED_QUERY);
    let io: IntersectionObserver | null = null;
    let frame = 0;
    const timers = new Set<number>();
    const timeouts = new Set<number>();

    const reveals = () => Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const counters = () => Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
    const onScreen = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };

    const roll = (el: HTMLElement) => {
      const value = el.dataset.count ?? "";
      const strips = Array.from(el.querySelectorAll<HTMLElement>(".odo__s"));
      if (!strips.length) {
        el.textContent = value;
        return;
      }
      // Next frame: the parked strips have been painted at 0, so the change transitions.
      timers.add(
        window.requestAnimationFrame(() =>
          strips.forEach((st) => st.style.setProperty("--v", st.dataset.to ?? "0"))
        )
      );
      // Back to plain text once the last digit has landed (crisp, and as served).
      const done = window.setTimeout(
        () => {
          el.classList.remove("odo");
          el.textContent = value;
        },
        COUNT_MS + strips.length * DIGIT_STAGGER + 120
      );
      timeouts.add(done);
    };

    const enter = (el: HTMLElement) => {
      if (el.hasAttribute("data-in")) return;
      el.setAttribute("data-in", "");
      io?.unobserve(el);
      if (el.hasAttribute("data-count") && el.dataset.counting === "") {
        delete el.dataset.counting;
        roll(el);
      }
    };

    const start = () => {
      io?.disconnect();
      io = null;
      if (!motion.matches) {
        html.dataset.homeMotion = "still";
        reveals().forEach((el) => el.setAttribute("data-in", ""));
        counters().forEach((el) => {
          delete el.dataset.counting;
          el.classList.remove("odo");
          el.textContent = el.dataset.count ?? el.textContent;
        });
        return;
      }
      // Already on screen: in before the hidden states exist.
      for (const el of reveals()) if (onScreen(el)) el.setAttribute("data-in", "");
      // Counters below the fold become odometers parked at 0 and roll when they arrive.
      for (const el of counters()) {
        const value = el.dataset.count ?? "";
        if (!el.hasAttribute("data-in") && !onScreen(el) && /^\d{1,6}$/.test(value)) {
          el.dataset.counting = "";
          if (!el.querySelector(".odo__s")) buildOdometer(el, value);
        }
      }
      html.dataset.homeMotion = "on";
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) enter(e.target as HTMLElement);
        },
        { rootMargin: "0px 0px -8% 0px" }
      );
      for (const el of [...reveals(), ...counters()]) {
        if (!el.hasAttribute("data-in")) io.observe(el);
      }
    };

    // Grounds that follow a pin, and card stacking: read on scroll.
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of document.querySelectorAll<HTMLElement>("[data-ground-at]")) {
        const at = Number(el.dataset.groundAt);
        const from = el.dataset.groundFrom ?? "light";
        const to = el.dataset.groundTo ?? "dark";
        let next = to;
        if (pinned.matches) {
          const r = el.getBoundingClientRect();
          const span = r.height - vh;
          const p = span > 0 ? clamp01(-r.top / span) : 0;
          next = p >= at ? to : from;
        } else {
          // No pin: dark only while the opening is under the header's centre line.
          const ap = el.querySelector("[data-stage-aperture]")?.getBoundingClientRect();
          const y = 52;
          next = ap && ap.top <= y && ap.bottom >= y ? to : from;
        }
        if (el.dataset.ground !== next) el.dataset.ground = next;
      }
      for (const el of document.querySelectorAll<HTMLElement>("[data-stack]")) {
        // Sticks once its bottom meets the viewport's (CSS: top = 100vh − own height).
        const h = `${el.offsetHeight}px`;
        if (el.style.getPropertyValue("--self-h") !== h) el.style.setProperty("--self-h", h);
        const next = document.getElementById(el.dataset.stack ?? "");
        const k =
          pinned.matches && next ? clamp01((vh - next.getBoundingClientRect().top) / vh) : 0;
        el.style.setProperty("--stack", k.toFixed(3));
      }
    };
    // Pins that must fit the screen. The frame's height is the same pinned or not (auto, at
    // least one screen), so switching never feeds back into the measurement.
    const fitting = Array.from(document.querySelectorAll<HTMLElement>("[data-pin-fit]"));
    const fit = () => {
      for (const sec of fitting) {
        const pin = sec.querySelector<HTMLElement>(".h-sticky");
        const off = pinned.matches && !!pin && pin.offsetHeight > window.innerHeight + 1;
        if (off !== (sec.dataset.pin === "off")) {
          if (off) sec.dataset.pin = "off";
          else delete sec.dataset.pin;
        }
      }
    };
    const fitRo = new ResizeObserver(fit);
    for (const sec of fitting) {
      const pin = sec.querySelector(".h-sticky");
      if (pin) fitRo.observe(pin);
    }

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const onResize = () => {
      fit();
      onScroll();
    };
    const onFocus = (e: FocusEvent) => {
      const el = (e.target as Element | null)?.closest?.<HTMLElement>("[data-reveal]");
      if (el) enter(el);
    };

    fit();
    start();
    update();
    motion.addEventListener("change", start);
    pinned.addEventListener("change", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("focusin", onFocus);
    return () => {
      io?.disconnect();
      fitRo.disconnect();
      timers.forEach((t) => window.cancelAnimationFrame(t));
      timeouts.forEach((t) => window.clearTimeout(t));
      for (const el of counters()) {
        el.classList.remove("odo");
        el.textContent = el.dataset.count ?? el.textContent;
      }
      if (frame) window.cancelAnimationFrame(frame);
      motion.removeEventListener("change", start);
      pinned.removeEventListener("change", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("focusin", onFocus);
      for (const sec of fitting) delete sec.dataset.pin;
      delete html.dataset.homeMotion;
    };
  }, []);

  return null;
}
