import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/site";

/** Small always-available WhatsApp shortcut. No JS required. */
export function FloatingContact() {
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener"
      className="site-chrome fixed bottom-5 right-5 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-navy px-4 text-sm font-semibold text-white shadow-lg shadow-navy/20 transition-colors hover:bg-navy-soft print:hidden"
      aria-label="Message the desk on WhatsApp"
    >
      <MessageCircle className="h-5 w-5 text-brass-light" aria-hidden="true" />
      <span className="hidden sm:inline">Talk to a broker</span>
    </a>
  );
}
