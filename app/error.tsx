"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, RotateCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, route this to your error tracker.
    console.error(error);
  }, [error]);

  return (
    <>
      <Nav />
      <main className="notfound">
        <div className="code">!</div>
        <h1 className="display">Something went sideways.</h1>
        <p>
          An unexpected error blocked this page. The desk has been notified.
          {error.digest && (
            <>
              {" "}
              Reference:{" "}
              <span className="mono" style={{ color: "var(--accent-brass)" }}>
                {error.digest}
              </span>
            </>
          )}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => reset()}>
            Try again <RotateCcw className="h-4 w-4" />
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              Back to home <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
