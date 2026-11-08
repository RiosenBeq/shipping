import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Card } from "@/components/site/stage";
import { dutyWhatsappUrl, siteConfig, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Stamp } from "./inner/Stamp";
import { BtnLabel, Glows, Sub } from "./inner/ui";

type Props = {
  title?: string;
  text?: string;
  /** Desk inbox shown large on the end side. Defaults to the main desk. */
  email?: string;
  /** Button labels — overridden on localized landing pages. */
  labels?: { inquiry?: string; email?: string; newTab?: string; whatsapp?: string };
  /** Contact form link; desk and class pages preselect cargo and ship size. */
  inquiryHref?: string;
  whatsappText?: string;
  /** The small caps line on the letter. Default "From the Bosphorus". */
  eyebrow?: string;
  /** Short note under the buttons, e.g. "The inquiry form is in English." on localized pages. */
  note?: string;
  id?: string;
  /** Extra block under the duty line. */
  aside?: React.ReactNode;
  className?: string;
};

/**
 * The mini letter (DESIGN-V2 §7.9, §10): the closing scene of every inner page. A night card
 * with a paper letter (Source Serif headline, the 60-minute promise, signature and the brass
 * stamp) beside the desk's email, the inquiry and WhatsApp buttons and the after-hours duty
 * line. Same props as the old CTA band.
 */
export function CtaBand({
  title = "Have a cargo or a ship to fix?",
  text = "Send the cargo, ports and laycan. A broker replies within 60 minutes during business hours — no account needed, nothing stored on this site.",
  email = siteConfig.email,
  labels,
  inquiryHref = "/contact",
  whatsappText,
  eyebrow = "From the Bosphorus",
  note,
  id = "contact-desk",
  aside,
  className,
}: Props) {
  const titleId = `${id}-title`;
  return (
    // data-fab-hide: the floating WhatsApp button steps aside while this scene
    // (which has its own WhatsApp button) is on screen.
    <Card
      ground="night"
      id={id}
      aria-labelledby={titleId}
      data-fab-hide=""
      className={cn("ip-card ip-card--night print:hidden", className)}
    >
      <Glows />
      <div className="ip-wrap">
        <div className="ip-letter-block">
          <div className="ip-letter" data-ground="light">
            <p className="ip-letter__label">{eyebrow}</p>
            <h2 id={titleId} className="ip-letter__title">
              {title}
            </h2>
            <p className="ip-letter__text">{text}</p>
            <div className="ip-letter__sign">
              <p className="ip-letter__mark m-0">
                <b>LEVANTER</b>
                <span>Beşiktaş, Istanbul</span>
              </p>
              <Stamp />
            </div>
          </div>

          <div className="ip-contact">
            <Sub className="!mb-0">Contact</Sub>
            {/* The address as plain, selectable text too, for people without a mail client. */}
            <a href={`mailto:${email}`} className="ip-contact__email" dir="ltr">
              {email}
            </a>
            <div className="ip-actions ip-actions--stack">
              {/* hrefLang: the form is English-only, which matters on localized pages */}
              <Link href={inquiryHref} hrefLang="en" className="lv-btn lv-btn--cta">
                <BtnLabel>{labels?.inquiry ?? "Send an inquiry"}</BtnLabel>
              </Link>
              <a
                href={whatsappUrl(whatsappText)}
                target="_blank"
                rel="noopener"
                className="lv-btn lv-btn--ghost"
              >
                <MessageCircle aria-hidden="true" />
                {labels?.whatsapp ?? "WhatsApp the desk"}
                <span className="sr-only"> {labels?.newTab ?? "(opens in a new tab)"}</span>
              </a>
            </div>
            {note && <p className="ip-contact__note">{note}</p>}
            <div className="ip-duty ip-glass">
              <span className="ip-duty__dot" aria-hidden="true" />
              <p>
                <b>{siteConfig.duty.label}</b>
                WhatsApp the duty broker —{" "}
                <a href={dutyWhatsappUrl()} target="_blank" rel="noopener" dir="ltr">
                  {siteConfig.duty.display}
                  <span className="sr-only"> (WhatsApp, opens in a new tab)</span>
                </a>
                . {siteConfig.duty.hours}
              </p>
            </div>
            {aside}
          </div>
        </div>
      </div>
    </Card>
  );
}
