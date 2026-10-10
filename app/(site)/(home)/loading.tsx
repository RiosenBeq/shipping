import { PageSkeleton } from "@/components/site/PageSkeleton";

/**
 * Home opens on the navy hero with no breadcrumb. In the (home) group so the
 * Suspense boundary wraps this page only: a (site)-wide loading.tsx would sit
 * above the catch-all and turn its notFound() into a soft 404 (HTTP 200).
 */
export default function Loading() {
  return <PageSkeleton tone="dark" crumbs={false} />;
}
