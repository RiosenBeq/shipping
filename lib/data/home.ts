/**
 * The homepage copy (DESIGN-V2 §7, §13): edited in the admin (/keystatic →
 * Pages → Homepage), stored in content/home.json, checked by
 * homeFileSchema (lib/content/schemas.ts) in the content tests and at build
 * time. The localized homepages take their copy from lib/i18n.ts instead.
 */
import file from "@/content/home.json";
import type { HomeFile } from "@/lib/content/schemas";

export const HOME: HomeFile = file as HomeFile;
