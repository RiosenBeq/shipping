import Link from "next/link";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
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
  /** Short note under the buttons, e.g. "The inquiry form is in English." on localized pages. */
  note?: string;
  id?: string;
  /**
   * Homepages: a transparent window onto the voyage stage's night scene
   * instead of a navy band. The copy keeps its dark-band colours.
   */
  onStage?: boolean;
  /** Replaces the end column; the buttons then move under the text. */
  aside?: React.ReactNode;
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
  note,
  id,
  onStage = false,
  aside,
}: Props) {
  const actions = (
    <div className="flex w-full flex-col gap-4 lg:max-w-md">
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
      {note && <p className="text-sm text-fog">{note}</p>}
      {/* The address as plain, selectable text for people without a mail client.
          The paragraph keeps the page direction (right-aligned on RTL); only the
          address itself is isolated as LTR. */}
      <p className="text-start font-mono text-[13px] tracking-wide text-fog">
        <bdi dir="ltr" className="select-all">
          {email}
        </bdi>
      </p>
    </div>
  );

  return (
    // data-fab-hide: the floating WhatsApp button steps aside while this band
    // (which has its own WhatsApp button) is on screen.
    <section
      id={id}
      data-fab-hide=""
      data-voyage-scene={onStage ? "contact" : undefined}
      className={cn(
        "relative isolate overflow-hidden text-white print:hidden",
        !onStage && "bg-navy"
      )}
    >
      {!onStage && (
        <>
          <div className="uv-hero-pattern" aria-hidden="true" />
          {/* brass hairline across the top edge */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-brass/70 to-transparent"
          />
        </>
      )}
      <div
        className={cn(
          "container relative z-[1] grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-16",
          onStage ? "py-24 md:py-40" : "py-16 md:py-24"
        )}
      >
        <div className={cn(onStage && "voyage-scrim voyage-scrim--ink")}>
          {eyebrow && (
            <Eyebrow dark className="mb-4">
              {eyebrow}
            </Eyebrow>
          )}
          <h2 className="font-display text-[32px] leading-[1.12] tracking-tight md:text-[44px]">
            {title}
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-fog">{text}</p>
          {aside && <div className="mt-9">{actions}</div>}
        </div>

        {aside ? (
          <div className="w-full lg:max-w-md lg:justify-self-end">{aside}</div>
        ) : (
          <div className="w-full lg:max-w-md lg:justify-self-end">{actions}</div>
        )}
      </div>
    </section>
  );
}
