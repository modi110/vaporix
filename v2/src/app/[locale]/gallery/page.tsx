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
 * A plain grid, not the masonry v1 needed: every photograph now comes out of
 * the pipeline at the same 3:4, so columns would only reintroduce ragged
 * bottoms for no gain. One per row on a phone — a dark car shrunk to half a
 * phone width stops reading as a car.
 */
function Gallery() {
  const p = useTranslations("pages.gallery");

  return (
    <>
      <PageHeader title={p("title")} lede={p("lede")} />

      <section className="section bg-pearl text-ink">
        <div className="wrap">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shots.map((shot, i) => (
              <figure key={shot.name} className="m-0">
                <picture>
                  <source
                    srcSet={`/images/gallery/${shot.name}.avif`}
                    type="image/avif"
                  />
                  <Image
                    src={`/images/gallery/${shot.name}.webp`}
                    alt={p(`alt.${shot.alt}`)}
                    width={shot.w}
                    height={shot.h}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="h-auto w-full"
                    // The first screenful should not wait on the observer.
                    priority={i < 2}
                  />
                </picture>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
