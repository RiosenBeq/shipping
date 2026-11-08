/**
 * Long-form editorial bodies for each research report, keyed by the report
 * slug. Plain markdown-ish blocks so the renderer stays simple. Edited with
 * each note in the admin (/keystatic → Research notes → Body) and stored in
 * content/research.json.
 *
 * Gated reports show only their `summary` on the site; the full report is sent
 * on request by the research desk.
 */
import file from "@/content/research.json";
import type { ResearchFile, ResearchNoteFile } from "@/lib/content/schemas";

export type ReportBlock =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "ul"; items: string[] }
  /** Numbered list, for checklists and sequences. */
  | { kind: "ol"; items: string[] }
  /** `link` points to a related page on this site. */
  | { kind: "callout"; label: string; text: string; link?: { href: string; label: string } }
  | { kind: "table"; caption: string; head: string[]; rows: string[][] };

export type ReportBody = {
  /** One-sentence dek under the title. */
  dek: string;
  /** Summary shown on the site for gated reports. */
  summary?: string;
  blocks: ReportBlock[];
};

function toBlock(b: ResearchNoteFile["blocks"][number]): ReportBlock {
  switch (b.discriminant) {
    case "p":
    case "h2":
      return { kind: b.discriminant, text: b.value };
    case "ul":
    case "ol":
      return { kind: b.discriminant, items: b.value };
    case "callout": {
      const { label, text, linkHref, linkLabel } = b.value;
      return linkHref && linkLabel
        ? { kind: "callout", label, text, link: { href: linkHref, label: linkLabel } }
        : { kind: "callout", label, text };
    }
    case "table":
      return {
        kind: "table",
        caption: b.value.caption,
        head: b.value.head.map((c) => c ?? ""),
        rows: b.value.rows.map((r) => r.cells.map((c) => c ?? "")),
      };
  }
}

export const REPORT_BODIES: Record<string, ReportBody> = Object.fromEntries(
  (file as ResearchFile).notes.map((n): [string, ReportBody] => [
    n.slug,
    {
      dek: n.dek,
      ...(n.summary ? { summary: n.summary } : {}),
      blocks: n.blocks.map(toBlock),
    },
  ])
);

/** Plain text of a note (dek, summary and blocks) for llms-full.txt, RSS and word counts. */
export function bodyText(body: ReportBody): string {
  const parts: string[] = [];
  if (body.summary) parts.push(body.summary);
  for (const b of body.blocks) {
    switch (b.kind) {
      case "p":
        parts.push(b.text);
        break;
      case "h2":
        parts.push(`## ${b.text}`);
        break;
      case "ul":
        parts.push(b.items.map((i) => `- ${i}`).join("\n"));
        break;
      case "ol":
        parts.push(b.items.map((item, i) => `${i + 1}. ${item}`).join("\n"));
        break;
      case "callout":
        parts.push(`${b.label}: ${b.text}`);
        break;
      case "table":
        parts.push(
          [
            b.caption,
            `| ${b.head.join(" | ")} |`,
            `| ${b.head.map(() => "---").join(" | ")} |`,
            ...b.rows.map((r) => `| ${r.join(" | ")} |`),
          ].join("\n")
        );
        break;
    }
  }
  return parts.join("\n\n");
}
