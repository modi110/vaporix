import { useTranslations } from "next-intl";

/**
 * "Add to Apple Wallet" and "Add to Google Wallet", as a picture only.
 *
 * These are not buttons: nothing happens when they are tapped. The passes are
 * not built yet (they need an Apple Developer account and a Google Wallet
 * issuer account, see `loyalty system/STATUS.md`), so for now they only show
 * where the badges will go.
 *
 * The look follows Apple's wallet buttons: black, thin light border, the
 * wallet icon on the left, a small "Add to" over the big product name. The
 * icons are drawn stand-ins, not the platforms' artwork. Apple and Google
 * both forbid making your own version of their badge, so before launch
 * replace each one with the official artwork (Apple's comes with the
 * Developer Program, Google's is a free download) and turn it into a real
 * link to the pass route.
 */
export function WalletButtons() {
  const t = useTranslations("card");

  return (
    <section aria-labelledby="wallet-title" className="grid w-full max-w-[360px] gap-3">
      <h2 id="wallet-title" className="text-center text-sm font-semibold text-[#2b3a52]">
        {t("walletTitle")}
      </h2>

      <div className="grid gap-3">
        <Badge small={t("walletAddTo")} big="Apple Wallet">
          <AppleWalletIcon />
        </Badge>
        <Badge small={t("walletAddTo")} big="Google Wallet">
          <GoogleWalletIcon />
        </Badge>
      </div>
    </section>
  );
}

function Badge({
  small,
  big,
  children,
}: {
  small: string;
  big: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="img"
      aria-label={`${small} ${big}`}
      className="flex min-h-14 select-none items-center justify-center gap-3.5 rounded-xl border border-[#a6a6a6] bg-black px-5 py-2 text-left text-white"
    >
      {children}
      <span aria-hidden="true" className="grid leading-none">
        <span className="text-[0.8rem] tracking-normal text-white/90">{small}</span>
        <span className="mt-1 text-[1.4rem] font-medium tracking-normal">{big}</span>
      </span>
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

/** A wallet in Google's four colors. */
function GoogleWalletIcon() {
  return (
    <svg viewBox="0 0 44 36" aria-hidden="true" className="h-9 w-11 shrink-0">
      <rect x="3" y="3" width="38" height="30" rx="6" fill="#4285f4" />
      <path d="M3 9a6 6 0 0 1 6-6h12v10H3Z" fill="#ea4335" />
      <path d="M21 3h14a6 6 0 0 1 6 6v4H21Z" fill="#fbbc05" />
      <path d="M3 23h38v4a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6Z" fill="#34a853" />
      <circle cx="32" cy="18" r="4" fill="#fff" />
    </svg>
  );
}
