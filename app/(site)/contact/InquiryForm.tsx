"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Check, Copy, MessageCircle } from "lucide-react";
import { Eyebrow } from "@/components/site/Section";
import {
  INQUIRY_MODES,
  INQUIRY_SEGMENTS,
  INQUIRY_TERMS,
  INQUIRY_VESSELS,
  InquiryModeSchema,
  InquirySchema,
  InquirySegmentSchema,
  InquiryTermSchema,
  type Inquiry,
  type InquirySegment,
} from "@/lib/schemas";
import { siteConfig, whatsappUrl } from "@/lib/site";
import { cn, FORCED_FOCUS, FORCED_SEGMENTED } from "@/lib/utils";

type Field = keyof Inquiry;
type Form = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;
type Channel = "email" | "whatsapp";
type Vessel = Inquiry["vessel"];
type Sent = {
  via: Channel;
  /** Whether the page lost focus after the hand-off, i.e. something actually opened. */
  opened: boolean;
  deskName: string;
  deskEmail: string;
  subject: string;
  body: string;
};

const ANY_VESSEL: Vessel = INQUIRY_VESSELS[0];

/** No cargo preselected: an inquiry is never routed to a desk by default. */
const EMPTY: Form = {
  mode: "cargo",
  segment: "",
  vessel: ANY_VESSEL,
  term: "voyage",
  loadArea: "",
  dischargeArea: "",
  quantity: "",
  laycanFrom: "",
  laycanTo: "",
  name: "",
  company: "",
  email: "",
  phone: "",
  notes: "",
};

/** Visual order of the fields — the first invalid one in this order gets focus. */
const FIELD_ORDER: Field[] = [
  "mode",
  "segment",
  "term",
  "vessel",
  "quantity",
  "loadArea",
  "dischargeArea",
  "laycanFrom",
  "laycanTo",
  "name",
  "company",
  "email",
  "phone",
  "notes",
];

const GAS_SEGMENTS = new Set<string>(["lpg", "ammonia", "petchem"]);
const GAS_VESSELS = new Set<Vessel>([
  "VLGC",
  "MGC",
  "Handysize gas carrier",
  "Pressurised / small LPG",
]);
const isGas = (segment: string) => GAS_SEGMENTS.has(segment);

/** Vessel sizes that fit the chosen cargo (tankers for oil, gas carriers for gases). */
const vesselsFor = (segment: string) =>
  INQUIRY_VESSELS.filter((v) => v !== ANY_VESSEL && GAS_VESSELS.has(v) === isGas(segment));

const TANKER_VESSELS = vesselsFor("crude");
const GAS_VESSEL_LIST = vesselsFor("lpg");

/** Short labels for the segmented control; the email keeps the full INQUIRY_SEGMENTS label. */
const SEGMENT_SHORT: Record<InquirySegment, string> = {
  crude: "Crude",
  clean: "Clean products",
  lpg: "LPG",
  ammonia: "Ammonia",
  petchem: "Petchem gases",
};

/**
 * Labels for the terms control: broker shorthand on phones, where three equal
 * cells can't hold "Spot voyage" / "Time charter" on one line, the full words
 * from sm up. Only one version is displayed at a time, so the radio's
 * accessible name always matches what is on screen. <i>, not <span>: the
 * kit's `.uv-segmented span` rule would style a nested span as a segment.
 */
const TERM_LABEL: Record<keyof typeof INQUIRY_TERMS, React.ReactNode> = {
  voyage: (
    <>
      <i className="not-italic sm:hidden">Spot</i>
      <i className="not-italic max-sm:hidden">Spot voyage</i>
    </>
  ),
  tc: (
    <>
      <i className="not-italic sm:hidden">Period</i>
      <i className="not-italic max-sm:hidden">Time charter</i>
    </>
  ),
  coa: "COA",
};

/*
 * Phones: the kit's flex-wrap control wraps raggedly (3+2, 2+1). Lay it out as
 * an even grid instead — cargo in two columns with an odd last option spanning
 * the row, terms as three equal one-line cells. `!` — the kit's display/padding
 * load after Tailwind.
 */
const SEGMENTED_GRID = {
  mode: "max-sm:!grid max-sm:grid-cols-2 max-sm:[&_span]:h-full",
  segment:
    "max-sm:!grid max-sm:grid-cols-2 max-sm:[&>label:last-child:nth-child(odd)]:col-span-2 max-sm:[&_span]:h-full",
  term: "max-sm:!grid max-sm:grid-cols-3 max-sm:[&_span]:h-full max-sm:[&_span]:!px-2",
} as const;

/** Lucide "copy" glyph as a mask, swapped into the toast icon (kit `--uv-check` mask) when nothing opened. */
const COPY_ICON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='14' height='14' x='8' y='8' rx='2'/%3E%3Cpath d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'/%3E%3C/svg%3E")`;

const NOTES_MAX = 2000;

/** Unsent inquiry, kept for this tab only, so a stray tap and Back loses nothing. */
const DRAFT_KEY = "lv-inquiry-draft";

function loadDraft(): Partial<Form> {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    const data: unknown = raw ? JSON.parse(raw) : null;
    if (!data || typeof data !== "object") return {};
    const draft: Partial<Form> = {};
    for (const k of Object.keys(EMPTY) as Field[]) {
      const v = (data as Record<string, unknown>)[k];
      if (typeof v === "string") draft[k] = v.slice(0, k === "notes" ? NOTES_MAX : 200);
    }
    // Enumerated fields must still be valid options; anything else falls back.
    if (draft.mode && !InquiryModeSchema.safeParse(draft.mode).success) delete draft.mode;
    if (draft.term && !InquiryTermSchema.safeParse(draft.term).success) delete draft.term;
    if (draft.segment && !InquirySegmentSchema.safeParse(draft.segment).success)
      delete draft.segment;
    if (draft.vessel && !INQUIRY_VESSELS.includes(draft.vessel as Vessel)) delete draft.vessel;
    if (
      draft.segment &&
      draft.vessel &&
      !vesselsFor(draft.segment).includes(draft.vessel as Vessel)
    ) {
      draft.vessel = ANY_VESSEL;
    }
    return draft;
  } catch {
    return {};
  }
}

function saveDraft(form: Form) {
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  } catch {
    // storage full or blocked: the form still works, just without a draft
  }
}

function clearDraft() {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // nothing to clear
  }
}

/** Today in the visitor's time zone, as yyyy-mm-dd (the date inputs' format). */
function localToday() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

/*
 * Kit gaps, patched per input (uiverse.css is shared):
 *  - Browser autofill paints its own blue fill over the field; repaint it in the
 *    kit's field colour and draw the brass focus bar as an inset shadow instead.
 *  - Date inputs: keep the value left-aligned on iOS, give empty iOS date inputs
 *    their full height, and soften the native calendar icon.
 */
const AUTOFILL = `[&:-webkit-autofill]:shadow-[inset_0_0_0_100vmax_#f8f5ef] [&:-webkit-autofill]:[-webkit-text-fill-color:#0A1F33] [&:-webkit-autofill:focus]:shadow-[inset_0_-2px_0_#B8893A,inset_0_0_0_100vmax_#f8f5ef] focus:placeholder:!opacity-100 ${FORCED_FOCUS}`;
// (placeholder rule: the kit dims focused placeholders to 70%, about 3.2:1 on
// the field — full slate keeps format hints like "name@company.com" at 6:1.
// FORCED_FOCUS: a real focus ring in Windows High Contrast, where the kit's
// gradient focus bar disappears.)
/*
 * Empty date inputs: the native "mm/dd/yyyy" mask would otherwise sit in full
 * navy and look like an entered value. Slate until a date is chosen (or while
 * the field is being typed into).
 */
const DATE =
  "min-h-[3.6rem] [&::-webkit-date-and-time-value]:text-left [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 data-[empty=true]:[&:not(:focus)]:!text-slate";

/** Plain-text inquiry for the email body / WhatsApp message, shaped by mode and terms. */
function summary(v: Inquiry) {
  const ship = v.mode === "ship";
  const tc = !ship && v.term === "tc";
  const window = (label: string) =>
    `${label}: ${v.laycanFrom}${v.laycanTo ? ` – ${v.laycanTo}` : " (end date open)"}`;
  const lines: (string | null)[] = ship
    ? [
        "Open position",
        v.quantity ? `Ship: ${v.quantity}` : null,
        `Vessel: ${v.vessel}`,
        `Trades: ${INQUIRY_SEGMENTS[v.segment]}`,
        `Open: ${v.loadArea}, ${v.laycanFrom}`,
        `Employment sought: ${INQUIRY_TERMS[v.term]}`,
      ]
    : tc
      ? [
          `Cargo: ${INQUIRY_SEGMENTS[v.segment]}`,
          `Vessel: ${v.vessel}`,
          `Terms: ${INQUIRY_TERMS[v.term]}`,
          `Delivery: ${v.loadArea}`,
          v.dischargeArea ? `Redelivery: ${v.dischargeArea}` : null,
          `Period: ${v.quantity}`,
          window("Delivery window"),
        ]
      : [
          `Cargo: ${INQUIRY_SEGMENTS[v.segment]}`,
          `Vessel: ${v.vessel}`,
          `Terms: ${INQUIRY_TERMS[v.term]}`,
          `Load: ${v.loadArea}`,
          `Discharge: ${v.dischargeArea}`,
          `Quantity: ${v.quantity}`,
          window("Laycan"),
        ];
  return [
    ...lines,
    v.notes ? `Notes: ${v.notes}` : null,
    "",
    `${v.name} · ${v.company}`,
    v.email,
    v.phone || null,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

/** Email subject: says at a glance whether it is a cargo, a period or an open ship. */
function subjectFor(v: Inquiry) {
  const cargo = INQUIRY_SEGMENTS[v.segment];
  if (v.mode === "ship") {
    const ship = v.vessel === ANY_VESSEL ? cargo : v.vessel;
    return `Open position — ${ship} — open ${v.loadArea} ${v.laycanFrom}`;
  }
  if (v.term === "tc") return `Time charter inquiry — ${cargo} — delivery ${v.loadArea}`;
  const kind = v.term === "coa" ? "COA inquiry" : "Charter inquiry";
  return `${kind} — ${cargo} — ${v.loadArea} to ${v.dischargeArea}`;
}

/**
 * Zod validation, one message per field (the schema's checks depend on the
 * mode and terms), plus what only the browser knows: today's date.
 */
function validate(form: Form): { data?: Inquiry; errors: Errors } {
  const r = InquirySchema.safeParse(form);
  const errors: Errors = {};
  if (!r.success) {
    for (const issue of r.error.issues) {
      const k = issue.path[0] as Field | undefined;
      if (k && !errors[k]) errors[k] = issue.message;
    }
  }
  const ship = form.mode === "ship";
  const tc = !ship && form.term === "tc";
  if (errors.segment && ship) errors.segment = "Choose what the ship carries";
  // `min` only limits the date picker; a typed date (e.g. the wrong year) isn't.
  if (!errors.laycanFrom && form.laycanFrom && form.laycanFrom < localToday()) {
    errors.laycanFrom = ship
      ? "The open date can’t be in the past"
      : tc
        ? "Delivery can’t start in the past"
        : "Laycan can’t start in the past";
  }
  if (!r.success || Object.keys(errors).length > 0) return { errors };
  return { data: r.data, errors };
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scroll a field into view and focus it (radio groups: their first option). */
function focusById(elId: string) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  el.focus({ preventScroll: true });
}

/**
 * Single-page charter inquiry. Validates with Zod, then opens the visitor's
 * own mail client (or WhatsApp) with the inquiry pre-filled — nothing is
 * stored server-side.
 */
export function InquiryForm() {
  const id = useId();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState<Channel | null>(null);
  const [sent, setSent] = useState<Sent | null>(null);
  const [today, setToday] = useState<string>();

  const submitRef = useRef<HTMLButtonElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<Field | null>(null);
  const timer = useRef<number>();
  /** Removes the blur/visibilitychange listeners of the current hand-off. */
  const stopWatching = useRef<() => void>();

  // Client-only setup, in order: the unsent draft from this tab (back after a
  // stray tap), then ?segment=…&vessel=…&quantity=… pre-select (links from
  // desk, class pages and the LPG converter), which wins for those fields, and
  // today's date as the earliest laycan (computed here to avoid a hydration
  // mismatch). Unknown values, or a ship size that doesn't fit the cargo, are
  // ignored. A ship size alone (MGC, Handysize guides: they swing between
  // cargoes) is kept with no cargo picked. Any pre-select means a cargo inquiry.
  useEffect(() => {
    const draft = loadDraft();
    if (Object.keys(draft).length > 0) setForm((f) => ({ ...f, ...draft }));

    const params = new URLSearchParams(window.location.search);
    const parsed = InquirySegmentSchema.safeParse(params.get("segment"));
    const vesselOnly = params.get("vessel");
    if (
      !parsed.success &&
      vesselOnly &&
      vesselOnly !== ANY_VESSEL &&
      INQUIRY_VESSELS.includes(vesselOnly as Vessel)
    ) {
      setForm((f) => ({
        ...f,
        mode: "cargo",
        vessel: vesselOnly,
        // a drafted cargo that doesn't fit the linked ship size is dropped
        segment:
          f.segment && !vesselsFor(f.segment).includes(vesselOnly as Vessel) ? "" : f.segment,
      }));
    }
    if (parsed.success) {
      const segment = parsed.data;
      const vessel = params.get("vessel");
      const quantity = params.get("quantity")?.trim().slice(0, 60);
      setForm((f) => ({
        ...f,
        mode: "cargo",
        segment,
        vessel:
          vessel && vesselsFor(segment).includes(vessel as Vessel)
            ? vessel
            : vesselsFor(segment).includes(f.vessel as Vessel)
              ? f.vessel
              : ANY_VESSEL,
        quantity: quantity || f.quantity,
      }));
    }
    setToday(localToday());
    return () => {
      window.clearTimeout(timer.current);
      stopWatching.current?.();
    };
  }, []);

  // Move focus to the first invalid field *after* aria-invalid/aria-describedby
  // are rendered, so screen readers announce the error with the label.
  useEffect(() => {
    const k = pendingFocus.current;
    if (!k) return;
    pendingFocus.current = null;
    focusById(`${id}-${k}`);
  }, [errors, id]);

  /** The error summary's action: back to the first field that needs attention. */
  const focusFirstError = () => {
    const k = FIELD_ORDER.find((f) => errors[f]);
    if (k) focusById(`${id}-${k}`);
  };

  const update = (patch: Partial<Form>) => {
    const next = { ...form, ...patch };
    setForm(next);
    saveDraft(next);
    // Errors only appear after a send attempt; from then on the whole form
    // re-validates as you type, so messages clear (or update) in step.
    if (attempted) setErrors(validate(next).errors);
    if (sent) setSent(null);
  };

  const setSegment = (segment: string) =>
    update({
      segment,
      vessel: vesselsFor(segment).includes(form.vessel as Vessel) ? form.vessel : ANY_VESSEL,
    });

  const submit = (via: Channel) => {
    if (busy) return;
    setAttempted(true);
    const { data, errors: next } = validate(form);
    setErrors(next);
    if (!data) {
      setSent(null);
      pendingFocus.current = FIELD_ORDER.find((k) => next[k]) ?? null;
      return;
    }

    const gas = isGas(data.segment);
    const desk = gas ? siteConfig.desks.lpg : siteConfig.desks.tankers;
    const deskName = gas ? "LPG & ammonia desk" : "tanker desk";
    const subject = subjectFor(data);
    const body = summary(data);

    setSent(null);
    setBusy(via);

    // There is no callback from a mail app or WhatsApp. If the hand-off worked,
    // this window loses focus (app launched) or is hidden (new tab, webmail
    // handler); if neither happens, nothing opened — e.g. desktop Chrome with
    // no mail handler — and the toast leads with "Copy inquiry" instead.
    stopWatching.current?.();
    let opened = false;
    const onBlur = () => {
      opened = true;
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") opened = true;
    };
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    stopWatching.current = () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
      stopWatching.current = undefined;
    };

    // Navigate synchronously, inside the click, so pop-up blockers allow it.
    if (via === "email") {
      window.location.href = `mailto:${desk.email}?cc=${siteConfig.email}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      window.open(whatsappUrl(`${subject}\n\n${body}`), "_blank", "noopener");
    }
    // Hold the busy state while we watch for the hand-off, then confirm.
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      stopWatching.current?.();
      setBusy(null);
      setSent({ via, opened, deskName, deskEmail: desk.email, subject, body });
      // Handed off to the mail app / WhatsApp: the draft has done its job.
      if (opened) clearDraft();
    }, 1500);
  };

  const dismiss = () => {
    const hadFocus = toastRef.current?.contains(document.activeElement);
    setSent(null);
    if (hadFocus) submitRef.current?.focus();
  };

  const errorCount = Object.values(errors).filter(Boolean).length;
  const msgId = (k: Field) => `${id}-${k}-msg`;

  /** Inline message under a field: the error when there is one, otherwise an optional hint. */
  const message = (k: Field, hint?: React.ReactNode) => {
    const err = errors[k];
    if (!err && !hint) return null;
    return (
      <p id={msgId(k)} className="uv-field__msg flex items-start gap-1.5">
        {err && <AlertCircle className="mt-[3px] h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
        <span>{err ?? hint}</span>
      </p>
    );
  };

  const control = (k: Field, hasHint = false) => ({
    id: `${id}-${k}`,
    name: k,
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      update({ [k]: e.target.value }),
    "aria-invalid": errors[k] ? (true as const) : undefined,
    "aria-describedby": errors[k] || hasHint ? msgId(k) : undefined,
  });

  const input = (
    k: Field,
    label: string,
    opts: {
      type?: "text" | "email" | "tel" | "date";
      placeholder?: string;
      autoComplete?: string;
      optional?: boolean;
      min?: string;
      hint?: string;
      className?: string;
    } = {}
  ) => (
    <div className={cn("uv-field", opts.className)}>
      <input
        {...control(k, Boolean(opts.hint))}
        type={opts.type ?? "text"}
        // The kit needs a placeholder for its floating label; real hints show on focus.
        // Date inputs take none (their label stays floated above the date mask).
        placeholder={opts.type === "date" ? undefined : (opts.placeholder ?? " ")}
        autoComplete={opts.autoComplete ?? "off"}
        aria-required={opts.optional ? undefined : true}
        min={opts.min}
        spellCheck={opts.type === "email" ? false : undefined}
        data-empty={opts.type === "date" ? !form[k] : undefined}
        className={cn(AUTOFILL, opts.type === "date" && DATE)}
      />
      <label htmlFor={`${id}-${k}`}>
        {label}
        {opts.optional && " (optional)"}
      </label>
      {message(k, opts.hint)}
    </div>
  );

  const segmented = (
    k: "mode" | "segment" | "term",
    label: string,
    options: [string, React.ReactNode][],
    onPick: (value: string) => void
  ) => {
    const err = errors[k];
    return (
      <div>
        <p id={`${id}-${k}-label`} className="mb-2 text-[13px] font-medium text-slate">
          {label}
        </p>
        <div
          className={cn(
            "uv-segmented",
            SEGMENTED_GRID[k],
            FORCED_SEGMENTED,
            err && "!border-state-negative"
          )}
          role="radiogroup"
          aria-labelledby={`${id}-${k}-label`}
          aria-required="true"
          aria-invalid={err ? true : undefined}
        >
          {options.map(([value, text], i) => (
            <label key={value}>
              <input
                type="radio"
                id={i === 0 ? `${id}-${k}` : undefined}
                name={k}
                value={value}
                checked={form[k] === value}
                onChange={() => onPick(value)}
                aria-describedby={err ? msgId(k) : undefined}
              />
              <span>{text}</span>
            </label>
          ))}
        </div>
        {err && (
          <p id={msgId(k)} className="uv-field__msg flex items-start gap-1.5 !text-state-negative">
            <AlertCircle className="mt-[3px] h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{err}</span>
          </p>
        )}
      </div>
    );
  };

  // Floated full-width legend: it lays out like a normal block (margins work, and
  // the fieldset's top rule isn't broken by it). The content after it clears.
  const legend = (n: string, text: string) => (
    <legend className="float-left mb-6 flex w-full items-center gap-3">
      <span className="font-mono text-[11px] text-slate" aria-hidden="true">
        {n}
      </span>
      <Eyebrow as="span" size="sm">
        {text}
      </Eyebrow>
    </legend>
  );

  const gas = isGas(form.segment);
  const notesLeft = NOTES_MAX - form.notes.length;
  // The form follows what the visitor brings and the terms: an owner with an
  // open ship, or a period charterer, isn't asked for a discharge port and a
  // cargo tonnage.
  const ship = form.mode === "ship";
  const tc = !ship && form.term === "tc";
  const coa = !ship && form.term === "coa";

  return (
    <form
      noValidate
      aria-label="Charter inquiry"
      onSubmit={(e) => {
        e.preventDefault();
        submit("email");
      }}
      className="rounded-lg border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,31,51,0.04)] sm:p-8 md:p-10"
    >
      <fieldset>
        {legend("01", "Cargo & ship")}
        <div className="clear-left grid gap-6">
          {segmented(
            "mode",
            "I have",
            (Object.keys(INQUIRY_MODES) as (keyof typeof INQUIRY_MODES)[]).map((k) => [
              k,
              INQUIRY_MODES[k],
            ]),
            (mode) => update({ mode })
          )}
          {segmented(
            "segment",
            ship ? "The ship carries" : "Cargo",
            (Object.keys(INQUIRY_SEGMENTS) as InquirySegment[]).map((k) => [k, SEGMENT_SHORT[k]]),
            setSegment
          )}
          {segmented(
            "term",
            ship ? "Employment sought" : "Charter terms",
            (Object.keys(INQUIRY_TERMS) as (keyof typeof INQUIRY_TERMS)[]).map((k) => [
              k,
              TERM_LABEL[k],
            ]),
            (term) => update({ term })
          )}
          <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
            <div className="uv-field">
              <select {...control("vessel")} className={AUTOFILL}>
                <option value={ANY_VESSEL}>{ANY_VESSEL}</option>
                {/* both families until a cargo is chosen, then only the ones that fit */}
                {(form.segment ? [gas] : [false, true]).map((g) => (
                  <optgroup key={String(g)} label={g ? "Gas carriers" : "Tankers"}>
                    {(g ? GAS_VESSEL_LIST : TANKER_VESSELS).map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <label htmlFor={`${id}-vessel`}>Vessel size</label>
              {message("vessel")}
            </div>
            {ship
              ? input("quantity", "Ship name / size", {
                  placeholder: "e.g. MT Levant Star, 115,000 dwt",
                  optional: true,
                })
              : input("quantity", tc ? "Charter period" : "Quantity", {
                  placeholder: tc
                    ? "e.g. 12 months ± 30 days"
                    : coa
                      ? gas
                        ? "e.g. 6 × 44,000 mt over 12 months"
                        : "e.g. 6 × 80,000 mt over 12 months"
                      : gas
                        ? "e.g. 44,000 mt or 5,000 mt ±10%"
                        : "e.g. 80,000 mt ±10%",
                })}
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-10 border-t border-line pt-8">
        {legend("02", ship ? "Position & timing" : "Route & timing")}
        <div className="clear-left grid gap-x-5 gap-y-6 md:grid-cols-2">
          {ship ? (
            <>
              {input("loadArea", "Open port / area", { placeholder: "e.g. Aliağa, Fujairah" })}
              {input("laycanFrom", "Open date", { type: "date", min: today })}
            </>
          ) : (
            <>
              {input("loadArea", tc ? "Delivery area" : "Load port / area", {
                placeholder: tc ? "e.g. East Med, Singapore" : "e.g. Novorossiysk, Houston",
              })}
              {input("dischargeArea", tc ? "Redelivery area" : "Discharge port / area", {
                placeholder: tc ? "e.g. worldwide, Med–Black Sea" : "e.g. Aliağa, Augusta",
                optional: tc,
              })}
              {input("laycanFrom", tc ? "Delivery from" : "Laycan from", {
                type: "date",
                min: today,
              })}
              {input("laycanTo", tc ? "Delivery to" : "Laycan to", {
                type: "date",
                min: form.laycanFrom || today,
                optional: true,
              })}
            </>
          )}
        </div>
      </fieldset>

      <fieldset className="mt-10 border-t border-line pt-8">
        {legend("03", "Your details")}
        <div className="clear-left grid gap-x-5 gap-y-6 md:grid-cols-2">
          {input("name", "Name", { autoComplete: "name" })}
          {input("company", "Company", { autoComplete: "organization" })}
          {input("email", "Email", {
            type: "email",
            autoComplete: "email",
            placeholder: "name@company.com",
          })}
          {input("phone", "Phone / WhatsApp", {
            type: "tel",
            autoComplete: "tel",
            optional: true,
            placeholder: "+90 5xx xxx xx xx",
          })}
          <div className="uv-field md:col-span-2">
            <textarea
              {...control("notes", notesLeft < 300)}
              rows={4}
              maxLength={NOTES_MAX}
              placeholder={
                ship
                  ? "Last cargoes, approvals, trading limits…"
                  : "Grade, terminals, restrictions, CP form…"
              }
              className={AUTOFILL}
            />
            <label htmlFor={`${id}-notes`}>Notes (optional)</label>
            {message("notes", notesLeft < 300 ? `${notesLeft} characters left` : undefined)}
          </div>
        </div>
      </fieldset>

      <div className="mt-10 border-t border-line pt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            ref={submitRef}
            type="submit"
            className="uv-btn uv-btn--lg sm:min-w-[15rem]"
            aria-busy={busy === "email" || undefined}
            aria-disabled={busy === "whatsapp" || undefined}
          >
            {busy === "email" ? (
              <>
                <span className="uv-loader uv-loader--sm" aria-hidden="true" />
                <span>Opening email app…</span>
              </>
            ) : (
              <>
                <span>Send by email</span>
                <ArrowRight aria-hidden="true" />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => submit("whatsapp")}
            className="uv-btn-outline uv-btn--lg sm:min-w-[15rem]"
            aria-busy={busy === "whatsapp" || undefined}
            aria-disabled={busy === "email" || undefined}
          >
            {busy === "whatsapp" ? (
              <span
                className="uv-loader uv-loader--sm"
                style={{ "--uv-loader-air": "#fff" } as React.CSSProperties}
                aria-hidden="true"
              />
            ) : (
              <MessageCircle aria-hidden="true" />
            )}
            <span>{busy === "whatsapp" ? "Opening WhatsApp…" : "Send via WhatsApp"}</span>
          </button>
          {/* Own row, flush with the field errors above; a way back to the first one. */}
          {attempted && errorCount > 0 && (
            <p className="flex items-start gap-1.5 text-sm font-medium text-state-negative sm:basis-full">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <button type="button" onClick={focusFirstError} className="uv-link text-start">
                {errorCount === 1
                  ? "1 field needs attention — go to it"
                  : `${errorCount} fields need attention — go to the first`}
              </button>
            </p>
          )}
        </div>
        <p className="mt-4 max-w-xl text-pretty text-[13px] leading-relaxed text-slate">
          Opens your own email app or WhatsApp with the inquiry filled in. Nothing is stored on our
          servers; an unsent draft stays in this browser tab until you send it or close the tab.{" "}
          <Link href="/privacy" className="uv-link font-medium text-navy">
            Privacy policy
          </Link>
        </p>

        {/* Always-present live region, so the confirmation is announced reliably. */}
        <div role="status" aria-live="polite">
          {sent && (
            <div
              ref={toastRef}
              className="uv-toast mt-6"
              onKeyDown={(e) => {
                if (e.key === "Escape") dismiss();
              }}
            >
              <span
                className="uv-toast__icon"
                aria-hidden="true"
                // Nothing opened: a copy glyph instead of the kit's success check.
                style={
                  sent.opened ? undefined : ({ "--uv-check": COPY_ICON } as React.CSSProperties)
                }
              />
              <div className="min-w-0">
                <p className="uv-toast__title">
                  {sent.opened
                    ? sent.via === "email"
                      ? "Finish sending in your email app"
                      : "Finish sending in WhatsApp"
                    : sent.via === "email"
                      ? "Nothing opened? Copy the inquiry"
                      : "WhatsApp didn’t open? Copy the inquiry"}
                </p>
                <p className="uv-toast__text">
                  {sent.opened ? (
                    sent.via === "email" ? (
                      <>
                        The inquiry is addressed to the {sent.deskName} and ready to send. Using
                        webmail instead? Copy the inquiry and paste it into a new message to{" "}
                      </>
                    ) : (
                      <>The inquiry is ready to send. Prefer email? Copy it and send it to </>
                    )
                  ) : sent.via === "email" ? (
                    <>
                      This browser may have no email app set up. Copy the inquiry and paste it into
                      a new message to the {sent.deskName},{" "}
                    </>
                  ) : (
                    <>
                      A pop-up blocker may have stopped it. Copy the inquiry and paste it into a new
                      message to the {sent.deskName},{" "}
                    </>
                  )}
                  <a
                    href={`mailto:${sent.deskEmail}`}
                    className="uv-link font-semibold text-navy [overflow-wrap:anywhere]"
                  >
                    {sent.deskEmail}
                  </a>
                  .
                </p>
                {/* nothing is lost if the hand-off didn't open anything; when it
                    didn't, copying is the way forward, so it becomes the lead action */}
                <CopyInquiryButton
                  text={`${sent.subject}\n\n${sent.body}`}
                  primary={!sent.opened}
                />
              </div>
              <button
                type="button"
                className="uv-toast__close"
                aria-label="Dismiss"
                onClick={dismiss}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

/** "Copy inquiry" action in the confirmation toast; its label change is announced by the toast's live region. */
function CopyInquiryButton({ text, primary = false }: { text: string; primary?: boolean }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    let ok: boolean;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = legacyCopy(text);
    }
    setState(ok ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2400);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(primary ? "uv-btn" : "uv-btn-outline", "uv-btn--sm mt-3")}
    >
      {state === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span>
        {state === "copied"
          ? "Inquiry copied"
          : state === "failed"
            ? "Couldn’t copy"
            : "Copy inquiry"}
      </span>
    </button>
  );
}

/** Fallback for browsers without the async Clipboard API (or insecure contexts). */
function legacyCopy(text: string) {
  const active = document.activeElement as HTMLElement | null;
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  ta.remove();
  active?.focus();
  return ok;
}

/**
 * Icon button that copies a value, wrapped in the kit's `.uv-tooltip`
 * ("Copy email" → "Copied!"). The result is also announced to screen readers.
 * Used by the contact page's direct lines.
 *
 * WCAG 1.4.13 patches on top of the CSS-only kit tooltip:
 *  - dismissible: Esc hides it (until the pointer or focus leaves and returns);
 *  - hoverable: the bubble takes pointer events while shown, so moving onto it
 *    keeps it open (the kit sets pointer-events:none);
 *  - not sticky: after a mouse click the button keeps (non-visible) focus, which
 *    the kit's :focus-within would turn into a permanent tip; it now hides once
 *    the pointer leaves, and keyboard focus (:focus-visible) still shows it.
 */
export function CopyButton({
  value,
  label,
  tooltip = "Copy",
  className,
}: {
  value: string;
  /** Accessible name, e.g. "Copy tanker desk email address". */
  label: string;
  /** Idle tooltip text, e.g. "Copy email". */
  tooltip?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const [dismissed, setDismissed] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Esc dismisses a tip shown by hover too, without moving the pointer or focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDismissed(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const copy = async () => {
    let ok: boolean;
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch {
      ok = legacyCopy(value);
    }
    setDismissed(false);
    setState(ok ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1800);
  };

  const tip = state === "copied" ? "Copied!" : state === "failed" ? "Couldn't copy" : tooltip;
  const reset = () => setDismissed(false);

  return (
    <span
      className={cn(
        "uv-tooltip inline-flex shrink-0",
        // hoverable bubble (it only receives events while visible)
        "[&::after]:!pointer-events-auto [&::before]:!pointer-events-auto",
        state === "idle" && [
          // a mouse click leaves focus behind; don't let that pin the tip open
          "[&:not(:hover):has(button:focus:not(:focus-visible))]:before:!invisible",
          "[&:not(:hover):has(button:focus:not(:focus-visible))]:after:!invisible",
          dismissed && "before:!invisible after:!invisible",
        ],
        className
      )}
      data-tooltip={tip}
      data-tooltip-show={state === "idle" ? undefined : "true"}
      onMouseEnter={reset}
      onMouseLeave={reset}
    >
      <button
        type="button"
        onClick={copy}
        onFocus={reset}
        onBlur={reset}
        aria-label={label}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white motion-safe:transition-colors",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy",
          state === "copied"
            ? "border-brass text-brass-ink"
            : "border-line text-slate hover:border-navy/40 hover:bg-sand hover:text-navy"
        )}
      >
        {state === "copied" ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
      <span className="sr-only" role="status">
        {state === "copied"
          ? `${value} copied to clipboard`
          : state === "failed"
            ? "Copy failed"
            : ""}
      </span>
    </span>
  );
}
