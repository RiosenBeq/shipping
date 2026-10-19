import { siteConfig } from "@/lib/site";
import { OG_SIZE, shareImage } from "@/lib/og";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return shareImage({
    eyebrow: "Istanbul · Shipbrokers",
    title: "Tanker & LPG chartering, brokered from the Bosphorus.",
  });
}
