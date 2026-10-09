"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, ArrowRight, Check, Copy, MessageCircle } from "lucide-react";
import {
  INQUIRY_SEGMENTS,
  INQUIRY_TERMS,
  INQUIRY_VESSELS,
  InquirySchema,
  InquirySegmentSchema,
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
  segment:
    "max-sm:!grid max-sm:grid-cols-2 max-sm:[&>label:last-child:nth-child(odd)]:col-span-2 max-sm:[&_span]:h-full",
  term: "max-sm:!grid max-sm:grid-cols-3 max-sm:[&_span]:h-full max-sm:[&_span]:!px-2",
} as const;

/** Lucide "copy" glyph as a mask, swapped into the toast icon (kit `--uv-check` mask) when nothing opened. */
const COPY_ICON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='14' height='14' x='8' y='8' rx='2'/%3E%3Cpath d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'/%3E%3C/svg%3E")`;

const NOTES_MAX = 2000;
const LAYCAN_ORDER_MSG = "Laycan end must be on or after the start date";

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

function summary(v: Inquiry) {
  return [
    `Cargo: ${INQUIRY_SEGMENTS[v.segment]}`,
    `Vessel: ${v.vessel}`,
    `Terms: ${INQUIRY_TERMS[v.term]}`,
    `Load: ${v.loadArea}`,
    `Discharge: ${v.dischargeArea}`,
    `Quantity: ${v.quantity}`,
    `Laycan: ${v.laycanFrom}${v.laycanTo ? ` – ${v.laycanTo}` : " (end date open)"}`,
    v.notes ? `Notes: ${v.notes}` : null,
    "",
    `${v.name} · ${v.company}`,
    v.email,
    v.phone || null,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

/** Zod validation, one message per field. Laycan order is checked even while other fields are open. */
function validate(form: Form): { data?: Inquiry; errors: Errors } {
  const r = InquirySchema.safeParse(form);
  if (r.success) return { data: r.data, errors: {} };
  const errors: Errors = {};
  for (const issue of r.error.issues) {
    const k = issue.path[0] as Field | undefined;
    if (k && !errors[k]) errors[k] = issue.message;
  }
  if (!errors.laycanTo && form.laycanFrom && form.laycanTo && form.laycanFrom > form.laycanTo) {
    errors.laycanTo = LAYCAN_ORDER_MSG;
  }
  return { errors };
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  // Client-only setup: ?segment=…&vessel=…&quantity=… pre-select (links from
  // desk, class pages and the LPG converter) and today's date as the earliest
  // laycan (computed here to avoid a hydration mismatch). Unknown values, or a
  // ship size that doesn't fit the cargo, are ignored. A ship size alone (MGC,
  // Handysize guides: they swing between cargoes) is kept with no cargo picked.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsed = InquirySegmentSchema.safeParse(params.get("segment"));
    const vesselOnly = params.get("vessel");
    if (
      !parsed.success &&
      vesselOnly &&
      vesselOnly !== ANY_VESSEL &&
      INQUIRY_VESSELS.includes(vesselOnly as Vessel)
    ) {
      setForm((f) => ({ ...f, vessel: vesselOnly }));
    }
    if (parsed.success) {
      const segment = parsed.data;
      const vessel = params.get("vessel");
      const quantity = params.get("quantity")?.trim().slice(0, 60);
      setForm((f) => ({
        ...f,
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
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setToday(d.toISOString().slice(0, 10));
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
    const el = document.getElementById(`${id}-${k}`);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    el.focus({ preventScroll: true });
  }, [errors, id]);

  const update = (patch: Partial<Form>) => {
    const next = { ...form, ...patch };
    setForm(next);
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
    const subject = `Charter inquiry — ${INQUIRY_SEGMENTS[data.segment]} — ${data.loadArea} to ${data.dischargeArea}`;
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
    k: "segment" | "term",
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
    <legend className="float-left mb-6 flex w-full items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink">
      <span className="font-mono text-[11px] tracking-normal text-slate" aria-hidden="true">
        {n}
      </span>
      <span className="h-px w-6 bg-brass/60" aria-hidden="true" />
      {text}
    </legend>
  );

  const gas = isGas(form.segment);
  const notesLeft = NOTES_MAX - form.notes.length;

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
            "segment",
            "Cargo",
            (Object.keys(INQUIRY_SEGMENTS) as InquirySegment[]).map((k) => [k, SEGMENT_SHORT[k]]),
            setSegment
          )}
          {segmented(
            "term",
            "Charter terms",
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
            {input("quantity", "Quantity", {
              placeholder: gas ? "e.g. 44,000 mt or 5,000 mt ±10%" : "e.g. 80,000 mt ±10%",
            })}
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-10 border-t border-line pt-8">
        {legend("02", "Route & timing")}
        <div className="clear-left grid gap-x-5 gap-y-6 md:grid-cols-2">
          {input("loadArea", "Load port / area", { placeholder: "e.g. Novorossiysk, Houston" })}
          {input("dischargeArea", "Discharge port / area", { placeholder: "e.g. Aliağa, Augusta" })}
          {input("laycanFrom", "Laycan from", { type: "date", min: today })}
          {input("laycanTo", "Laycan to", {
            type: "date",
            min: form.laycanFrom || today,
            optional: true,
          })}
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
              placeholder="Grade, terminals, restrictions, CP form…"
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
          {attempted && errorCount > 0 && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-state-negative sm:ml-2">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {errorCount === 1 ? "1 field needs attention" : `${errorCount} fields need attention`}
            </p>
          )}
        </div>
        <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-slate">
          Opens your own email app or WhatsApp with the inquiry filled in. Nothing is stored on this
          site.
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
