import { shareImage } from "@/lib/og";
import { shareCards } from "@/lib/og-cards";

export const dynamic = "force-static";
export const dynamicParams = false;

/** Page path for an /og/… key: ["home"] → "/", ["tankers", "vlcc"] → "/tankers/vlcc". */
const pathOf = (key: string[]) => (key.join("/") === "home" ? "/" : `/${key.join("/")}`);

export function generateStaticParams() {
  return Object.keys(shareCards()).map((path) => ({
    key: path === "/" ? ["home"] : path.slice(1).split("/"),
  }));
}

/** Per-page Open Graph / Twitter card (1200 × 630 PNG), rendered at build time. */
export function GET(_req: Request, { params }: { params: { key: string[] } }) {
  const card = shareCards()[pathOf(params.key)];
  if (!card) return new Response("Not found", { status: 404 });
  return shareImage(card);
}
