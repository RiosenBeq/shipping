// Type-only: the client nav uses this module and must not pull zod into every page.
import type { INQUIRY_VESSELS, InquirySegment } from "./schemas";

type Vessel = (typeof INQUIRY_VESSELS)[number];

/** Ship-size guide slug → the matching option in the inquiry form's vessel list. */
export const VESSEL_BY_CLASS: Record<string, Vessel> = {
  vlcc: "VLCC",
  suezmax: "Suezmax",
  aframax: "Aframax / LR2",
  lr1: "LR1",
  mr: "MR / Handy tanker",
  vlgc: "VLGC",
  mgc: "MGC",
  handysize: "Handysize gas carrier",
  pressurised: "Pressurised / small LPG",
};

/**
 * Link to the contact form with the cargo (and optionally ship size and
 * quantity) preselected, so an inquiry started on a desk page reaches the
 * right desk. InquiryForm reads and validates these parameters.
 */
export function inquiryHref({
  segment,
  vessel,
  quantity,
}: { segment?: InquirySegment; vessel?: Vessel; quantity?: string } = {}) {
  const q = new URLSearchParams();
  if (segment) q.set("segment", segment);
  if (vessel) q.set("vessel", vessel);
  if (quantity) q.set("quantity", quantity);
  const qs = q.toString();
  return qs ? `/contact?${qs}` : "/contact";
}

/**
 * Clean-product tanker guides; every other tanker guide is crude. Kept here
 * (not read from tanker-classes) so the client nav doesn't bundle that data.
 */
const CLEAN_TANKERS = new Set(["lr1", "mr"]);

/**
 * Gas-carrier guides whose trade is mainly LPG. MGCs (the ammonia workhorse)
 * and Handysize ships (petrochemical gases first) swing between cargoes, so
 * their links preselect only the ship size and the visitor picks the cargo.
 */
const LPG_FIRST_GAS_CLASSES = new Set(["vlgc", "pressurised"]);

/** Inquiry link for a gas-carrier class guide (/lpg/[class]). */
export function lpgClassInquiryHref(slug: string) {
  return inquiryHref({
    segment: LPG_FIRST_GAS_CLASSES.has(slug) ? "lpg" : undefined,
    vessel: VESSEL_BY_CLASS[slug],
  });
}

/** Inquiry link for the page at `pathname` (used by the site nav). */
export function inquiryHrefFor(pathname: string) {
  const [, section, slug] = pathname.split("/");
  if (section === "tankers") {
    // The tanker hub spans crude and clean products, so the visitor picks.
    if (!slug) return "/contact";
    return inquiryHref({
      segment: CLEAN_TANKERS.has(slug) ? "clean" : "crude",
      vessel: VESSEL_BY_CLASS[slug],
    });
  }
  if (section === "lpg") {
    return slug ? lpgClassInquiryHref(slug) : inquiryHref({ segment: "lpg" });
  }
  return "/contact";
}
