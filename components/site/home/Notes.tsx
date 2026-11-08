import Link from "next/link";
import { Faq } from "@/components/site/Faq";
import { NotesStrip } from "@/components/site/blog/NotesStrip";
import { Card } from "@/components/site/stage";
import { Arrow } from "./icons";
import type { HomeView } from "./types";

/**
 * 8 · Notes (DESIGN-V2 §7.8): a paper card with the blog's "Notes from the
 * desk" strip (three latest posts, All posts, ←/→) and the FAQ in two columns —
 * h2 and "Ask the desk" on the left, the accordion on the right. FAQPage
 * JSON-LD comes only from these visible items.
 */
export function Notes({ view, id }: { view: HomeView; id: string }) {
  const { notes } = view;
  return (
    <Card id={id} as="div" ground="paper" className="h-card h-notes">
      <div className="h-wrap">
        <NotesStrip
          id="notes-strip"
          posts={notes.posts}
          sub={notes.sub}
          title={notes.title}
          allLabel={notes.allPosts}
          className="h-notes__strip"
        />
        {notes.faq.length > 0 && (
          <section className="h-faq" aria-labelledby="faq-title">
            <div className="h-faq__head">
              <h2 id="faq-title" className="t-display h-faq__title">
                {notes.faqTitle}
              </h2>
              <Link href={notes.faqMore.href} hrefLang={view.linkLang} className="lv-link">
                <span>{notes.faqMore.label}</span>
                <Arrow />
              </Link>
            </div>
            <Faq items={notes.faq} className="h-faq__list" />
          </section>
        )}
      </div>
    </Card>
  );
}
