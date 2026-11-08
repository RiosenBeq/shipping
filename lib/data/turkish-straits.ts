/**
 * Turkish Straits transit guide (/turkish-straits): the Bosphorus and the
 * Dardanelles from a chartering point of view. Rules are summarised, not
 * quoted; figures are rounded and durable (no tariffs or live queue data).
 * Edited in the admin (/keystatic → Turkish Straits), stored in
 * content/turkish-straits.json.
 */
import file from "@/content/turkish-straits.json";
import type { TurkishStraitsFile } from "@/lib/content/schemas";

const data = file as TurkishStraitsFile;

export const STRAITS_UPDATED: string = data.updated;

export const STRAITS_FACTS: readonly { readonly k: string; readonly v: string }[] = data.facts;

export const STRAITS_SECTIONS: { id: string; title: string; body: string[]; list?: string[] }[] =
  data.sections.map((s) => ({
    id: s.id,
    title: s.title,
    body: s.body,
    ...(s.list.length ? { list: s.list } : {}),
  }));

export const STRAITS_FAQ: { q: string; a: string }[] = data.faq;
