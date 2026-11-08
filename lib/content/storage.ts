/**
 * Where the Keystatic admin (/keystatic) reads and writes content.
 *
 * - local:  edits write the JSON files in content/ (and photos in public/images)
 *           on this machine. Default in `next dev`.
 * - github: edits commit to RiosenBeq/shipping (main by default) through a GitHub
 *           App; Vercel redeploys. Default in production.
 *
 * KEYSTATIC_STORAGE=local|github overrides the default, e.g.
 * `KEYSTATIC_STORAGE=github npm run dev` once, to create the GitHub App through
 * Keystatic's setup flow. On Vercel the file system is read-only and local mode
 * would be unauthenticated, so Vercel always uses github.
 */
export type StorageMode = "local" | "github";

export const GITHUB_REPO = { owner: "RiosenBeq", name: "shipping" } as const;

/**
 * The branch Vercel deploys to production. Keystatic would otherwise open the
 * repository's default branch, which on RiosenBeq/shipping is an older one.
 */
export const GITHUB_BRANCH = "main";

/** Server-side secrets and the public app slug that GitHub mode needs. */
export const GITHUB_ENV_VARS = [
  "KEYSTATIC_GITHUB_CLIENT_ID",
  "KEYSTATIC_GITHUB_CLIENT_SECRET",
  "KEYSTATIC_SECRET",
  "NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG",
] as const;

type Env = Record<string, string | undefined>;

export function keystaticStorageMode(env: Env = process.env): StorageMode {
  if (env.VERCEL) return "github";
  if (env.KEYSTATIC_STORAGE === "local" || env.KEYSTATIC_STORAGE === "github") {
    return env.KEYSTATIC_STORAGE;
  }
  return env.NODE_ENV === "development" ? "local" : "github";
}

/** Names (never values) of the GitHub App variables that are not set. */
export function missingGithubEnv(env: Env = process.env): string[] {
  return GITHUB_ENV_VARS.filter((name) => !env[name]);
}

/**
 * True when /keystatic should show the setup notice instead of the editor:
 * GitHub mode outside development without the GitHub App variables. (In
 * development Keystatic's own setup screen creates the app and writes .env.)
 */
export function needsGithubSetup(env: Env = process.env): boolean {
  return (
    keystaticStorageMode(env) === "github" &&
    env.NODE_ENV !== "development" &&
    missingGithubEnv(env).length > 0
  );
}
