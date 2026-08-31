"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SplitText } from "@/components/ui/SplitText";
import { PillLink } from "@/components/ui/PillButton";
import { VehicleArt } from "@/components/ui/VehicleArt";
import { vehicles, servicesFor, startingPrice, type VehicleId } from "@/content/vehicles";

/**
 * Pricing starts from the vehicle, because that is the first thing a customer
 * knows and the thing that actually drives the number. Pick a bracket and the
 * whole service board re-prices against it.
 */
export function Services() {
  const t = useTranslations("services");
  const v = useTranslations("vehicles");
  const [selected, setSelected] = useState<VehicleId>("urbano");

  const vehicle = vehicles.find((x) => x.id === selected) ?? vehicles[1];
  const rows = servicesFor(vehicle);

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
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item.id)}
                aria-pressed={on}
                data-reveal
                style={{ transitionDelay: `${i * 70}ms` }}
                className={`group relative overflow-hidden rounded-card border p-6 text-left transition-colors duration-400 ${
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
                  {/* reserve two lines so every card's price row shares a baseline */}
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
            );
          })}
        </div>

        {/* the board, re-priced for the chosen bracket */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]" data-reveal>
          <div className="rounded-card border border-hairline bg-surface p-[clamp(1.4rem,2.2vw,2rem)]">
            <p className="t-label mb-5">
              {v("includes")} · {v(`items.${vehicle.id}.name`)}
            </p>
            <ul>
              {rows.map((row, i) => (
                <li
                  key={row.slug}
                  className="flex items-baseline justify-between gap-4 border-b border-hairline py-3 last:border-b-0"
                  style={{
                    animation: `vaporix-row-in .45s var(--ease-out-expo) ${i * 45}ms both`,
                  }}
                >
                  <span className="text-sm">{t(`items.${row.slug}.name`)}</span>
                  <span className="flex shrink-0 items-baseline gap-4">
                    <span className="t-label hidden sm:block">
                      {t("minutes", { count: row.minutes })}
                    </span>
                    <b className="w-20 text-right font-mono font-medium tabular-nums text-vapor">
                      {row.price} €
                    </b>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex flex-col justify-between gap-8 overflow-hidden rounded-card border border-hairline bg-surface p-[clamp(1.4rem,2.2vw,2rem)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[-55%] aspect-square w-[130%] -translate-x-1/2 bg-[radial-gradient(circle,rgba(var(--vapor-rgb),.14),transparent_62%)]"
            />
            <div className="relative">
              <VehicleArt id={vehicle.id} className="h-28 w-full text-vapor" />
              <p className="t-label mt-6">{t("label")}</p>
              <p className="t-lede mt-3 text-sm">{t("lede")}</p>
            </div>
            <PillLink href="/contact" className="relative self-start">
              {t("cta")}
            </PillLink>
          </div>
        </div>
      </div>
    </section>
  );
}
