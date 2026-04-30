import { describe, expect, it } from "vitest";
import { readingTimeMinutes, slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and joins with dashes", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips Türkçe diacritics (ı/İ/ş/ğ/ü/ö/ç)", () => {
    expect(slugify("Mehmet Aydın")).toBe("mehmet-aydin");
    expect(slugify("Tunç Demir")).toBe("tunc-demir");
    expect(slugify("Şükrü Öztürk")).toBe("sukru-ozturk");
    expect(slugify("Ğöçük İğne")).toBe("gocuk-igne");
  });

  it("strips combining marks for European diacritics", () => {
    expect(slugify("Søren Hansen")).toBe("soren-hansen");
    expect(slugify("Léa Martin")).toBe("lea-martin");
  });

  it("collapses runs of non-alphanumerics into a single dash", () => {
    expect(slugify("foo  --  bar / baz")).toBe("foo-bar-baz");
  });

  it("trims leading/trailing dashes", () => {
    expect(slugify("--hello--")).toBe("hello");
    expect(slugify(" / hello / ")).toBe("hello");
  });

  it("handles ampersands and punctuation in titles", () => {
    expect(slugify("Sale & Purchase Outlook 2026")).toBe("sale-purchase-outlook-2026");
    expect(slugify("EU ETS phase-2: cargo allocation, who actually pays")).toBe(
      "eu-ets-phase-2-cargo-allocation-who-actually-pays"
    );
  });
});

describe("readingTimeMinutes", () => {
  it("rounds up to at least 1 minute", () => {
    expect(readingTimeMinutes("hello")).toBe(1);
    expect(readingTimeMinutes("")).toBe(1);
  });

  it("scales with word count at 220 wpm by default", () => {
    const text = Array(440).fill("word").join(" ");
    expect(readingTimeMinutes(text)).toBe(2);
  });

  it("respects a custom wpm", () => {
    const text = Array(400).fill("word").join(" ");
    expect(readingTimeMinutes(text, 200)).toBe(2);
  });
});
