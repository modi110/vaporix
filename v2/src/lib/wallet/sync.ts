import "server-only";

import type { LoyaltyState } from "@/lib/loyalty/types";
import { appleConfigured } from "./apple";
import { pushCard } from "./apple-registry";
import { googleWallet } from "./google";
import { toPassView } from "./types";

/**
 * Push a card's new state to every wallet it may live in.
 *
 * Call it AFTER the database write has succeeded, outside the response (see
 * `after()` in the scan and redeem routes). It never throws, so a wallet
 * outage cannot turn a recorded visit into an error on the staff screen.
 *
 * Apple is different from Google: we do not send the new state, only a push
 * that makes each phone fetch the pass again from our web service, which builds
 * it from the live card.
 */
export async function syncWallets(
  state: LoyaltyState,
  justRedeemed = false,
): Promise<void> {
  const view = toPassView(state, justRedeemed);
  await Promise.allSettled([
    googleWallet.update(view),
    appleConfigured() ? pushCard(state.cardNumber) : Promise.resolve(),
  ]);
}
