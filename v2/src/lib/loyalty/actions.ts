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
 *
 * A refusal hands back what was typed and which field is wrong. React resets
 * a form after its action runs, so without `values` one mistyped digit would
 * wipe the name and phone along with it — on a phone, that is the visitor
 * typing everything again.
 */
export type JoinField = "name" | "phone" | "email";

export type JoinState = {
  error: string | null;
  field?: JoinField;
  values?: { name: string; phone: string; email: string };
};

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function joinLoyalty(
  _previous: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const name = String(formData.get("name") ?? "").trim();
  const phoneInput = String(formData.get("phone") ?? "");
  const emailInput = String(formData.get("email") ?? "").trim();

  const values = { name, phone: phoneInput, email: emailInput };
  const refuse = (error: string, field?: JoinField): JoinState => ({
    error,
    field,
    values,
  });

  if (name.length < 2 || name.length > 80) {
    return refuse("errorName", "name");
  }

  // Normalized here so "600112233" and "+34 600 11 22 33" are the same person.
  const phoneE164 = normalizePhone(phoneInput);
  if (!phoneE164) {
    return refuse("errorPhone", "phone");
  }

  const email = emailInput === "" ? null : emailInput;
  if (email !== null && !EMAIL.test(email)) {
    return refuse("errorEmail", "email");
  }

  let token: string;
  try {
    const result = await registerCustomer({ name, phoneE164, email });
    // Never hand back the existing card. Its URL is the QR, and the QR is
    // what earns and redeems washes — redirecting here would give anyone who
    // knows a customer's phone number that customer's card. The owner finds
    // it again from /admin, by phone, with the customer standing there.
    if (result.code === "EXISTING") return refuse("errorExisting", "phone");
    if (!result.state) return refuse("errorGeneric");
    token = result.state.qrToken;
  } catch {
    // The reason is for the server log, never for the visitor: a database
    // message in the UI is an information leak.
    return refuse("errorGeneric");
  }

  const locale = await getLocale();
  redirect({ href: { pathname: "/card/[token]", params: { token } }, locale });

  // Unreachable: redirect() throws. next-intl does not type it as `never`,
  // so TypeScript still wants a return on this path.
  return { error: null };
}
