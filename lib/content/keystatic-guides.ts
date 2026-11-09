/**
 * The "Guides" collection for /keystatic: one Markdoc file per page in
 * content/guides/ (frontmatter + body), served at /guides/<slug> and listed on
 * /guides, in the sitemap and in llms.txt / llms-full.txt. Spread into
 * keystatic.config.ts (`guides: guidesCollection(blogComponents)` in the
 * collections, `...guidesNavigation` in the sidebar). The body uses the blog's
 * components, so lib/blog/markdoc.ts renders both. Field order is the key
 * order Keystatic writes; lib/guides/schema.ts checks the same shape.
 * How to use it: docs/CMS.md → "Rehberler (Guides)".
 */
import { collection, fields } from "@keystatic/core";
import type { ContentComponent } from "@keystatic/core/content-components";
import brokersFile from "@/content/brokers.json";
import {
  GUIDE_DESK_LABELS,
  GUIDE_DESKS,
  GUIDE_KIND_LABELS,
  GUIDE_KINDS,
  GUIDE_LANG_LABELS,
  GUIDE_LANGS,
  GUIDE_LINK_TARGETS,
  GUIDE_SEGMENT_LABELS,
  GUIDE_SEGMENTS,
  GUIDES_DIR,
  GUIDES_PATH,
} from "@/lib/guides/meta";
import { BLOG_IMAGE_DIR, BLOG_IMAGE_PUBLIC_PATH, SLUG_PATTERN } from "./options";

const required = { isRequired: true } as const;

const choice = <T extends string>(
  label: string,
  values: readonly T[],
  defaultValue: T,
  labels: Record<T, string>,
  description?: string
) =>
  fields.select({
    label,
    description,
    defaultValue,
    options: values.map((value) => ({ value, label: labels[value] })),
  });

export function guidesCollection(components: Record<string, ContentComponent>) {
  return collection({
    label: "Guides",
    path: `${GUIDES_DIR}/*`,
    slugField: "title",
    format: { contentField: "body" },
    entryLayout: "content",
    columns: ["lang", "updated"],
    previewUrl: `${GUIDES_PATH}/{slug}`,
    schema: {
      title: fields.slug({
        name: {
          label: "Title (the page's h1)",
          description: "Say what the page answers, in the searcher's words.",
          validation: required,
        },
        slug: {
          label: "URL slug",
          description:
            "The address: /guides/<slug>. Short, with the search words (Turkish pages: no ç, ğ, ı, ö, ş, ü). Do not change it once published.",
          validation: {
            pattern: {
              regex: SLUG_PATTERN,
              message: "Lowercase letters, digits and single hyphens only (e.g. tanker-kiralama).",
            },
          },
        },
      }),
      draft: fields.checkbox({
        label: "Draft",
        description: "Drafts show on the development server only; the live site leaves them out.",
      }),
      seoTitle: fields.text({
        label: "Search title",
        description:
          "Optional <title> for Google, at most 60 characters. Needed when the title is longer than that.",
        validation: { length: { max: 60 } },
      }),
      description: fields.text({
        label: "Search summary (meta description)",
        description: "140–160 characters: what the page answers and why to click.",
        multiline: true,
        validation: { isRequired: true, length: { min: 1, max: 160 } },
      }),
      dek: fields.text({
        label: "Lead",
        description: "One or two sentences under the title.",
        multiline: true,
        validation: required,
      }),
      query: fields.text({
        label: "Target search query",
        description:
          "The search the page is written for, e.g. tanker kiralama. Not shown; used as the first keyword.",
        validation: required,
      }),
      keywords: fields.array(fields.text({ label: "Keyword", validation: required }), {
        label: "More keywords",
        itemLabel: (props) => props.value || "(empty)",
      }),
      kind: choice("Page type", GUIDE_KINDS, "guide", GUIDE_KIND_LABELS),
      lang: choice(
        "Language",
        GUIDE_LANGS,
        "en",
        GUIDE_LANG_LABELS,
        "The language the page is written in (sets lang and hreflang)."
      ),
      translation: fields.relationship({
        label: "Same page in the other language",
        description:
          "Optional. Only for a true counterpart (same topic, same answers). Search engines then show each reader their language.",
        collection: "guides",
      }),
      desk: choice(
        "Desk",
        GUIDE_DESKS,
        "tankers",
        GUIDE_DESK_LABELS,
        "Whose inbox the page's buttons write to."
      ),
      segment: choice(
        "Cargo on the inquiry form",
        GUIDE_SEGMENTS,
        "any",
        GUIDE_SEGMENT_LABELS,
        "The cargo the 'Send an inquiry' button preselects."
      ),
      author: fields.select({
        label: "Author (byline)",
        description: "A broker from the Brokers list.",
        defaultValue: "mehmet-aydin",
        options: brokersFile.brokers.map((b) => ({ value: b.name.slug, label: b.name.name })),
      }),
      published: fields.date({ label: "Published", validation: required }),
      updated: fields.date({
        label: "Last reviewed",
        description: "Shown on the page and used in the sitemap. Update it when you check the page.",
        validation: required,
      }),
      linkFrom: fields.multiselect({
        label: "Link to this page from",
        description: "Pages that show a link to this guide in their 'Related' list.",
        options: GUIDE_LINK_TARGETS.map((t) => ({ value: t.path, label: t.label })),
      }),
      related: fields.multiRelationship({
        label: "Related guides",
        description: "Shown at the end of the page (others from the same desk fill the gaps).",
        collection: "guides",
      }),
      faq: fields.array(
        fields.object({
          q: fields.text({ label: "Question", validation: required }),
          a: fields.text({ label: "Answer", multiline: true, validation: required }),
        }),
        {
          label: "FAQ",
          description: "4–6 questions people actually ask. Also FAQPage data for search.",
          itemLabel: (props) => props.fields.q.value || "New question",
        }
      ),
      ctaTitle: fields.text({
        label: "Closing letter: headline",
        description: "Optional. Defaults to 'Have a cargo or a ship to fix?' (or the Turkish).",
      }),
      ctaText: fields.text({
        label: "Closing letter: text",
        description: "Optional. Say what to send the desk for this kind of fixture.",
        multiline: true,
      }),
      body: fields.markdoc({
        label: "Body",
        description:
          "Open with the answer in two or three sentences, then question-style H2s. No invented rates, port specifications or statistics.",
        options: {
          heading: [2, 3],
          image: { directory: BLOG_IMAGE_DIR, publicPath: BLOG_IMAGE_PUBLIC_PATH },
          codeBlock: false,
        },
        components,
      }),
    },
  });
}

/** Spread into `ui.navigation` in keystatic.config.ts. */
export const guidesNavigation = { Guides: ["guides" as const] };
