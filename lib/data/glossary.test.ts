import { describe, expect, it } from "vitest";
import { GLOSSARY_TERMS, GROUP_LABELS } from "./glossary";
import { slugify } from "@/lib/slug";

describe("glossary anchors", () => {
  it("gives every term a unique anchor that doesn't clash with section ids", () => {
    const anchors = GLOSSARY_TERMS.map((t) => slugify(t.term));
    expect(new Set(anchors).size).toBe(anchors.length);
    for (const group of Object.keys(GROUP_LABELS)) expect(anchors).not.toContain(group);
  });
});
