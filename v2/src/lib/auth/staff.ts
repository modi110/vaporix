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
): Promise<PinCheck> {
  const supabase = serviceClient();

  const { data, error } = await supabase
    .from("staff")
    .select("id, pin_hash, role, active, locked_until")
    .eq("id", staffId)
    .maybeSingle();

  if (error) throw new Error(`verifyStaffPin failed: ${error.message}`);

  // An unknown or deactivated account is reported exactly like a wrong PIN, so
  // the login screen cannot be used to enumerate who works here.
  if (!data || !data.active) return { ok: false, reason: "INVALID" };

  if (data.locked_until && new Date(data.locked_until) > new Date()) {
    return { ok: false, reason: "LOCKED" };
  }

  const matches = verifyPin(pin, data.pin_hash);

  const { data: attempt, error: attemptError } = await supabase.rpc(
    "record_staff_login_attempt",
    { p_staff_id: staffId, p_success: matches },
  );

  if (attemptError) {
    throw new Error(`record_staff_login_attempt failed: ${attemptError.message}`);
  }

  if (!matches) {
    const locked = (attempt as { locked?: boolean } | null)?.locked === true;
    return { ok: false, reason: locked ? "LOCKED" : "INVALID" };
  }

  return { ok: true, staffId: data.id, role: data.role as StaffRole };
}
