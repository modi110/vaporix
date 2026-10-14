"use server";

import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { normalizePhone } from "./phone";
import { registerCustomer } from "./service";

/**
 * Loyalty registration.
 *
 * `error` is a message key, not a sentence: the form is rendered in two
 * locales and the server has no business deciding which language to answer in.
 */
export type JoinState = { error: string | null };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function joinLoyalty(
  _previous: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const name = String(formData.get("name") ?? "").trim();
  const phoneInput = String(formData.get("phone") ?? "");
  const emailInput = String(formData.get("email") ?? "").trim();

  if (name.length < 2 || name.length > 80) {
    return { error: "errorName" };
  }

  // Normalized here so "600112233" and "+34 600 11 22 33" are the same person.
  const phoneE164 = normalizePhone(phoneInput);
  if (!phoneE164) {
    return { error: "errorPhone" };
  }

  const email = emailInput === "" ? null : emailInput;
  if (email !== null && !EMAIL.test(email)) {
    return { error: "errorEmail" };
  }

  let token: string;
  try {
    const result = await registerCustomer({ name, phoneE164, email });
    // Never hand back the existing card. Its URL is the QR, and the QR is
    // what earns and redeems washes — redirecting here would give anyone who
    // knows a customer's phone number that customer's card. The owner finds
    // it again from /admin, by phone, with the customer standing there.
    if (result.code === "EXISTING") return { error: "errorExisting" };
    if (!result.state) return { error: "errorGeneric" };
    token = result.state.qrToken;
  } catch {
    // The reason is for the server log, never for the visitor: a database
    // message in the UI is an information leak.
    return { error: "errorGeneric" };
  }

  const locale = await getLocale();
  redirect({ href: { pathname: "/card/[token]", params: { token } }, locale });

  // Unreachable: redirect() throws. next-intl does not type it as `never`,
  // so TypeScript still wants a return on this path.
  return { error: null };
}
