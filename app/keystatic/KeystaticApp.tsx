"use client";

import { makePage } from "@keystatic/next/ui/app";
import { keystaticConfig } from "@/keystatic.config";
import type { StorageMode } from "@/lib/content/storage";

// Built once per mode. The server page picks the mode, because the client
// cannot read KEYSTATIC_STORAGE (only NEXT_PUBLIC_* variables reach it).
const PAGES = {
  local: makePage(keystaticConfig("local")),
  github: makePage(keystaticConfig("github")),
};

export function KeystaticApp({ mode }: { mode: StorageMode }) {
  const Page = PAGES[mode];
  return <Page />;
}
