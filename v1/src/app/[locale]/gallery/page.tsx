import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { shots } from "@/content/gallery";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.gallery" });
  return { title: `${t("title")} — Vaporix`, description: t("lede") };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Gallery />;
}

/**
 * A masonry column layout rather than a grid: these photographs are a mix of
 * portrait and landscape, and a grid would either crop them or leave holes.
 * CSS columns keep every frame whole at its own ratio, and collapse to one
 * column on a phone where a single wide image per scroll reads best.
 */
function Gallery() {
  const p = useTranslations("pages.gallery");

  return (
    <>
      <PageHeader label={p("label")} title={p("title")} lede={p("lede")} />

      <section className="section-under-header">
        <div className="wrap">
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
            {shots.map((shot, i) => (
              <figure
                key={shot.src}
                data-reveal
                style={{ transitionDelay: `${(i % 6) * 60}ms` }}
                className="group relative block break-inside-avoid overflow-hidden rounded-card border border-hairline bg-surface"
              >
                <Image
                  src={shot.src}
                  alt={p(`alt.${shot.alt}`)}
                  width={shot.w}
                  height={shot.h}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 48vw, 92vw"
                  className="h-auto w-full"
                  // the first screenful should not wait on the observer
                  priority={i < 2}
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
