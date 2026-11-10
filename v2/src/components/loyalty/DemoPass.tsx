"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { LoyaltyPass, dialCopy } from "./LoyaltyPass";

/** Paid washes on the sample, matching the live programme's three. */
const TARGET = 3;
const STEP_MS = 520;

/**
 * The real card, filling itself in, for the pages that sell the programme.
 *
 * It is the product's best picture: the review found visitors were asked to
 * sign up before ever seeing what they would get. This shows it — the same
 * component the customer's own card uses, so the promise and the thing
 * cannot drift apart — stamping its way to the free wash.
 *
 * Plays once, when it first comes into view. Server-rendered empty, so with
 * no JavaScript it is still a whole card. With reduced motion it simply
 * appears full.
 *
 * The QR is real and points at the signup page: a visitor who scans the
 * sample with their camera lands exactly where they should.
 */
export function DemoPass({
  qrSvg,
  className = "",
}: {
  qrSvg: string;
  className?: string;
}) {
  const t = useTranslations("card");
  const l = useTranslations("loyalty.demo");
  const ref = useRef<HTMLDivElement>(null);
  const [visits, setVisits] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let timer: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        if (still) {
          setVisits(TARGET);
          return;
        }
        timer = window.setInterval(() => {
          setVisits((v) => {
            if (v + 1 >= TARGET) window.clearInterval(timer);
            return Math.min(v + 1, TARGET);
          });
        }, STEP_MS);
      },
      { threshold: 0.45 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  const full = visits >= TARGET;
  const reward = l("reward");
  const emphasis = { b: (chunks: React.ReactNode) => <b>{chunks}</b> };
  const remaining = TARGET - visits;

  const status = full
    ? t.rich("ready", emphasis)
    : remaining === 1
      ? t.rich("remainingOne", { ...emphasis, reward })
      : t.rich("remainingMany", { ...emphasis, count: remaining, reward });

  return (
    // One image to a screen reader: the sample is an illustration, and its
    // parts read aloud one by one would be noise.
    <div
      ref={ref}
      role="img"
      aria-label={l("alt")}
      className={`pass-live ${className}`}
    >
      <LoyaltyPass
        nameTag="p"
        state={{
          qrToken: "",
          cardNumber: "1234567",
          customerName: l("name"),
          visits,
          visitsRequired: TARGET,
          rewardAvailable: full,
          active: true,
          rewardLabelEs: reward,
          rewardLabelEn: reward,
        }}
        qrSvg={qrSvg}
        copy={{
          washesLabel: t("washesLabel"),
          status,
          customerLabel: t("customerLabel"),
          dial: dialCopy(t, {
            visits,
            visitsRequired: TARGET,
            rewardAvailable: full,
          }),
        }}
      />
    </div>
  );
}
