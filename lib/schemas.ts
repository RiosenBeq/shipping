import { z } from "zod";

/* === Research === */
export const ResearchCategorySchema = z.enum(["all", "weekly", "route", "reg", "guide"]);
export type ResearchCategory = z.infer<typeof ResearchCategorySchema>;

/* === Charter inquiry === */
export const INQUIRY_SEGMENTS = {
  crude: "Crude oil",
  clean: "Clean / refined products",
  lpg: "LPG (propane, butane)",
  ammonia: "Ammonia",
  petchem: "Petrochemical gases",
} as const;

export const INQUIRY_TERMS = {
  voyage: "Spot voyage",
  tc: "Time charter",
  coa: "COA / contract",
} as const;

export const INQUIRY_VESSELS = [
  "Not sure — advise me",
  "VLCC",
  "Suezmax",
  "Aframax / LR2",
  "LR1",
  "MR / Handy tanker",
  "VLGC",
  "MGC",
  "Handysize gas carrier",
  "Pressurised / small LPG",
] as const;

const keys = <T extends Record<string, string>>(o: T) =>
  Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];

export const InquirySegmentSchema = z.enum(keys(INQUIRY_SEGMENTS));
export type InquirySegment = z.infer<typeof InquirySegmentSchema>;

export const InquiryTermSchema = z.enum(keys(INQUIRY_TERMS));
export type InquiryTerm = z.infer<typeof InquiryTermSchema>;

/** What the visitor brings: a cargo to move, or an open ship looking for employment. */
export const INQUIRY_MODES = {
  cargo: "A cargo",
  ship: "An open ship",
} as const;

export const InquiryModeSchema = z.enum(keys(INQUIRY_MODES));
export type InquiryMode = z.infer<typeof InquiryModeSchema>;

const optionalText = z.string().trim().optional();

/**
 * Which fields are required depends on what the visitor brings and the terms:
 *  - cargo, spot voyage or COA: load, discharge, quantity and laycan start;
 *  - cargo, time charter: delivery area, period and delivery date (redelivery
 *    optional — `dischargeArea`/`quantity`/`laycanFrom` carry them);
 *  - open ship: open port/area and open date (ship name optional, no discharge).
 */
export const InquirySchema = z
  .object({
    // Optional for older links/drafts: no mode means a cargo inquiry.
    mode: InquiryModeSchema.default("cargo"),
    // No default cargo in the form, so a tanker inquiry can't slip through to the
    // LPG desk. Non-fatal custom check (not z.enum): an empty choice must not
    // abort the object, or the mode-dependent checks below wouldn't run and the
    // other missing fields would only be reported on the next attempt.
    segment: z.custom<InquirySegment>((v) => InquirySegmentSchema.safeParse(v).success, {
      message: "Choose a cargo type",
      fatal: false,
    }),
    vessel: z.enum(INQUIRY_VESSELS),
    term: InquiryTermSchema,
    loadArea: z.string().trim(),
    dischargeArea: optionalText,
    quantity: optionalText,
    laycanFrom: z.string().optional(),
    // Optional: early-stage inquiries often have a start date but no firm window yet.
    laycanTo: z.string().optional(),
    name: z.string().trim().min(2, "Enter your name"),
    company: z.string().trim().min(2, "Enter your company"),
    email: z.string().trim().email("Enter a valid email address"),
    phone: z.string().trim().optional(),
    notes: z.string().trim().max(2000).optional(),
  })
  .superRefine((v, ctx) => {
    const require = (path: string, ok: boolean, message: string) => {
      if (!ok) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
    };
    const ship = v.mode === "ship";
    const tc = !ship && v.term === "tc";

    require("loadArea", v.loadArea.length >= 2, ship
      ? "Enter the port or area where the ship opens"
      : tc
        ? "Enter a delivery port or area"
        : "Enter a load port or area");
    if (!ship && !tc) {
      require("dischargeArea", (v.dischargeArea ?? "").length >=
        2, "Enter a discharge port or area");
    }
    if (!ship) {
      require("quantity", (v.quantity ?? "").length >= 1, tc
        ? "Enter the charter period, e.g. 12 months"
        : "Enter a quantity, e.g. 44,000 mt");
    }
    require("laycanFrom", Boolean(v.laycanFrom), ship
      ? "Choose the date the ship opens"
      : tc
        ? "Choose a delivery date"
        : "Choose a laycan start date");
    // An open ship gives one open date; the window end only applies to cargoes.
    if (!ship && v.laycanFrom && v.laycanTo && v.laycanFrom > v.laycanTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["laycanTo"],
        message: tc
          ? "Delivery window must end on or after its start"
          : "Laycan end must be on or after the start date",
      });
    }
  });

export type Inquiry = z.infer<typeof InquirySchema>;
