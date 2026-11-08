import type { AuthorData } from "@/lib/blog/meta";
import { cn } from "@/lib/utils";

/** Desk heads have a brass avatar (AVATAR_COLOR in lib/data/brokers.ts). */
const isHead = (author: AuthorData) => author.color.toUpperCase() === "#B8893A";

/** A broker's photo, or their initials in the desk colour. Decorative (the name is next to it). */
export function AuthorAvatar({ author, size = "md" }: { author: AuthorData; size?: "md" | "lg" }) {
  return (
    <span
      className={cn("bl-av", size === "lg" && "bl-av--lg", isHead(author) && "bl-av--head")}
      aria-hidden="true"
    >
      {author.photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- small square photo from /images/brokers
        <img src={author.photo} alt="" width={72} height={72} loading="lazy" decoding="async" />
      ) : (
        author.initials
      )}
    </span>
  );
}

/** Avatar + name + title (cards, the masthead and the desk card). */
export function Byline({ author, note }: { author: AuthorData; note?: string }) {
  return (
    <span className="bl-by">
      <AuthorAvatar author={author} />
      <span>
        <b>{author.name}</b>
        <small>{note ?? author.title}</small>
      </span>
    </span>
  );
}
