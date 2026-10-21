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
    // No error tracker is wired up yet — log to the console so it shows in browser devtools.
    console.error(error);
  }, [error]);

  return (
    <>
      <Nav />
      <main className="notfound" id="main">
        <div className="code" aria-hidden="true">
          !
        </div>
        <h1 className="display">Something went sideways.</h1>
        <p>
          An unexpected error stopped this page from loading. Try again, or contact the desk if it
          keeps happening
          {error.digest ? (
            <>
              {" "}
              and quote reference{" "}
              <span className="mono" style={{ color: "var(--accent-brass)" }}>
                {error.digest}
              </span>
            </>
          ) : null}
          .
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => reset()}>
            Try again <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              Back to home <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
