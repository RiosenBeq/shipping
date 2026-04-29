import type { Metadata } from "next";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { VoyageEstimator } from "./VoyageEstimator";

export const metadata: Metadata = {
  title: "Voyage Estimator — LEVANTER",
  description:
    "LEVANTER voyage estimator: calculate TCE, freight, bunker burn, and P&L across major tanker lanes.",
};

export default function VoyageEstimatorPage() {
  return (
    <>
      <Nav active="tools" />
      <main>
        <VoyageEstimator />
      </main>
      <Footer />
    </>
  );
}
