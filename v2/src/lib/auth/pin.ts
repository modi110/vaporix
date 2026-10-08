import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Staff PIN hashing.
 *
 * A PIN is a tiny secret — six digits is a million possibilities — so the
 * stored form has to be slow to test. scrypt from Node's standard library is
 * deliberately memory-hard; combined with the five-attempt lockout in
 * `record_staff_login_attempt`, guessing is not a practical attack.
 *
 * No dependency needed for this, so none is taken.
 */

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

export function hashPin(pin: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const derived = scryptSync(pin, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export function verifyPin(pin: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const salt = Buffer.from(parts[1], "base64url");
  const expected = Buffer.from(parts[2], "base64url");
  if (expected.length !== KEY_LENGTH) return false;

  const derived = scryptSync(pin, salt, KEY_LENGTH);
  // Constant time: a plain === leaks how much of the hash matched.
  return timingSafeEqual(derived, expected);
}
