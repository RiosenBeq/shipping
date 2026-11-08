import { PageSkeleton } from "@/components/site/PageSkeleton";

/**
 * The desk hub opens on a night window, so its skeleton is night too. In the (hub)
 * group so the boundary doesn't wrap the [class] guides, whose notFound() must
 * stay a real 404 (a Suspense boundary above it would answer HTTP 200).
 */
export default function Loading() {
  return <PageSkeleton />;
}
