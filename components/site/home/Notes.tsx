import Link from "next/link";
import { Faq } from "@/components/site/Faq";
import { NotesStrip } from "@/components/site/blog/NotesStrip";
import { BLOG_CATEGORIES, CATEGORY_INFO, categoryPath } from "@/lib/blog/meta";
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
  if (!notes) return null;
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
        {/* Every category with posts, crawlable from the homepage (the blog is in English). */}
        <nav className="h-notes__cats" aria-label="Blog categories" lang="en">
          <p className="t-label">Browse by category</p>
          <ul>
            {BLOG_CATEGORIES.filter((c) => notes.categories.counts[c] > 0).map((c) => (
              <li key={c}>
                <Link href={categoryPath(c)} className="lv-chip">
                  {CATEGORY_INFO[c].label}
                  <b>{notes.categories.counts[c]}</b>
                  <span className="sr-only"> posts</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
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
