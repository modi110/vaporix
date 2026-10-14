import "server-only";

import { serviceClient } from "@/lib/supabase/server";
import { verifyPin } from "./pin";
import type { StaffRole } from "./session";

/**
 * Staff lookup and PIN verification.
 *
 * Login is "pick your name, then type your PIN" rather than PIN alone. Names
 * are not secrets and the list is three or four people, so showing them costs
 * nothing — and it means each attempt is tied to one account, which is what
 * lets the lockout counter work and what keeps `visits.staff_id` honest.
 */

export type StaffSummary = { id: string; name: string };

export async function listActiveStaff(): Promise<StaffSummary[]> {
  const { data, error } = await serviceClient()
    .from("staff")
    .select("id, name")
    .eq("active", true)
    .order("name");

  if (error) throw new Error(`listActiveStaff failed: ${error.message}`);
  return (data ?? []) as StaffSummary[];
}

export type PinCheck =
  | { ok: true; staffId: string; role: StaffRole }
  | { ok: false; reason: "INVALID" | "LOCKED" };

export async function verifyStaffPin(
  staffId: string,
  pin: string,
  trustedDevice: boolean,
): Promise<PinCheck> {
  const supabase = serviceClient();

  // The attempt is counted, under a row lock, before the PIN is looked at.
  // Checking first and counting after let parallel requests all slip past the
  // lockout together. Unknown and deactivated accounts come back as INVALID,
  // exactly like a wrong PIN, so the login cannot enumerate who works here.
  const { data, error } = await supabase.rpc("begin_staff_login", {
    p_staff_id: staffId,
    p_trusted: trustedDevice,
  });

  if (error) throw new Error(`begin_staff_login failed: ${error.message}`);

  const attempt = data as
    | { ok: false; reason: "INVALID" | "LOCKED" }
    | { ok: true; pin_hash: string; role: StaffRole; locks: boolean };

  if (!attempt.ok) return { ok: false, reason: attempt.reason };

  if (!verifyPin(pin, attempt.pin_hash)) {
    return { ok: false, reason: attempt.locks ? "LOCKED" : "INVALID" };
  }

  const { error: resetError } = await supabase.rpc("record_staff_login_attempt", {
    p_staff_id: staffId,
    p_success: true,
  });

  if (resetError) {
    throw new Error(`record_staff_login_attempt failed: ${resetError.message}`);
  }

  return { ok: true, staffId, role: attempt.role };
}
