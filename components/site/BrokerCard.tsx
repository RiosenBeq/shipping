import { Languages, Mail, MapPin, MessageCircle } from "lucide-react";
import { TEAM_LABEL, type Broker } from "@/lib/data/brokers";
import { siteConfig, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

/** WCAG relative luminance of a #rrggbb colour. */
function luminance(hex: string) {
  const n = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** White initials when they reach 4.5:1 on the avatar colour, navy otherwise (e.g. on brass). */
function initialsColor(bg: string) {
  if (!/^#[0-9a-f]{6}$/i.test(bg)) return "#fff";
  return 1.05 / (luminance(bg) + 0.05) >= 4.5 ? "#fff" : "#0A1F33";
}

/**
 * Person card on a static `.uv-card` (no hover lift: only the two actions are
 * links, so the card must not look clickable). Email goes to the desk inbox
 * with an "Attn" subject line; that inbox is printed under the buttons so
 * touch users see where the mail goes too.
 */
export function BrokerCard({
  broker,
  showTeam = false,
  className,
}: {
  broker: Broker;
  /** Show the broker's desk above the name (useful outside the grouped /brokers page). */
  showTeam?: boolean;
  className?: string;
}) {
  const deskEmail =
    broker.team === "lpg" ? siteConfig.desks.lpg.email : siteConfig.desks.tankers.email;
  const firstName = broker.name.split(" ")[0];

  return (
    // `!` overrides: the kit card's own padding/gap load after Tailwind.
    <article className={cn("uv-card h-full !gap-0 !p-6", className)}>
      {/* items-start + a two-line role slot: a wrapping role no longer shifts
          the name up or the chips down against its neighbours in the row. */}
      <div className="flex items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-display text-lg tracking-wide shadow-[0_0_0_3px_#fff,0_0_0_4px_#B8893A]"
          style={{ background: broker.color, color: initialsColor(broker.color) }}
          aria-hidden="true"
        >
          {broker.initials}
        </div>
        <div className="min-w-0">
          {showTeam && (
            <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brass-ink">
              {TEAM_LABEL[broker.team]}
            </p>
          )}
          <h3 className="text-lg font-semibold leading-snug text-navy">{broker.name}</h3>
          <p className="mt-0.5 min-h-[2lh] text-sm leading-snug text-slate">{broker.title}</p>
        </div>
      </div>

      <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${firstName}'s focus`}>
        {broker.focus.map((f) => (
          <li key={f}>
            <span className="uv-chip">{f}</span>
          </li>
        ))}
      </ul>

      {/* Pinned to the bottom as one block, so the divider, meta rows and
          buttons line up across a row even when titles wrap differently. */}
      <div className="mt-auto pt-5">
        <dl className="space-y-1.5 border-t border-line pt-4 text-sm text-slate">
          <div className="flex items-center gap-2">
            <dt>
              <MapPin className="h-4 w-4 text-brass-ink" aria-hidden="true" />
              <span className="sr-only">Office</span>
            </dt>
            <dd className="text-navy">{broker.office}</dd>
          </div>
          <div className="flex items-start gap-2">
            <dt>
              <Languages className="mt-0.5 h-4 w-4 text-brass-ink" aria-hidden="true" />
              <span className="sr-only">Languages</span>
            </dt>
            <dd>{broker.languages.join(", ")}</dd>
          </div>
        </dl>

        {/* Side by side while both fit at their natural width; in a narrow card
          they wrap and each takes the full row (never clipped by the kit's
          overflow:hidden). */}
        <div className="flex flex-wrap gap-2 pt-6">
          <a
            href={`mailto:${deskEmail}?subject=${encodeURIComponent(`Attn ${broker.name}`)}`}
            className="uv-btn-outline uv-btn--sm flex-auto"
          >
            <Mail aria-hidden="true" />
            Email
            <span className="sr-only"> {broker.name}</span>
          </a>
          <a
            href={whatsappUrl(`Hi ${firstName} — `)}
            target="_blank"
            rel="noopener"
            className="uv-btn-outline uv-btn--sm flex-auto"
          >
            <MessageCircle aria-hidden="true" />
            WhatsApp
            <span className="sr-only"> {broker.name} (opens in a new tab)</span>
          </a>
        </div>
        {/* Label and address always on their own lines, so every card's footer
            is the same height whether or not the address would have fit. */}
        <p className="mt-2.5 text-xs text-slate [overflow-wrap:anywhere]">
          Email goes to <span className="block font-mono text-navy">{deskEmail}</span>
        </p>
      </div>
    </article>
  );
}
