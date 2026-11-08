import { makeRouteHandler } from "@keystatic/next/route-handler";
import { keystaticConfig } from "@/keystatic.config";
import { keystaticStorageMode, needsGithubSetup, type StorageMode } from "@/lib/content/storage";

/**
 * Keystatic's API: file reads and writes in local mode, GitHub sign-in in
 * GitHub mode. The handler is built on the first request, not at import:
 * Keystatic throws when GitHub mode lacks its variables, and that would fail
 * `next build` on a deployment that has not set up the GitHub App yet.
 */
export const dynamic = "force-dynamic";

type Handlers = ReturnType<typeof makeRouteHandler>;
const handlers = new Map<StorageMode, Handlers>();

function getHandlers(): Handlers | null {
  if (needsGithubSetup()) return null;
  const mode = keystaticStorageMode();
  let h = handlers.get(mode);
  if (!h) {
    h = makeRouteHandler({ config: keystaticConfig(mode) });
    handlers.set(mode, h);
  }
  return h;
}

const NOT_CONFIGURED = JSON.stringify({
  error: "Content editing is not connected on this deployment. See docs/CMS.md.",
});

async function handle(method: "GET" | "POST", request: Request): Promise<Response> {
  const h = getHandlers();
  const res = h
    ? await h[method](request)
    : new Response(NOT_CONFIGURED, {
        status: 503,
        headers: { "content-type": "application/json" },
      });
  const headers = new Headers(res.headers);
  headers.set("X-Robots-Tag", "noindex, nofollow");
  headers.set("Cache-Control", "no-store");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

export function GET(request: Request) {
  return handle("GET", request);
}

export function POST(request: Request) {
  return handle("POST", request);
}
