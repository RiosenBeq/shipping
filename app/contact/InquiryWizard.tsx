"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Copy, Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InquiryCargoSchema,
  InquiryStep1Schema,
  InquiryStep2Schema,
  InquiryStep3Schema,
  InquiryStep4Schema,
  InquiryTermSchema,
  type DischArea,
  type InquiryCargo,
  type InquiryTerm,
  type LoadArea,
  type PreferredClass,
} from "@/lib/schemas";
import { siteConfig, telUrl, whatsappUrl } from "@/lib/site";
import { trackConversion } from "@/lib/analytics";

type Form = {
  cargo: InquiryCargo;
  loadArea: LoadArea;
  dischArea: DischArea;
  stem: string;
  vesselClass: PreferredClass;
  laycanFrom: string;
  laycanTo: string;
  term: InquiryTerm;
  notes: string;
  name: string;
  firm: string;
  email: string;
  phone: string;
};

const CARGO_OPTIONS: { value: InquiryCargo; name: string; desc: string }[] = [
  { value: "crude", name: "Crude", desc: "VLCC · Suezmax · Aframax" },
  { value: "clean", name: "Clean products", desc: "LR2 · LR1 · MR · Handy" },
  { value: "chem", name: "Chemicals", desc: "IMO 2/3 · stainless · coated" },
  { value: "bulk", name: "Dry bulk", desc: "Cape · Kamsarmax · Ultramax · Handy" },
];

/** Vessel classes offered for each cargo type. */
const CLASS_OPTIONS: Record<InquiryCargo, { value: PreferredClass; label: string }[]> = {
  crude: [
    { value: "VLCC", label: "VLCC" },
    { value: "Suezmax", label: "Suezmax" },
    { value: "Aframax", label: "Aframax" },
    { value: "Open", label: "Open / not sure" },
  ],
  clean: [
    { value: "LR2", label: "LR2" },
    { value: "LR1", label: "LR1" },
    { value: "MR", label: "MR" },
    { value: "Handy", label: "Handy" },
    { value: "Open", label: "Open / not sure" },
  ],
  chem: [
    { value: "Chem-stainless", label: "Stainless (IMO 2)" },
    { value: "Chem-coated", label: "Coated (IMO 2/3)" },
    { value: "Open", label: "Open / not sure" },
  ],
  bulk: [
    { value: "Capesize", label: "Capesize" },
    { value: "Kamsarmax", label: "Panamax / Kamsarmax" },
    { value: "Ultramax", label: "Supramax / Ultramax" },
    { value: "Handysize", label: "Handysize" },
    { value: "Open", label: "Open / not sure" },
  ],
};

const DEFAULT_CLASS: Record<InquiryCargo, PreferredClass> = {
  crude: "Suezmax",
  clean: "MR",
  chem: "Chem-stainless",
  bulk: "Ultramax",
};

const TERM_OPTIONS: { value: InquiryTerm; name: string; desc: string }[] = [
  { value: "voy", name: "Single voyage", desc: "Spot or relet" },
  { value: "tc", name: "Time charter", desc: "3–12 months, periods" },
  { value: "coa", name: "COA", desc: "Multiple lifts, programme" },
  { value: "contract", name: "Long contract", desc: "12+ months, dedicated" },
];

const LOAD_AREAS: { value: LoadArea; label: string }[] = [
  { value: "blk", label: "Black Sea / CPC" },
  { value: "med", label: "Mediterranean" },
  { value: "nsea-baltic", label: "North Sea / Baltic" },
  { value: "waf", label: "West Africa" },
  { value: "ag-rs", label: "Arabian Gulf / Red Sea" },
  { value: "usg-caribs", label: "US Gulf / Caribbean" },
  { value: "ecsa", label: "East Coast South America" },
  { value: "australia", label: "Australia" },
  { value: "fareast", label: "Far East / SE Asia" },
  { value: "other", label: "Other — add in notes" },
];

const DISCH_AREAS: { value: DischArea; label: string }[] = [
  { value: "ukc-med", label: "UK Continent / Med" },
  { value: "usg-usac", label: "US Gulf / US Atlantic coast" },
  { value: "fareast", label: "Far East / China" },
  { value: "india", label: "India / Pakistan" },
  { value: "sam", label: "South America" },
  { value: "waf", label: "West Africa" },
  { value: "spore-eafr", label: "Singapore / East Africa" },
  { value: "other", label: "Other — add in notes" },
];

const STEPS = [
  { num: 1, label: "Cargo" },
  { num: 2, label: "Route & vessel" },
  { num: 3, label: "Laycan & terms" },
  { num: 4, label: "Your details" },
] as const;

const INITIAL: Form = {
  cargo: "crude",
  loadArea: "blk",
  dischArea: "ukc-med",
  stem: "",
  vesselClass: DEFAULT_CLASS.crude,
  laycanFrom: "",
  laycanTo: "",
  term: "voy",
  notes: "",
  name: "",
  firm: "",
  email: "",
  phone: "",
};

const labelOf = <T extends string>(list: { value: T; label?: string; name?: string }[], v: T) => {
  const hit = list.find((o) => o.value === v);
  return hit?.label ?? hit?.name ?? v;
};

/** Pre-fill from links such as /contact?cargo=bulk&term=coa&notes=Attn%3A%20… */
function prefillFromSearch(search: string): Partial<Form> {
  const params = new URLSearchParams(search);
  const out: Partial<Form> = {};
  const cargo = InquiryCargoSchema.safeParse(params.get("cargo"));
  if (cargo.success) {
    out.cargo = cargo.data;
    out.vesselClass = DEFAULT_CLASS[cargo.data];
  }
  const term = InquiryTermSchema.safeParse(params.get("term"));
  if (term.success) out.term = term.data;
  const notes = params.get("notes");
  if (notes) out.notes = notes.slice(0, 300);
  return out;
}

export function InquiryWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState<"idle" | "ok" | "error">("idle");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (window.location.search)
      setForm((f) => ({ ...f, ...prefillFromSearch(window.location.search) }));
  }, []);

  // Move focus to the new step's heading so keyboard and screen-reader users keep their place.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, submitted]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) {
      setErrors((e) => {
        const { [key]: _removed, ...rest } = e;
        return rest;
      });
    }
  };

  const setCargo = (cargo: InquiryCargo) =>
    setForm((p) => ({
      ...p,
      cargo,
      vesselClass: CLASS_OPTIONS[cargo].some((c) => c.value === p.vesselClass)
        ? p.vesselClass
        : DEFAULT_CLASS[cargo],
    }));

  const validateStep = (s: number): boolean => {
    const result =
      s === 1
        ? InquiryStep1Schema.safeParse({ cargo: form.cargo })
        : s === 2
          ? InquiryStep2Schema.safeParse({
              loadArea: form.loadArea,
              dischArea: form.dischArea,
              stem: form.stem,
              vesselClass: form.vesselClass,
            })
          : s === 3
            ? InquiryStep3Schema.safeParse({
                laycanFrom: form.laycanFrom,
                laycanTo: form.laycanTo,
                term: form.term,
                notes: form.notes,
              })
            : InquiryStep4Schema.safeParse({
                name: form.name,
                firm: form.firm,
                email: form.email,
                phone: form.phone || undefined,
              });
    if (!result.success) {
      const next: Record<string, string> = {};
      result.error.issues.forEach((iss) => {
        const k = iss.path[0]?.toString();
        if (k && !next[k]) next[k] = iss.message;
      });
      setErrors(next);
      // Focus the first invalid field.
      const firstKey = Object.keys(next)[0];
      if (firstKey) {
        requestAnimationFrame(() =>
          formRef.current?.querySelector<HTMLElement>(`#${firstKey}`)?.focus()
        );
      }
      return false;
    }
    setErrors({});
    return true;
  };

  // Stable reference for the lifetime of this component instance.
  const [reference] = useState(
    () =>
      `LVT-${new Date().toISOString().slice(0, 10)}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`
  );

  const subject = `Charter inquiry — ${labelOf(CARGO_OPTIONS, form.cargo)} — ${reference}`;

  // Human-readable inquiry, used for the email body and the copy-to-clipboard fallback.
  const summary = [
    `Reference: ${reference}`,
    "",
    `Cargo: ${labelOf(CARGO_OPTIONS, form.cargo)}`,
    `Load area: ${labelOf(LOAD_AREAS, form.loadArea)}`,
    `Discharge area: ${labelOf(DISCH_AREAS, form.dischArea)}`,
    `Stem: ${form.stem.trim() || "—"}`,
    `Preferred class: ${labelOf(CLASS_OPTIONS[form.cargo], form.vesselClass)}`,
    "",
    `Laycan: ${form.laycanFrom || "—"} → ${form.laycanTo || "—"}`,
    `Charter type: ${labelOf(TERM_OPTIONS, form.term)}`,
    `Notes: ${form.notes.trim() || "—"}`,
    "",
    `Name: ${form.name.trim()}`,
    `Company: ${form.firm.trim()}`,
    `Email: ${form.email.trim()}`,
    `Phone / WhatsApp: ${form.phone.trim() || "—"}`,
  ].join("\n");

  const mailtoUrl = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(summary)}`;

  const goNext = () => {
    if (!validateStep(step)) return;
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    setSubmitted(true);
    trackConversion("inquiry_composed", { cargo: form.cargo, term: form.term });
    // Hand the pre-filled inquiry to the visitor's email app.
    window.location.href = mailtoUrl;
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${summary}`);
      setCopied("ok");
      trackConversion("inquiry_copied", { cargo: form.cargo });
    } catch {
      setCopied("error");
    }
  };

  const errorProps = (key: keyof Form) =>
    errors[key]
      ? { "aria-invalid": true as const, "aria-describedby": `${key}-error` }
      : { "aria-invalid": false as const };

  const fieldError = (name: keyof Form) =>
    errors[name] ? (
      <span id={`${name}-error`} className="field-error">
        {errors[name]}
      </span>
    ) : null;

  return (
    <div className="inquiry-grid">
      <section className="inquiry-side" aria-label="How the inquiry works">
        <span className="eyebrow">In four steps</span>
        <h2 className="inquiry-side-title">The desk needs four things to quote sharp.</h2>
        <p>
          Cargo, route, the lift window and how to reach you. Only your name, company and email are
          required — leave anything else blank and we&apos;ll fill the gaps on the call.
        </p>
        <ol className="steps">
          {STEPS.map((s) => (
            <li
              key={s.num}
              className={`step-pill ${step === s.num && !submitted ? "active" : step > s.num || submitted ? "done" : ""}`}
              aria-current={step === s.num && !submitted ? "step" : undefined}
            >
              <span className="num" aria-hidden="true">
                {step > s.num || submitted ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  s.num
                )}
              </span>
              <span>
                <span className="sr-only">Step {s.num}: </span>
                {s.label}
              </span>
            </li>
          ))}
        </ol>
        <div className="inquiry-direct">
          <p className="inquiry-direct-title">Prefer to talk?</p>
          <ul className="broker-contact">
            <li>
              <a href={telUrl()}>
                <Phone className="h-4 w-4" aria-hidden="true" /> {siteConfig.phone}
              </a>
            </li>
            <li>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp{" "}
                {siteConfig.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.email}`}>
                <Mail className="h-4 w-4" aria-hidden="true" /> {siteConfig.email}
              </a>
            </li>
          </ul>
        </div>
      </section>

      <form
        ref={formRef}
        className="inquiry-form"
        onSubmit={(e) => {
          e.preventDefault();
          goNext();
        }}
        noValidate
        aria-label="Charter inquiry"
      >
        {submitted ? (
          <div className="inquiry-success">
            <div className="check" aria-hidden="true">
              <Check className="h-7 w-7" strokeWidth={2.4} />
            </div>
            <h2 className="step-title" ref={headingRef} tabIndex={-1}>
              One more step: press Send in your email app.
            </h2>
            <p>
              Your email app should have opened with the inquiry filled in. It reaches the desk once
              you send it from your own address. Reference{" "}
              <span className="mono" style={{ color: "var(--accent-brass)" }}>
                {reference}
              </span>
              .
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                marginTop: 24,
                flexWrap: "wrap",
              }}
            >
              <Button asChild>
                <a href={mailtoUrl}>
                  <Mail className="h-4 w-4" aria-hidden="true" /> Open email again
                </a>
              </Button>
              <Button type="button" variant="outline" onClick={copySummary}>
                <Copy className="h-4 w-4" aria-hidden="true" />
                {copied === "ok" ? "Copied" : "Copy inquiry text"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setSubmitted(false)}>
                Edit inquiry
              </Button>
            </div>
            <p role="status" className="form-notice" style={{ textAlign: "center" }}>
              {copied === "ok"
                ? `Copied — paste it into an email to ${siteConfig.email}.`
                : copied === "error"
                  ? "Couldn't copy automatically — select the text below instead."
                  : `No email app? Copy the text and send it to ${siteConfig.email}, or call ${siteConfig.phone}.`}
            </p>
            <div className="copy-box">
              <pre aria-label="Inquiry text">{`${subject}\n\n${summary}`}</pre>
            </div>
          </div>
        ) : (
          <>
            {step === 1 && (
              <fieldset className="step-fieldset">
                <legend className="sr-only">Cargo type</legend>
                <h2 className="step-title" ref={headingRef} tabIndex={-1}>
                  What are you chartering?
                </h2>
                <p className="step-sub">Pick the closest match — we&apos;ll refine on the call.</p>
                <div className="opt-grid">
                  {CARGO_OPTIONS.map((o) => (
                    <label
                      key={o.value}
                      className={`opt ${form.cargo === o.value ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="cargo"
                        value={o.value}
                        checked={form.cargo === o.value}
                        onChange={() => setCargo(o.value)}
                        className="sr-only"
                        id={o.value === CARGO_OPTIONS[0].value ? "cargo" : undefined}
                      />
                      <span className="opt-name">{o.name}</span>
                      <span className="opt-desc">{o.desc}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 2 && (
              <div>
                <h2 className="step-title" ref={headingRef} tabIndex={-1}>
                  Where&apos;s the trade?
                </h2>
                <p className="step-sub">Load region first; we&apos;ll match the right desk.</p>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="loadArea">Load area</label>
                    <Select
                      value={form.loadArea}
                      onValueChange={(v) => set("loadArea", v as LoadArea)}
                    >
                      <SelectTrigger id="loadArea">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LOAD_AREAS.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="field">
                    <label htmlFor="dischArea">Discharge area</label>
                    <Select
                      value={form.dischArea}
                      onValueChange={(v) => set("dischArea", v as DischArea)}
                    >
                      <SelectTrigger id="dischArea">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DISCH_AREAS.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="field">
                    <label htmlFor="stem">
                      Stem <span className="field-hint">(optional, mt or bbl)</span>
                    </label>
                    <Input
                      id="stem"
                      value={form.stem}
                      onChange={(e) => set("stem", e.target.value)}
                      placeholder={
                        form.cargo === "bulk" ? "e.g. 170,000 mt iron ore" : "e.g. 130,000 mt"
                      }
                      {...errorProps("stem")}
                    />
                    {fieldError("stem")}
                  </div>
                  <div className="field">
                    <label htmlFor="vesselClass">Preferred class</label>
                    <Select
                      value={form.vesselClass}
                      onValueChange={(v) => set("vesselClass", v as PreferredClass)}
                    >
                      <SelectTrigger id="vesselClass">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_OPTIONS[form.cargo].map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="step-title" ref={headingRef} tabIndex={-1}>
                  Window and terms.
                </h2>
                <p className="step-sub">
                  Laycan, charter type and anything special — CP terms welcome.
                </p>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="laycanFrom">
                      Laycan from <span className="field-hint">(optional)</span>
                    </label>
                    <Input
                      id="laycanFrom"
                      type="date"
                      value={form.laycanFrom}
                      onChange={(e) => set("laycanFrom", e.target.value)}
                      {...errorProps("laycanFrom")}
                    />
                    {fieldError("laycanFrom")}
                  </div>
                  <div className="field">
                    <label htmlFor="laycanTo">
                      Laycan to <span className="field-hint">(optional)</span>
                    </label>
                    <Input
                      id="laycanTo"
                      type="date"
                      value={form.laycanTo}
                      min={form.laycanFrom || undefined}
                      onChange={(e) => set("laycanTo", e.target.value)}
                      {...errorProps("laycanTo")}
                    />
                    {fieldError("laycanTo")}
                  </div>
                </div>
                <fieldset className="step-fieldset mt-4">
                  <legend className="field-legend">Charter type</legend>
                  <div className="opt-grid">
                    {TERM_OPTIONS.map((o) => (
                      <label
                        key={o.value}
                        className={`opt ${form.term === o.value ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="term"
                          value={o.value}
                          checked={form.term === o.value}
                          onChange={() => set("term", o.value)}
                          className="sr-only"
                        />
                        <span className="opt-name">{o.name}</span>
                        <span className="opt-desc">{o.desc}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="field mt-4">
                  <label htmlFor="notes">
                    Notes or CP terms <span className="field-hint">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    value={form.notes}
                    maxLength={2000}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Ports, cargo grade, special requirements, the broker you'd like to reach…"
                    {...errorProps("notes")}
                  />
                  {fieldError("notes")}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="step-title" ref={headingRef} tabIndex={-1}>
                  How should we reach you?
                </h2>
                <p className="step-sub">A broker replies directly — no robo-replies.</p>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="name">Name</label>
                    <Input
                      id="name"
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      required
                      {...errorProps("name")}
                    />
                    {fieldError("name")}
                  </div>
                  <div className="field">
                    <label htmlFor="firm">Company</label>
                    <Input
                      id="firm"
                      autoComplete="organization"
                      value={form.firm}
                      onChange={(e) => set("firm", e.target.value)}
                      required
                      {...errorProps("firm")}
                    />
                    {fieldError("firm")}
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email</label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      required
                      {...errorProps("email")}
                    />
                    {fieldError("email")}
                  </div>
                  <div className="field">
                    <label htmlFor="phone">
                      WhatsApp / phone <span className="field-hint">(optional)</span>
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+90 ..."
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      {...errorProps("phone")}
                    />
                    {fieldError("phone")}
                  </div>
                </div>
                <p className="form-notice">
                  Sending opens your email app with this inquiry pre-filled; nothing is stored on
                  this website. We use your details only to answer the inquiry — see the{" "}
                  <Link href="/privacy">privacy policy</Link>.
                </p>
              </div>
            )}

            <div className="inquiry-controls">
              <Button
                type="button"
                variant="ghost"
                onClick={goBack}
                disabled={step === 1}
                className="!px-3"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
              </Button>
              <div
                className="inquiry-progress"
                role="progressbar"
                aria-label="Inquiry progress"
                aria-valuemin={1}
                aria-valuemax={4}
                aria-valuenow={step}
                aria-valuetext={`Step ${step} of 4`}
              >
                <div className="inquiry-progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
              </div>
              <Button type="submit">
                {step === 4 ? "Compose email to the desk" : "Next"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
