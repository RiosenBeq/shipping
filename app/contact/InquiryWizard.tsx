"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
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
  InquiryStep1Schema,
  InquiryStep2Schema,
  InquiryStep3Schema,
  InquiryStep4Schema,
  type InquiryCargo,
  type InquiryTerm,
} from "@/lib/schemas";

type Form = {
  cargo: InquiryCargo;
  loadArea: string;
  dischArea: string;
  stem: string;
  vesselClass: string;
  laycanFrom: string;
  laycanTo: string;
  term: InquiryTerm;
  name: string;
  firm: string;
  email: string;
  phone: string;
};

const INITIAL: Form = {
  cargo: "crude",
  loadArea: "blk-cpc",
  dischArea: "ukc-med",
  stem: "",
  vesselClass: "Suezmax",
  laycanFrom: "",
  laycanTo: "",
  term: "voy",
  name: "",
  firm: "",
  email: "",
  phone: "",
};

const CARGO_OPTIONS: { value: InquiryCargo; name: string; desc: string }[] = [
  { value: "crude", name: "Crude", desc: "VLCC · Suezmax · Aframax" },
  { value: "clean", name: "Clean products", desc: "LR2 · LR1 · MR · Handy" },
  { value: "chem", name: "Chemicals", desc: "IMO 2/3 · stainless · coated" },
  { value: "bulk", name: "Dry bulk", desc: "Cape · Pmx · Smx · Handy" },
];

const TERM_OPTIONS: { value: InquiryTerm; name: string; desc: string }[] = [
  { value: "voy", name: "Single voyage", desc: "Spot or relet" },
  { value: "tc", name: "Time charter", desc: "3-12 mo, periods" },
  { value: "coa", name: "COA", desc: "Multiple lifts, programme" },
  { value: "contract", name: "Long contract", desc: "12+ months, dedicated" },
];

const LOAD_AREAS = [
  { value: "blk-cpc", label: "Black Sea / CPC" },
  { value: "nsea-baltic", label: "NSEA / Baltic" },
  { value: "waf-med", label: "WAF / Mediterranean" },
  { value: "ag-rs", label: "AG / Red Sea" },
  { value: "usg-caribs", label: "USG / Caribs" },
  { value: "fareast", label: "Far East" },
] as const;

const DISCH_AREAS = [
  { value: "ukc-med", label: "UKC / Med" },
  { value: "usg-usac", label: "USG / USAC" },
  { value: "fareast-india", label: "Far East / India" },
  { value: "wcsa-ecsa", label: "WCSA / ECSA" },
  { value: "waf", label: "WAF" },
  { value: "spore-eafr", label: "Singapore / EAFR" },
] as const;

const CLASSES = ["VLCC", "Suezmax", "Aframax", "MR", "Handy", "Open"] as const;

const STEPS = [
  { num: 1, label: "Cargo & vessel class" },
  { num: 2, label: "Load / discharge" },
  { num: 3, label: "Laycan & terms" },
  { num: 4, label: "Your details" },
] as const;

export function InquiryWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) {
      setErrors((e) => {
        const { [key]: _, ...rest } = e;
        return rest;
      });
    }
  };

  const validateStep = (s: number): boolean => {
    const next: Record<string, string> = {};
    let result;
    if (s === 1) {
      result = InquiryStep1Schema.safeParse({ cargo: form.cargo });
    } else if (s === 2) {
      result = InquiryStep2Schema.safeParse({
        loadArea: form.loadArea,
        dischArea: form.dischArea,
        stem: form.stem,
        vesselClass: form.vesselClass,
      });
    } else if (s === 3) {
      result = InquiryStep3Schema.safeParse({
        laycanFrom: form.laycanFrom,
        laycanTo: form.laycanTo,
        term: form.term,
      });
    } else {
      result = InquiryStep4Schema.safeParse({
        name: form.name,
        firm: form.firm,
        email: form.email,
        phone: form.phone || undefined,
      });
    }
    if (!result.success) {
      result.error.issues.forEach((iss) => {
        const k = iss.path[0]?.toString();
        if (k) next[k] = iss.message;
      });
      setErrors(next);
      return false;
    }
    setErrors({});
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    if (step < 4) {
      setStep(step + 1);
    } else {
      setSubmitted(true);
    }
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const reference = `LVT-${new Date().toISOString().slice(0, 10)}-${Math.random()
    .toString(36)
    .substring(2, 4)
    .toUpperCase()}`;

  return (
    <div className="inquiry-grid">
      <aside className="inquiry-side">
        <span className="eyebrow">In four steps</span>
        <h3>The desk needs four things to quote sharp.</h3>
        <p>
          Cargo and class, the lift window, terms, and how to reach you. Skip anything you
          don&apos;t have yet — we&apos;ll fill the gaps on the call.
        </p>
        <div className="steps">
          {STEPS.map((s) => (
            <div
              key={s.num}
              className={`step-pill ${step === s.num ? "active" : step > s.num ? "done" : ""}`}
            >
              <span className="num">
                {step > s.num ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s.num}
              </span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </aside>

      <form
        className="inquiry-form"
        onSubmit={(e) => {
          e.preventDefault();
          goNext();
        }}
        noValidate
      >
        {submitted ? (
          <div className="inquiry-success">
            <div className="check">
              <Check className="h-7 w-7" strokeWidth={2.4} />
            </div>
            <h4>Inquiry on the desk.</h4>
            <p>
              A broker will reply within 60 minutes during business hours. Reference{" "}
              <span className="mono" style={{ color: "var(--accent-brass)" }}>
                {reference}
              </span>
            </p>
          </div>
        ) : (
          <>
            {step === 1 && (
              <div>
                <h4>What are you chartering?</h4>
                <p className="step-sub">Pick the closest match — we&apos;ll refine on the call.</p>
                <div className="opt-grid">
                  {CARGO_OPTIONS.map((o) => (
                    <button
                      type="button"
                      key={o.value}
                      className={`opt ${form.cargo === o.value ? "selected" : ""} text-left`}
                      onClick={() => set("cargo", o.value)}
                    >
                      <span className="opt-name">{o.name}</span>
                      <span className="opt-desc">{o.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h4>Where&apos;s the trade?</h4>
                <p className="step-sub">Load region first; we&apos;ll match the right desk.</p>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="loadArea">Load area</label>
                    <Select value={form.loadArea} onValueChange={(v) => set("loadArea", v)}>
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
                    <Select value={form.dischArea} onValueChange={(v) => set("dischArea", v)}>
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
                    <label htmlFor="stem">Stem (mt or bbl)</label>
                    <Input
                      id="stem"
                      value={form.stem}
                      onChange={(e) => set("stem", e.target.value)}
                      placeholder="e.g. 130,000 mt"
                      aria-invalid={!!errors.stem}
                    />
                    {errors.stem && <span className="field-error">{errors.stem}</span>}
                  </div>
                  <div className="field">
                    <label htmlFor="vesselClass">Preferred class</label>
                    <Select value={form.vesselClass} onValueChange={(v) => set("vesselClass", v)}>
                      <SelectTrigger id="vesselClass">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASSES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
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
                <h4>Window and terms.</h4>
                <p className="step-sub">Laycan-to-laycan, charter type, anything special.</p>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="laycanFrom">Laycan from</label>
                    <Input
                      id="laycanFrom"
                      type="date"
                      value={form.laycanFrom}
                      onChange={(e) => set("laycanFrom", e.target.value)}
                      aria-invalid={!!errors.laycanFrom}
                    />
                    {errors.laycanFrom && <span className="field-error">{errors.laycanFrom}</span>}
                  </div>
                  <div className="field">
                    <label htmlFor="laycanTo">Laycan to</label>
                    <Input
                      id="laycanTo"
                      type="date"
                      value={form.laycanTo}
                      onChange={(e) => set("laycanTo", e.target.value)}
                      aria-invalid={!!errors.laycanTo}
                    />
                    {errors.laycanTo && <span className="field-error">{errors.laycanTo}</span>}
                  </div>
                </div>
                <div className="opt-grid mt-4">
                  {TERM_OPTIONS.map((o) => (
                    <button
                      type="button"
                      key={o.value}
                      className={`opt ${form.term === o.value ? "selected" : ""} text-left`}
                      onClick={() => set("term", o.value)}
                    >
                      <span className="opt-name">{o.name}</span>
                      <span className="opt-desc">{o.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h4>How should we reach you?</h4>
                <p className="step-sub">Direct broker — no forms forwarded, no robo-replies.</p>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="name">Name</label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      aria-invalid={!!errors.name}
                      required
                    />
                    {errors.name && <span className="field-error">{errors.name}</span>}
                  </div>
                  <div className="field">
                    <label htmlFor="firm">Firm</label>
                    <Input
                      id="firm"
                      value={form.firm}
                      onChange={(e) => set("firm", e.target.value)}
                      aria-invalid={!!errors.firm}
                      required
                    />
                    {errors.firm && <span className="field-error">{errors.firm}</span>}
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email</label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      aria-invalid={!!errors.email}
                      required
                    />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>
                  <div className="field">
                    <label htmlFor="phone">WhatsApp / phone</label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+90 ..."
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </div>
                </div>
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
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <div className="inquiry-progress">
                <div className="inquiry-progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
              </div>
              <Button type="submit">
                {step === 4 ? "Send to desk" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
