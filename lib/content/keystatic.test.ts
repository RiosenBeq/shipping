import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { llmsFullTxt, llmsTxt } from "@/lib/llms";
import {
  GITHUB_ENV_VARS,
  keystaticStorageMode,
  missingGithubEnv,
  needsGithubSetup,
} from "@/lib/content/storage";
import { keystaticConfig } from "@/keystatic.config";

const ROOT = path.resolve(__dirname, "../..");
const githubEnv = Object.fromEntries(GITHUB_ENV_VARS.map((k) => [k, "x"]));

describe("Keystatic storage", () => {
  it("is local in development and GitHub in production", () => {
    expect(keystaticStorageMode({ NODE_ENV: "development" })).toBe("local");
    expect(keystaticStorageMode({ NODE_ENV: "production" })).toBe("github");
    expect(keystaticStorageMode({ NODE_ENV: "production", KEYSTATIC_STORAGE: "local" })).toBe(
      "local"
    );
    // Creating the GitHub App: GitHub mode on a dev server.
    expect(keystaticStorageMode({ NODE_ENV: "development", KEYSTATIC_STORAGE: "github" })).toBe(
      "github"
    );
  });

  it("never writes files on Vercel (read-only, and local mode has no sign-in)", () => {
    expect(
      keystaticStorageMode({ NODE_ENV: "production", VERCEL: "1", KEYSTATIC_STORAGE: "local" })
    ).toBe("github");
  });

  it("shows the setup notice in production until the GitHub App variables exist", () => {
    expect(needsGithubSetup({ NODE_ENV: "production" })).toBe(true);
    expect(missingGithubEnv({ NODE_ENV: "production" })).toEqual([...GITHUB_ENV_VARS]);
    expect(needsGithubSetup({ NODE_ENV: "production", ...githubEnv })).toBe(false);
    // Development hands over to Keystatic's own "create GitHub App" screen.
    expect(needsGithubSetup({ NODE_ENV: "development", KEYSTATIC_STORAGE: "github" })).toBe(false);
    expect(needsGithubSetup({ NODE_ENV: "production", KEYSTATIC_STORAGE: "local" })).toBe(false);
  });

  it("commits to RiosenBeq/shipping in GitHub mode", () => {
    expect(keystaticConfig("github").storage).toEqual({
      kind: "github",
      repo: { owner: "RiosenBeq", name: "shipping" },
    });
    expect(keystaticConfig("local").storage).toEqual({ kind: "local" });
  });
});

describe("the admin stays out of search and AI indexes", () => {
  it("is disallowed in robots.txt for every crawler group", () => {
    const r = robots();
    for (const rule of [r.rules].flat()) {
      expect([rule.disallow ?? []].flat()).toEqual(expect.arrayContaining(["/api/", "/keystatic"]));
    }
  });

  it("is absent from the sitemap, llms.txt and llms-full.txt", () => {
    expect(sitemap().filter((e) => /keystatic|\/api\//.test(e.url))).toEqual([]);
    expect(llmsTxt()).not.toMatch(/keystatic/i);
    expect(llmsFullTxt()).not.toMatch(/keystatic/i);
  });

  it("is noindex and has its own root layout", () => {
    const layout = readFileSync(path.join(ROOT, "app/keystatic/layout.tsx"), "utf8");
    expect(layout).toMatch(/robots:\s*\{\s*index:\s*false,\s*follow:\s*false/);
    expect(layout).toMatch(/<html[\s>]/);
    expect(layout).toMatch(/<body>/);
  });
});
