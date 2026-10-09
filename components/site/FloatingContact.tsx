"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Chat bubble with a handset inside: reads as WhatsApp without the brand mark. */
function WhatsAppGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path
        d="M15.6 13.9v1.2a.8.8 0 0 1-.9.8 7.9 7.9 0 0 1-3.4-1.2 7.8 7.8 0 0 1-2.4-2.4 7.9 7.9 0 0 1-1.2-3.5.8.8 0 0 1 .8-.8h1.2a.8.8 0 0 1 .8.7c.05.4.15.77.28 1.12a.8.8 0 0 1-.18.85l-.5.5a6.4 6.4 0 0 0 2.4 2.4l.5-.5a.8.8 0 0 1 .85-.18c.35.13.73.23 1.12.28a.8.8 0 0 1 .7.81z"
        strokeWidth="1.4"
      />
    </svg>
  );
}

/** How far the page must scroll (in viewport heights) before the button appears. */
const REVEAL_AT = 0.7;

/**
 * WhatsApp shortcut on the kit's `.uv-fab` (navy pill, brass icon, three
 * pulses then rest).
 *
 * - Appears only once the hero has scrolled away (the hero already has its own
 *   WhatsApp button), and steps aside while the footer or any `[data-fab-hide]`
 *   section (the CtaBand, whose full-width phone buttons it would otherwise sit
 *   on, and which has its own WhatsApp button) is on screen. Not shown on
 *   /contact, which lists WhatsApp twice already.
 * - Round 48px icon below 1600px; the label slides in on hover/focus and is
 *   always shown on very wide screens. It only clears the content column
 *   above ~1340px; narrower, it overlaps the content edge, so it sits a little
 *   tighter to the corner on phones. The accessible name starts with the
 *   visible label (WCAG 2.5.3).
 * - Localized: label, greeting and side (left on RTL) follow the landing page.
 */
export function FloatingContact() {
  const pathname = usePathname() || "/";
  const locale = getLocale(pathname.split("/")[1] ?? "");
  const hidden = pathname === "/contact" || pathname.startsWith("/contact/");

  const [shown, setShown] = useState(false);
  // Mounted on first reveal, so the kit's three pulses play when it appears.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (hidden) return;
    // Footer and CTA bands currently on screen; the button hides while any is.
    const blocking = new Set<Element>();
    let frame = 0;
    const update = () => {
      frame = 0;
      const next = window.scrollY > window.innerHeight * REVEAL_AT && blocking.size === 0;
      setShown(next);
      if (next) setMounted(true);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const targets = [
      document.getElementById("site-footer"),
      ...Array.from(document.querySelectorAll("[data-fab-hide]")),
    ].filter((el): el is Element => el !== null);
    const io =
      targets.length > 0 && "IntersectionObserver" in window
        ? new IntersectionObserver((entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) blocking.add(entry.target);
              else blocking.delete(entry.target);
            }
            schedule();
          })
        : null;
    if (io) targets.forEach((el) => io.observe(el));

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [hidden, pathname]);

  if (hidden || !mounted) return null;

  const label = locale?.dict.fab ?? "WhatsApp a broker";
  const newTab = locale?.dict.newTab ?? "(opens in a new tab)";
  const rtl = locale?.dir === "rtl";

  return (
    // Positioning and the reveal live on this wrapper; the link itself stays a
    // plain kit `.uv-fab` (whose own transition/transform rules load after Tailwind).
    <div
      id="floating-contact"
      lang={locale?.hreflang ?? "en"}
      className={cn(
        "site-chrome fixed bottom-4 z-40 md:bottom-5 print:hidden",
        rtl ? "left-4 md:left-5" : "right-4 md:right-5",
        // fades up when first mounted, then transitions on every show/hide
        "motion-safe:duration-300 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2",
        "motion-safe:transition-[opacity,transform,visibility]",
        shown ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0"
      )}
    >
      <a
        href={whatsappUrl(locale?.dict.whatsappGreeting)}
        target="_blank"
        rel="noopener"
        aria-label={`${label} ${newTab}`}
        // Brass hairline keeps the navy pill visible over navy sections (WCAG
        // 1.4.11); `!` because the kit sets `border: 0` after Tailwind.
        className={cn(
          "uv-fab group ![border:1px_solid_rgba(217,176,113,0.45)]",
          "!px-0 hover:!px-4 focus-visible:!px-4 min-[1600px]:!px-4"
        )}
      >
        <WhatsAppGlyph />
        <span className="hidden whitespace-nowrap group-hover:inline group-focus-visible:inline min-[1600px]:inline">
          {label}
        </span>
      </a>
    </div>
  );
}
