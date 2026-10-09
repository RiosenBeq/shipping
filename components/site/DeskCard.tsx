import { Clock, Mail, MessageCircle } from "lucide-react";
import { siteConfig, whatsappUrl } from "@/lib/site";

type Line = { label: string; value: string; href: string };

/**
 * Evergreen hero card: direct desk lines and the reply promise.
 * Replaces the old indicative rate board, which needed live data.
 */
export function DeskCard({
  title = "Direct desk lines",
  note = "A broker replies within 60 minutes during business hours.",
  whatsappText,
  lines,
}: {
  title?: string;
  note?: string;
  whatsappText?: string;
  lines?: Line[];
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
    <div className="uv-card uv-card--dark p-6 md:p-7" dir="ltr">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass-light">{title}</p>
      <ul className="mt-5 divide-y divide-white/10">
        {rows.map((r) => (
          <li key={r.label}>
            <a
              href={r.href}
              {...(r.icon === "wa" ? { target: "_blank", rel: "noopener" } : {})}
              className="group flex items-center gap-4 py-3.5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-brass-light transition-colors group-hover:border-brass-light">
                {r.icon === "wa" ? (
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Mail className="h-4 w-4" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-fog">{r.label}</span>
                <span className="block truncate font-medium text-white group-hover:text-brass-light">
                  {r.value}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      {note && (
        <p className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4 text-sm text-fog">
          <Clock className="h-4 w-4 text-brass-light" aria-hidden="true" />
          {note}
        </p>
      )}
    </div>
  );
}
