import { PageSkeleton } from "@/components/site/PageSkeleton";

/** This route opens on a navy hero, so its skeleton is navy too. */
export default function Loading() {
  return <PageSkeleton tone="dark" />;
}
