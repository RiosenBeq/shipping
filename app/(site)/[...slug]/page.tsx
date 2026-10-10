import { notFound } from "next/navigation";

/**
 * Throw from metadata too, so the head gets the not-found title and noindex.
 * There is deliberately no (site)/loading.tsx: a Suspense boundary above this
 * page would turn its notFound() into HTTP 200 (a soft 404). Skeletons live
 * next to the static pages that use them.
 */
export function generateMetadata(): never {
  notFound();
}

/**
 * Unmatched URLs. With two root layouts there is no app-level not-found, so
 * this catch-all sends every unknown path to the styled 404 in (site).
 * (Single-segment paths such as /foo are handled by app/[lang]/page.tsx.)
 */
export default function CatchAll(): never {
  notFound();
}
