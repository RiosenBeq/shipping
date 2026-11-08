/**
 * FAQ lists for the home and desk pages. Kept here (not in the pages) so
 * llms-full.txt can publish the same answers the pages show. Edited in the
 * admin (/keystatic → FAQs), stored in content/faqs.json.
 */
import file from "@/content/faqs.json";
import type { FaqsFile } from "@/lib/content/schemas";

export type FaqEntry = { q: string; a: string };

const data = file as FaqsFile;

export const HOME_FAQ: FaqEntry[] = data.home;
export const TANKERS_FAQ: FaqEntry[] = data.tankers;
export const LPG_FAQ: FaqEntry[] = data.lpg;
export const ABOUT_FAQ: FaqEntry[] = data.about;
