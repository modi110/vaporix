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
