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
  email: z.string().email("Geçerli bir e-posta giriniz"),
});
export type SubscribeForm = z.infer<typeof SubscribeSchema>;

export const OfficeCitySchema = z.enum(["ist", "lon", "sg", "hou"]);
export type OfficeCity = z.infer<typeof OfficeCitySchema>;

/* === Contact / charter inquiry === */
export const InquiryCargoSchema = z.enum(["crude", "clean", "chem", "bulk"]);
export type InquiryCargo = z.infer<typeof InquiryCargoSchema>;

export const InquiryTermSchema = z.enum(["voy", "tc", "coa", "contract"]);
export type InquiryTerm = z.infer<typeof InquiryTermSchema>;

export const LoadAreaSchema = z.enum([
  "blk-cpc",
  "nsea-baltic",
  "waf-med",
  "ag-rs",
  "usg-caribs",
  "fareast",
]);
export const DischAreaSchema = z.enum([
  "ukc-med",
  "usg-usac",
  "fareast-india",
  "wcsa-ecsa",
  "waf",
  "spore-eafr",
]);

export const PreferredClassSchema = z.enum([
  "VLCC",
  "Suezmax",
  "Aframax",
  "MR",
  "Handy",
  "Open",
]);

export const InquiryStep1Schema = z.object({
  cargo: InquiryCargoSchema,
});

export const InquiryStep2Schema = z.object({
  loadArea: LoadAreaSchema,
  dischArea: DischAreaSchema,
  stem: z.string().trim().min(1, "Yük miktarı gerekli"),
  vesselClass: PreferredClassSchema,
});

export const InquiryStep3Schema = z
  .object({
    laycanFrom: z.string().min(1, "Laycan başlangıç tarihi gerekli"),
    laycanTo: z.string().min(1, "Laycan bitiş tarihi gerekli"),
    term: InquiryTermSchema,
  })
  .refine(
    (v) => !v.laycanFrom || !v.laycanTo || new Date(v.laycanFrom) <= new Date(v.laycanTo),
    {
      message: "Laycan bitişi başlangıçtan sonra olmalı",
      path: ["laycanTo"],
    }
  );

export const InquiryStep4Schema = z.object({
  name: z.string().trim().min(2, "Ad gerekli"),
  firm: z.string().trim().min(2, "Şirket gerekli"),
  email: z.string().email("Geçerli bir e-posta giriniz"),
  phone: z.string().trim().optional(),
});

export const InquiryFullSchema = z
  .object({})
  .merge(InquiryStep1Schema)
  .merge(InquiryStep2Schema)
  .merge(z.object({ laycanFrom: z.string(), laycanTo: z.string(), term: InquiryTermSchema }))
  .merge(InquiryStep4Schema);

export type InquiryStep1 = z.infer<typeof InquiryStep1Schema>;
export type InquiryStep2 = z.infer<typeof InquiryStep2Schema>;
export type InquiryStep4 = z.infer<typeof InquiryStep4Schema>;
export type InquiryFull = z.infer<typeof InquiryFullSchema>;
