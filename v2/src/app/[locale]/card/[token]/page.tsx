import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LoyaltyPass } from "@/components/loyalty/LoyaltyPass";
import { getCardState, isCelebrating } from "@/lib/loyalty/service";
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
 * The URL carries the QR token, so it is a bearer link: anyone holding it
 * holds the card, free wash included, because showing the QR at the counter
 * is all redeeming takes. It is only ever handed out once, at registration,
 * and must never be indexed.
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

  // Only worth asking once the card is back at zero: any other count means
  // the customer has already started the next cycle, and the finished row
  // would be a lie.
  const celebrating =
    state.visits === 0 && !state.rewardAvailable && (await isCelebrating(token));

  let status: React.ReactNode;
  if (celebrating) {
    status = t.rich("congrats", emphasis);
  } else if (state.rewardAvailable) {
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
        celebrating={celebrating}
        copy={{
          washesLabel: t("washesLabel"),
          status,
          customerLabel: t("customerLabel"),
        }}
      />
      {/* TODO(wallet): the Google and Apple Wallet buttons go here. */}
    </div>
  );
}
