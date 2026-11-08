import Link from "next/link";
import { BLOG_PATH, type PostCardData } from "@/lib/blog/meta";
import { cn } from "@/lib/utils";
import { PostCard } from "./PostCard";
import { ScrollRow } from "./ScrollRow";
import "./blog.css";

/**
 * "Notes from the desk": the latest posts as a row of cards (DESIGN-V2 §7.8)
 * for the homepage and the desk pages. Data comes in as props, so the page
 * decides which posts (lib/blog/posts.ts → latestPostCards(3) or
 * latestPostCards(3, "lpg")):
 *
 *   import { NotesStrip } from "@/components/site/blog/NotesStrip";
 *   import { latestPostCards } from "@/lib/blog/posts";
 *   <NotesStrip posts={latestPostCards(3)} />
 *
 * Renders the "— From the desk" sub line, an <h2> (pass `title`), an
 * "All posts" pill and ←/→ buttons when the row overflows (phones: a snap
 * row with 1.15 cards visible). No background of its own: place it on a
 * paper card/section.
 */
export function NotesStrip({
  posts,
  id = "notes",
  sub = "From the desk",
  title = "Notes from the desk.",
  allHref = BLOG_PATH,
  allLabel = "All posts",
  className,
}: {
  posts: PostCardData[];
  id?: string;
  sub?: string;
  title?: string;
  allHref?: string;
  allLabel?: string;
  className?: string;
}) {
  if (posts.length === 0) return null;
  const headingId = `${id}-title`;
  return (
    <section id={id} className={cn("bl", className)} aria-labelledby={headingId}>
      <ScrollRow
        label={title}
        header={
          <div>
            <p className="bl-sub">{sub}</p>
            <h2 id={headingId}>{title}</h2>
          </div>
        }
        actions={
          <Link href={allHref} className="bl-pill bl-pill--lg">
            {allLabel}
          </Link>
        }
      >
        {posts.map((p) => (
          <li key={p.slug}>
            <PostCard post={p} />
          </li>
        ))}
      </ScrollRow>
    </section>
  );
}
