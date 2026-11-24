import type { ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { alternatesFor } from "@/i18n/urls";
import { ButtonAnchor } from "@/components/ui/Button";
import { Offers } from "@/components/sections/Offers";
import { site, whatsappWith } from "@/content/site";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.business" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: alternatesFor("/business", locale),
  };
}

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Business />;
}

const proof = ["demo", "week", "noAppointment"] as const;
const benefits = ["onsite", "steam", "finish"] as const;
const commitments = ["week", "noAppointment", "materials"] as const;
const steps = ["visit", "demo"] as const;
const sectors = [
  "delivery",
  "courier",
  "trades",
  "technicians",
  "rental",
  "taxi",
  "schools",
  "industry",
] as const;

/**
 * Line icons (24px grid, 1.75 stroke, round caps) for the service cards, the
 * commitment block and the two ways to start. No list on this page is
 * numbered: the client gave no order, so none is implied.
 */
const icons: Record<string, ReactNode> = {
  // a van at a building: we come to you
  onsite: (
    <>
      <path d="M3 17V8.5l6-3.5 6 3.5V17" />
      <path d="M15 11h3.5l2.5 3v3h-6" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="17.5" cy="17.5" r="1.5" />
      <path d="M7 12h4" />
    </>
  ),
  // rising steam
  steam: (
    <>
      <path d="M8 20c-2-2.5 2-4.5 0-7s2-4.5 0-7" />
      <path d="M12.5 20c-2-2.5 2-4.5 0-7s2-4.5 0-7" />
      <path d="M17 20c-2-2.5 2-4.5 0-7s2-4.5 0-7" />
    </>
  ),
  // a shine
  finish: (
    <>
      <path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z" />
      <path d="M18.5 16v4M16.5 18h4" />
    </>
  ),
  // a calendar
  week: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  // a clock
  noAppointment: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  // a shield with a check
  materials: (
    <>
      <path d="M12 3l7 3v5.5c0 4.2-3 7.6-7 9-4-1.4-7-4.8-7-9V6z" />
      <path d="M8.75 12l2.25 2.25L15.5 9.75" />
    </>
  ),
  // a phone: the call or technical visit
  visit: (
    <path d="M5.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 7 7l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3.5 5.5a2 2 0 0 1 2-2z" />
  ),
  // a check in a circle: see the result, free
  demo: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.25 12.25l2.5 2.5 5-5" />
    </>
  ),
};

function Icon({ id, className }: { id: string; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {icons[id]}
    </svg>
  );
}

/**
 * Companies and fleets: the client's own "propuesta de servicios para
 * empresas y flotas", set as a page and in the proposal's own order. Formal
 * `usted` throughout, because it is written to a fleet or admin manager.
 *
 * Every offer, promise and term on this page is the client's wording (the
 * proposal and the flyer); nothing here commits them to prices, schedules
 * or conditions they have not written. No form and no prices for the
 * washing: every action is a WhatsApp chat that opens with the request
 * already typed, or a call. The free demonstration is the main action.
 *
 * Same visual language as the offers band: rounded panels (`biz-panel`),
 * pills for buttons, icon badges and tags, big condensed type, site blues
 * only. No numbers on screen: lists are marked with icon badges (the 1-3
 * below are the proposal's section numbers, for reference only).
 *
 *   hero          blue     promise, the free demonstration, workshop photo
 *   wash          white    1. washing and steam disinfection (proposal §1)
 *   offers        deep     2. the 99 € pack and the battery offer (§2)
 *   commitment    white    3. the operating commitment (§3)
 *   steps         blue     two ways to start: call or visit, free demonstration
 *   sectors       white    who it is for, then the closing ask
 *
 * Motion is the site-wide scroll reveal only (once, skipped for reduced
 * motion, nothing hidden without JS).
 */
function Business() {
  const p = useTranslations("pages.business");
  const demoHref = whatsappWith(p("waText"));

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="band-grain relative text-pearl">
        <div
          className="wrap grid items-center gap-10 pb-[var(--pad-section)] lg:grid-cols-12 lg:gap-12"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 7rem)" }}
        >
          <div className="lg:col-span-7">
            <p className="inline-flex rounded-full border border-pearl/40 px-4 py-1.5 text-sm uppercase">
              {p("label")}
            </p>
            <h1 className="t-display-lg mt-6 max-w-[14ch] text-balance lg:text-[clamp(3.5rem,6.2vw,5.75rem)]">
              {p("title")}
            </h1>
            <p className="mt-6 max-w-[48ch] text-lg leading-relaxed tracking-normal text-pearl/90">
              {p("lede")}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonAnchor href={demoHref} variant="white">
                {p("cta")}
              </ButtonAnchor>
              <ButtonAnchor
                href={site.phoneHref}
                variant="outlined"
                arrow={false}
                className="border-pearl/60"
              >
                {p("call")} {site.phone}
              </ButtonAnchor>
            </div>
            <ul className="mt-9 flex flex-wrap gap-2">
              {proof.map((id) => (
                <li
                  key={id}
                  className="inline-flex items-center gap-2 rounded-full bg-pearl/12 px-3.5 py-2 text-xs uppercase leading-tight sm:text-sm"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-3.5 shrink-0"
                  >
                    <path d="M3 8.5l3 3 7-7" />
                  </svg>
                  {p(`proof.${id}`)}
                </li>
              ))}
            </ul>
          </div>

          <figure className="biz-panel relative aspect-[4/3] w-full sm:aspect-[16/10] lg:col-span-5 lg:aspect-[4/5]">
            <picture className="absolute inset-0 block">
              <source srcSet="/images/gallery/bmw-serie5.avif" type="image/avif" />
              <Image
                src="/images/gallery/bmw-serie5.webp"
                alt={p("heroPhotoAlt")}
                fill
                priority
                sizes="(min-width: 1024px) 36vw, 100vw"
                className="object-cover object-[50%_78%] lg:object-center"
              />
            </picture>
            <figcaption className="absolute bottom-4 left-4 rounded-full bg-pearl px-4 py-2 text-xs uppercase leading-tight text-giallo-deep sm:bottom-5 sm:left-5 sm:text-sm">
              {p("photoTag")}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ---------- 1. washing and steam disinfection ---------- */}
      <section className="section bg-pearl text-ink">
        <div className="wrap">
          <header className="mb-10 lg:mb-14">
            <p className="t-sub font-medium text-muted">{p("benefits.label")}</p>
            <h2 className="t-display mt-2 max-w-[22ch] text-balance">
              {p("benefits.title")}
            </h2>
          </header>

          <div className="grid gap-4 lg:grid-cols-12">
            <div className="biz-panel relative aspect-[4/3] lg:col-span-5 lg:row-span-3 lg:aspect-auto lg:min-h-[30rem]">
              <Image
                src="/images/x4-interior.png"
                alt={p("benefits.photoAlt")}
                fill
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-cover object-[28%_50%]"
              />
            </div>

            {benefits.map((id) => {
              // The disinfection is the client's headline item: the one solid panel.
              const lead = id === "steam";
              return (
                <article
                  key={id}
                  className={`biz-panel grid gap-4 p-6 sm:grid-cols-[3rem_1fr] sm:gap-6 sm:p-8 lg:col-span-7 ${
                    lead ? "bg-giallo text-pearl" : "bg-giallo/6 text-ink"
                  }`}
                >
                  <span
                    className={`grid size-12 place-items-center rounded-full ${
                      lead ? "bg-pearl text-giallo" : "bg-giallo text-pearl"
                    }`}
                  >
                    <Icon id={id} className="size-6" />
                  </span>
                  <div>
                    <h3 className="t-heading leading-tight text-balance">
                      {p(`benefits.items.${id}.title`)}
                    </h3>
                    <p
                      className={`t-body mt-2 ${lead ? "text-pearl/90" : "text-muted"}`}
                    >
                      {p(`benefits.items.${id}.body`)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- 2. the workshop offer ---------- */}
      <Offers variant="business" />

      {/* ---------- 3. the operating commitment ---------- */}
      <section className="section bg-pearl text-ink">
        <div className="wrap">
          <h2 className="t-display mb-10 max-w-[20ch] text-balance lg:mb-14">
            {p("commitments.title")}
          </h2>
          <ul className="biz-panel grid divide-y divide-giallo/25 border border-giallo/25 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {commitments.map((id) => (
              <li key={id} className="flex flex-col gap-3 p-6 sm:p-8">
                <span className="mb-2 inline-flex h-14 w-20 items-center justify-center rounded-full border border-giallo/35 bg-giallo/6 text-giallo">
                  <Icon id={id} className="size-7" />
                </span>
                <h3 className="t-heading leading-tight">
                  {p(`commitments.items.${id}.title`)}
                </h3>
                <p className="t-body text-muted">
                  {p(`commitments.items.${id}.body`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- steps: two equal ways to start (no order) ---------- */}
      <section className="band-grain section relative text-pearl">
        <div className="wrap">
          <div className="grid gap-10 lg:grid-cols-3 lg:gap-4">
            <div className="flex flex-col items-start gap-6 lg:justify-between lg:py-2 lg:pr-6">
              <h2 className="t-display">{p("steps.title")}</h2>
              <ButtonAnchor href={demoHref} variant="white">
                {p("cta")}
              </ButtonAnchor>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
              {steps.map((id) => {
                // The demonstration is the page's main action: the one white card.
                // Neither card is numbered; the client gave no order.
                const lead = id === "demo";
                return (
                  <li
                    key={id}
                    className={`biz-panel flex flex-col gap-4 p-6 sm:p-8 ${
                      lead
                        ? "bg-pearl text-giallo"
                        : "border border-pearl/35 bg-pearl/8"
                    }`}
                  >
                    <span
                      className={`mb-2 inline-flex h-14 w-20 items-center justify-center rounded-full border ${
                        lead
                          ? "border-giallo/35 bg-giallo/6 text-giallo"
                          : "border-pearl/40 bg-pearl/10 text-pearl"
                      }`}
                    >
                      <Icon id={id} className="size-7" />
                    </span>
                    <h3 className="t-heading leading-tight">
                      {p(`steps.items.${id}.title`)}
                    </h3>
                    <p className={`t-body ${lead ? "text-muted" : "text-pearl/90"}`}>
                      {p(`steps.items.${id}.body`)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- sectors, then the closing ask ---------- */}
      <section className="section bg-pearl text-ink">
        <div className="wrap">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <h2 className="t-display max-w-[22ch] text-balance">
                {p("sectors.title")}
              </h2>
              <p className="t-body mt-5 text-lg text-muted">{p("sectors.lede")}</p>
            </div>
            <ul className="flex flex-wrap content-start gap-2.5 lg:col-span-7 lg:pt-2">
              {sectors.map((id) => (
                <li
                  key={id}
                  className="rounded-full border border-giallo/35 px-4 py-2.5 text-base uppercase leading-tight sm:px-5 sm:py-3 sm:text-lg"
                >
                  {p(`sectors.items.${id}`)}
                </li>
              ))}
            </ul>
          </div>

          <div className="biz-panel mt-16 grid gap-8 bg-giallo-deep p-6 text-pearl sm:p-10 lg:mt-24 lg:grid-cols-12 lg:items-end lg:p-14">
            <div className="lg:col-span-8">
              <h2 className="t-display-lg max-w-[16ch] text-balance">
                {p("closing.title")}
              </h2>
              <p className="mt-5 max-w-[52ch] text-lg leading-relaxed tracking-normal text-pearl/90">
                {p("closing.body")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <ButtonAnchor href={demoHref} variant="white">
                {p("cta")}
              </ButtonAnchor>
              <ButtonAnchor
                href={site.phoneHref}
                variant="outlined"
                arrow={false}
                className="border-pearl/60"
              >
                {p("call")}
              </ButtonAnchor>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
