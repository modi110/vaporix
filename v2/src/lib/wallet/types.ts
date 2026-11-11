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
  /** True at 3/3: the free wash is waiting to be used. */
  ready: boolean;
  /** "2/3" */
  washes: string;
  /** Row label next to the washes count. */
  remainingLabel: string;
  /** "1 más", or "¡GRATIS!" at state 3. */
  remaining: string;
  /** "4º gratis", or "Listo para usar" at state 3. */
  reward: string;
  /**
   * Lock-screen notification sent after each recorded visit: a thank-you for
   * visits 1–2, a congratulation at 3/3, a thank-you after the free wash.
   * Ignored when a pass is created (`saveUrl`); only `update` sends it.
   */
  message: {
    /** Whole text, for Apple's `changeMessage` (no length limit). */
    full: string;
    /** Google notification title: keep under 29 characters. */
    title: string;
    /** Google notification body. */
    body: string;
  };
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
    ready,
    washes: `${ready ? max : state.visits}/${max}`,
    remainingLabel: ready ? "Tu próximo lavado" : "Hasta lavado gratis",
    remaining: ready ? "¡GRATIS!" : `${left} más`,
    reward: ready ? "Listo para usar" : "4º gratis",
    // Every recorded visit sends one (the callers only build a view after a
    // committed visit or redemption). Short on purpose: Google wants a title
    // under 29 characters. Wording is a draft for the owner to approve.
    message: ready
      ? {
          full: "¡Enhorabuena! 🎉 Tu próximo lavado es gratis",
          title: "¡Próximo lavado gratis! 🎉",
          body: "¡Enhorabuena! Tu próximo lavado es gratis",
        }
      : justRedeemed
        ? {
            full: "¡Disfruta tu lavado gratis! 🎉 Te esperamos pronto 🚗",
            title: "¡Disfruta tu lavado gratis! 🎉",
            body: "Te esperamos pronto 🚗",
          }
        : {
            full: "¡Gracias por tu visita! 💙",
            title: "¡Gracias por tu visita! 💙",
            body: " ",
          },
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
