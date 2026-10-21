import { describe, expect, it } from "vitest";
import { breadcrumbsLd, buildPageMetadata, itemListLd, organizationLd, serviceLd } from "./seo";
import { MEMBERSHIPS, siteConfig, verifiedMemberships } from "./site";

describe("buildPageMetadata", () => {
  it("sets a canonical URL on the configured origin", () => {
    const m = buildPageMetadata({ title: "T", description: "D", path: "/tankers" });
    expect(m.alternates?.canonical).toBe(`${siteConfig.url}/tankers`);
    expect(String(m.alternates?.canonical)).not.toContain("levanter.example");
  });

  it("marks pages noindex when asked (and for non-indexable builds)", () => {
    const m = buildPageMetadata({ title: "T", description: "D", path: "/x", noindex: true });
    expect(m.robots).toMatchObject({ index: false });
  });

  it("emits Open Graph article metadata for dated content", () => {
    const m = buildPageMetadata({
      title: "T",
      description: "D",
      path: "/research/x",
      article: { publishedTime: "2026-04-28T00:00:00.000Z" },
    });
    expect(m.openGraph).toMatchObject({
      type: "article",
      publishedTime: "2026-04-28T00:00:00.000Z",
    });
  });
});

describe("JSON-LD helpers", () => {
  it("uses a logo large enough for Google (≥112px)", () => {
    const org = organizationLd();
    expect(org.logo.width).toBeGreaterThanOrEqual(112);
    expect(org.logo.url).toMatch(/\/logo\.png$/);
  });

  it("models service lines as Service, not a LocalBusiness subtype", () => {
    const ld = serviceLd({ name: "n", description: "d", serviceType: "s", path: "/dry-bulk" });
    expect(ld["@type"]).toBe("Service");
  });

  it("numbers breadcrumb and list items from 1 with absolute URLs", () => {
    const crumbs = breadcrumbsLd([
      { name: "Home", path: "/" },
      { name: "Tankers", path: "/tankers" },
    ]);
    expect(crumbs.itemListElement.map((i) => i.position)).toEqual([1, 2]);
    const list = itemListLd("x", [{ name: "a", path: "/a" }]);
    expect(list.itemListElement[0].url).toBe(`${siteConfig.url}/a`);
  });
});

describe("claims gating", () => {
  it("shows no membership until it has been verified", () => {
    expect(verifiedMemberships()).toEqual(MEMBERSHIPS.filter((m) => m.verified));
  });
});
