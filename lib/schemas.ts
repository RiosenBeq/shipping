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
