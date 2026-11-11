import "server-only";

import { isCelebrating, lookUpCard } from "@/lib/loyalty/service";
import { serviceClient } from "@/lib/supabase/server";
import { push } from "./apple";
import { toPassView, type PassView } from "./types";

/**
 * What the Apple web service remembers and reads. The pass itself is always
 * built from the live card state, so there is nothing to keep in sync here
 * except which phones hold which card.
 */

const TABLE = "apple_pass_registrations";

export async function register(
  deviceId: string,
  passTypeId: string,
  serial: string,
  pushToken: string,
): Promise<"created" | "existing"> {
  const db = serviceClient();
  const { data: existing } = await db
    .from(TABLE)
    .select("push_token")
    .eq("device_library_identifier", deviceId)
    .eq("pass_type_identifier", passTypeId)
    .eq("serial_number", serial)
    .maybeSingle();

  const { error } = await db.from(TABLE).upsert(
    {
      device_library_identifier: deviceId,
      pass_type_identifier: passTypeId,
      serial_number: serial,
      push_token: pushToken,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "device_library_identifier,pass_type_identifier,serial_number" },
  );
  if (error) throw new Error(`apple register failed: ${error.message}`);
  return existing ? "existing" : "created";
}

export async function unregister(deviceId: string, passTypeId: string, serial: string) {
  const { error } = await serviceClient()
    .from(TABLE)
    .delete()
    .eq("device_library_identifier", deviceId)
    .eq("pass_type_identifier", passTypeId)
    .eq("serial_number", serial);
  if (error) throw new Error(`apple unregister failed: ${error.message}`);
}

/**
 * Serial numbers on this phone that changed after `since` (or all of them).
 * `lastUpdated` is the tag Apple hands back next time as `passesUpdatedSince`.
 */
export async function changedSerials(
  deviceId: string,
  passTypeId: string,
  since: string | null,
): Promise<{ serialNumbers: string[]; lastUpdated: string } | null> {
  const db = serviceClient();
  const { data: regs, error } = await db
    .from(TABLE)
    .select("serial_number")
    .eq("device_library_identifier", deviceId)
    .eq("pass_type_identifier", passTypeId);
  if (error) throw new Error(`apple registrations failed: ${error.message}`);

  const serials = (regs ?? []).map((r) => r.serial_number as string);
  if (serials.length === 0) return null;

  let query = db
    .from("loyalty_cards")
    .select("card_number, updated_at")
    .in("card_number", serials);
  if (since) query = query.gt("updated_at", since);
  const { data: cards, error: cardError } = await query;
  if (cardError) throw new Error(`apple changed cards failed: ${cardError.message}`);
  if (!cards || cards.length === 0) return null;

  const lastUpdated = cards
    .map((c) => c.updated_at as string)
    .reduce((a, b) => (a > b ? a : b));
  return { serialNumbers: cards.map((c) => c.card_number as string), lastUpdated };
}

/** The current pass view and its last-change time, or null for an unknown card. */
export async function currentPass(
  serial: string,
): Promise<{ view: PassView; updatedAt: string } | null> {
  if (!/^[0-9]{7}$/.test(serial)) return null;
  const state = await lookUpCard(serial);
  if (!state || !state.active) return null;

  const { data, error } = await serviceClient()
    .from("loyalty_cards")
    .select("updated_at")
    .eq("card_number", serial)
    .maybeSingle();
  if (error || !data) return null;

  // Only a card still at zero can be "just redeemed"; a new visit inside the
  // celebration window must read as a normal visit.
  const justRedeemed = state.visits === 0 && (await isCelebrating(state.qrToken));
  const view = toPassView(state, justRedeemed);
  return { view, updatedAt: data.updated_at as string };
}

/** Push every phone that holds this card. Dead tokens are forgotten. */
export async function pushCard(serial: string): Promise<void> {
  const db = serviceClient();
  const { data, error } = await db
    .from(TABLE)
    .select("device_library_identifier, pass_type_identifier, push_token")
    .eq("serial_number", serial);
  if (error) throw new Error(`apple push lookup failed: ${error.message}`);

  await Promise.allSettled(
    (data ?? []).map(async (row) => {
      const result = await push(row.push_token as string);
      if (result === "gone") {
        await unregister(
          row.device_library_identifier as string,
          row.pass_type_identifier as string,
          serial,
        );
      } else if (result === "error") {
        console.error("Apple Wallet push failed");
      }
    }),
  );
}
