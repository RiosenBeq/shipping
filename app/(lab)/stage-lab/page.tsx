import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Stage lab",
  robots: { index: false, follow: false },
};

/**
 * /stage-lab — development only (docs/STAGE.md): every plate, grade, aperture and the tide
 * wipe on one page. In production builds the condition is a constant, the import below is
 * dropped as dead code and the route answers 404.
 */
export default async function StageLabPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (process.env.NODE_ENV !== "production") {
    const { StageLab } = await import("@/components/site/stage/lab/StageLab");
    const bake = searchParams.bake;
    return <StageLab bake={bake === "bathy" || bake === "hero" ? bake : null} />;
  }
  notFound();
}
