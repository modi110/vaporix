import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LoyaltyPass } from "@/components/loyalty/LoyaltyPass";
import { getCardState } from "@/lib/loyalty/service";
import { renderQrSvg } from "@/lib/loyalty/qr";

/**
 * The customer's card.
 *
 * Rendered fresh on every request: the count changes while the customer is
 * standing at the counter, and a cached 4/5 shown to staff who just recorded
 * the fifth wash would be worse than useless.
 */
export const dynamic = "force-dynamic";

/**
 * The URL carries the QR token, so it is a bearer link — anyone holding it
 * sees this page. That is acceptable (the token can only ever *earn* visits;
 * redeeming one needs authenticated staff), but it must never be indexed.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function CardPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  const state = await getCardState(token);
  if (!state) notFound();

  const t = await getTranslations({ locale, namespace: "card" });

  if (!state.active) {
    return (
      <div className="pass-page">
        <p className="pass-page__hint">{t("inactive")}</p>
      </div>
    );
  }

  const qrSvg = await renderQrSvg(state.qrToken);
  const remaining = state.visitsRequired - state.visits;

  // The reward comes from the database, so naming it in the status line costs
  // nothing when the offer changes.
  const reward = locale === "en" ? state.rewardLabelEn : state.rewardLabelEs;

  // `rich` rather than `t`: the card sets the count and the reward in blue, and
  // where the emphasis falls differs per language, so the markup belongs in the
  // translation and not in a sentence stitched together here.
  const emphasis = { b: (chunks: React.ReactNode) => <b>{chunks}</b> };

  let status: React.ReactNode;
  if (state.rewardAvailable) {
    status = t.rich("ready", { ...emphasis, reward });
  } else if (remaining === 1) {
    status = t.rich("remainingOne", { ...emphasis, reward });
  } else {
    status = t.rich("remainingMany", { ...emphasis, count: remaining, reward });
  }

  return (
    <div className="pass-page">
      <LoyaltyPass
        state={state}
        qrSvg={qrSvg}
        copy={{
          washesLabel: t("washesLabel"),
          status,
          customerLabel: t("customerLabel"),
        }}
      />
      {/* TODO(wallet): "add this to your home screen" is the right advice
          only while the web page IS the card. Once the Google and Apple
          Wallet buttons ship, this line must be replaced by them — telling
          someone to bookmark a page when they could hold a real pass is
          worse than saying nothing. See `card.saveHint` in messages/. */}
      <p className="pass-page__hint">{t("saveHint")}</p>
    </div>
  );
}
