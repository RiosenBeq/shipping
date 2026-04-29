import type { OfficeCity } from "@/lib/schemas";

export type Office = {
  city: string;
  meta: string;
  addr: string;
  phone: string;
  after: string;
  sectors: string;
  hours: string;
  lang: string;
  member: string;
  head: string;
  headRole: string;
  tz: string;
  pin: { x: number; y: number; size: number; isHQ: boolean };
};

export const OFFICES: Record<OfficeCity, Office> = {
  ist: {
    city: "Istanbul",
    meta: "41.04°N · 28.99°E · GMT+3",
    addr: "Yıldız Caddesi 12, Beşiktaş, 34349 Istanbul",
    phone: "+90 212 000 0000",
    after: "+90 533 000 0000",
    sectors: "Crude · Aframax · Black Sea · Chemicals",
    hours: "07:00 – 21:00 daily",
    lang: "English · Turkish · Russian · Arabic",
    member: "FONASBA · BIMCO · ITIC",
    head: "Mehmet Aydın",
    headRole: "Managing Director · Istanbul",
    tz: "Europe/Istanbul",
    pin: { x: 540, y: 175, size: 6, isHQ: true },
  },
  lon: {
    city: "London",
    meta: "51.51°N · 0.13°W · GMT",
    addr: "30 St Mary Axe, City of London, EC3A 8BF",
    phone: "+44 20 0000 0000",
    after: "+44 7700 000 000",
    sectors: "Suezmax · Clean Products · Dry Bulk · S&P",
    hours: "06:30 – 19:30 weekdays",
    lang: "English · French · Greek",
    member: "Baltic Exchange · BIMCO · ITIC",
    head: "Demetrios Pavlou",
    headRole: "Director · London",
    tz: "Europe/London",
    pin: { x: 480, y: 155, size: 5, isHQ: false },
  },
  sg: {
    city: "Singapore",
    meta: "1.28°N · 103.85°E · GMT+8",
    addr: "One Marina Boulevard, Singapore 018989",
    phone: "+65 6000 0000",
    after: "+65 9000 0000",
    sectors: "VLCC · MR · East-of-Suez · Bulk",
    hours: "07:00 – 20:00 weekdays",
    lang: "English · Mandarin · Bahasa",
    member: "SSA · BIMCO · MPA registered",
    head: "Wei Zhang",
    headRole: "Head of Asia Desk · Singapore",
    tz: "Asia/Singapore",
    pin: { x: 770, y: 280, size: 5, isHQ: false },
  },
  hou: {
    city: "Houston",
    meta: "29.76°N · 95.37°W · GMT−6",
    addr: "700 Travis St, Houston, TX 77002",
    phone: "+1 713 000 0000",
    after: "+1 832 000 0000",
    sectors: "USG Crude · Clean · Atlantic Basin",
    hours: "06:00 – 18:00 weekdays",
    lang: "English · Spanish",
    member: "BIMCO · ITIC · USFMC OTI",
    head: "Olivia Bennett",
    headRole: "Head of US Desk · Houston",
    tz: "America/Chicago",
    pin: { x: 195, y: 245, size: 5, isHQ: false },
  },
};

export const CITY_LABEL: Record<OfficeCity, string> = {
  ist: "Istanbul",
  lon: "London",
  sg: "Singapore",
  hou: "Houston",
};
