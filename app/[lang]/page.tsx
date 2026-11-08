import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/site/JsonLd";
import { HomePage } from "@/components/site/home/HomePage";
import { localizedHome } from "@/components/site/home/view";
import { LOCALES, getLocale, homeLanguages } from "@/lib/i18n";
import { buildPageMetadata, localBusinessLd, webPageLd } from "@/lib/seo";

type Params = { params: { lang: string } };

export function generateStaticParams() {
  return LOCALES.map((l) => ({ lang: l.code }));
}
// No `dynamicParams = false`: an unknown first segment (/foo) must render this
// segment's styled not-found. With two root layouts there is no app-level 404,
// so a dynamicParams miss would fall back to Next's unstyled default page.

export function generateMetadata({ params }: Params): Metadata {
  const locale = getLocale(params.lang);
  // Unknown first segment (/foo): notFound() here too, so the head gets the
  // not-found title and noindex rather than the root defaults. Keep this route
  // free of a loading.tsx: a Suspense boundary above the page turns its
  // notFound() into HTTP 200 (+ noindex) instead of 404.
  if (!locale) notFound();
  return buildPageMetadata({
    title: locale.dict.metaTitle,
    description: locale.dict.metaDescription,
    path: `/${locale.code}`,
    absoluteTitle: true,
    locale: locale.ogLocale,
    languages: homeLanguages(),
    keywords: locale.dict.keywords,
  });
}

/**
 * Translated homepage for one shipping market, on the same section flow and
 * plates as the English homepage (components/site/home). Desk, class and team
 * links go to the English pages (hrefLang="en"); lang/dir are set on <html> by
 * app/[lang]/layout.tsx.
 */
export default function LocalizedHome({ params }: Params) {
  const locale = getLocale(params.lang);
  if (!locale) notFound();
  const t = locale.dict;
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: t.metaTitle,
            description: t.metaDescription,
            path: `/${locale.code}`,
            lang: locale.hreflang,
          }),
          localBusinessLd(),
        ]}
      />
      <HomePage view={localizedHome(locale)} />
    </>
  );
}
