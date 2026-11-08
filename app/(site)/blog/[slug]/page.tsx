import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/site/JsonLd";
import { ArticleBody } from "@/components/site/blog/ArticleBody";
import { AuthorAvatar, Byline } from "@/components/site/blog/AuthorAvatar";
import { ArrowIcon } from "@/components/site/blog/icons";
import { BlogMasthead } from "@/components/site/blog/Masthead";
import { PostGrid } from "@/components/site/blog/PostGrid";
import { PostCover } from "@/components/site/blog/PostCover";
import { TableOfContents } from "@/components/site/blog/TableOfContents";
import "@/components/site/blog/blog.css";
import { BLOG_PATH, CATEGORY_INFO, formatPostDate, shareImagePath } from "@/lib/blog/meta";
import {
  adjacentPosts,
  getPost,
  getPosts,
  relatedPosts,
  toCard,
  type Post,
} from "@/lib/blog/posts";
import { getBroker } from "@/lib/data/brokers";
import { inquiryHref } from "@/lib/inquiry";
import { blogPostingLd, buildPageMetadata, faqLd, isoDateTime, webPageLd } from "@/lib/seo";
import { siteConfig, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}
// Unknown slugs render on demand and hit notFound() (the styled 404). Keep
// this route free of a loading.tsx: a Suspense boundary above the page turns
// its notFound() into HTTP 200.

export function generateMetadata({ params }: Props): Metadata {
  const post = getPost(params.slug);
  if (!post) notFound();
  const title = post.seoTitle ?? post.title;
  return {
    ...buildPageMetadata({
      title,
      // Drop the " — LEVANTER" suffix when it would push the title past ~60 characters.
      absoluteTitle: title.length > 48,
      description: post.description,
      path: post.href,
      languages: { en: post.href },
      ogImage: shareImagePath(post.slug),
      keywords: [...post.tags, post.category.label, post.format],
      article: {
        publishedTime: isoDateTime(post.date),
        modifiedTime: isoDateTime(post.updated ?? post.date),
        section: post.category.label,
        authors: post.author ? [post.author.name] : [],
        tags: post.tags,
      },
    }),
    ...(post.draft ? { robots: { index: false, follow: false } } : {}),
  };
}

/** The desk that answers for a post's author: their team's inbox. */
function deskFor(post: Post) {
  const broker = post.author ? getBroker(post.author.name) : undefined;
  const lpg = broker ? broker.team === "lpg" : post.desk === "lpg";
  return lpg
    ? {
        name: siteConfig.desks.lpg.label,
        email: siteConfig.desks.lpg.email,
        inquiry: inquiryHref({
          segment: /ammonia|\bNH3\b|NH₃/i.test(`${post.title} ${post.tags.join(" ")}`)
            ? "ammonia"
            : "lpg",
        }),
      }
    : {
        name: siteConfig.desks.tankers.label,
        email: siteConfig.desks.tankers.email,
        inquiry: inquiryHref(),
      };
}

const firstName = (name: string) => name.split(" ")[0];

/** /blog/<slug>: one post (DESIGN-V2 §10: masthead, cover aperture, three columns). */
export default function BlogPostPage({ params }: Props) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const desk = deskFor(post);
  const broker = post.author ? getBroker(post.author.name) : undefined;
  const { newer, older } = adjacentPosts(post);
  const related = relatedPosts(post, 3);
  const showToc = post.headings.filter((h) => h.level === 2).length >= 2;
  const mailSubject = encodeURIComponent(`Re: ${post.title}`);

  return (
    <div className="bl bl-page">
      <JsonLd
        data={[
          webPageLd({
            title: post.title,
            description: post.description,
            path: post.href,
            dateModified: isoDateTime(post.updated ?? post.date),
          }),
          blogPostingLd({
            title: post.title,
            description: post.description,
            path: post.href,
            date: post.date,
            updated: post.updated,
            section: post.category.label,
            author: post.author,
            keywords: post.tags,
            text: post.text,
            image: shareImagePath(post.slug),
            gated: post.gated,
          }),
          ...(post.faq.length ? [faqLd(post.faq)] : []),
        ]}
      />

      <BlogMasthead
        className="bl-mast--post"
        crumbs={[
          { name: "Blog", path: BLOG_PATH },
          { name: post.category.label, path: post.category.href },
          { name: post.title, path: post.href },
        ]}
      >
        <ul className="bl-pills mb-6">
          <li>
            <Link href={post.category.href} className="bl-pill bl-pill--night">
              {post.category.label}
            </Link>
          </li>
          {post.format !== post.category.label &&
            post.format !== CATEGORY_INFO[post.category.slug].singular && (
              <li>
                <span className="bl-pill bl-pill--night">{post.format}</span>
              </li>
            )}
          {post.draft && (
            <li>
              <span className="bl-pill bl-pill--brass">Draft — not on the live site</span>
            </li>
          )}
        </ul>
        <h1 id="post-title" className="bl-title">
          {post.title}
        </h1>
        <p className="bl-mast__dek">{post.dek}</p>
        <div className="bl-meta">
          {post.author && <Byline author={post.author} />}
          <dl>
            <div>
              <dt>Published</dt>
              <dd>
                <time dateTime={post.date}>{post.dateLabel}</time>
              </dd>
            </div>
            {post.updated && (
              <div>
                <dt>Updated</dt>
                <dd>
                  <time dateTime={post.updated}>{formatPostDate(post.updated)}</time>
                </dd>
              </div>
            )}
            <div>
              <dt>Read</dt>
              <dd>{post.gated ? "Summary" : `${post.readingTime} min`}</dd>
            </div>
            {post.issue && (
              <div>
                <dt>Issue</dt>
                <dd>{post.issue}</dd>
              </div>
            )}
          </dl>
        </div>
      </BlogMasthead>

      <div className="bl-sheet">
        <div className="bl-wrap">
          <PostCover post={post} size="hero" priority className="bl-article-cover" />

          <div className={cn("bl-layout", !showToc && "bl-layout--no-toc")}>
            {showToc && (
              <TableOfContents
                headings={post.headings.filter((h) => h.level === 2)}
                articleId="post-body"
              />
            )}

            <article id="post-body" aria-labelledby="post-title">
              {post.keyTakeaways.length > 0 && (
                <section className="bl-takeaways" aria-labelledby="takeaways-title">
                  <h2 id="takeaways-title">Key takeaways</h2>
                  <ol>
                    {post.keyTakeaways.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ol>
                </section>
              )}

              {post.gated && post.summary && (
                <div className="bl-prose">
                  <p>
                    <strong>Summary. </strong>
                    {post.summary}
                  </p>
                </div>
              )}

              <ArticleBody ast={post.ast} />

              {post.gated && (
                <div className="bl-gated">
                  <h2>Full report on request</h2>
                  <p>
                    The full report is sent by email, free of charge. Write to the desk and we will
                    send you a copy.
                  </p>
                  <a
                    className="bl-btn"
                    href={`mailto:${siteConfig.desks.research.email}?subject=${encodeURIComponent(
                      `Report request: ${post.title}`
                    )}`}
                  >
                    Request the full report
                    <span className="bl-btn__arrow">
                      <ArrowIcon />
                    </span>
                  </a>
                </div>
              )}

              {post.faq.length > 0 && (
                <section className="bl-faq" aria-labelledby="faq-title">
                  <h2 id="faq-title">Questions</h2>
                  {post.faq.map((f) => (
                    <details key={f.q}>
                      <summary>{f.q}</summary>
                      <p>{f.a}</p>
                    </details>
                  ))}
                </section>
              )}

              {post.tags.length > 0 && (
                <div className="bl-tags">
                  <span>Filed under</span>
                  <ul className="bl-pills">
                    {post.tags.map((t) => (
                      <li key={t}>
                        <span className="bl-pill">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {post.author && (
                <section className="bl-author" aria-labelledby="author-title">
                  <AuthorAvatar author={post.author} size="lg" />
                  <div>
                    <h2 id="author-title">About the author</h2>
                    <h3>{post.author.name}</h3>
                    <p>
                      {post.author.title}
                      {broker ? ` · ${broker.office}` : ""}
                      {broker?.languages.length ? ` · speaks ${broker.languages.join(", ")}` : ""}
                    </p>
                    {broker && broker.focus.length > 0 && <p>Focus: {broker.focus.join(", ")}.</p>}
                    <p className="bl-author__links">
                      <Link href={`/brokers#${post.author.id}`}>Meet the team</Link>
                      <a href={`mailto:${desk.email}?subject=${mailSubject}`}>Email the desk</a>
                    </p>
                  </div>
                </section>
              )}
            </article>

            <section className="bl-desk" aria-labelledby="desk-title">
              <h2 id="desk-title">Talk to the author</h2>
              {post.author && <Byline author={post.author} note={desk.name} />}
              <p>
                Questions on this note, or a cargo or ship it affects? Talk to the broker who wrote
                it. A first reply within 60 minutes in business hours.
              </p>
              <div className="bl-desk__actions">
                <a href={`mailto:${desk.email}?subject=${mailSubject}`}>
                  {post.author ? `Email ${firstName(post.author.name)}` : "Email the desk"}
                  <span className="bl-btn__arrow">
                    <ArrowIcon />
                  </span>
                </a>
                <a
                  href={whatsappUrl(`Hi LEVANTER desk — about "${post.title}".`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp the desk
                  <span className="bl-btn__arrow">
                    <ArrowIcon />
                  </span>
                </a>
              </div>
              <small dir="ltr">{desk.email}</small>
            </section>
          </div>

          {(newer || older) && (
            <nav className="bl-pn" aria-label="More posts">
              {older ? (
                <Link href={older.href} rel="prev">
                  <small>← Older · {older.dateLabel}</small>
                  <strong>{older.title}</strong>
                </Link>
              ) : (
                <span />
              )}
              {newer && (
                <Link href={newer.href} rel="next" className="bl-pn__next">
                  <small>Newer · {newer.dateLabel} →</small>
                  <strong>{newer.title}</strong>
                </Link>
              )}
            </nav>
          )}

          {related.length > 0 && (
            <section className="bl-related mt-16 md:mt-24" aria-labelledby="related-title">
              <div className="bl-head">
                <div>
                  <p className="bl-sub">Keep reading</p>
                  <h2 id="related-title">Related notes.</h2>
                </div>
                <Link href={BLOG_PATH} className="bl-pill bl-pill--lg">
                  All posts
                </Link>
              </div>
              <PostGrid posts={related.map(toCard)} grouped={false} />
            </section>
          )}

          <section className="bl-letter" aria-labelledby="letter-title">
            <div>
              <h2 id="letter-title">Have a cargo or a ship to fix?</h2>
              <p>
                Send the cargo, ports and laycan. A broker replies within sixty minutes in business
                hours — no account needed.
              </p>
            </div>
            <div>
              <a className="bl-letter__mail" href={`mailto:${desk.email}`} dir="ltr">
                {desk.email}
              </a>
              <div className="bl-letter__actions">
                <Link className="bl-btn" href={desk.inquiry}>
                  Send an inquiry
                  <span className="bl-btn__arrow">
                    <ArrowIcon />
                  </span>
                </Link>
                <a
                  className="bl-btn bl-btn--ghost"
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp the desk
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
