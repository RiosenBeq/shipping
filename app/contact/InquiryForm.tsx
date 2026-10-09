"use client";

import { useEffect, useId, useState } from "react";
import { Mail, MessageCircle } from "lucide-react";
import {
  INQUIRY_SEGMENTS,
  INQUIRY_TERMS,
  INQUIRY_VESSELS,
  InquirySchema,
  InquirySegmentSchema,
  type Inquiry,
} from "@/lib/schemas";
import { siteConfig, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

type Form = Record<keyof Inquiry, string>;
type Errors = Partial<Record<keyof Inquiry, string>>;

const EMPTY: Form = {
  segment: "lpg",
  vessel: INQUIRY_VESSELS[0],
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

const GAS_SEGMENTS = new Set(["lpg", "ammonia", "petchem"]);

function summary(v: Inquiry) {
  return [
    `Cargo: ${INQUIRY_SEGMENTS[v.segment]}`,
    `Vessel: ${v.vessel}`,
    `Terms: ${INQUIRY_TERMS[v.term]}`,
    `Load: ${v.loadArea}`,
    `Discharge: ${v.dischargeArea}`,
    `Quantity: ${v.quantity}`,
    `Laycan: ${v.laycanFrom} – ${v.laycanTo}`,
    v.notes ? `Notes: ${v.notes}` : null,
    "",
    `${v.name} · ${v.company}`,
    v.email,
    v.phone || null,
  ]
    .filter((l) => l !== null)
    .join("\n");
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
  const [sentVia, setSentVia] = useState<"email" | "whatsapp" | null>(null);

  // Pre-select the cargo segment from ?segment=… (links from desk pages).
  useEffect(() => {
    const seg = new URLSearchParams(window.location.search).get("segment");
    const parsed = InquirySegmentSchema.safeParse(seg);
    if (parsed.success) setForm((f) => ({ ...f, segment: parsed.data }));
  }, []);

  const set =
    (k: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
    };

  const submit = (via: "email" | "whatsapp") => {
    const r = InquirySchema.safeParse(form);
    if (!r.success) {
      const next: Errors = {};
      for (const issue of r.error.issues) {
        const k = issue.path[0] as keyof Inquiry;
        if (!next[k]) next[k] = issue.message;
      }
      setErrors(next);
      const first = Object.keys(next)[0];
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    const v = r.data;
    const subject = `Charter inquiry — ${INQUIRY_SEGMENTS[v.segment]} — ${v.loadArea} to ${v.dischargeArea}`;
    const body = summary(v);
    const deskEmail = GAS_SEGMENTS.has(v.segment)
      ? siteConfig.desks.lpg.email
      : siteConfig.desks.tankers.email;
    setSentVia(via);
    if (via === "email") {
      window.location.href = `mailto:${deskEmail}?cc=${siteConfig.email}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      window.open(whatsappUrl(`${subject}\n\n${body}`), "_blank", "noopener");
    }
  };

  const field = (k: keyof Form) => ({
    id: `${id}-${k}`,
    name: k,
    value: form[k],
    onChange: set(k),
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${id}-${k}-err` : undefined,
    className: cn(
      "h-11 w-full rounded-md border bg-white px-3 text-navy outline-none transition-colors focus:border-navy",
      errors[k] ? "border-state-negative" : "border-line"
    ),
  });

  const Label = ({
    k,
    children,
    optional,
  }: {
    k: keyof Form;
    children: React.ReactNode;
    optional?: boolean;
  }) => (
    <label htmlFor={`${id}-${k}`} className="mb-1.5 block text-sm font-medium text-navy">
      {children}
      {optional && <span className="font-normal text-slate"> (optional)</span>}
    </label>
  );

  const Err = ({ k }: { k: keyof Form }) =>
    errors[k] ? (
      <p id={`${id}-${k}-err`} className="mt-1 text-xs text-state-negative">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit("email");
      }}
      className="rounded-lg border border-line bg-white p-6 md:p-8"
    >
      <fieldset>
        <legend className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink">
          Cargo & ship
        </legend>
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <Label k="segment">Cargo</Label>
            <select {...field("segment")}>
              {Object.entries(INQUIRY_SEGMENTS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label k="vessel">Vessel size</Label>
            <select {...field("vessel")}>
              {INQUIRY_VESSELS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label k="term">Terms</Label>
            <select {...field("term")}>
              {Object.entries(INQUIRY_TERMS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink">
          Route & timing
        </legend>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label k="loadArea">Load port / area</Label>
            <input
              {...field("loadArea")}
              placeholder="e.g. Novorossiysk, Houston"
              autoComplete="off"
            />
            <Err k="loadArea" />
          </div>
          <div>
            <Label k="dischargeArea">Discharge port / area</Label>
            <input
              {...field("dischargeArea")}
              placeholder="e.g. Aliağa, Augusta"
              autoComplete="off"
            />
            <Err k="dischargeArea" />
          </div>
          <div>
            <Label k="quantity">Quantity</Label>
            <input
              {...field("quantity")}
              placeholder="e.g. 44,000 mt or 5,000 mt ±10%"
              autoComplete="off"
            />
            <Err k="quantity" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label k="laycanFrom">Laycan from</Label>
              <input {...field("laycanFrom")} type="date" />
              <Err k="laycanFrom" />
            </div>
            <div>
              <Label k="laycanTo">Laycan to</Label>
              <input {...field("laycanTo")} type="date" />
              <Err k="laycanTo" />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink">
          Your details
        </legend>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label k="name">Name</Label>
            <input {...field("name")} autoComplete="name" />
            <Err k="name" />
          </div>
          <div>
            <Label k="company">Company</Label>
            <input {...field("company")} autoComplete="organization" />
            <Err k="company" />
          </div>
          <div>
            <Label k="email">Email</Label>
            <input {...field("email")} type="email" autoComplete="email" />
            <Err k="email" />
          </div>
          <div>
            <Label k="phone" optional>
              Phone / WhatsApp
            </Label>
            <input {...field("phone")} type="tel" autoComplete="tel" />
          </div>
          <div className="md:col-span-2">
            <Label k="notes" optional>
              Notes
            </Label>
            <textarea
              {...field("notes")}
              rows={4}
              className={cn(field("notes").className, "h-auto py-2.5")}
              placeholder="Grade, terminals, restrictions, CP form…"
            />
          </div>
        </div>
      </fieldset>

      <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-navy px-6 font-semibold text-white transition-colors hover:bg-navy-soft"
        >
          <Mail className="h-4 w-4" aria-hidden="true" /> Send by email
        </button>
        <button
          type="button"
          onClick={() => submit("whatsapp")}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-navy/25 px-6 font-semibold text-navy transition-colors hover:border-navy"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> Send via WhatsApp
        </button>
        <p className="text-xs leading-relaxed text-slate sm:ml-2">
          Opens your own email app or WhatsApp with the inquiry filled in. Nothing is stored on this
          site.
        </p>
      </div>

      {sentVia && (
        <p role="status" className="mt-5 rounded-md bg-sand px-4 py-3 text-sm text-navy">
          {sentVia === "email"
            ? "Your email app should now be open with the inquiry ready to send. If nothing happened, email us directly at "
            : "WhatsApp should now be open with the inquiry ready to send. You can also email "}
          <a className="font-semibold underline" href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>
          .
        </p>
      )}
    </form>
  );
}
