import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { LoyaltyPass } from "@/components/loyalty/LoyaltyPass";
import { WalletButtons } from "@/components/loyalty/WalletButtons";
import { getCardState, isCelebrating } from "@/lib/loyalty/service";
import { renderQrSvg } from "@/lib/loyalty/qr";
import { googleWallet } from "@/lib/wallet/google";

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
  searchParams,
}: {
  params: Promise<{ locale: string; token: string }>;
  searchParams: Promise<{ card?: string }>;
}) {
  const { locale, token } = await params;
  const { card: showCard } = await searchParams;
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

  // The card is meant to live in Apple Wallet and Google Wallet, not on the
  // site, so signup lands here: the two wallet badges first, and a third
  // button that opens the web card. TEMPORARY: the passes are not built yet,
  // so the web card is the only working card. Once they are, delete the
  // `view` button and the `?card=1` branch below.
  if (!showCard) {
    return (
      <div className="pass-page">
        <div className="grid max-w-[360px] gap-2 text-center">
          <h1 className="text-2xl font-bold text-[#0b1b36]">{t("readyTitle")}</h1>
          <p className="text-base text-[#2b3a52]">{t("readyBody")}</p>
        </div>
        <WalletButtons
          googleHref={
            googleWallet.isConfigured()
              ? `/api/wallet/google?token=${encodeURIComponent(token)}`
              : undefined
          }
        >
          <Link
            href={{ pathname: "/card/[token]", params: { token }, query: { card: "1" } }}
            className="flex min-h-14 items-center justify-center rounded-xl border border-[#005fd3] bg-white px-4 py-2 text-[1.05rem] font-semibold tracking-normal text-[#005fd3] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
          >
            {t("viewCard")}
          </Link>
        </WalletButtons>
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
    </div>
  );
}
