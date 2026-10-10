import { PageSkeleton } from "@/components/site/PageSkeleton";

/**
 * The research index opens on the light (sand) header. In the (index) group
 * so the boundary doesn't wrap research/[slug], whose notFound() must stay a
 * real 404 (a Suspense boundary above it would answer HTTP 200).
 */
export default function Loading() {
  return <PageSkeleton />;
}
