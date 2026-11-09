import type { Metadata } from "next";
import { JsonLd } from "@/components/site/JsonLd";
import { HomePage } from "@/components/site/home/HomePage";
import { englishHome } from "@/components/site/home/view";
import { buildPageMetadata, localBusinessLd, serviceLd, webPageLd } from "@/lib/seo";
import { homeLanguages } from "@/lib/i18n";

const TITLE = "OBM Shipping — Tanker & LPG Shipbrokers in Istanbul";
const DESCRIPTION =
  "Istanbul tanker and LPG shipbrokers: crude, clean products, LPG and ammonia on spot, time charter and COA. Direct broker access, first reply in 60 minutes.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/",
  absoluteTitle: true,
  languages: homeLanguages(),
  keywords: [
    "tanker broker",
    "LPG shipbroker",
    "LPG broker Istanbul",
    "tanker broker Istanbul",
    "VLGC chartering",
    "MGC charter",
    "Aframax chartering Mediterranean",
    "Black Sea tanker broker",
    "ammonia carrier chartering",
  ],
});

export default function Home() {
  const view = englishHome();
  return (
    <>
      <JsonLd
        data={[
          webPageLd({ title: TITLE, description: DESCRIPTION, path: "/" }),
          localBusinessLd(),
          serviceLd({
            name: "Tanker and LPG chartering brokerage",
            description: DESCRIPTION,
            serviceType: "Shipbroking",
            path: "/",
            offers: [
              { name: "Tanker chartering", path: "/tankers" },
              { name: "LPG and ammonia chartering", path: "/lpg" },
            ],
          }),
        ]}
      />
      <HomePage view={view} />
    </>
  );
}
