import Link from "next/link";
import type { PostCardData } from "@/lib/blog/meta";
import { cn } from "@/lib/utils";
import { Byline } from "./AuthorAvatar";
import { ArrowIcon } from "./icons";
import { PostCover } from "./PostCover";

/** Date and reading-time pills (the date is a machine-readable <time>). */
export function PostPills({
  post,
  withFormat = false,
}: {
  post: PostCardData;
  withFormat?: boolean;
}) {
  return (
    <ul className="bl-pills" aria-label="About this post">
      {withFormat && (
        <li>
          <span className="bl-pill bl-pill--ink">{post.format}</span>
        </li>
      )}
      {post.draft && (
        <li>
          <span className="bl-pill bl-pill--brass">Draft</span>
        </li>
      )}
      <li>
        <span className="bl-pill">
          <time dateTime={post.date}>{post.dateLabel}</time>
        </span>
      </li>
      <li>
        <span className="bl-pill">
          {post.gated ? "Summary · full report on request" : `${post.readingTime} min read`}
        </span>
      </li>
    </ul>
  );
}

/**
 * A post teaser: cover, pills, category, title, byline. The title is the
 * link and its hit area covers the card (one tab stop per post).
 */
export function PostCard({
  post,
  headingLevel = 3,
  priority = false,
  className,
}: {
  post: PostCardData;
  headingLevel?: 2 | 3;
  priority?: boolean;
  className?: string;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className={cn("bl-card", className)}>
      <PostCover post={post} size="sm" priority={priority} />
      <PostPills post={post} />
      <p className="bl-card__cat">{post.category.label}</p>
      <Heading className="bl-card__title">
        <Link href={post.href} className="bl-card__link">
          <span>{post.title}</span>
        </Link>
      </Heading>
      {post.author && <Byline author={post.author} />}
    </article>
  );
}

/** The newest post, large: cover left, text right (mock 04). */
export function FeaturedPost({ post }: { post: PostCardData }) {
  return (
    <article className="bl-card bl-feat">
      <PostCover post={post} size="wide" priority />
      <div>
        <PostPills post={post} withFormat />
        <h2 className="bl-card__title">
          <Link href={post.href} className="bl-card__link">
            <span>{post.title}</span>
          </Link>
        </h2>
        <p className="bl-card__dek">{post.dek}</p>
        <div className="bl-feat__foot">
          {post.author && <Byline author={post.author} />}
          <span className="bl-btn" aria-hidden="true">
            Read the note
            <span className="bl-btn__arrow">
              <ArrowIcon />
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
