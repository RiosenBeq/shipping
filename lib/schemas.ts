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

export const InquirySchema = z
  .object({
    // No default cargo in the form, so a tanker inquiry can't slip through to the LPG desk.
    segment: z.enum(keys(INQUIRY_SEGMENTS), {
      errorMap: () => ({ message: "Choose a cargo type" }),
    }),
    vessel: z.enum(INQUIRY_VESSELS),
    term: InquiryTermSchema,
    loadArea: z.string().trim().min(2, "Enter a load port or area"),
    dischargeArea: z.string().trim().min(2, "Enter a discharge port or area"),
    quantity: z.string().trim().min(1, "Enter a quantity, e.g. 44,000 mt"),
    laycanFrom: z.string().min(1, "Choose a laycan start date"),
    // Optional: early-stage inquiries often have a start date but no firm window yet.
    laycanTo: z.string().optional(),
    name: z.string().trim().min(2, "Enter your name"),
    company: z.string().trim().min(2, "Enter your company"),
    email: z.string().trim().email("Enter a valid email address"),
    phone: z.string().trim().optional(),
    notes: z.string().trim().max(2000).optional(),
  })
  .refine((v) => !v.laycanFrom || !v.laycanTo || v.laycanFrom <= v.laycanTo, {
    message: "Laycan end must be on or after the start date",
    path: ["laycanTo"],
  });

export type Inquiry = z.infer<typeof InquirySchema>;
