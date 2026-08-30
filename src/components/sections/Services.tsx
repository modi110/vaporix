"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SplitText } from "@/components/ui/SplitText";
import { PillLink } from "@/components/ui/PillButton";
import { services } from "@/content/services";
import { tiers } from "@/content/pricing";

/**
 * Three columns, following the reference: the pitch on the left, the full
 * service list in the middle rendered grey with only the active row in accent,
 * and the tabbed price card on the right.
 */
export function Services() {
  const t = useTranslations("services");
  const p = useTranslations("pricing");
  const [tier, setTier] = useState(0);
  const [active, setActive] = useState(services[0].slug);

  const current = services.find((s) => s.slug === active) ?? services[0];

  return (
    <section className="section" id="services">
      <div
        aria-hidden="true"
        className="glow-vapor pointer-events-none absolute -right-[18%] top-[14%] size-[720px] rounded-full"
        data-speed="0.88"
      />

      <div className="wrap grid gap-[clamp(2.5rem,4vw,3.5rem)] lg:grid-cols-[0.9fr_1.1fr_0.95fr] lg:items-start">
        <div>
          <p className="t-label mb-6" data-reveal>
            {t("label")}
          </p>
          <h2 className="t-h2" data-split>
            <SplitText text={t("title")} />
          </h2>
          <p className="t-lede mt-6" data-reveal>
            {t("lede")}
          </p>
          <div className="mt-8" data-reveal>
            <PillLink href="/contact">{t("cta")}</PillLink>
          </div>
        </div>

        <div>
          <ul className="grid">
            {services.map((s, i) => {
              const on = s.slug === active;
              return (
                <li key={s.slug} className="border-b border-hairline" data-reveal
                    style={{ transitionDelay: `${i * 55}ms` }}>
                  <Link
                    href={{ pathname: "/services/[slug]", params: { slug: s.slug } }}
                    onMouseEnter={() => setActive(s.slug)}
                    onFocus={() => setActive(s.slug)}
                    className={`flex w-full items-center gap-3 py-3.5 text-left text-[clamp(0.75rem,0.95vw,0.8125rem)] font-medium uppercase tracking-[0.09em] transition-[color,padding] duration-300 ${
                      on ? "pl-1 text-vapor" : "text-muted hover:text-vapor"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-px shrink-0 bg-vapor transition-[width] duration-300 ${
                        on ? "w-4.5" : "w-0"
                      }`}
                    />
                    {t(`items.${s.slug}.name`)}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* the hovered service explains itself, so the list is not just a list */}
          <p className="t-lede mt-6 min-h-[3.5em] text-sm" aria-live="polite">
            {t(`items.${current.slug}.short`)}
          </p>
        </div>

        <div
          data-reveal
          className="relative overflow-hidden rounded-card border border-hairline bg-surface p-[clamp(1.4rem,2.2vw,2rem)]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[-60%] aspect-square w-[130%] -translate-x-1/2 bg-[radial-gradient(circle,rgba(var(--vapor-rgb),.14),transparent_62%)]"
          />

          <div
            role="tablist"
            aria-label={p("label")}
            className="relative z-[1] flex gap-0.5 rounded-pill border border-hairline bg-white/5 p-1"
          >
            {tiers.map((tr, i) => (
              <button
                key={tr.id}
                type="button"
                role="tab"
                aria-selected={i === tier}
                onClick={() => setTier(i)}
                className={`flex-1 rounded-pill px-2 py-2.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 ${
                  i === tier ? "bg-ink text-void" : "text-muted hover:text-ink"
                }`}
              >
                {p(`tiers.${tr.id}.name`)}
              </button>
            ))}
          </div>

          <div className="relative z-[1] mt-6">
            {tiers[tier].rows.map((row, i) => (
              <div
                key={row.key}
                className="flex items-baseline justify-between gap-4 border-b border-hairline py-2.5 text-sm last:border-b-0"
                style={{
                  animation: `vaporix-row-in .5s var(--ease-out-expo) ${i * 55}ms both`,
                }}
              >
                <span className="text-ink">{p(`rows.${row.key}`)}</span>
                <b className="whitespace-nowrap font-mono font-medium tabular-nums text-vapor">
                  {row.price} €
                </b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
