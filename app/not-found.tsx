import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "404 — Page not found",
  description: "The page you're looking for doesn't exist on the LEVANTER site.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="notfound" id="main">
        <div className="code" aria-hidden="true">
          404
        </div>
        <h1 className="display">This lane isn&apos;t on our chart yet.</h1>
        <p>
          The page you&apos;re looking for has either been retired or never existed. Try one of
          these instead:
        </p>
        <ul className="notfound-links">
          <li>
            <Link href="/tankers">Tanker chartering</Link>
          </li>
          <li>
            <Link href="/dry-bulk">Dry bulk chartering</Link>
          </li>
          <li>
            <Link href="/research">Research</Link>
          </li>
          <li>
            <Link href="/voyage-estimator">Voyage estimator</Link>
          </li>
        </ul>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">
              Back to home <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">
              Charter inquiry <Compass className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
