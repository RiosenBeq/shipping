import { z } from "zod";

export const SectorSchema = z.enum(["crude", "clean", "chem", "bulk", "sp"]);
export type Sector = z.infer<typeof SectorSchema>;

export const VesselClassSchema = z.enum(["VLCC", "Suezmax", "Aframax", "MR", "Cape", "Pmx", "Smx"]);
export type VesselClassFilter = z.infer<typeof VesselClassSchema>;

export const DeskSchema = z.enum(["Istanbul", "London", "Singapore", "Houston"]);
export type Desk = z.infer<typeof DeskSchema>;

export const BrokerFilterSchema = z.object({
  sectors: z.array(SectorSchema),
  classes: z.array(VesselClassSchema),
  desks: z.array(DeskSchema),
  q: z.string(),
  sort: z.enum(["name", "role", "desk"]),
});
export type BrokerFilter = z.infer<typeof BrokerFilterSchema>;

export const ResearchCategorySchema = z.enum(["all", "weekly", "route", "reg", "sp", "annual"]);
export type ResearchCategory = z.infer<typeof ResearchCategorySchema>;

export const ResearchFilterSchema = z.object({
  category: ResearchCategorySchema,
  q: z.string(),
});
export type ResearchFilter = z.infer<typeof ResearchFilterSchema>;

export const SubscribeSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});
export type SubscribeForm = z.infer<typeof SubscribeSchema>;

export const OfficeCitySchema = z.enum(["istanbul", "london", "singapore", "houston"]);
export type OfficeCity = z.infer<typeof OfficeCitySchema>;

/* === Contact / charter inquiry === */
export const InquiryCargoSchema = z.enum(["crude", "clean", "chem", "bulk"]);
export type InquiryCargo = z.infer<typeof InquiryCargoSchema>;

export const InquiryTermSchema = z.enum(["voy", "tc", "coa", "contract"]);
export type InquiryTerm = z.infer<typeof InquiryTermSchema>;

export const LoadAreaSchema = z.enum([
  "blk",
  "med",
  "nsea-baltic",
  "waf",
  "ag-rs",
  "usg-caribs",
  "ecsa",
  "australia",
  "fareast",
  "other",
]);
export type LoadArea = z.infer<typeof LoadAreaSchema>;

export const DischAreaSchema = z.enum([
  "ukc-med",
  "usg-usac",
  "fareast",
  "india",
  "sam",
  "waf",
  "spore-eafr",
  "other",
]);
export type DischArea = z.infer<typeof DischAreaSchema>;

/** Preferred vessel class. Which values are offered depends on the cargo (see InquiryWizard). */
export const PreferredClassSchema = z.enum([
  "VLCC",
  "Suezmax",
  "Aframax",
  "LR2",
  "LR1",
  "MR",
  "Handy",
  "Chem-stainless",
  "Chem-coated",
  "Capesize",
  "Kamsarmax",
  "Ultramax",
  "Handysize",
  "Open",
]);
export type PreferredClass = z.infer<typeof PreferredClassSchema>;

export const InquiryStep1Schema = z.object({
  cargo: InquiryCargoSchema,
});

export const InquiryStep2Schema = z.object({
  loadArea: LoadAreaSchema,
  dischArea: DischAreaSchema,
  /** Optional — the desk can quote a range and firm it up on the call. */
  stem: z.string().trim().max(120, "Keep the stem under 120 characters").optional(),
  vesselClass: PreferredClassSchema,
});

const isoDate = z
  .string()
  .trim()
  .refine((v) => v === "" || !Number.isNaN(new Date(v).getTime()), "Enter a valid date");

export const InquiryStep3Schema = z
  .object({
    laycanFrom: isoDate.optional(),
    laycanTo: isoDate.optional(),
    term: InquiryTermSchema,
    notes: z.string().trim().max(2000, "Keep notes under 2,000 characters").optional(),
  })
  .refine((v) => !v.laycanFrom || !v.laycanTo || new Date(v.laycanFrom) <= new Date(v.laycanTo), {
    message: "Laycan end must be on or after the start date",
    path: ["laycanTo"],
  });

export const InquiryStep4Schema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  firm: z.string().trim().min(2, "Enter your company"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().max(40, "Keep the phone number under 40 characters").optional(),
});

export type InquiryStep1 = z.infer<typeof InquiryStep1Schema>;
export type InquiryStep2 = z.infer<typeof InquiryStep2Schema>;
export type InquiryStep3 = z.infer<typeof InquiryStep3Schema>;
export type InquiryStep4 = z.infer<typeof InquiryStep4Schema>;
