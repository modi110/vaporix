import { useLocale, useTranslations } from "next-intl";

/**
 * "Add to Apple Wallet" and "Add to Google Wallet".
 *
 * Google's badge is Google's official artwork (`public/images/wallet/`, from
 * the Wallet brand guidelines download: es-ES and en-GB "wallet-button"). Its
 * shape, colours and padding must not be altered, and it must not be smaller
 * than the other buttons, so it is shown at full width, never cropped.
 *
 * Apple's badge is still a drawn stand-in, a picture only. Apple forbids
 * making your own version, so swap in the official artwork (it comes with
 * the Developer Program) before Apple Wallet goes live.
 */
export function WalletButtons({
  children,
  appleHref,
  googleHref,
}: {
  /** Extra items after the two badges, in the same grid. */
  children?: React.ReactNode;
  /** When set, the Apple badge is a real link that downloads the pass. */
  appleHref?: string;
  /** When set, the Google badge is a real link that saves the pass. */
  googleHref?: string;
}) {
  const t = useTranslations("card");

  return (
    <section aria-label={t("walletTitle")} className="grid w-full max-w-[360px] gap-3">
      <div className="grid gap-3">
        <Badge small={t("walletAddTo")} big="Apple Wallet" href={appleHref}>
          <AppleWalletIcon />
        </Badge>
        <GoogleBadge label={`${t("walletAddTo")} Google Wallet`} href={googleHref} />
        {children}
      </div>
    </section>
  );
}

function Badge({
  small,
  big,
  children,
  href,
}: {
  small: string;
  big: string;
  children: React.ReactNode;
  href?: string;
}) {
  const className =
    "flex min-h-14 select-none items-center justify-center gap-3 rounded-xl border border-[#a6a6a6] bg-black px-4 py-2 text-left text-white";
  const label = (
    <span aria-hidden="true" className="grid leading-none">
      <span className="text-[0.8rem] tracking-normal text-white/90">{small}</span>
      <span className="mt-1 text-[1.25rem] font-medium tracking-normal">{big}</span>
    </span>
  );

  // A plain <a>, not next/link: the target is an API route that redirects to
  // Google, so there is no page for the router to prefetch.
  if (href) {
    return (
      <a href={href} aria-label={`${small} ${big}`} className={className}>
        {children}
        {label}
      </a>
    );
  }
  return (
    <div role="img" aria-label={`${small} ${big}`} className={className}>
      {children}
      {label}
    </div>
  );
}

/** Stacked colored cards over a pale wallet, the way Apple's icon reads. */
function AppleWalletIcon() {
  return (
    <svg viewBox="0 0 44 36" aria-hidden="true" className="h-9 w-11 shrink-0">
      <rect x="4" y="1" width="36" height="12" rx="4" fill="#3aa0e6" />
      <rect x="4" y="5" width="36" height="12" rx="4" fill="#5cc45e" />
      <rect x="4" y="9" width="36" height="12" rx="4" fill="#f5c843" />
      <rect x="4" y="13" width="36" height="12" rx="4" fill="#f58a3c" />
      <rect x="4" y="17" width="36" height="12" rx="4" fill="#ee5a52" />
      <path
        d="M2 21a4 4 0 0 1 4-4h32a4 4 0 0 1 4 4v9a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5Z"
        fill="#dcd7ca"
      />
      <path d="M17 17h10a5 5 0 0 1-10 0Z" fill="#ee5a52" />
    </svg>
  );
}

/**
 * Google's official "Add to Google Wallet" button, untouched. Full width of
 * the grid keeps it at least as large as the Apple badge beside it.
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
