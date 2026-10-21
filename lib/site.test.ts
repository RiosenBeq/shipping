import { describe, expect, it } from "vitest";
import { COMPANY_DETAILS_CONFIRMED, siteConfig } from "@/lib/site";

/** Values that only make sense as design placeholders. */
const PLACEHOLDER = /\.example\b|000 ?0000|0000000/;

describe("contact details", () => {
  const values = [
    siteConfig.email,
    siteConfig.phone,
    siteConfig.whatsapp,
    siteConfig.whatsappDisplay,
    ...Object.values(siteConfig.desks).map((d) => d.email),
  ];

  it("are confirmed only once no placeholder is left", () => {
    const placeholders = values.filter((v) => PLACEHOLDER.test(v));
    if (COMPANY_DETAILS_CONFIRMED) expect(placeholders).toEqual([]);
    else expect(placeholders.length).toBeGreaterThan(0);
  });
});
