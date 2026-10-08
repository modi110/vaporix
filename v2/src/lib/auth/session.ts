import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Staff sessions.
 *
 * This module is deliberately the *only* place that knows how a staff member
 * is identified. Everything else asks `readStaffSession()` and gets an id and
 * a role. When the shop outgrows PINs and moves to Supabase Auth, this file is
 * what gets replaced — nothing calling it has to change.
 *
 * The cookie is an HMAC-signed triple, not encrypted: it carries no secret,
 * only an id the server was going to look up anyway. The signature is what
 * stops someone editing `staff` into `admin` by hand.
 */

export type StaffRole = "staff" | "admin";

export type StaffSession = {
  staffId: string;
  role: StaffRole;
};

const COOKIE_NAME = "vpx_staff";

/** One shift. Long enough not to interrupt service, short enough to matter. */
const MAX_AGE_SECONDS = 60 * 60 * 12;

function secret(): string {
  const value = process.env.LOYALTY_SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error(
      "LOYALTY_SESSION_SECRET is missing or too short (need 32+ chars). " +
        "See .env.example.",
    );
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function createStaffSession(
  staffId: string,
  role: StaffRole,
): Promise<void> {
  const expiresAt = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = `${staffId}.${role}.${expiresAt}`;
  const store = await cookies();

  store.set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    // Plain HTTP only ever happens on a local dev machine.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function readStaffSession(): Promise<StaffSession | null> {
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const parts = raw.split(".");
  if (parts.length !== 4) return null;

  const [staffId, role, expiresAt, signature] = parts;
  const payload = `${staffId}.${role}.${expiresAt}`;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length) return null;
  if (!timingSafeEqual(expected, received)) return null;

  if (Number(expiresAt) * 1000 < Date.now()) return null;
  if (role !== "staff" && role !== "admin") return null;

  return { staffId, role };
}

export async function clearStaffSession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
