import Link from "next/link";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="notfound">
        <div className="code">404</div>
        <h1 className="display">This lane isn&apos;t on our chart yet.</h1>
        <p>
          The page you&apos;re looking for has either been retired or never existed. Let&apos;s get
          you back to where the desk is fixing.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Button asChild>
            <Link href="/">
              Back to home <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/voyage-estimator">
              Open voyage estimator <Compass className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
