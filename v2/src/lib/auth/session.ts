import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { serviceClient } from "@/lib/supabase/server";

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
 * stops someone editing the id by hand. The role in it is not trusted — it is
 * re-read from the staff row on every request.
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

/** True when `signature` is the HMAC of `payload`, compared in constant time. */
function signedBy(payload: string, signature: string): boolean {
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function readStaffSession(): Promise<StaffSession | null> {
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const parts = raw.split(".");
  if (parts.length !== 4) return null;

  const [staffId, role, expiresAt, signature] = parts;
  if (!signedBy(`${staffId}.${role}.${expiresAt}`, signature)) return null;

  if (Number(expiresAt) * 1000 < Date.now()) return null;

  // The cookie proves who signed in, not what they are allowed to do now.
  // Reading the row on every request is what makes deactivating someone, or
  // taking admin away, take effect immediately instead of at the end of a
  // twelve-hour cookie.
  const { data, error } = await serviceClient()
    .from("staff")
    .select("role, active")
    .eq("id", staffId)
    .maybeSingle();

  if (error) throw new Error(`staff session lookup failed: ${error.message}`);
  if (!data || !data.active) return null;
  if (data.role !== "staff" && data.role !== "admin") return null;

  return { staffId, role: data.role };
}

export async function clearStaffSession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

/*
 * Trusted devices.
 *
 * The lockout after five wrong PINs protects the PIN, but the staff names are
 * on the public login page, so anyone could also use it to lock the real
 * person out all day. A phone that has signed in successfully before gets
 * this cookie, and a request carrying it may try once past a lock. One wrong
 * PIN from it and the trust is dropped, so a stolen cookie is not a way
 * around the lock either.
 */
const DEVICE_COOKIE = "vpx_device";
const DEVICE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

export async function trustDevice(staffId: string): Promise<void> {
  const expiresAt = Math.floor(Date.now() / 1000) + DEVICE_MAX_AGE_SECONDS;
  const payload = `device.${staffId}.${expiresAt}`;

  (await cookies()).set(DEVICE_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEVICE_MAX_AGE_SECONDS,
  });
}

export async function isTrustedDevice(staffId: string): Promise<boolean> {
  const raw = (await cookies()).get(DEVICE_COOKIE)?.value;
  if (!raw) return false;

  const parts = raw.split(".");
  if (parts.length !== 4) return false;

  const [label, id, expiresAt, signature] = parts;
  if (!signedBy(`${label}.${id}.${expiresAt}`, signature)) return false;

  return label === "device" && id === staffId && Number(expiresAt) * 1000 > Date.now();
}

export async function forgetDevice(): Promise<void> {
  (await cookies()).delete(DEVICE_COOKIE);
}
