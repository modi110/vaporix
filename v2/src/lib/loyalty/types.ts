/**
 * The shape every loyalty surface reads: the web card, the staff screen, and
 * later the Apple and Google Wallet adapters. All of it comes from the
 * database — nothing here is ever computed in the browser.
 */
export type LoyaltyState = {
  qrToken: string;
  /**
   * Seven digits, shown on the card and readable aloud. Separate from
   * `qrToken` on purpose: the token is the credential, this is the thing a
   * customer can quote over the phone without handing over their card.
   */
  cardNumber: string;
  customerName: string;
  visits: number;
  visitsRequired: number;
  rewardAvailable: boolean;
  active: boolean;
  rewardLabelEs: string;
  rewardLabelEn: string;
};

/** Outcomes of `register_visit` in the database. */
export type ScanCode =
  | "OK"
  | "INVALID_TOKEN"
  | "CARD_INACTIVE"
  | "REWARD_PENDING"
  | "COOLDOWN"
  | "STAFF_INVALID";

/** Outcomes of `redeem_reward` in the database. */
export type RedeemCode = "OK" | "INVALID_TOKEN" | "NO_REWARD" | "STAFF_INVALID";

export type ScanResult = {
  code: ScanCode;
  state: LoyaltyState | null;
  /** Only present on COOLDOWN: seconds until this card may be scanned again. */
  retryAfterSeconds?: number;
};

export type RedeemResult = {
  code: RedeemCode;
  state: LoyaltyState | null;
};
