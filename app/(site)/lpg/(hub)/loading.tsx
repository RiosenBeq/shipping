import { PageSkeleton } from "@/components/site/PageSkeleton";

/**
 * This route opens on a navy hero, so its skeleton is navy too. In the (hub)
 * group so the boundary doesn't wrap the [class] guides, whose notFound() must
 * stay a real 404 (a Suspense boundary above it would answer HTTP 200).
 */
export default function Loading() {
  return <PageSkeleton tone="dark" />;
}
