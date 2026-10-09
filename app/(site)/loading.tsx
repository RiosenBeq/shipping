"use client";

import { usePathname } from "next/navigation";
import { PageSkeleton } from "@/components/site/PageSkeleton";

/**
 * Default route loading state. While a navigation is pending, usePathname()
 * already returns the destination, so Home (navy hero, no breadcrumb) gets the
 * dark skeleton without a breadcrumb bar instead of flashing sand first; every
 * other page here opens on the light (sand) PageHeader.
 */
export default function Loading() {
  const home = usePathname() === "/";
  return home ? <PageSkeleton tone="dark" crumbs={false} /> : <PageSkeleton />;
}
