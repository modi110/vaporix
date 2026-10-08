import { verifyStaffPin } from "@/lib/auth/staff";
import { createStaffSession } from "@/lib/auth/session";

/**
 * Exchanges a staff id and PIN for a session cookie.
 *
 * Every failure answers the same way — 401, with only "wrong" or "locked"
 * distinguished — so the endpoint cannot be used to discover who works here
 * or which accounts exist.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ reason: "INVALID" }, { status: 400 });
  }

  const { staffId, pin } = (body ?? {}) as { staffId?: string; pin?: string };

  if (typeof staffId !== "string" || typeof pin !== "string" || pin === "") {
    return Response.json({ reason: "INVALID" }, { status: 400 });
  }

  const result = await verifyStaffPin(staffId, pin);

  if (!result.ok) {
    return Response.json({ reason: result.reason }, { status: 401 });
  }

  await createStaffSession(result.staffId, result.role);
  return Response.json({ ok: true });
}
