/**
 * Keystatic admin (/keystatic): every editable list on the site, stored as
 * JSON singletons in content/. lib/site.ts and lib/data/* import those files
 * statically, so pages, client components, the RSS feed, llms.txt and JSON-LD
 * read the same data with no runtime file access.
 *
 * Field order here is the key order Keystatic writes. Empty text fields are
 * left out of the JSON; the loaders treat a missing key as empty. The zod
 * schemas in lib/content/schemas.ts check the files at test and build time.
 * How to use it: docs/CMS.md.
 */
import { config, fields, singleton } from "@keystatic/core";
import {
  ARTICLES,
  AVATAR_KINDS,
  E164_PATTERN,
  GLOSSARY_GROUP_KEYS,
  OFFICE_NAMES,
  REPORT_CATEGORIES,
  REPORT_DESKS,
  SLUG_PATTERN,
  TANKER_FAMILIES,
  TEAM_KEYS,
} from "@/lib/content/options";
import { GITHUB_REPO, keystaticStorageMode, type StorageMode } from "@/lib/content/storage";

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
        { city: line("City"), country: line("Country"), role: line("Role") },
        { layout: [4, 4, 4] }
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

const research = singleton({
  label: "Research notes",
  path: "content/research",
  format: { data: "json" },
  schema: {
    notes: fields.array(
      fields.object({
        slug: slugField(
          "URL slug",
          "The note's address: /research/<slug>. Do not change it once published."
        ),
        title: line("Title"),
        seoTitle: optionalLine(
          "Search title",
          "Optional shorter <title> for search results when the title runs past ~60 characters."
        ),
        desc: fields.text({
          label: "Summary (meta description)",
          description: "One or two sentences, at most 160 characters.",
          multiline: true,
          validation: { isRequired: true, length: { max: 160 } },
        }),
        desk: choice("Desk", REPORT_DESKS, "tankers", { tankers: "Tankers", lpg: "LPG & ammonia" }),
        cat: choice("Category (filter)", REPORT_CATEGORIES, "guide", {
          weekly: "Weekly outlook",
          route: "Route guide",
          reg: "Regulatory / risk",
          guide: "Guide",
        }),
        catLabel: line("Category label", "As printed on the card, e.g. Route Guide, Risk Brief."),
        iss: line("Issue", "e.g. OCTOBER 2026, 18 / 2026, Q2 2026, BRIEF."),
        date: fields.date({ label: "Published", validation: required }),
        updated: fields.date({
          label: "Last material revision",
          description: "Optional. Feeds dateModified and the sitemap.",
        }),
        author: line("Author", "A broker's name exactly as on the Brokers list."),
        read: fields.integer({
          label: "Reading time (minutes)",
          validation: { isRequired: true, min: 1 },
        }),
        gated: fields.checkbox({
          label: "Gated",
          description: "Shows only the gated summary below; the full report is sent on request.",
        }),
        label: line("Card tags", "e.g. CRUDE · TD20 / TD6"),
        dek: para("Dek", "One sentence under the title on the note page."),
        summary: fields.text({
          label: "Gated summary",
          description: "Shown instead of the full text when the note is gated.",
          multiline: true,
        }),
        blocks: fields.blocks(
          {
            p: {
              label: "Paragraph",
              schema: fields.text({ label: "Paragraph", multiline: true, validation: required }),
              itemLabel: (props) => short(props.value, "Paragraph"),
            },
            h2: {
              label: "Heading",
              schema: line("Heading"),
              itemLabel: (props) => `## ${props.value}`,
            },
            ul: {
              label: "Bullet list",
              schema: strings("Items", "Item", { multiline: true }),
              itemLabel: (props) => `• Bullet list (${props.elements.length})`,
            },
            ol: {
              label: "Numbered list",
              schema: strings("Items", "Item", { multiline: true }),
              itemLabel: (props) => `1. Numbered list (${props.elements.length})`,
            },
            callout: {
              label: "Callout box",
              schema: fields.object({
                label: line("Label"),
                text: para("Text"),
                linkHref: optionalLine(
                  "Link: path",
                  "Optional. A page on this site, e.g. /compliance."
                ),
                linkLabel: optionalLine("Link: text"),
              }),
              itemLabel: (props) => `Callout: ${props.fields.label.value}`,
            },
            table: {
              label: "Table",
              schema: fields.object({
                caption: line("Caption"),
                head: cells("Column headings", "Heading"),
                rows: fields.array(fields.object({ cells: cells("Cells", "Cell") }), {
                  label: "Rows",
                  itemLabel: (props) =>
                    props.fields.cells.elements.map((c) => c.value).join(" | ") || "Row",
                }),
              }),
              itemLabel: (props) => `Table: ${props.fields.caption.value}`,
            },
          },
          { label: "Body" }
        ),
      }),
      {
        label: "Notes",
        description: "Newest first. The order here is the order on /research.",
        itemLabel: (props) => props.fields.title.value || "New note",
      }
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
            description: "Liquid density at atmospheric boiling point.",
            step: 0.001,
            validation: { isRequired: true, min: 0.1, max: 2 },
          }),
        },
        { layout: [4, 4, 4] }
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

/* ---------- config ---------- */

const singletons = {
  site,
  brokers,
  research,
  faqs,
  glossary,
  tankerClasses,
  lpgClasses,
  lpgCargoes,
  compliance,
  turkishStraits,
};

export function keystaticConfig(mode: StorageMode) {
  return config({
    storage: mode === "local" ? { kind: "local" } : { kind: "github", repo: GITHUB_REPO },
    ui: {
      brand: { name: "LEVANTER" },
      navigation: {
        Company: ["site", "brokers"],
        Research: ["research"],
        "Desks & reference": [
          "tankerClasses",
          "lpgClasses",
          "lpgCargoes",
          "faqs",
          "glossary",
          "compliance",
          "turkishStraits",
        ],
      },
    },
    singletons,
  });
}

export default keystaticConfig(keystaticStorageMode());
