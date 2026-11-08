/**
 * Markdoc for blog post bodies (content/blog/*.mdoc): the tags editors insert
 * from the Keystatic toolbar (callout, pullQuote, routeTable, figure), the
 * node overrides (heading anchors, row headers in tables, lazy images), and
 * three outputs of one transform:
 *
 *   - a render tree for the article page (components/site/blog/ArticleBody),
 *   - HTML for the RSS feed's <content:encoded>,
 *   - plain text for llms-full.txt, word counts and the migration test.
 *
 * The tag attributes must match the Keystatic components in
 * keystatic.config.ts (`blogComponents`); lib/blog/blog.test.ts checks that.
 * Pure: no file access, no React.
 */
import Markdoc, {
  Tag,
  type Config,
  type Node,
  type RenderableTreeNode,
  type Schema,
  type ValidateError,
} from "@markdoc/markdoc";
import { slugify } from "@/lib/slug";

/* ---------- tags (the Keystatic content components) ---------- */

const isTag = (n: RenderableTreeNode): n is Tag => Tag.isTag(n);

/** Boxed note with a label, its text and an optional link to a page on this site. */
const callout: Schema = {
  attributes: {
    label: { type: String, required: true },
    linkHref: { type: String, matches: /^\/(?!\/)/ },
    linkLabel: { type: String },
  },
  transform(node, config) {
    const { label, linkHref, linkLabel } = node.transformAttributes(config) as {
      label: string;
      linkHref?: string;
      linkLabel?: string;
    };
    const link =
      linkHref && linkLabel
        ? [
            new Tag("p", { class: "bl-callout__link" }, [
              new Tag("a", { href: linkHref }, [linkLabel]),
            ]),
          ]
        : [];
    // Part of the article: a note, not a complementary landmark.
    return new Tag("div", { class: "bl-callout", role: "note" }, [
      new Tag("p", { class: "bl-callout__label" }, [label]),
      ...node.transformChildren(config),
      ...link,
    ]);
  },
};

/** A sentence from the text, set large in the serif italic. */
const pullQuote: Schema = {
  selfClosing: true,
  attributes: {
    quote: { type: String, required: true },
    attribution: { type: String },
  },
  transform(node, config) {
    const { quote, attribution } = node.transformAttributes(config) as {
      quote: string;
      attribution?: string;
    };
    return new Tag("figure", { class: "bl-quote" }, [
      new Tag("blockquote", {}, [new Tag("p", {}, [quote])]),
      ...(attribution ? [new Tag("figcaption", {}, [attribution])] : []),
    ]);
  },
};

/** A table with a caption; wide tables scroll inside their frame. */
const routeTable: Schema = {
  attributes: { caption: { type: String, required: true } },
  children: ["table", "tag"],
  transform(node, config) {
    const { caption } = node.transformAttributes(config) as { caption: string };
    const children = node
      .transformChildren(config)
      .map((child) =>
        isTag(child) && child.name === "table"
          ? new Tag("table", child.attributes, [
              new Tag("caption", {}, [caption]),
              ...child.children,
            ])
          : child
      );
    return new Tag(
      "div",
      { class: "bl-table", role: "region", "aria-label": caption, tabindex: "0" },
      children
    );
  },
};

/** An uploaded image with a caption and an optional credit. */
const figure: Schema = {
  selfClosing: true,
  attributes: {
    image: { type: String, required: true },
    alt: { type: String, required: true },
    caption: { type: String },
    credit: { type: String },
  },
  transform(node, config) {
    const { image, alt, caption, credit } = node.transformAttributes(config) as {
      image: string;
      alt: string;
      caption?: string;
      credit?: string;
    };
    const text = [
      ...(caption ? [caption] : []),
      ...(credit ? [new Tag("span", { class: "bl-figure__credit" }, [credit])] : []),
    ];
    return new Tag("figure", { class: "bl-figure" }, [
      new Tag("img", { src: image, alt, loading: "lazy", decoding: "async" }),
      ...(text.length ? [new Tag("figcaption", {}, text)] : []),
    ]);
  },
};

export const BLOG_TAGS = { callout, pullQuote, routeTable, figure } as const;
export type BlogTagName = keyof typeof BLOG_TAGS;

/* ---------- node overrides ---------- */

const nodes: Config["nodes"] = {
  // Render the body's blocks directly (the page supplies the <article>).
  document: { ...Markdoc.nodes.document, render: undefined },
  heading: {
    ...Markdoc.nodes.heading,
    transform(node, config) {
      const attributes = node.transformAttributes(config);
      const level = node.attributes.level as number;
      return new Tag(
        `h${level}`,
        { ...attributes, id: attributes.id ?? slugify(inlineText(node)) },
        node.transformChildren(config)
      );
    },
  },
  th: {
    ...Markdoc.nodes.th,
    transform(node, config) {
      return new Tag(
        "th",
        { scope: "col", ...node.transformAttributes(config) },
        node.transformChildren(config)
      );
    },
  },
  // The first cell of a body row names the row (as the research notes did).
  tr: {
    ...Markdoc.nodes.tr,
    transform(node, config) {
      const children = node.transformChildren(config);
      const first = children[0];
      if (node.children[0]?.type === "td" && first && isTag(first)) {
        children[0] = new Tag("th", { ...first.attributes, scope: "row" }, first.children);
      }
      return new Tag("tr", node.transformAttributes(config), children);
    },
  },
  image: {
    ...Markdoc.nodes.image,
    transform(node, config) {
      return new Tag("img", {
        ...node.transformAttributes(config),
        loading: "lazy",
        decoding: "async",
      });
    },
  },
};

export const MARKDOC_CONFIG: Config = { tags: BLOG_TAGS, nodes };

/* ---------- parse / validate / transform ---------- */

/** Parse a post file (frontmatter + body) or a body on its own. */
export function parseMarkdoc(source: string): Node {
  return Markdoc.parse(source);
}

/** Markdoc problems in a body (unknown tags, missing attributes, bad nesting). */
export function validateBody(ast: Node): ValidateError[] {
  return Markdoc.validate(ast, MARKDOC_CONFIG).filter((e) => e.error.level !== "debug");
}

/**
 * Give every heading a unique id (its slug, numbered on repeats) before
 * transforming, so the table of contents and the rendered anchors agree.
 */
export function assignHeadingIds(ast: Node): Heading[] {
  const seen = new Map<string, number>();
  const headings: Heading[] = [];
  for (const node of ast.walk()) {
    if (node.type !== "heading") continue;
    const text = inlineText(node);
    const base = (node.attributes.id as string | undefined) || slugify(text) || "section";
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    const id = n ? `${base}-${n + 1}` : base;
    node.attributes.id = id;
    headings.push({ id, text, level: node.attributes.level as number });
  }
  return headings;
}

export type Heading = { id: string; text: string; level: number };

export function transformBody(ast: Node): RenderableTreeNode {
  return Markdoc.transform(ast, MARKDOC_CONFIG);
}

/** The body as HTML (RSS <content:encoded>). */
export function bodyHtml(ast: Node): string {
  return Markdoc.renderers.html(transformBody(ast));
}

/* ---------- plain text ---------- */

/** The text of a node's inline content: words only, no markup. */
export function inlineText(node: Node): string {
  switch (node.type) {
    case "text":
    case "code":
      return String(node.attributes.content ?? "");
    case "softbreak":
      return " ";
    case "hardbreak":
      return "\n";
    case "image":
      return String(node.attributes.alt ?? "");
    default:
      return node.children.map(inlineText).join("");
  }
}

const tableText = (table: Node, caption?: string) => {
  const rows = [...table.walk()].filter((n) => n.type === "tr");
  const cells = (tr: Node) => tr.children.map((c) => inlineText(c).trim());
  const [head, ...body] = rows;
  if (!head) return caption ?? "";
  return [
    ...(caption ? [caption] : []),
    `| ${cells(head).join(" | ")} |`,
    `| ${cells(head)
      .map(() => "---")
      .join(" | ")} |`,
    ...body.map((r) => `| ${cells(r).join(" | ")} |`),
  ].join("\n");
};

function blockText(node: Node): string[] {
  switch (node.type) {
    case "paragraph":
      return [inlineText(node)];
    case "heading":
      return [`${"#".repeat(node.attributes.level as number)} ${inlineText(node)}`];
    case "list": {
      const ordered = Boolean(node.attributes.ordered);
      return [
        node.children
          .map((item, i) => `${ordered ? `${i + 1}.` : "-"} ${inlineText(item).trim()}`)
          .join("\n"),
      ];
    }
    case "table":
      return [tableText(node)];
    case "blockquote":
      return node.children.flatMap(blockText).map((t) => `> ${t}`);
    case "fence":
      return [String(node.attributes.content ?? "").trimEnd()];
    case "image":
      return [String(node.attributes.alt ?? "")];
    case "hr":
      return [];
    case "tag":
      switch (node.tag) {
        case "callout":
          return [`${node.attributes.label}: ${node.children.flatMap(blockText).join(" ")}`];
        case "routeTable": {
          // {% table %} parses to a tag node wrapping the table node.
          const table = [...node.walk()].find((c) => c.type === "table");
          return [table ? tableText(table, node.attributes.caption) : node.attributes.caption];
        }
        case "pullQuote":
          return [
            `“${node.attributes.quote}”${node.attributes.attribution ? ` — ${node.attributes.attribution}` : ""}`,
          ];
        case "figure":
          return [node.attributes.caption ?? node.attributes.alt ?? ""].filter(Boolean);
        default:
          return node.children.flatMap(blockText);
      }
    default:
      return node.children.flatMap(blockText);
  }
}

/**
 * Plain text of a body: paragraphs, "## headings", "- " and "1. " lists,
 * "Label: text" callouts and pipe tables, separated by blank lines. The same
 * shape the research notes' bodyText() produced, so the migration test can
 * compare old and new text exactly.
 */
export function bodyText(ast: Node): string {
  return ast.children
    .flatMap(blockText)
    .filter((t) => t.length > 0)
    .join("\n\n");
}

/** Internal links in a body (links and callout links), for link checks. */
export function bodyLinks(ast: Node): string[] {
  const out: string[] = [];
  for (const node of ast.walk()) {
    if (node.type === "link" && typeof node.attributes.href === "string") {
      out.push(node.attributes.href);
    }
    if (node.type === "tag" && node.tag === "callout" && node.attributes.linkHref) {
      out.push(node.attributes.linkHref);
    }
  }
  return out;
}

/** Images a body uses (figures and inline images), for existence checks. */
export function bodyImages(ast: Node): string[] {
  const out: string[] = [];
  for (const node of ast.walk()) {
    if (node.type === "image" && typeof node.attributes.src === "string") {
      out.push(node.attributes.src);
    }
    if (node.type === "tag" && node.tag === "figure" && node.attributes.image) {
      out.push(node.attributes.image);
    }
  }
  return out;
}

export const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;
