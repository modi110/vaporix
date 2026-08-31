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
  type VehicleId,
} from "@/content/vehicles";

/**
 * Pricing starts from the vehicle, because size is the thing a customer
 * already knows and the thing that drives the number. Pick a bracket and the
 * packages below swap to that bracket's board.
 *
 * Note on the reveals: `data-reveal` sits on a wrapper React never re-renders.
 * The reveal class is added straight to the DOM by GSAP, so putting it on an
 * element whose className React also owns would wipe it on the next state
 * change — and the card would vanish back to opacity 0.
 */
export function Services() {
  const t = useTranslations("services");
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
        <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {vehicles.map((item, i) => {
            const on = item.id === selected;
            return (
              <div
                key={item.id}
                data-reveal
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <button
                  type="button"
                  onClick={() => setSelected(item.id)}
                  aria-pressed={on}
                  className={`group relative h-full w-full overflow-hidden rounded-card border p-6 text-left transition-colors duration-400 ${
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
                    className={`relative h-24 w-full transition-colors duration-400 ${
                      on ? "text-vapor" : "text-muted group-hover:text-ink"
                    }`}
                  />

                  <span className="relative mt-5 block">
                    <span className="block text-lg font-medium tracking-[-0.02em]">
                      {v(`items.${item.id}.name`)}
                    </span>
                    {/* two lines reserved so every price row shares a baseline */}
                    <span className="t-label mt-2 block min-h-[2.9em] normal-case tracking-[0.04em] text-muted-dim">
                      {v(`items.${item.id}.examples`)}
                    </span>
                  </span>

                  <span className="relative mt-5 flex items-baseline gap-2 border-t border-hairline pt-4">
                    <span className="t-label">{v("from")}</span>
                    <span
                      className={`font-mono text-xl font-medium tabular-nums transition-colors duration-400 ${
                        on ? "text-vapor" : "text-ink"
                      }`}
                    >
                      {startingPrice(item)} €
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* packages for the chosen bracket */}
        <div className="mt-16">
          <p className="t-label mb-6">
            {v("choose")} · {v(`items.${vehicle.id}.name`)}
          </p>

          {/* keyed on the bracket so the cards remount and re-run their
              entrance every time the selection changes */}
          <div
            key={vehicle.id}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {vehicle.packages.map((pkg, i) => (
              <article
                key={pkg.id}
                style={{
                  animation: `vaporix-row-in .55s var(--ease-out-expo) ${i * 90}ms both`,
                }}
                className={`relative flex flex-col gap-5 overflow-hidden rounded-card border p-7 ${
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
                  <b className="shrink-0 font-mono text-2xl font-medium tabular-nums text-vapor">
                    {pkg.price} €
                  </b>
                </div>

                <p className="relative t-lede text-sm">
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
        </div>
      </div>
    </section>
  );
}
