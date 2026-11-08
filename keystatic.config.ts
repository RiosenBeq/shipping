/**
 * Keystatic admin (/keystatic): every editable list on the site, stored as
 * JSON singletons in content/, plus the blog: the `posts` collection, one
 * Markdoc file per post in content/blog/ (frontmatter + body). lib/site.ts and
 * lib/data/* import the JSON files statically, so pages, client components,
 * llms.txt and JSON-LD read the same data with no runtime file access; the
 * posts are read once at build time by lib/blog/posts.ts.
 *
 * Field order here is the key order Keystatic writes. Empty text fields are
 * left out of the JSON; the loaders treat a missing key as empty. The zod
 * schemas in lib/content/schemas.ts check the files at test and build time.
 * How to use it: docs/CMS.md.
 */
import { collection, config, fields, singleton } from "@keystatic/core";
import { block, wrapper } from "@keystatic/core/content-components";
import brokersFile from "@/content/brokers.json";
import {
  ARTICLES,
  AVATAR_KINDS,
  BLOG_CATEGORIES,
  BLOG_CATEGORY_LABELS,
  BLOG_DESK_LABELS,
  BLOG_DESKS,
  BLOG_IMAGE_DIR,
  BLOG_IMAGE_PUBLIC_PATH,
  E164_PATTERN,
  GLOSSARY_GROUP_KEYS,
  OFFICE_NAMES,
  SLUG_PATTERN,
  TANKER_FAMILIES,
  TEAM_KEYS,
} from "@/lib/content/options";
import { stills, type StillKey } from "@/lib/media";
import { GITHUB_REPO, keystaticStorageMode, type StorageMode } from "@/lib/content/storage";
import { homeNavigation, homeSingletons } from "@/lib/content/keystatic-home";
import { freightNavigation, freightSingletons } from "@/lib/content/keystatic-freight";

/* ---------- shared field helpers ---------- */

const required = { isRequired: true } as const;

const line = (label: string, description?: string) =>
  fields.text({ label, description, validation: required });

const para = (label: string, description?: string) =>
  fields.text({ label, description, multiline: true, validation: required });

const optionalLine = (label: string, description?: string) => fields.text({ label, description });

const slugField = (label: string, description: string) =>
  fields.text({
    label,
    description,
    validation: {
      isRequired: true,
      pattern: {
        regex: SLUG_PATTERN,
        message: "Lowercase letters, digits and single hyphens only (e.g. my-new-page).",
      },
    },
  });

const choice = <T extends string>(
  label: string,
  values: readonly T[],
  defaultValue: T,
  labels: Partial<Record<T, string>> = {},
  description?: string
) =>
  fields.select({
    label,
    description,
    defaultValue,
    options: values.map((value) => ({ value, label: labels[value] ?? value })),
  });

/** Row label in the admin's lists: the first ~100 characters. */
const short = (value: string, fallback: string) =>
  !value ? fallback : value.length > 100 ? `${value.slice(0, 99)}…` : value;

/** A list of short strings (chips, languages, bullet points). */
const strings = (label: string, itemLabel: string, opts: { multiline?: boolean } = {}) =>
  fields.array(fields.text({ label: itemLabel, multiline: opts.multiline, validation: required }), {
    label,
    itemLabel: (props) => short(props.value, "(empty)"),
  });

/** Table cells may be empty (Keystatic stores an empty cell as null). */
const cells = (label: string, itemLabel: string) =>
  fields.array(fields.text({ label: itemLabel }), {
    label,
    itemLabel: (props) => short(props.value, "(empty)"),
  });

const faqList = (label: string, description?: string) =>
  fields.array(
    fields.object({
      q: line("Question"),
      a: para("Answer"),
    }),
    { label, description, itemLabel: (props) => props.fields.q.value || "New question" }
  );

const routeList = () =>
  fields.array(
    fields.object({
      code: line("Code", "Benchmark or short code, e.g. TD3C, BLPG3, NH3."),
      lane: line("Lane", "e.g. MEG → China"),
      note: para("Note"),
      hormuz: fields.checkbox({
        label: "Loads in the Middle East Gulf",
        description: "Adds the Strait of Hormuz note next to this route.",
      }),
    }),
    {
      label: "Routes",
      itemLabel: (props) => `${props.fields.code.value} · ${props.fields.lane.value}`,
    }
  );

const titledTextList = (label: string, title: string, body: string) =>
  fields.array(fields.object({ title: line(title), body: para(body) }), {
    label,
    itemLabel: (props) => props.fields.title.value || "New item",
  });

/* ---------- singletons ---------- */

const site = singleton({
  label: "Site settings",
  path: "content/site",
  format: { data: "json" },
  schema: {
    name: line("Company name", "Shown in the logo, page titles and structured data."),
    tagline: line("Tagline"),
    description: para(
      "Site description",
      "Default meta description and the summary in llms.txt (keep it under ~160 characters)."
    ),
    url: line(
      "Site URL",
      "Canonical address, without a trailing slash. The NEXT_PUBLIC_SITE_URL environment variable overrides it."
    ),
    legalEntity: line("Legal entity"),
    founded: line("Founded (year)"),
    contentUpdated: fields.date({
      label: "Content last updated",
      description:
        "Bump after a material content change. Feeds the sitemap, humans.txt and ai.txt.",
      validation: required,
    }),
    email: line("Main email"),
    phone: line("Phone", "As displayed, e.g. +90 212 000 0000."),
    whatsapp: fields.text({
      label: "WhatsApp number (E.164)",
      description: "No spaces, e.g. +905330000000. Used to build wa.me links.",
      validation: {
        isRequired: true,
        pattern: { regex: E164_PATTERN, message: "Use + and digits only, e.g. +905330000000." },
      },
    }),
    whatsappDisplay: line("WhatsApp number (as displayed)", "e.g. +90 533 000 0000"),
    hours: para("Office hours"),
    duty: fields.object(
      {
        label: line("Title", "e.g. Live fixture after hours?"),
        whatsapp: fields.text({
          label: "Duty WhatsApp (E.164)",
          description: "No spaces, e.g. +905330000000.",
          validation: {
            isRequired: true,
            pattern: { regex: E164_PATTERN, message: "Use + and digits only, e.g. +905330000000." },
          },
        }),
        display: line("Number as displayed", "e.g. +90 533 000 0000"),
        hours: line("When it is answered", "e.g. Answered evenings and weekends."),
      },
      {
        label: "After-hours duty line",
        description: "The duty broker box in the homepage letter scene and on /contact.",
        layout: [12, 6, 6, 12],
      }
    ),
    desks: fields.object(
      {
        tankers: fields.object(
          { label: line("Name"), email: line("Email") },
          { label: "Tanker desk", layout: [6, 6] }
        ),
        lpg: fields.object(
          { label: line("Name"), email: line("Email") },
          { label: "LPG & ammonia desk", layout: [6, 6] }
        ),
        research: fields.object(
          { label: line("Name"), email: line("Email") },
          { label: "Research", layout: [6, 6] }
        ),
      },
      { label: "Desk inboxes", description: "Shown on desk pages, broker cards and /contact." }
    ),
    address: fields.object(
      {
        street: line("Street"),
        locality: line("City"),
        postalCode: line("Postal code"),
        country: line("Country code", "Two letters, e.g. TR."),
      },
      { label: "Address (headquarters)", layout: [12, 4, 4, 4] }
    ),
    geo: fields.object(
      {
        latitude: fields.number({ label: "Latitude", step: 0.0001, validation: required }),
        longitude: fields.number({ label: "Longitude", step: 0.0001, validation: required }),
      },
      { label: "Map position (headquarters)", layout: [6, 6] }
    ),
    offices: fields.array(
      fields.object(
        {
          city: line("City"),
          country: line("Country"),
          role: line("Role"),
          timeZone: fields.text({
            label: "Time zone",
            description:
              "IANA name for the office clock, e.g. Europe/Istanbul, Europe/London, Asia/Singapore.",
            validation: {
              isRequired: true,
              pattern: { regex: /^[A-Za-z_]+\/[A-Za-z_/]+$/, message: "e.g. Europe/Istanbul" },
            },
          }),
        },
        { layout: [3, 3, 3, 3] }
      ),
      {
        label: "Offices",
        itemLabel: (props) => `${props.fields.city.value} — ${props.fields.role.value}`,
      }
    ),
    twitter: line("X / Twitter handle", "With the @, e.g. @levanter."),
    socials: fields.object(
      {
        linkedin: fields.url({ label: "LinkedIn", validation: required }),
        twitter: fields.url({ label: "X / Twitter", validation: required }),
      },
      { label: "Social profiles", layout: [6, 6] }
    ),
  },
});

const brokers = singleton({
  label: "Brokers",
  path: "content/brokers",
  format: { data: "json" },
  schema: {
    brokers: fields.array(
      fields.object({
        name: fields.slug({
          name: { label: "Name", validation: required },
          slug: {
            label: "Short id",
            description: "Generated from the name; used as the photo's folder name.",
          },
        }),
        title: line("Title", "e.g. Broker — VLCC"),
        team: choice("Desk", TEAM_KEYS, "lpg", {
          lpg: "LPG & ammonia",
          crude: "Crude tankers",
          clean: "Clean products",
        }),
        office: choice("Office", OFFICE_NAMES, "Istanbul"),
        focus: strings("Focus", "Focus"),
        languages: strings("Languages", "Language"),
        initials: fields.text({
          label: "Initials",
          description: "Shown in the round avatar when there is no photo.",
          validation: { isRequired: true, length: { max: 3 } },
        }),
        avatar: choice("Avatar colour", AVATAR_KINDS, "broker", {
          head: "Brass (desk head)",
          broker: "Navy (broker)",
        }),
        photo: fields.image({
          label: "Photo",
          description:
            "Optional. A square head-and-shoulders photo, at least 240 × 240 px. Saved in public/images/brokers/.",
          directory: "public/images",
          publicPath: "/images/",
        }),
      }),
      {
        label: "Brokers",
        description: "Order here is the order on /brokers and on the home pages.",
        slugField: "name",
        itemLabel: (props) =>
          `${props.fields.name.value.name || "New broker"} — ${props.fields.title.value}`,
      }
    ),
    teamLabels: fields.object(
      { lpg: line("LPG"), crude: line("Crude"), clean: line("Clean") },
      { label: "Desk names", description: "Headings on /brokers and labels on broker cards." }
    ),
  },
});

const faqs = singleton({
  label: "FAQs",
  path: "content/faqs",
  format: { data: "json" },
  schema: {
    home: faqList("Home page"),
    tankers: faqList("Tanker desk (/tankers)"),
    lpg: faqList("LPG desk (/lpg)"),
    about: faqList("About page"),
  },
});

/** Admin-side names for the glossary groups (the headings on /glossary are editable below). */
const GLOSSARY_GROUP_NAMES: Record<(typeof GLOSSARY_GROUP_KEYS)[number], string> = {
  freight: "Freight & rates",
  vessels: "Tankers & bunkers",
  gas: "LPG & gas carriers",
  regulatory: "Regulatory & compliance",
  ports: "Ports & chokepoints",
  commercial: "Commercial & contracts",
};

const glossary = singleton({
  label: "Glossary",
  path: "content/glossary",
  format: { data: "json" },
  schema: {
    terms: fields.array(
      fields.object({
        group: choice("Group", GLOSSARY_GROUP_KEYS, "freight", GLOSSARY_GROUP_NAMES),
        term: line("Term"),
        def: para("Definition"),
      }),
      { label: "Terms", itemLabel: (props) => props.fields.term.value || "New term" }
    ),
    groups: fields.object(
      {
        freight: line(GLOSSARY_GROUP_NAMES.freight),
        vessels: line(GLOSSARY_GROUP_NAMES.vessels),
        gas: line(GLOSSARY_GROUP_NAMES.gas),
        regulatory: line(GLOSSARY_GROUP_NAMES.regulatory),
        ports: line(GLOSSARY_GROUP_NAMES.ports),
        commercial: line(GLOSSARY_GROUP_NAMES.commercial),
      },
      { label: "Group headings", description: "Section headings on /glossary." }
    ),
  },
});

const tankerClasses = singleton({
  label: "Tanker classes",
  path: "content/tanker-classes",
  format: { data: "json" },
  schema: {
    classes: fields.array(
      fields.object({
        slug: slugField("URL slug", "/tankers/<slug>. Do not change it once published."),
        name: line("Name"),
        shortName: line("Short name"),
        article: choice("Article for the short name", ARTICLES, "a", {
          a: "a (a VLCC)",
          an: "an (an Aframax)",
        }),
        plural: line("Plural", "e.g. Suezmaxes, LR1s"),
        longName: line("Long name"),
        family: choice("Family", TANKER_FAMILIES, "crude", { crude: "Crude", clean: "Clean" }),
        dwtRange: line("Deadweight range"),
        cargoCapacity: line("Cargo capacity"),
        loa: line("Length overall"),
        beam: line("Beam"),
        draft: line("Draft"),
        speed: line("Speed"),
        consumption: line("Consumption"),
        intro: para("Introduction"),
        routes: routeList(),
        marketsServed: strings("Markets served", "Market"),
        keyTrends: titledTextList("Key trends", "Title", "Text"),
        charterShape: para("How it is chartered"),
        desk: para("Who covers it"),
      }),
      { label: "Classes", itemLabel: (props) => props.fields.name.value || "New class" }
    ),
  },
});

const lpgClasses = singleton({
  label: "LPG classes",
  path: "content/lpg-classes",
  format: { data: "json" },
  schema: {
    classes: fields.array(
      fields.object({
        slug: slugField("URL slug", "/lpg/<slug>. Do not change it once published."),
        name: line("Name"),
        longName: line("Long name"),
        ctaNoun: line("Name with article", 'For running copy: "Looking for an MGC?"'),
        capacity: line("Capacity"),
        containment: line("Containment"),
        typicalCargo: line("Typical cargo"),
        cargoes: strings("Cargoes", "Cargo"),
        intro: para("Introduction"),
        routes: routeList(),
        trades: strings("Trades", "Trade"),
        watchpoints: titledTextList("Watchpoints", "Title", "Text"),
        charterShape: para("How it is chartered"),
        desk: para("Who covers it"),
        faq: faqList("FAQ"),
      }),
      { label: "Classes", itemLabel: (props) => props.fields.name.value || "New class" }
    ),
  },
});

const lpgCargoes = singleton({
  label: "LPG converter cargoes",
  path: "content/lpg-cargoes",
  format: { data: "json" },
  schema: {
    cargoes: fields.array(
      fields.object(
        {
          key: slugField("Key", "Internal id, e.g. propane. Keep it unchanged."),
          label: line("Name"),
          density: fields.number({
            label: "Density (t/m³)",
            description: "Liquid density at atmospheric boiling point (refrigerated carriage).",
            step: 0.001,
            validation: { isRequired: true, min: 0.1, max: 2 },
          }),
          densityAmbient: fields.number({
            label: "Density at 15 °C (t/m³)",
            description:
              "As carried in fully pressurised ships (the freight calculator's pressurised class). Optional.",
            step: 0.001,
            validation: { min: 0.1, max: 2 },
          }),
        },
        { layout: [3, 3, 3, 3] }
      ),
      {
        label: "Cargoes in the cbm ↔ tonnes converter (/lpg)",
        description: "The first one is selected by default when propane is missing.",
        itemLabel: (props) => `${props.fields.label.value} — ${props.fields.density.value ?? "?"}`,
      }
    ),
  },
});

const compliance = singleton({
  label: "Compliance",
  path: "content/compliance",
  format: { data: "json" },
  schema: {
    updated: fields.date({ label: "Last reviewed", validation: required }),
    screening: fields.array(
      fields.object({
        title: line("Title"),
        intro: para("Introduction"),
        checks: strings("Checks", "Check", { multiline: true }),
      }),
      { label: "What we screen", itemLabel: (props) => props.fields.title.value || "New group" }
    ),
    steps: fields.array(fields.object({ title: line("Title"), text: para("Text") }), {
      label: "How we screen (steps)",
      itemLabel: (props) => props.fields.title.value || "New step",
    }),
    faq: faqList("FAQ"),
  },
});

const turkishStraits = singleton({
  label: "Turkish Straits",
  path: "content/turkish-straits",
  format: { data: "json" },
  schema: {
    updated: fields.date({ label: "Last reviewed", validation: required }),
    facts: fields.array(fields.object({ k: line("Fact"), v: line("Value") }, { layout: [4, 8] }), {
      label: "Key facts",
      itemLabel: (props) => `${props.fields.k.value}: ${props.fields.v.value}`,
    }),
    sections: fields.array(
      fields.object({
        id: slugField("Anchor id", "Used in links to this section (#id)."),
        title: line("Heading"),
        body: strings("Paragraphs", "Paragraph", { multiline: true }),
        list: strings("Bullet points (optional)", "Bullet point", { multiline: true }),
      }),
      { label: "Sections", itemLabel: (props) => props.fields.title.value || "New section" }
    ),
    faq: faqList("FAQ"),
  },
});

/* ---------- blog ---------- */

/** Body components: the "+" menu of the post editor. Mirrored by lib/blog/markdoc.ts. */
export const blogComponents = {
  callout: wrapper({
    label: "Callout",
    description: "A boxed note with a label (e.g. Practical takeaway) and an optional link.",
    schema: {
      label: line("Label", "Short, e.g. Practical takeaway, Desk note, Update, October 2026."),
      linkHref: optionalLine("Link: path", "Optional. A page on this site, e.g. /compliance."),
      linkLabel: optionalLine("Link: text"),
    },
  }),
  pullQuote: block({
    label: "Pull quote",
    description: "One sentence from the text, set large. Use at most one or two per post.",
    schema: {
      quote: para("Quote"),
      attribution: optionalLine("Attribution", "Optional, e.g. the broker's name."),
    },
  }),
  routeTable: wrapper({
    label: "Table with caption",
    description:
      "A captioned table (routes, cost splits, worked examples). Insert a table inside it; the first row is the header and the first column names each row.",
    schema: {
      caption: line("Caption", "e.g. Illustrative laytime calculation, round numbers only"),
    },
  }),
  figure: block({
    label: "Figure",
    description: "An image with a caption. Saved in public/images/blog/.",
    schema: {
      image: fields.image({
        label: "Image",
        description: "At least 1360 px wide. JPG, PNG, WebP or AVIF.",
        directory: BLOG_IMAGE_DIR,
        publicPath: BLOG_IMAGE_PUBLIC_PATH,
        validation: required,
      }),
      alt: line("Alt text", "What the image shows, for screen readers and search."),
      caption: optionalLine("Caption"),
      credit: optionalLine("Credit", "Photographer or source, if not our own."),
    },
  }),
};

const STILL_LABELS: Record<StillKey, string> = Object.fromEntries(
  (Object.keys(stills) as StillKey[]).map((k) => [k, stills[k].alt])
) as Record<StillKey, string>;

const posts = collection({
  label: "Blog posts",
  path: "content/blog/*",
  slugField: "title",
  format: { contentField: "body" },
  entryLayout: "content",
  columns: ["date", "category"],
  previewUrl: "/blog/{slug}",
  schema: {
    title: fields.slug({
      name: { label: "Title", validation: required },
      slug: {
        label: "URL slug",
        description:
          "The post's address: /blog/<slug>. Generated from the title; do not change it once published.",
        validation: {
          pattern: {
            regex: SLUG_PATTERN,
            message: "Lowercase letters, digits and single hyphens only (e.g. my-new-post).",
          },
        },
      },
    }),
    draft: fields.checkbox({
      label: "Draft",
      description:
        "Drafts show on the development server only (preview while you write); the live site leaves them out.",
    }),
    seoTitle: fields.text({
      label: "Search title",
      description:
        "Optional shorter <title> for search results, at most 60 characters. Needed when the title is longer than that.",
      validation: { length: { max: 60 } },
    }),
    description: fields.text({
      label: "Search summary (meta description)",
      description: "One or two sentences, at most 160 characters. Also the RSS summary.",
      multiline: true,
      validation: { isRequired: true, length: { max: 160 } },
    }),
    dek: para("Dek", "One sentence under the title on the post page and on cards."),
    category: choice("Category", BLOG_CATEGORIES, "chartering-guides", BLOG_CATEGORY_LABELS),
    format: optionalLine(
      "Format label",
      "Optional pill on the card, e.g. Risk brief, Route guide, Weekly outlook. Defaults to the category."
    ),
    desk: choice(
      "Desk",
      BLOG_DESKS,
      "tankers",
      BLOG_DESK_LABELS,
      "Which desk pages list the post."
    ),
    author: choice(
      "Author",
      brokersFile.brokers.map((b) => b.name.slug),
      "elif-kaya",
      Object.fromEntries(brokersFile.brokers.map((b) => [b.name.slug, b.name.name])),
      "A broker from the Brokers list (add new brokers there first, then reload this page)."
    ),
    date: fields.date({ label: "Published", validation: required }),
    updated: fields.date({
      label: "Last material revision",
      description: "Optional. Shown on the post, and feeds dateModified, the sitemap and RSS.",
    }),
    issue: optionalLine("Issue", "Optional, e.g. October 2026, 18 / 2026, Brief."),
    tags: strings("Tags", "Tag"),
    readingTime: fields.integer({
      label: "Reading time (minutes)",
      description: "Optional. Leave empty to work it out from the text.",
      validation: { min: 1 },
    }),
    gated: fields.checkbox({
      label: "Summary only",
      description:
        "Shows the summary below and a 'full report on request' box; the full text is emailed on request.",
    }),
    summary: fields.text({
      label: "Summary (summary-only posts)",
      description: "Shown above the body when the post is summary only.",
      multiline: true,
    }),
    keyTakeaways: strings("Key takeaways", "Takeaway", { multiline: true }),
    cover: fields.conditional(
      fields.select({
        label: "Cover",
        description: "Type-set (a big code over contour lines) unless you have a photograph.",
        options: [
          { value: "type", label: "Type-set cover" },
          { value: "still", label: "Photograph" },
        ],
        defaultValue: "type",
      }),
      {
        type: fields.object(
          {
            code: fields.text({
              label: "Code",
              description:
                "The big text: a route code (TD3C), a class (VLGC) or coordinates (26°34′N). 12 characters at most. No prices or rates.",
              validation: { isRequired: true, length: { max: 12 } },
            }),
            caption: optionalLine(
              "Caption",
              "Small line under the code, e.g. Strait of Hormuz · 56°15′E."
            ),
            seed: fields.integer({
              label: "Pattern",
              description:
                "Optional number (1–9999) that changes the contour pattern. Empty: derived from the slug.",
              validation: { min: 1, max: 9999 },
            }),
          },
          { label: "Type-set cover" }
        ),
        still: fields.object(
          {
            media: choice(
              "From the media library",
              ["none", ...(Object.keys(stills) as StillKey[])],
              "none",
              {
                none: "— (upload below instead)",
                ...STILL_LABELS,
              }
            ),
            image: fields.image({
              label: "Or upload a photograph",
              description: "Landscape, at least 1600 px wide. Saved in public/images/blog/.",
              directory: BLOG_IMAGE_DIR,
              publicPath: BLOG_IMAGE_PUBLIC_PATH,
            }),
            alt: line("Alt text", "What the photograph shows."),
            caption: optionalLine("Caption / credit"),
          },
          { label: "Photograph" }
        ),
      }
    ),
    faq: faqList(
      "FAQ",
      "Optional questions and answers at the end of the post (FAQPage data for search)."
    ),
    body: fields.markdoc({
      label: "Body",
      options: {
        heading: [2, 3],
        image: { directory: BLOG_IMAGE_DIR, publicPath: BLOG_IMAGE_PUBLIC_PATH },
        codeBlock: false,
      },
      components: blogComponents,
    }),
  },
});

/* ---------- config ---------- */

const singletons = {
  ...homeSingletons,
  site,
  brokers,
  faqs,
  glossary,
  tankerClasses,
  lpgClasses,
  lpgCargoes,
  compliance,
  turkishStraits,
  ...freightSingletons,
};

export function keystaticConfig(mode: StorageMode) {
  return config({
    storage: mode === "local" ? { kind: "local" } : { kind: "github", repo: GITHUB_REPO },
    ui: {
      brand: { name: "LEVANTER" },
      navigation: {
        ...homeNavigation,
        Company: ["site", "brokers"],
        Blog: ["posts"],
        "Desks & reference": [
          "tankerClasses",
          "lpgClasses",
          "lpgCargoes",
          "faqs",
          "glossary",
          "compliance",
          "turkishStraits",
        ],
        ...freightNavigation,
      },
    },
    singletons,
    collections: { posts },
  });
}

export default keystaticConfig(keystaticStorageMode());
