/**
 * The blog's RSS 2.0 feed (/blog/feed.xml): every published post, newest
 * first, with the full text as HTML in <content:encoded> so readers get the
 * whole post. Pure (posts in, XML out) for the route and the tests.
 */
import { siteConfig } from "@/lib/site";
import { BLOG_DESCRIPTION, BLOG_FEED_PATH, BLOG_NAME, BLOG_PATH } from "./meta";
import { bodyHtml } from "./markdoc";
import type { Post } from "./posts";

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const abs = (path: string) => new URL(path, siteConfig.url).toString();
const rfc822 = (iso: string) => new Date(`${iso}T00:00:00Z`).toUTCString();

/** Relative links and images in the HTML made absolute (feed readers have no base URL). */
const absolutize = (html: string) =>
  html.replace(/\b(href|src)="\/(?!\/)/g, (_, attr: string) => `${attr}="${abs("/")}`);

/** A post's full text as HTML: dek, key takeaways, summary, body, FAQ. */
export function postFeedHtml(post: Post): string {
  const parts = [`<p><em>${escape(post.dek)}</em></p>`];
  if (post.keyTakeaways.length) {
    parts.push(
      `<p><strong>Key takeaways</strong></p><ul>${post.keyTakeaways
        .map((t) => `<li>${escape(t)}</li>`)
        .join("")}</ul>`
    );
  }
  if (post.summary) parts.push(`<p><strong>Summary.</strong> ${escape(post.summary)}</p>`);
  parts.push(bodyHtml(post.ast));
  if (post.gated) {
    parts.push(
      `<p><em>The full report is sent on request: ${escape(siteConfig.desks.research.email)}.</em></p>`
    );
  }
  if (post.faq.length) {
    parts.push(post.faq.map((f) => `<h3>${escape(f.q)}</h3><p>${escape(f.a)}</p>`).join(""));
  }
  return absolutize(parts.join(""));
}

export function blogFeedXml(posts: Post[]): string {
  const items = posts
    .map((p) => {
      const url = abs(p.href);
      return `    <item>
      <title>${escape(p.title)}</title>
      <link>${escape(url)}</link>
      <guid isPermaLink="true">${escape(url)}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <category>${escape(p.category.label)}</category>${p.tags
        .map((t) => `\n      <category>${escape(t)}</category>`)
        .join("")}${p.author ? `\n      <dc:creator>${escape(p.author.name)}</dc:creator>` : ""}
      <description>${escape(p.description)}</description>
      <content:encoded><![CDATA[${postFeedHtml(p).replace(/]]>/g, "]]]]><![CDATA[>")}]]></content:encoded>
    </item>`;
    })
    .join("\n");

  // The newest revision, so the static output only changes when content does.
  const newest = posts.reduce(
    (max, p) => ((p.updated ?? p.date) > max ? (p.updated ?? p.date) : max),
    ""
  );
  const lastBuild = newest ? rfc822(newest) : new Date(0).toUTCString();
  const title = `${siteConfig.name} — ${BLOG_NAME.replace(/^LEVANTER /, "")}: Notes from the desk`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escape(title)}</title>
    <link>${escape(abs(BLOG_PATH))}</link>
    <description>${escape(BLOG_DESCRIPTION)}</description>
    <language>en</language>
    <copyright>${escape(`© ${siteConfig.legalEntity}`)}</copyright>
    <image>
      <url>${escape(abs("/apple-icon"))}</url>
      <title>${escape(title)}</title>
      <link>${escape(abs(BLOG_PATH))}</link>
    </image>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${escape(abs(BLOG_FEED_PATH))}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}
