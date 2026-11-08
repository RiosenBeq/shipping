import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import KeystaticPage from "@/app/keystatic/[[...params]]/page";
import { GET } from "@/app/api/keystatic/[...params]/route";

// Vitest compiles TSX with the classic runtime (React.createElement); Next uses
// the automatic one, so the app's components do not import React themselves.
(globalThis as { React?: typeof React }).React = React;

afterEach(() => vi.unstubAllEnvs());

function production(env: Record<string, string> = {}) {
  vi.stubEnv("NODE_ENV", "production");
  for (const k of [
    "KEYSTATIC_STORAGE",
    "VERCEL",
    "KEYSTATIC_GITHUB_CLIENT_ID",
    "KEYSTATIC_GITHUB_CLIENT_SECRET",
    "KEYSTATIC_SECRET",
    "NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG",
  ]) {
    vi.stubEnv(k, env[k] ?? "");
  }
}

describe("/keystatic in production without the GitHub App", () => {
  it("renders a setup notice that names the missing variables (not their values)", () => {
    production({ KEYSTATIC_SECRET: "s3cret-value" });
    const html = renderToStaticMarkup(KeystaticPage({ params: {} }));
    expect(html).toContain("Editing is not connected yet");
    expect(html).toContain("KEYSTATIC_GITHUB_CLIENT_ID");
    expect(html).toContain("NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG");
    expect(html).not.toContain("KEYSTATIC_SECRET<");
    expect(html).not.toContain("s3cret-value");
    expect(html).toContain("docs/CMS.md");
  });

  it("answers the API with 503 instead of crashing, and is noindex", async () => {
    production();
    const res = await GET(new Request("https://levanter.example/api/keystatic/github/login"));
    expect(res.status).toBe(503);
    expect(res.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });
});

describe("/keystatic in production with the GitHub App", () => {
  it("opens the main branch (the repository's default branch is an older one)", () => {
    production({
      KEYSTATIC_GITHUB_CLIENT_ID: "id",
      KEYSTATIC_GITHUB_CLIENT_SECRET: "secret",
      KEYSTATIC_SECRET: "x".repeat(40),
      NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: "levanter-cms",
    });
    let digest = "";
    try {
      KeystaticPage({ params: {} });
    } catch (e) {
      digest = String((e as { digest?: string }).digest);
    }
    expect(digest).toContain("/keystatic/branch/main");
    // Deeper admin URLs are left to Keystatic.
    expect(() => KeystaticPage({ params: { params: ["branch", "main"] } })).not.toThrow();
  });
});
