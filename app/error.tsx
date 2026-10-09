"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook an error tracker in here if one is added.
    console.error(error);
  }, [error]);

  return (
    <section className="container py-20 md:py-28">
      <p className="font-mono text-sm text-brass-ink">Error</p>
      <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight tracking-tight text-navy md:text-5xl">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate">
        This page didn&apos;t load properly. Try again, or go back to the home page. If it keeps
        happening, please let us know.
      </p>
      {error.digest && (
        <p className="mt-3 text-sm text-slate">
          Reference: <span className="font-mono text-navy">{error.digest}</span>
        </p>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => reset()}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            Back to home <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
