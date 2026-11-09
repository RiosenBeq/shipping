import { describe, expect, it } from "vitest";
import { INTRO_KEY, INTRO_SCRIPT } from "./intro";
import { leavesPage } from "./tide";

const HERE = "https://obmshipping.com/tankers?x=1#top";

describe("leavesPage (nav tide line)", () => {
  it("runs for another page of the site", () => {
    expect(leavesPage("/lpg", HERE)).toBe(true);
    expect(leavesPage("https://obmshipping.com/contact?segment=vlcc", HERE)).toBe(true);
    expect(leavesPage("../team", "https://obmshipping.com/tankers/vlcc")).toBe(true);
  });

  it("stays still for the same page, anchors and query-only changes", () => {
    expect(leavesPage("/tankers", HERE)).toBe(false);
    expect(leavesPage("/tankers/", HERE)).toBe(false);
    expect(leavesPage("#inquiry-title", HERE)).toBe(false);
    expect(leavesPage("?x=2", HERE)).toBe(false);
  });

  it("stays still for other origins, protocols, new tabs and downloads", () => {
    expect(leavesPage("https://wa.me/905", HERE)).toBe(false);
    expect(leavesPage("mailto:desk@obmshipping.com", HERE)).toBe(false);
    expect(leavesPage("tel:+90212", HERE)).toBe(false);
    expect(leavesPage("/lpg", HERE, { target: "_blank" })).toBe(false);
    expect(leavesPage("/lpg", HERE, { target: "_self" })).toBe(true);
    expect(leavesPage("/brochure.pdf", HERE, { download: true })).toBe(false);
    expect(leavesPage(null, HERE)).toBe(false);
  });
});

describe("INTRO_SCRIPT", () => {
  it("is one guarded statement that marks the session", () => {
    expect(INTRO_SCRIPT.startsWith("try{")).toBe(true);
    expect(INTRO_SCRIPT.endsWith("catch(e){}")).toBe(true);
    expect(INTRO_SCRIPT).toContain(INTRO_KEY);
    expect(() => new Function(INTRO_SCRIPT)).not.toThrow();
  });
});
