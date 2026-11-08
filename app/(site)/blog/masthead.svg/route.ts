import { mastheadSvg } from "@/lib/blog/cover";

export const dynamic = "force-static";

/** Contour lines behind the blog's night mastheads (lib/blog/cover.ts). */
export function GET() {
  return new Response(mastheadSvg(), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400",
    },
  });
}
