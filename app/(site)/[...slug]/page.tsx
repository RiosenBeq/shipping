import { notFound } from "next/navigation";

/**
 * Throw from metadata too, so the head gets the not-found title and noindex.
 * (site)/loading.tsx is a Suspense boundary above this page, so in Next 14 the
 * page's notFound() renders the styled 404 with HTTP 200 + noindex.
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
