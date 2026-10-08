/**
 * Phone normalization to E.164.
 *
 * The phone number is the customer's identity — `customers.phone_e164` is
 * unique, which is what stops someone registering again and again for a fresh
 * 0/3 card. That only holds if "600 11 22 33", "+34 600112233" and
 * "0034600112233" all collapse to the same string, so normalization happens
 * here, once, before anything reaches the database.
 */

/** Spain. The business is local; a bare 9-digit number is a Spanish one. */
const DEFAULT_COUNTRY_CODE = "34";

const E164 = /^\+[1-9]\d{7,14}$/;

export function normalizePhone(input: string): string | null {
  // Strip everything a person might type as separators, keeping a leading +.
  const cleaned = input.trim().replace(/[\s.\-()/]/g, "");
  if (cleaned === "") return null;

  let candidate: string;

  if (cleaned.startsWith("+")) {
    candidate = cleaned;
  } else if (cleaned.startsWith("00")) {
    // International prefix as dialled from Spain.
    candidate = `+${cleaned.slice(2)}`;
  } else if (/^\d{9}$/.test(cleaned)) {
    candidate = `+${DEFAULT_COUNTRY_CODE}${cleaned}`;
  } else {
    return null;
  }

  if (!/^\+\d+$/.test(candidate)) return null;
  return E164.test(candidate) ? candidate : null;
}
