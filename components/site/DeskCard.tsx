import { ArrowRight, Clock, Mail, MessageCircle } from "lucide-react";
import { siteConfig, whatsappUrl } from "@/lib/site";

type Line = { label: string; value: string; href: string };

/**
 * Evergreen hero card: direct desk lines and the reply promise.
 * Replaces the old indicative rate board, which needed live data.
 * Built on `.uv-card.uv-card--dark` as a static wrapper (only the rows are links).
 *
 * Every visible string can be passed in, so localized landing pages render it
 * fully in their language. The card follows the page direction; addresses and
 * numbers are isolated as LTR.
 */
export function DeskCard({
  title = "Direct desk lines",
  note = "A broker replies within 60 minutes during business hours.",
  whatsappText,
  lines,
  newTab = "(opens in a new tab)",
}: {
  title?: string;
  note?: string;
  whatsappText?: string;
  /** Email rows; defaults to the tanker and LPG desk inboxes. */
  lines?: Line[];
  /** Screen-reader hint on the WhatsApp row. */
  newTab?: string;
}) {
  const rows: (Line & { icon: "mail" | "wa" })[] = [
    ...(
      lines ?? [
        {
          label: siteConfig.desks.tankers.label,
          value: siteConfig.desks.tankers.email,
          href: `mailto:${siteConfig.desks.tankers.email}`,
        },
        {
          label: siteConfig.desks.lpg.label,
          value: siteConfig.desks.lpg.email,
          href: `mailto:${siteConfig.desks.lpg.email}`,
        },
      ]
    ).map((l) => ({ ...l, icon: "mail" as const })),
    {
      label: "WhatsApp",
      value: siteConfig.whatsappDisplay,
      href: whatsappUrl(whatsappText),
      icon: "wa" as const,
    },
  ];

  return (
    // `!` overrides: the kit card's own padding/gap load after Tailwind.
    <div className="uv-card uv-card--dark !gap-0 !p-6 md:!p-8">
      <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-brass-light">
        <span className="h-px w-6 bg-brass-light/70" aria-hidden="true" />
        {title}
      </p>

      <ul className="mt-5 divide-y divide-white/10 border-y border-white/10">
        {rows.map((r) => (
          <li key={r.label}>
            <a
              href={r.href}
              {...(r.icon === "wa" ? { target: "_blank", rel: "noopener" } : {})}
              className="group -mx-3 flex items-center gap-4 rounded-md px-3 py-4 transition-colors hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brass-light"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-brass-light transition-colors group-hover:border-brass-light/70 group-hover:bg-brass/10">
                {r.icon === "wa" ? (
                  <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
                ) : (
                  <Mail className="h-[18px] w-[18px]" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-fog">{r.label}</span>
                <span className="mt-0.5 block truncate text-[15px] font-medium text-white transition-colors group-hover:text-brass-light">
                  <bdi dir="ltr">{r.value}</bdi>
                </span>
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-fog opacity-60 transition-[transform,opacity,color] group-hover:translate-x-0.5 group-hover:text-brass-light group-hover:opacity-100 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
              {r.icon === "wa" && <span className="sr-only"> {newTab}</span>}
            </a>
          </li>
        ))}
      </ul>

      {note && (
        <p className="mt-5 flex items-start gap-2.5 text-sm leading-relaxed text-fog">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brass-light" aria-hidden="true" />
          {note}
        </p>
      )}
    </div>
  );
}
