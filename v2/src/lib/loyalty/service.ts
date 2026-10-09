import "server-only";

import { randomBytes } from "node:crypto";

import { serviceClient } from "@/lib/supabase/server";
import type {
  LoyaltyState,
  RedeemCode,
  RedeemResult,
  ScanCode,
  ScanResult,
} from "./types";

/**
 * The whole loyalty API surface.
 *
 * Every function here is a thin call into a Postgres function. The rules —
 * increment, cooldown, reward grant, reset — live in the database, inside one
 * transaction with the card row locked, so two staff phones scanning the same
 * customer at the same moment cannot both count a visit. Reimplementing any
 * of that here would reintroduce exactly the race the database design removes.
 */

/** Raw jsonb shape returned by `card_state_json` in Postgres. */
type StateRow = {
  qr_token: string;
  card_number: string;
  customer_name: string;
  visits: number;
  visits_required: number;
  reward_available: boolean;
  active: boolean;
  reward_label_es: string;
  reward_label_en: string;
};

function toState(row: StateRow | null | undefined): LoyaltyState | null {
  if (!row) return null;
  return {
    qrToken: row.qr_token,
    cardNumber: row.card_number,
    customerName: row.customer_name,
    visits: row.visits,
    visitsRequired: row.visits_required,
    rewardAvailable: row.reward_available,
    active: row.active,
    rewardLabelEs: row.reward_label_es,
    rewardLabelEn: row.reward_label_en,
  };
}

/**
 * The QR payload. 24 random bytes — unguessable, and carrying no visit count,
 * no reward state and nothing personal, so a photographed card leaks nothing
 * but an opaque identifier.
 */
export function generateQrToken(): string {
  return `VPR_${randomBytes(24).toString("base64url")}`;
}

export type RegisterResult = {
  code: "CREATED" | "EXISTING" | "INVALID";
  state: LoyaltyState | null;
};

export async function registerCustomer(input: {
  name: string;
  phoneE164: string;
  email: string | null;
}): Promise<RegisterResult> {
  const { data, error } = await serviceClient().rpc("register_customer", {
    p_name: input.name,
    p_phone_e164: input.phoneE164,
    p_email: input.email,
    p_qr_token: generateQrToken(),
  });

  if (error) throw new Error(`register_customer failed: ${error.message}`);

  const payload = data as { code: RegisterResult["code"]; state?: StateRow };
  return { code: payload.code, state: toState(payload.state) };
}

/**
 * The offer currently on sale, for the pages that advertise it.
 *
 * The landing page used to state the reward in its own copy, which meant
 * changing the offer in the database left the marketing page promising the
 * old one. One source, read at build/revalidate time.
 */
export async function getActiveReward(): Promise<{ es: string; en: string }> {
  const { data, error } = await serviceClient()
    .from("reward_definitions")
    .select("label_es, label_en")
    .eq("active", true)
    .single();

  if (error) throw new Error(`getActiveReward failed: ${error.message}`);
  return { es: data.label_es as string, en: data.label_en as string };
}

export async function getCardState(
  qrToken: string,
): Promise<LoyaltyState | null> {
  const { data, error } = await serviceClient().rpc("card_state", {
    p_qr_token: qrToken,
  });

  if (error) throw new Error(`card_state failed: ${error.message}`);
  return toState(data as StateRow | null);
}

/**
 * How long a card keeps showing its finished row after the free wash is
 * given. Redemption resets the count immediately — it has to, or the next
 * scan would hand out a second reward — so without this the customer's card
 * would snap to an empty 0/4 while they are still standing there. Three
 * hours covers the visit and is gone by the next one.
 */
const CELEBRATION_MS = 3 * 60 * 60 * 1000;

/**
 * Was this card's reward given out in the last few hours?
 *
 * Read from `rewards.redeemed_at`, which the database already records, so
 * this needs nothing added to the schema and cannot drift from what was
 * actually handed over.
 */
export async function isCelebrating(qrToken: string): Promise<boolean> {
  const db = serviceClient();

  const { data: card } = await db
    .from("loyalty_cards")
    .select("id")
    .eq("qr_token", qrToken)
    .maybeSingle();

  if (!card) return false;

  const { data: reward } = await db
    .from("rewards")
    .select("id")
    .eq("loyalty_card_id", card.id)
    .eq("status", "redeemed")
    .gte("redeemed_at", new Date(Date.now() - CELEBRATION_MS).toISOString())
    .limit(1)
    .maybeSingle();

  return Boolean(reward);
}

/**
 * Resolves whatever staff typed into the scanner's manual box.
 *
 * Seven digits is the customer number printed on the card; anything else is
 * treated as a QR token. The number exists because the token is deliberately
 * not printed anywhere readable, which left a camera that will not start with
 * no fallback at all. It is a lookup key only — the write still goes through
 * the `qrToken` on the state this returns, so nothing can be recorded against
 * a card that was not found first.
 */
export async function lookUpCard(code: string): Promise<LoyaltyState | null> {
  if (!/^[0-9]{7}$/.test(code)) return getCardState(code);

  const { data, error } = await serviceClient()
    .from("loyalty_cards")
    .select("qr_token")
    .eq("card_number", code)
    .maybeSingle();

  if (error) throw new Error(`card number lookup failed: ${error.message}`);
  if (!data) return null;

  return getCardState(data.qr_token as string);
}

export async function registerVisit(
  qrToken: string,
  staffId: string,
  device: string | null = null,
): Promise<ScanResult> {
  const { data, error } = await serviceClient().rpc("register_visit", {
    p_qr_token: qrToken,
    p_staff_id: staffId,
    p_device: device,
  });

  if (error) throw new Error(`register_visit failed: ${error.message}`);

  const payload = data as {
    code: ScanCode;
    state?: StateRow;
    retry_after_seconds?: number;
  };

  return {
    code: payload.code,
    state: toState(payload.state),
    retryAfterSeconds: payload.retry_after_seconds,
  };
}

export async function redeemReward(
  qrToken: string,
  staffId: string,
): Promise<RedeemResult> {
  const { data, error } = await serviceClient().rpc("redeem_reward", {
    p_qr_token: qrToken,
    p_staff_id: staffId,
  });

  if (error) throw new Error(`redeem_reward failed: ${error.message}`);

  const payload = data as { code: RedeemCode; state?: StateRow };
  return { code: payload.code, state: toState(payload.state) };
}
