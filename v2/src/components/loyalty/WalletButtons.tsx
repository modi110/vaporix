"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * "Add to Apple Wallet" and "Add to Google Wallet".
 *
 * The passes themselves are not built yet: they need an Apple Developer
 * account and a Google Wallet issuer account (see `loyalty system/STATUS.md`).
 * Until then a tap shows a short "coming soon" note instead of failing.
 *
 * When the accounts exist, give each button an `href` to the pass-making
 * route and delete the note. Replace these plain buttons with the platforms'
 * official badge artwork before launch: Apple and Google both publish
 * brand rules for the "Add to Wallet" badge.
 */
export function WalletButtons() {
  const t = useTranslations("card");
  const [shown, setShown] = useState(false);

  return (
    <section aria-labelledby="wallet-title" className="grid w-full max-w-[360px] gap-3">
      <h2 id="wallet-title" className="text-center text-sm font-semibold text-[#2b3a52]">
        {t("walletTitle")}
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <WalletButton label={t("walletApple")} onClick={() => setShown(true)}>
          <AppleGlyph />
        </WalletButton>
        <WalletButton label={t("walletGoogle")} onClick={() => setShown(true)}>
          <GoogleGlyph />
        </WalletButton>
      </div>

      <p role="status" className="min-h-5 text-center text-sm text-[#2b3a52]">
        {shown ? t("walletSoon") : ""}
      </p>
    </section>
  );
}

function WalletButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-[#0b0b0c] px-5 text-[0.95rem] font-semibold text-white transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
    >
      {children}
      {label}
    </button>
  );
}

function AppleGlyph() {
  return (
    // A plain wallet, not Apple's logo: the logo belongs to the official badge.
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 7.5A2 2 0 0 1 5.500 5.500H18.500a1 1 0 0 1 1 1v2" />
      <path d="M3.500 7.500v10a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-3" />
      <path d="M20.500 9.500h-4a2.500 2.500 0 0 0 0 5h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5Z" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.300-.2-1.900H12v3.600h5.400c-.2 1.200-.9 2.300-2 3v2.500h3.200c1.900-1.700 3-4.300 3-7.200Z" />
      <path fill="#34A853" d="M12 22c2.700 0 5-.9 6.600-2.500l-3.200-2.500c-.9.600-2 1-3.400 1-2.600 0-4.800-1.800-5.600-4.100H3.100v2.600C4.700 19.700 8 22 12 22Z" />
      <path fill="#FBBC05" d="M6.400 14c-.2-.6-.3-1.300-.3-2s.1-1.400.3-2V7.400H3.100C2.400 8.800 2 10.300 2 12s.4 3.200 1.100 4.600L6.400 14Z" />
      <path fill="#EA4335" d="M12 6c1.500 0 2.800.5 3.900 1.500l2.800-2.800C17 3.100 14.700 2 12 2 8 2 4.700 4.300 3.100 7.400L6.400 10C7.200 7.700 9.400 6 12 6Z" />
    </svg>
  );
}
