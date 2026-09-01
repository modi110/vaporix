import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useFormatter, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { SplitText } from "@/components/ui/SplitText";
import { PillLink } from "@/components/ui/PillButton";
import { VehicleArt } from "@/components/ui/VehicleArt";
import { CtaBand } from "@/components/sections/CtaBand";
import { account } from "@/content/account";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.account" });
  return {
    title: `${t("title")} — Vaporix`,
    description: t("lede"),
    // Nothing here should ever reach a search result once it holds real data.
    robots: { index: false, follow: false },
  };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Account />;
}

function Account() {
  const p = useTranslations("pages.account");
  const v = useTranslations("vehicles");
  const format = useFormatter();

  const { name, stampsEarned, stampsNeeded, visits } = account;
  const complete = stampsEarned >= stampsNeeded;

  return (
    <>
      <header className="section relative pb-0 pt-[clamp(9rem,16vw,14rem)]">
        <div
          aria-hidden="true"
          className="glow-vapor pointer-events-none absolute -left-[10%] -top-[10%] size-[620px] rounded-full"
          data-speed="0.88"
        />

        <div className="wrap relative grid gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-end lg:gap-20">
          <div>
            <p className="t-label mb-6" data-reveal>
              {p("label")}
            </p>
            <h1 className="t-h1 max-w-[14ch]" data-split>
              <SplitText text={p("greeting", { name })} />
            </h1>
            <p className="t-lede mt-7 max-w-[46ch]" data-reveal>
              {p("lede")}
            </p>
          </div>

          <StampCard
            earned={stampsEarned}
            needed={stampsNeeded}
            complete={complete}
          />
        </div>
      </header>

      <section className="section-under-header">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
            <div>
              <h2 className="t-h2">{p("visitsTitle")}</h2>
              <p className="t-lede mt-3 max-w-[42ch]">{p("visitsLede")}</p>
            </div>
            <PillLink href="/book" variant="ghost">
              {p("book")}
            </PillLink>
          </div>

          {visits.length === 0 ? (
            <p className="t-lede mt-12">{p("empty")}</p>
          ) : (
            <ol className="mt-12 grid gap-4">
              {visits.map((visit, i) => (
                <li
                  key={visit.id}
                  data-reveal
                  style={{ transitionDelay: `${i * 70}ms` }}
                >
                  <article className="grid gap-7 rounded-card border border-hairline bg-surface p-7 md:grid-cols-[0.32fr_1fr] md:items-start md:gap-10">
                    <div className="grid gap-4">
                      <VehicleArt
                        id={visit.vehicle}
                        className="h-16 w-full max-w-[168px] text-muted"
                      />
                      <div>
                        <p className="font-medium">
                          {v(`items.${visit.vehicle}.name`)}
                        </p>
                        <p className="t-label mt-1.5 normal-case tracking-[0.04em] text-muted-dim">
                          {v(`packages.${visit.package}.name`)}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-hairline pb-4">
                        <time
                          dateTime={visit.date}
                          className="font-mono text-sm tabular-nums text-muted"
                        >
                          {format.dateTime(new Date(visit.date), {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </time>
                        <span className="font-mono tabular-nums text-vapor">
                          {visit.price} €
                        </span>
                      </div>

                      <div className="grid gap-3">
                        <h3 className="t-label">{p("included")}</h3>
                        <ul className="flex flex-wrap gap-2">
                          {visit.tasks.map((task) => (
                            <li
                              key={task}
                              className="flex items-center gap-2 rounded-pill border border-hairline px-3.5 py-1.5 text-[0.8125rem] text-muted"
                            >
                              <Tick className="size-3 shrink-0 text-vapor" />
                              {p(`tasks.${task}`)}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <p className="t-label text-muted-dim">
                        {p("bay")} {String(visit.bay).padStart(2, "0")}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          )}

          <p className="t-lede mt-10 max-w-[54ch] text-sm text-muted-dim" data-reveal>
            {p("demoNote")}
          </p>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

/**
 * The loyalty card.
 *
 * The rail behind the stamps is two stacked bars rather than a gradient: a
 * hairline track the full width, and a cyan fill sized to the stamps already
 * earned. That keeps the progress readable without relying on colour alone —
 * every earned stamp also carries a tick and its own "earned" label for
 * screen readers.
 */
function StampCard({
  earned,
  needed,
  complete,
}: {
  earned: number;
  needed: number;
  complete: boolean;
}) {
  const p = useTranslations("pages.account");
  const stamps = Array.from({ length: needed }, (_, i) => i + 1);
  // The rail spans centre-to-centre, so the fill is measured between stamps.
  const fill = needed > 1 ? Math.min(earned - 1, needed - 1) / (needed - 1) : 1;

  return (
    <div
      data-reveal
      className="grid gap-8 rounded-card border border-vapor/35 bg-surface-2 p-8"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="t-label">{p("progressLabel")}</h2>
        <p className="font-mono tabular-nums text-vapor">
          {earned}/{needed}
        </p>
      </div>

      <ol className="relative flex items-start justify-between">
        <span
          aria-hidden="true"
          className="absolute left-7 right-7 top-7 h-px -translate-y-1/2 bg-hairline"
        />
        <span
          aria-hidden="true"
          className="absolute left-7 top-7 h-px -translate-y-1/2 bg-vapor transition-[width] duration-700"
          style={{ width: `calc((100% - 3.5rem) * ${Math.max(fill, 0)})` }}
        />

        {stamps.map((n) => {
          const done = n <= earned;
          return (
            <li key={n} className="relative grid w-14 justify-items-center gap-3">
              <span
                className={`grid size-14 place-items-center rounded-full border transition-colors duration-500 ${
                  done
                    ? "border-vapor bg-vapor text-on-accent"
                    : "border-dashed border-hairline-strong bg-surface text-muted-dim"
                }`}
              >
                {done ? (
                  <Tick className="size-5" />
                ) : (
                  <span className="font-mono text-sm tabular-nums">{n}</span>
                )}
              </span>
              <span className="sr-only">
                {p("stamp", { n })} — {done ? p("stampEarned") : p("stampPending")}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="text-sm text-muted">
        {complete
          ? p("progressDone")
          : p("progressNote", { earned, total: needed })}
      </p>

      <div className="grid gap-2 border-t border-hairline pt-6">
        <h3 className="t-label text-vapor">{p("rewardTitle")}</h3>
        <p className="text-sm text-muted">{p("rewardDesc")}</p>
      </div>
    </div>
  );
}

function Tick({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12.5 4.6 4.5L19 7" />
    </svg>
  );
}
