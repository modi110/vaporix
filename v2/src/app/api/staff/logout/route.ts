import { NextResponse } from "next/server";

import { clearStaffSession } from "@/lib/auth/session";

/**
 * Ends the shift.
 *
 * POST, not GET: it changes state, so it should not be reachable by a
 * prefetch, a crawler, or an image tag. 303 so the browser follows with a
 * GET rather than re-posting to the login page.
 */
export async function POST(request: Request) {
  await clearStaffSession();
  return NextResponse.redirect(new URL("/staff/login", request.url), 303);
}
