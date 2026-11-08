/**
 * Sanctions and compliance screening (/compliance). Describes the workflow,
 * not cap levels or list contents, which change too often to publish. Edited
 * in the admin (/keystatic → Compliance), stored in content/compliance.json.
 */
import file from "@/content/compliance.json";
import type { ComplianceFile } from "@/lib/content/schemas";

const data = file as ComplianceFile;

export const COMPLIANCE_UPDATED: string = data.updated;

export const SCREENING: { title: string; intro: string; checks: string[] }[] = data.screening;

export const COMPLIANCE_STEPS: { title: string; text: string }[] = data.steps;

export const COMPLIANCE_FAQ: { q: string; a: string }[] = data.faq;
