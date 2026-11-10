import type { LoyaltyState } from "@/lib/loyalty/types";

/**
 * What a wallet pass has to show, worked out once from the database state.
 *
 * The four states come from `loyalty system/wallet-design/README.md`. State 4
 * (free wash just redeemed) is the card at zero with a thank-you message, so
 * it cannot be told apart from a brand-new card by the count alone: the caller
 * says so with `justRedeemed`.
 */
export type PassView = {
  /** Which gauge image: 0 to 3. Index into `hero_N.png` / `strip_N.png`. */
  gauge: 0 | 1 | 2 | 3;
  /** "2/3" */
  washes: string;
  /** Row label next to the washes count. */
  remainingLabel: string;
  /** "1 más", or "¡GRATIS!" at state 3. */
  remaining: string;
  /** "4º gratis", or "Listo para usar" at state 3. */
  reward: string;
  /** Only set for states 3 and 4. Sent as a notification. */
  message: string | null;
  customerName: string;
  cardNumber: string;
  qrToken: string;
};

export function toPassView(
  state: LoyaltyState,
  justRedeemed = false,
): PassView {
  const max = state.visitsRequired;
  const gauge = Math.max(0, Math.min(3, state.visits)) as PassView["gauge"];
  const ready = state.rewardAvailable;
  const left = Math.max(0, max - state.visits);

  return {
    gauge: ready ? 3 : gauge,
    washes: `${ready ? max : state.visits}/${max}`,
    remainingLabel: ready ? "Tu próximo lavado" : "Hasta lavado gratis",
    remaining: ready ? "¡GRATIS!" : `${left} más`,
    reward: ready ? "Listo para usar" : "4º gratis",
    message: ready
      ? "¡Tu próximo lavado es gratis!"
      : justRedeemed
        ? "Lavado gratis canjeado. ¡Gracias!"
        : null,
    customerName: state.customerName,
    cardNumber: state.cardNumber,
    qrToken: state.qrToken,
  };
}

/**
 * What every wallet adapter offers. Only what both Google and Apple provably
 * need: a link that saves the pass, and an update when the card changes.
 */
export interface WalletAdapter {
  /** True when the credentials are configured. When false, hide the button. */
  isConfigured(): boolean;
  /** URL that adds this customer's pass to the wallet. */
  saveUrl(view: PassView): Promise<string>;
  /** Push the new state to a pass the customer already saved. Never throws. */
  update(view: PassView): Promise<void>;
}
