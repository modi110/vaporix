import { useLocale, useTranslations } from "next-intl";

/**
 * "Add to Google Wallet", the only way the card is offered after signup.
 *
 * Google's badge is Google's official artwork (`public/images/wallet/`, from
 * the Wallet brand guidelines download: es-ES and en-GB "wallet-button"). Its
 * shape, colours and padding must not be altered, so it is shown at full
 * width, never cropped.
 */
export function WalletButtons({
  googleHref,
}: {
  /** When set, the Google badge is a real link that saves the pass. */
  googleHref?: string;
}) {
  const t = useTranslations("card");

  return (
    <section aria-label={t("walletTitle")} className="grid w-full max-w-[360px] gap-3">
      <GoogleBadge label={`${t("walletAddTo")} Google Wallet`} href={googleHref} />
    </section>
  );
}

/**
 * Google's official "Add to Google Wallet" button, untouched.
 */
function GoogleBadge({ label, href }: { label: string; href?: string }) {
  const locale = useLocale();
  const img = (
    // A plain <img>: next/image would add nothing to a small static SVG.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/wallet/google-wallet-add-${locale === "es" ? "es" : "en"}.svg`}
      alt={label}
      className="h-auto w-full"
    />
  );
  // A plain <a>, not next/link: the target is an API route that redirects to
  // Google, so there is no page for the router to prefetch.
  return href ? (
    <a href={href} className="block rounded-full">
      {img}
    </a>
  ) : (
    <div>{img}</div>
  );
}
