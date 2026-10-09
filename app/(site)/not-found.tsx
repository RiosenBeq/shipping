import type { Metadata } from "next";
import { NotFoundView, notFoundMetadata } from "@/components/site/NotFoundView";

export const metadata: Metadata = notFoundMetadata;

export default function NotFound() {
  return <NotFoundView />;
}
