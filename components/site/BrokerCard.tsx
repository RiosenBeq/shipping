import { Mail, MessageCircle } from "lucide-react";
import type { Broker } from "@/lib/data/brokers";
import { siteConfig, whatsappUrl } from "@/lib/site";

/** Person card with direct contact links. Desk inbox is used for email. */
export function BrokerCard({ broker }: { broker: Broker }) {
  const deskEmail =
    broker.team === "lpg" ? siteConfig.desks.lpg.email : siteConfig.desks.tankers.email;
  return (
    <article className="flex h-full flex-col rounded-lg border border-line bg-white p-5">
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-lg text-white"
          style={{ background: broker.color }}
          aria-hidden="true"
        >
          {broker.initials}
        </div>
        <div>
          <h3 className="font-semibold text-navy">{broker.name}</h3>
          <p className="text-sm text-slate">{broker.title}</p>
        </div>
      </div>
      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Focus">
        {broker.focus.map((f) => (
          <li key={f} className="rounded-full bg-sand px-2.5 py-1 text-xs text-navy">
            {f}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate">
        {broker.office} · {broker.languages.join(", ")}
      </p>
      <div className="mt-auto flex gap-2 pt-5">
        <a
          href={`mailto:${deskEmail}?subject=${encodeURIComponent(`Attn ${broker.name}`)}`}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-line text-sm font-medium text-navy hover:border-navy"
        >
          <Mail className="h-4 w-4" aria-hidden="true" /> Email
        </a>
        <a
          href={whatsappUrl(`Hi ${broker.name.split(" ")[0]} — `)}
          target="_blank"
          rel="noopener"
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-line text-sm font-medium text-navy hover:border-navy"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
        </a>
      </div>
    </article>
  );
}
