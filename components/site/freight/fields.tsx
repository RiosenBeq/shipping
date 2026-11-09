"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { parseLocaleNumber } from "@/lib/number";
import { fmtInput } from "@/lib/freight/format";
import { cn } from "@/lib/utils";
import { ICON_STROKE } from "@/components/site/iconStroke";

/* ====================== Number field ====================== */

export type NumFieldProps = {
  label: string;
  /** Shown inside the field after the value, e.g. "kn", "t/day". */
  unit?: string;
  /** Spoken unit, e.g. "knots" (the visible unit is decorative). */
  unitName?: string;
  /** "$" before the value for money fields. */
  prefix?: string;
  value: number | undefined;
  /** The default (preset or reference) value: offered back when the field was changed. */
  def: number | undefined;
  /** Decimals shown when the value is tidied. */
  digits?: number;
  min: number;
  max: number;
  onChange: (v: number | undefined) => void;
  /** Empty is allowed (e.g. the flat rate) and means "not given". */
  optional?: boolean;
  hint?: React.ReactNode;
  className?: string;
  /** Stable DOM id (for jump links); generated when absent. */
  id?: string;
  disabled?: boolean;
};

const same = (a: number | undefined, b: number | undefined) =>
  a === b || (a !== undefined && b !== undefined && Math.abs(a - b) < 1e-9);

/**
 * A number in a text field (inputMode="decimal"): reads 84,000 / 84.000 / 84 000 / 84000,5
 * (lib/number.ts), checks the bounds as you type, and reports only valid numbers. Invalid or
 * half-typed input keeps the last good value in the estimate and says what is wrong; leaving
 * a required field empty puts the value back. A changed field gets a brass mark and a button
 * back to its default.
 */
export function NumField({
  label,
  unit,
  unitName,
  prefix,
  value,
  def,
  digits = 2,
  min,
  max,
  onChange,
  optional = false,
  hint,
  className,
  id: idProp,
  disabled,
}: NumFieldProps) {
  const auto = useId();
  const id = idProp ?? `fc-${auto}`;
  const ref = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(() => fmtInput(value, digits));
  const [error, setError] = useState<string | null>(null);
  const [readAs, setReadAs] = useState<string | null>(null);

  // A change from outside (class switch, reset, a link) rewrites the field — unless the
  // visitor is typing in it and their text already means that number (or is half-typed).
  useEffect(() => {
    const typing = typeof document !== "undefined" && document.activeElement === ref.current;
    if (typing) {
      const parsed = parseLocaleNumber(text).value;
      if (same(parsed, value) || text.trim() === "" || error) return;
    }
    setText(fmtInput(value, digits));
    setError(null);
    setReadAs(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only an outside change of `value` rewrites the text
  }, [value, digits]);

  const commit = (raw: string) => {
    setText(raw);
    if (raw.trim() === "") {
      setReadAs(null);
      setError(null);
      if (optional) onChange(undefined);
      return;
    }
    const p = parseLocaleNumber(raw);
    if (!Number.isFinite(p.value)) {
      setError("Enter a number, e.g. 84,000 or 13.5");
      setReadAs(null);
      return;
    }
    if (p.value < min || p.value > max) {
      setError(`Between ${fmtInput(min, 4)} and ${fmtInput(max, 4)}`);
      setReadAs(null);
      return;
    }
    setError(null);
    setReadAs(p.reinterpreted ? `Read as ${fmtInput(p.value, 4)}` : null);
    onChange(p.value);
  };

  const edited = value !== undefined && def !== undefined && !same(value, def);
  const msgId = `${id}-msg`;
  const msg = error ?? readAs ?? hint;

  return (
    <div className={cn("fc-field", edited && "is-edited", error && "is-invalid", className)}>
      <div className="fc-field__top">
        <label htmlFor={id} className="fc-field__label">
          {label}
          {unitName && <span className="sr-only"> in {unitName}</span>}
        </label>
        {edited && (
          <button
            type="button"
            className="fc-reset"
            onClick={() => {
              onChange(undefined);
              setError(null);
              setReadAs(null);
            }}
            aria-label={`${label}: back to ${fmtInput(def, digits)}${unit ? ` ${unit}` : ""}`}
            title={`Back to ${fmtInput(def, digits)}${unit ? ` ${unit}` : ""}`}
          >
            <RotateCcw aria-hidden="true" strokeWidth={ICON_STROKE.inline} />
          </button>
        )}
      </div>
      <div className="fc-field__box">
        {prefix && (
          <span className="fc-field__pre" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          value={text}
          onChange={(e) => commit(e.target.value)}
          onBlur={() => {
            // Leaving the field: tidy a good number; put back the last good one otherwise,
            // so the field always shows what the estimate uses.
            const p = parseLocaleNumber(text);
            if (!error && text.trim() !== "" && Number.isFinite(p.value)) {
              setText(fmtInput(p.value, digits));
            } else {
              setText(fmtInput(value, digits));
              setError(null);
            }
            setReadAs(null);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={msg ? msgId : undefined}
          className={cn("tnum", prefix && "has-pre", unit && "has-unit")}
        />
        {unit && (
          <span className="fc-field__unit" aria-hidden="true">
            {unit}
          </span>
        )}
      </div>
      {msg && (
        <p id={msgId} className="fc-field__msg">
          {error && <AlertCircle aria-hidden="true" strokeWidth={ICON_STROKE.inline} />}
          <span>{msg}</span>
        </p>
      )}
    </div>
  );
}

/* ====================== Select ====================== */

export type SelectOption = { value: string; label: string };
export type SelectGroup = { label: string; options: SelectOption[] };

export function SelectField({
  label,
  value,
  options,
  groups,
  onChange,
  hint,
  className,
  id: idProp,
}: {
  label: string;
  value: string;
  options?: SelectOption[];
  groups?: SelectGroup[];
  onChange: (v: string) => void;
  hint?: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const auto = useId();
  const id = idProp ?? `fc-${auto}`;
  return (
    <div className={cn("fc-field", className)}>
      <div className="fc-field__top">
        <label htmlFor={id} className="fc-field__label">
          {label}
        </label>
      </div>
      <div className="fc-field__box fc-field__box--select">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={hint ? `${id}-msg` : undefined}
        >
          {options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
          {groups?.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      {hint && (
        <p id={`${id}-msg`} className="fc-field__msg">
          {hint}
        </p>
      )}
    </div>
  );
}

/* ====================== Text (other port names) ====================== */

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const id = `fc-${useId()}`;
  return (
    <div className={cn("fc-field", className)}>
      <div className="fc-field__top">
        <label htmlFor={id} className="fc-field__label">
          {label}
        </label>
      </div>
      <div className="fc-field__box">
        <input
          id={id}
          type="text"
          autoComplete="off"
          maxLength={40}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

/* ====================== Segmented radios ====================== */

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
  hideLabel = false,
  hint,
}: {
  label: string;
  value: T;
  options: { value: T; label: React.ReactNode; title?: string }[];
  onChange: (v: T) => void;
  className?: string;
  hideLabel?: boolean;
  hint?: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className={cn("fc-field", className)}>
      <p id={`${id}-l`} className={cn("fc-field__label", hideLabel && "sr-only")}>
        {label}
      </p>
      <div
        className="fc-seg"
        role="radiogroup"
        aria-labelledby={`${id}-l`}
        aria-describedby={hint ? `${id}-msg` : undefined}
      >
        {options.map((o) => (
          <label key={o.value} title={o.title}>
            <input
              type="radio"
              name={`${id}-r`}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            <b>{o.label}</b>
          </label>
        ))}
      </div>
      {hint && (
        <p id={`${id}-msg`} className="fc-field__msg">
          {hint}
        </p>
      )}
    </div>
  );
}

/* ====================== Switch ====================== */

export function Switch({
  label,
  checked,
  onChange,
  hint,
  className,
}: {
  label: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: React.ReactNode;
  className?: string;
}) {
  const id = `fc-${useId()}`;
  return (
    <div className={cn("fc-switch", className)}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={hint ? `${id}-msg` : undefined}
      />
      <label htmlFor={id}>{label}</label>
      {hint && (
        <p id={`${id}-msg`} className="fc-field__msg">
          {hint}
        </p>
      )}
    </div>
  );
}
