import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Card } from "@/components/site/stage";
import type { Broker } from "@/lib/data/brokers";
import { siteConfig, whatsappUrl } from "@/lib/site";
import { Arrow, WhatsAppGlyph } from "./icons";
import { TeamStrip } from "./TeamStrip";
import { Lines } from "./text";
import type { HomeView } from "./types";
import { ICON_STROKE } from "@/components/site/iconStroke";

/** A glass portrait card: photo or a navy portrait with brass initials, name, role, desk, two actions. */
function Member({ broker, view }: { broker: Broker; view: HomeView }) {
  const team = view.team!;
  const deskEmail =
    broker.team === "lpg" ? siteConfig.desks.lpg.email : siteConfig.desks.tankers.email;
  const first = broker.name.split(" ")[0];
  return (
    <li className="member" lang="en">
      <span className="member__frame" aria-hidden="true">
        {broker.photo ? (
          <Image src={broker.photo} alt="" fill sizes="260px" unoptimized />
        ) : (
          <span className="member__initials">{broker.initials}</span>
        )}
      </span>
      <h3 className="t-card member__name">{broker.name}</h3>
      <p className="t-label member__role">{broker.title}</p>
      <p className="member__desk">
        {team.deskLabels[broker.team]} · {broker.office}
      </p>
      <div className="member__actions">
        <a
          className="member__btn"
          href={`mailto:${deskEmail}?subject=${encodeURIComponent(`Attn ${broker.name}`)}`}
        >
          <Mail aria-hidden="true" strokeWidth={ICON_STROKE.ring} />
          <span className="sr-only">{team.email.replace("{name}", broker.name)}</span>
        </a>
        <a
          className="member__btn"
          href={whatsappUrl(`Hi ${first} — `)}
          target="_blank"
          rel="noopener"
        >
          <WhatsAppGlyph weight="ring" />
          <span className="sr-only">
            {team.whatsapp.replace("{name}", broker.name)} {view.newTab}
          </span>
        </a>
      </div>
    </li>
  );
}

/**
 * 7 · Team (DESIGN-V2 §7.7): a night card with glows that stacks over Reach.
 * "— Our team", h2, lead and "Meet the team" on top; a strip of nine glass
 * portrait cards that slides sideways with the scroll (pinned 240vh, desktop).
 */
export function Team({ view, id }: { view: HomeView; id: string }) {
  const { team } = view;
  if (!team) return null;
  return (
    <Card
      id={id}
      ground="night"
      className="h-card h-team h-pinned"
      aria-labelledby="team-title"
      data-team-pin=""
    >
      <div className="h-team__pin h-sticky">
        <div className="h-glows" aria-hidden="true">
          <span className="lv-glow lv-glow--brass" />
          <span className="lv-glow lv-glow--tide" />
        </div>
        <div className="h-wrap h-team__head">
          <div>
            <p className="t-sub">{team.sub}</p>
            <h2 id="team-title" className="t-display" data-reveal="lines">
              <Lines lines={team.lines} />
            </h2>
            <p className="t-lead h-team__lead">{team.lead}</p>
          </div>
          <Link href={team.more.href} hrefLang={view.linkLang} className="lv-link h-team__more">
            <span>{team.more.label}</span>
            <Arrow />
          </Link>
        </div>
        <TeamStrip label={team.stripLabel}>
          {team.brokers.map((b) => (
            <Member key={b.name} broker={b} view={view} />
          ))}
        </TeamStrip>
      </div>
    </Card>
  );
}
