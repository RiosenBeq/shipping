import Link from "next/link";
import { ArrowRight, Phone, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig, telUrl, whatsappUrl, mailUrl } from "@/lib/site";
import { TrackedAnchor } from "./TrackedAnchor";

type Props = {
  /** Optional override for the headline text. */
  headline?: string;
  /** Optional override for the body copy. */
  body?: string;
  /** Topic pre-filled into the WhatsApp message and email subject. */
  context?: string;
  /** Inquiry form link, e.g. with the cargo pre-selected (`/contact?cargo=bulk`). */
  inquiryHref?: string;
};

const DEFAULT_HEADLINE = "Talk to the desk.";
const DEFAULT_BODY =
  "Send the cargo, the lift window, and how to reach you. A broker replies within 60 minutes during business hours.";

/**
 * End-of-page contact strip with four channels: charter inquiry form,
 * WhatsApp, telephone, and email. Drop in below long-form content on
 * any page to convert reader → desk-conversation.
 */
export function ContactCta({ headline, body, context, inquiryHref = "/contact" }: Props) {
  const waUrl = whatsappUrl(
    context
      ? `Hi LEVANTER desk — I'd like to discuss: ${context}`
      : "Hi LEVANTER desk — I'd like to discuss a fixture."
  );
  const emailUrl = mailUrl(context ? `LEVANTER · ${context}` : undefined);

  return (
    <section className="contact-cta" aria-labelledby="contact-cta-h">
      <div className="contact-cta-inner">
        <div className="contact-cta-head">
          <span className="eyebrow" style={{ color: "var(--accent-brass-lt)" }}>
            Reach the desk
          </span>
          <h2
            id="contact-cta-h"
            className="display"
            style={{
              color: "var(--ink-bone)",
              fontSize: "clamp(28px, 3.4vw, 38px)",
              fontWeight: 400,
              letterSpacing: "-0.018em",
              margin: "10px 0 14px",
              lineHeight: 1.15,
            }}
          >
            {headline ?? DEFAULT_HEADLINE}
          </h2>
          <p
            style={{
              color: "rgba(241,236,220,.78)",
              maxWidth: "52ch",
              margin: 0,
              fontSize: 16,
              lineHeight: 1.6,
            }}
          >
            {body ?? DEFAULT_BODY}
          </p>
        </div>

        <div className="contact-cta-grid">
          <Button asChild size="lg" className="contact-cta-primary">
            <Link href={inquiryHref}>
              Charter inquiry <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>

          <TrackedAnchor
            channel="whatsapp"
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-channel"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            <div>
              <div className="contact-channel-name">WhatsApp</div>
              <div className="contact-channel-value">{siteConfig.whatsappDisplay}</div>
            </div>
          </TrackedAnchor>
          <TrackedAnchor channel="phone" href={telUrl()} className="contact-channel">
            <Phone className="h-5 w-5" aria-hidden="true" />
            <div>
              <div className="contact-channel-name">Call HQ</div>
              <div className="contact-channel-value">{siteConfig.phone}</div>
            </div>
          </TrackedAnchor>
          <TrackedAnchor channel="email" href={emailUrl} className="contact-channel">
            <Mail className="h-5 w-5" aria-hidden="true" />
            <div>
              <div className="contact-channel-name">Email</div>
              <div className="contact-channel-value">{siteConfig.email}</div>
            </div>
          </TrackedAnchor>
        </div>
      </div>
    </section>
  );
}
