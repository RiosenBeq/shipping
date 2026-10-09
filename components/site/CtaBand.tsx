import Link from "next/link";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig, whatsappUrl } from "@/lib/site";
import { Eyebrow } from "./Section";

type Props = {
  title?: string;
  text?: string;
  /** Desk inbox to show as the email option. Defaults to the main desk. */
  email?: string;
  /** Button labels — overridden on localized landing pages. */
  labels?: { inquiry?: string; email?: string; newTab?: string };
  /** Contact form link; desk and class pages preselect cargo and ship size. */
  inquiryHref?: string;
  whatsappText?: string;
  /** Small label above the title. Omit for none. */
  eyebrow?: string;
};

/** End-of-page call to action on navy: inquiry form, WhatsApp, email. */
export function CtaBand({
  title = "Have a cargo or a ship to fix?",
  text = "Send the cargo, ports and laycan. A broker replies within 60 minutes during business hours — no account needed, nothing stored on this site.",
  email = siteConfig.email,
  labels,
  inquiryHref = "/contact",
  whatsappText,
  eyebrow,
}: Props) {
  return (
    // data-fab-hide: the floating WhatsApp button steps aside while this band
    // (which has its own WhatsApp button) is on screen.
    <section
      data-fab-hide=""
      className="relative isolate overflow-hidden bg-navy text-white print:hidden"
    >
      <div className="uv-hero-pattern" aria-hidden="true" />
      {/* brass hairline across the top edge */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-brass/70 to-transparent"
      />
      <div className="container relative z-[1] grid gap-10 py-16 md:py-24 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-16">
        <div>
          {eyebrow && (
            <Eyebrow dark className="mb-4">
              {eyebrow}
            </Eyebrow>
          )}
          <h2 className="font-display text-[32px] leading-[1.12] tracking-tight md:text-[44px]">
            {title}
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-fog">{text}</p>
        </div>

        <div className="flex w-full flex-col gap-4 lg:max-w-md lg:justify-self-end">
          <div className="grid gap-3 sm:grid-cols-2">
            {/* hrefLang: the form is English-only, which matters on localized pages */}
            <Button asChild size="lg" className="sm:col-span-2">
              <Link href={inquiryHref} hrefLang="en">
                {labels?.inquiry ?? "Send an inquiry"}
                <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="light">
              <a href={whatsappUrl(whatsappText)} target="_blank" rel="noopener">
                <MessageCircle aria-hidden="true" />
                WhatsApp
                <span className="sr-only"> {labels?.newTab ?? "(opens in a new tab)"}</span>
              </a>
            </Button>
            <Button asChild size="lg" variant="light">
              <a href={`mailto:${email}`}>
                <Mail aria-hidden="true" />
                {labels?.email ?? "Email"}
              </a>
            </Button>
          </div>
          {/* The address as plain, selectable text for people without a mail client.
              The paragraph keeps the page direction (right-aligned on RTL); only the
              address itself is isolated as LTR. */}
          <p className="text-start font-mono text-[13px] tracking-wide text-fog">
            <bdi dir="ltr" className="select-all">
              {email}
            </bdi>
          </p>
        </div>
      </div>
    </section>
  );
}
