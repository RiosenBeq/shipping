/**
 * "Ask the desk for a firm estimate": the contact form opened with this voyage.
 *
 * The form (app/(site)/contact/InquiryForm.tsx) reads `?segment=&vessel=&quantity=` from
 * its URL, and on load restores an unsent draft from sessionStorage ("lv-inquiry-draft",
 * the same tab). The link carries the first three; the click also writes the voyage into
 * that draft — load and discharge ports, and an estimate summary with the shareable link
 * in the notes — keeping anything the visitor already typed there (name, email, …).
 * data.test.ts / inquiry.test.ts guard the draft key and field names.
 */
import { VESSEL_BY_CLASS, inquiryHref } from "@/lib/inquiry";
import type { InquirySegment } from "@/lib/schemas";
import { isCleanTanker, type ClassSlug } from "./constants";
import { fmtDate, fmtDays, fmtNum, fmtUsd } from "./format";
import type { Resolved } from "./state";
import type { FreightData, VoyageResult } from "./types";

/** sessionStorage key of the contact form's unsent draft (InquiryForm's DRAFT_KEY). */
export const INQUIRY_DRAFT_KEY = "lv-inquiry-draft";
const NOTES_MAX = 2000;

/** The inquiry form's cargo choice for this ship and grade. */
export function segmentFor(cls: ClassSlug, kind: "tanker" | "gas", grade?: string): InquirySegment {
  if (kind === "tanker") return isCleanTanker(cls) ? "clean" : "crude";
  if (grade === "ammonia") return "ammonia";
  if (grade === "propane" || grade === "butane" || grade === undefined) return "lpg";
  return "petchem";
}

/** A plain-text estimate for the desk: what was assumed and what it came to. */
export function estimateSummary(
  data: FreightData,
  r: Resolved,
  e: VoyageResult,
  link: string
): string {
  const p = r.ports;
  const laden = r.legs.laden;
  const cargo =
    r.kind === "gas" && r.cargo
      ? `${fmtNum(e.quantityT)} t ${r.cargo.label}`
      : `${fmtNum(e.quantityT)} t`;
  const via = laden.route?.via ? ` via ${laden.route.via}` : "";
  const legs = [
    r.legs.ballast.on && !r.legs.ballast.samePort
      ? `ballast from ${p.open.facts.name} ${fmtNum(r.input.legs.ballast.nm ?? 0)} nm`
      : null,
    `laden ${fmtNum(r.input.legs.laden.nm ?? 0)} nm`,
    r.legs.ret.on
      ? `return ballast to ${p.ret.facts.name} ${fmtNum(r.input.legs.ret.nm ?? 0)} nm`
      : null,
  ].filter(Boolean);
  const freight =
    r.basis === "tce"
      ? `Target TCE ${fmtUsd(r.input.freight.targetTce)}/day → freight ${fmtUsd(e.money.perTonne ?? 0, 2)}/t`
      : `Freight ${fmtUsd(e.money.perTonne ?? 0, 2)}/t (${fmtUsd(e.money.grossFreight)})${
          r.basis === "ws"
            ? `, WS ${fmtNum(r.input.freight.ws, 2)} on a ${fmtUsd(r.input.freight.flat ?? 0, 2)} flat`
            : ""
        } → TCE ${e.money.tce === null ? "—" : `${fmtUsd(e.money.tce)}/day`}`;
  const prices = `Bunkers VLSFO ${fmtUsd(r.input.prices.vlsfo)}/t, MGO ${fmtUsd(r.input.prices.mgo)}/t (reference ${fmtDate(data.fuels.vlsfo.asOf)}); EU ETS ${fmtUsd(e.co2.etsCost)}`;
  const text = [
    "Freight calculator estimate (indicative):",
    `${r.preset.label} · ${cargo} · ${p.load.facts.name} → ${p.discharge.facts.name}${via}`,
    `${legs.join(" · ")} · ${fmtDays(e.days.total)} days in all`,
    freight,
    `Breakeven ${fmtUsd(e.breakeven.perTonne ?? 0, 2)}/t · ${prices}`,
    `Link: ${link}`,
    "Please come back with a firm estimate.",
  ].join("\n");
  return text.slice(0, NOTES_MAX);
}

/** The contact form link for this voyage, and the draft fields the click saves. */
export function inquiryFor(
  data: FreightData,
  r: Resolved,
  e: VoyageResult,
  link: string
): { href: string; draft: Record<string, string> } {
  const segment = segmentFor(r.preset.slug, r.kind, r.cargo?.key);
  const vessel = VESSEL_BY_CLASS[r.preset.slug];
  const quantity =
    e.quantityT > 0
      ? `${fmtNum(e.quantityT)} t${r.kind === "gas" && r.cargo ? ` ${r.cargo.label}` : ""}`.slice(
          0,
          60
        )
      : undefined;
  return {
    href: inquiryHref({ segment, vessel, quantity }),
    draft: {
      mode: "cargo",
      term: "voyage",
      segment,
      ...(vessel ? { vessel } : {}),
      ...(quantity ? { quantity } : {}),
      loadArea: r.ports.load.facts.name.slice(0, 200),
      dischargeArea: r.ports.discharge.facts.name.slice(0, 200),
      notes: estimateSummary(data, r, e, link),
    },
  };
}

/**
 * Merge the voyage into the contact form's draft (browser only): what the visitor typed
 * before (name, company, email, phone, laycan) stays; the voyage fields are replaced.
 */
export function saveInquiryDraft(draft: Record<string, string>): void {
  try {
    const raw = window.sessionStorage.getItem(INQUIRY_DRAFT_KEY);
    const prev: unknown = raw ? JSON.parse(raw) : null;
    const base = prev && typeof prev === "object" ? (prev as Record<string, unknown>) : {};
    window.sessionStorage.setItem(INQUIRY_DRAFT_KEY, JSON.stringify({ ...base, ...draft }));
  } catch {
    // Storage blocked or full: the link still carries cargo, ship size and quantity.
  }
}
