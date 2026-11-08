import Image from "next/image";
import { Mail, MessageCircle } from "lucide-react";
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

const BRASS_LIGHT = "#D9B071";
const NAVY = "#0A1F33";

/**
 * Initials colour for an avatar fill: brass-light when it reaches 4.5:1 on the
 * fill (navy discs), navy otherwise (brass discs). Also used by the localized
 * landing pages' broker link.
 */
export function initialsColor(bg: string) {
  if (!/^#[0-9a-f]{6}$/i.test(bg)) return "#fff";
  return (luminance(BRASS_LIGHT) + 0.05) / (luminance(bg) + 0.05) >= 4.5 ? BRASS_LIGHT : NAVY;
}

/**
 * A broker's glass portrait card (DESIGN-V2 §7.7, §10) — night grounds only: portrait frame
 * (the photo set in /keystatic, or brass initials over the static contours), name, role,
 * focus chips, office and languages, and two round actions. Only the actions are links, so
 * the card itself does not lift. Email goes to the desk inbox with an "Attn" subject line;
 * the inbox is printed beside the buttons so touch users see where the mail goes too.
 */
export function BrokerCard({
  broker,
  showTeam = false,
  id,
  className,
}: {
  broker: Broker;
  /** Anchor id (on /brokers: the broker's slug, the target of blog bylines' /brokers#slug). */
  id?: string;
  /** Show the broker's desk on the portrait (useful outside the grouped /brokers page). */
  showTeam?: boolean;
  className?: string;
}) {
  const deskEmail =
    broker.team === "lpg" ? siteConfig.desks.lpg.email : siteConfig.desks.tankers.email;
  const firstName = broker.name.split(" ")[0];

  return (
    <article id={id} className={cn("ip-broker ip-glass", className)}>
      <div className="ip-broker__portrait">
        {broker.photo ? (
          <Image
            src={broker.photo}
            alt={broker.name}
            width={400}
            height={320}
            sizes="(min-width: 900px) 320px, 80vw"
          />
        ) : (
          <span className="ip-broker__initials" aria-hidden="true">
            {broker.initials}
          </span>
        )}
        {showTeam && <span className="ip-broker__team">{TEAM_LABEL[broker.team]}</span>}
      </div>
      <div className="ip-broker__body">
        <h3 className="t-card">{broker.name}</h3>
        <p className="t-label ip-broker__role">{broker.title}</p>
        <ul className="ip-chips" aria-label={`${firstName}'s focus`}>
          {broker.focus.map((f) => (
            <li key={f}>
              <span className="ip-chip">{f}</span>
            </li>
          ))}
        </ul>
        <dl className="ip-broker__facts">
          <div>
            <dt>Office</dt>
            <dd>{broker.office}</dd>
          </div>
          <div>
            <dt>Languages</dt>
            <dd>{broker.languages.join(", ")}</dd>
          </div>
        </dl>
        <div className="ip-broker__actions">
          <a
            href={`mailto:${deskEmail}?subject=${encodeURIComponent(`Attn ${broker.name}`)}`}
            className="ip-iconbtn"
          >
            <Mail aria-hidden="true" />
            <span className="sr-only">Email {broker.name}</span>
          </a>
          <a
            href={whatsappUrl(`Hi ${firstName} — `)}
            target="_blank"
            rel="noopener"
            className="ip-iconbtn"
          >
            <MessageCircle aria-hidden="true" />
            <span className="sr-only">WhatsApp {broker.name} (opens in a new tab)</span>
          </a>
          <p className="ip-broker__mail m-0">
            <span>Email goes to</span>
            {deskEmail}
          </p>
        </div>
      </div>
    </article>
  );
}
