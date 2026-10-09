import Link from "next/link";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig, whatsappUrl } from "@/lib/site";

type Props = {
  title?: string;
  text?: string;
  /** Desk inbox to show as the email option. Defaults to the main desk. */
  email?: string;
  /** Button labels — overridden on localized landing pages. */
  labels?: { inquiry?: string; email?: string };
  whatsappText?: string;
};

/** End-of-page call to action: inquiry form, WhatsApp, email. */
export function CtaBand({
  title = "Have a cargo or a ship to fix?",
  text = "Send the cargo, ports and laycan. A broker replies within 60 minutes during business hours — no account, no forms forwarded.",
  email = siteConfig.email,
  labels,
  whatsappText,
}: Props) {
  return (
    <section className="bg-navy text-white">
      <div className="container grid gap-8 py-16 md:py-20 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div>
          <h2 className="font-display text-3xl leading-tight tracking-tight md:text-[40px]">
            {title}
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-fog">{text}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <Button asChild size="lg">
            <Link href="/contact">
              {labels?.inquiry ?? "Send an inquiry"}{" "}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="light">
            <a href={whatsappUrl(whatsappText)} target="_blank" rel="noopener">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </Button>
          <Button asChild size="lg" variant="light">
            <a href={`mailto:${email}`}>
              <Mail className="h-4 w-4" /> {labels?.email ?? "Email"}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
