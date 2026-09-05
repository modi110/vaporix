"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SplitText } from "@/components/ui/SplitText";
import { PillLink } from "@/components/ui/PillButton";
import { VehicleArt } from "@/components/ui/VehicleArt";
import {
  vehicles,
  getVehicle,
  startingPrice,
  type Vehicle,
  type VehicleId,
} from "@/content/vehicles";

/**
 * Pricing starts from the vehicle, because size is the thing a customer
 * already knows and the thing that drives the number.
 *
 * Two shapes for one interaction. On a phone the brackets are a single
 * column, so the board opens inline directly under the card you tapped and
 * you never lose your place. From `sm` up the cards sit in a grid where
 * "under it" has no meaning, so one shared board sits below the whole set.
 * Only one of the two is ever in the document: the other is `display: none`,
 * which keeps it out of the accessibility tree as well as off the screen.
 *
 * Note on the reveals: `data-reveal` sits on a wrapper React never re-renders.
 * The reveal class is added straight to the DOM by GSAP, so putting it on an
 * element whose className React also owns would wipe it on the next state
 * change — and the card would vanish back to opacity 0.
 */
export function Services() {
  const v = useTranslations("vehicles");
  const [selected, setSelected] = useState<VehicleId>("urbano");

  const vehicle = getVehicle(selected);

  return (
    <section className="section" id="services">
      <div
        aria-hidden="true"
        className="glow-vapor pointer-events-none absolute -right-[18%] top-[10%] size-[720px] rounded-full"
        data-speed="0.88"
      />

      <div className="wrap">
        <header className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <p className="t-label mb-6" data-reveal>
              {v("label")}
            </p>
            <h2 className="t-h2" data-split>
              <SplitText text={v("title")} />
            </h2>
          </div>
          <p className="t-lede" data-reveal>
            {v("lede")}
          </p>
        </header>

        {/* the four brackets */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {vehicles.map((item, i) => {
            const on = item.id === selected;
            return (
              <div
                key={item.id}
                data-reveal
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                {/*
                  Two shapes again. A phone gets a compact row — art, name,
                  price, all on one line — because five tall cards would put
                  the packages three screens below the fold. From `sm` the
                  card stands up and the examples come back.
                */}
                <button
                  type="button"
                  onClick={() => setSelected(item.id)}
                  aria-pressed={on}
                  className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-card border p-4 text-left transition-colors duration-400 sm:block sm:h-full sm:p-6 ${
                    on
                      ? "border-vapor/60 bg-surface-2"
                      : "border-hairline bg-surface hover:border-hairline-strong"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-x-0 -top-1/2 aspect-square bg-[radial-gradient(circle,rgba(var(--vapor-rgb),.16),transparent_62%)] transition-opacity duration-500 ${
                      on ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                    }`}
                  />

                  <VehicleArt
                    id={item.id}
                    className={`relative h-12 w-20 shrink-0 transition-colors duration-400 sm:h-24 sm:w-full ${
                      on ? "text-vapor-ink" : "text-muted group-hover:text-ink"
                    }`}
                  />

                  <span className="relative min-w-0 flex-1 sm:mt-5 sm:block">
                    <span className="block text-lg font-medium tracking-[-0.02em]">
                      {v(`items.${item.id}.name`)}
                    </span>
                    {/* two lines reserved so every price row shares a baseline */}
                    <span className="t-label mt-2 hidden min-h-[2.9em] normal-case tracking-[0.04em] text-muted-dim sm:block">
                      {v(`items.${item.id}.examples`)}
                    </span>
                  </span>

                  <span className="relative flex shrink-0 items-baseline gap-2 sm:mt-5 sm:border-t sm:border-hairline sm:pt-4">
                    <span className="t-label hidden sm:inline">
                      {v("from")}
                    </span>
                    <span
                      className={`font-mono text-lg font-medium tabular-nums transition-colors duration-400 sm:text-xl ${
                        on ? "text-vapor-ink" : "text-ink"
                      }`}
                    >
                      {startingPrice(item)} €
                    </span>
                  </span>

                  {/*
                    Selection must not rest on colour alone. On a phone the
                    card is one short row, so a corner badge would land on the
                    price; there the tick joins the row instead.
                  */}
                  <span
                    aria-hidden="true"
                    className={`relative grid size-5 shrink-0 place-items-center rounded-full transition-all duration-300 sm:absolute sm:right-5 sm:top-5 sm:size-6 ${
                      on
                        ? "scale-100 bg-vapor text-on-accent opacity-100"
                        : "scale-75 bg-transparent opacity-0"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-3 sm:size-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                </button>

                {/* phone only: the chosen bracket opens where it was tapped */}
                {on ? (
                  <div className="mt-3 sm:hidden">
                    <PackageBoard vehicle={item} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* from sm up: one board under the whole set */}
        <div className="mt-16 hidden sm:block">
          <PackageBoard vehicle={vehicle} />
        </div>
      </div>
    </section>
  );
}

function PackageBoard({ vehicle }: { vehicle: Vehicle }) {
  const t = useTranslations("services");
  const v = useTranslations("vehicles");

  return (
    <>
      <p className="t-label mb-5">
        {v("choose")} · {v(`items.${vehicle.id}.name`)}
      </p>

      {/* keyed on the bracket so the cards remount and re-run their
          entrance every time the selection changes */}
      <div key={vehicle.id} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vehicle.packages.map((pkg, i) => (
          <article
            key={pkg.id}
            style={{
              animation: `vaporix-row-in .55s var(--ease-out-expo) ${i * 90}ms both`,
            }}
            className={`relative flex flex-col gap-4 overflow-hidden rounded-card border p-6 sm:gap-5 sm:p-7 ${
              pkg.featured
                ? "border-vapor/50 bg-surface-2"
                : "border-hairline bg-surface"
            }`}
          >
            {pkg.featured ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[-60%] aspect-square w-[130%] -translate-x-1/2 bg-[radial-gradient(circle,rgba(var(--vapor-rgb),.15),transparent_62%)]"
              />
            ) : null}

            <div className="relative flex items-baseline justify-between gap-4">
              <h3 className="text-lg font-medium tracking-[-0.02em]">
                {v(`packages.${pkg.id}.name`)}
              </h3>
              <b className="shrink-0 font-mono text-2xl font-medium tabular-nums text-vapor-ink">
                {pkg.price} €
              </b>
            </div>

            <p className="t-lede relative text-sm">
              {v(`packages.${pkg.id}.desc`)}
            </p>

            <PillLink
              href="/book"
              variant={pkg.featured ? "solid" : "ghost"}
              size="sm"
              className="relative mt-auto self-start"
            >
              {t("cta")}
            </PillLink>
          </article>
        ))}
      </div>
    </>
  );
}
