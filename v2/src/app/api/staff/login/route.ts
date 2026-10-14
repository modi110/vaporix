import { verifyStaffPin } from "@/lib/auth/staff";
import {
  createStaffSession,
  forgetDevice,
  isTrustedDevice,
  trustDevice,
} from "@/lib/auth/session";

/**
 * Exchanges a staff id and PIN for a session cookie.
 *
 * Every failure answers the same way — 401, with only "wrong" or "locked"
 * distinguished — so the endpoint cannot be used to discover who works here
 * or which accounts exist.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ reason: "INVALID" }, { status: 400 });
  }

  const { staffId, pin } = (body ?? {}) as { staffId?: string; pin?: string };

  // Checked here because Postgres rejects a malformed uuid with an error,
  // which would otherwise surface as a 500 instead of a plain "wrong".
  if (typeof staffId !== "string" || !UUID.test(staffId) || typeof pin !== "string" || pin === "") {
    return Response.json({ reason: "INVALID" }, { status: 400 });
  }

  const trusted = await isTrustedDevice(staffId);

  let result;
  try {
    result = await verifyStaffPin(staffId, pin, trusted);
  } catch (error) {
    console.error(error);
    return Response.json({ reason: "ERROR" }, { status: 500 });
  }

  if (!result.ok) {
    // One wrong PIN and this phone loses its pass through the lock.
    if (trusted) await forgetDevice();
    return Response.json({ reason: result.reason }, { status: 401 });
  }

  await createStaffSession(result.staffId, result.role);
  await trustDevice(result.staffId);
  return Response.json({ ok: true });
}
