import { describe, expect, it } from "vitest";
import { POSTS_DIR } from "./blog/posts";
import { GUIDES_DIR } from "./guides/meta";

// lib/blog/posts.ts and lib/guides/guides.ts read these folders through literal paths so the
// server file tracer packs only them into Vercel functions (a path built from a constant made
// it pack the whole project, past Vercel's 250 MB function limit). Keep the literals in sync.
describe("content folders read at runtime", () => {
  it("match the literal paths the readers use", () => {
    expect(POSTS_DIR).toBe("content/blog");
    expect(GUIDES_DIR).toBe("content/guides");
  });
});
