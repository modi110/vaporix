// Creates (or updates) the Vaporix loyalty class in Google Wallet. Run once,
// and again whenever loyalty-class.json changes:
//
//   node --env-file=.env.local scripts/google-wallet-setup.mjs
//
// Needs GOOGLE_WALLET_ISSUER_ID and GOOGLE_WALLET_KEY_FILE in .env.local.
// It prints Google's answer for the class and nothing from the key.

import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const issuer = process.env.GOOGLE_WALLET_ISSUER_ID?.trim().replace(/\.+$/, "");
const keyFile = process.env.GOOGLE_WALLET_KEY_FILE;
if (!issuer || !keyFile) {
  console.error("Missing GOOGLE_WALLET_ISSUER_ID or GOOGLE_WALLET_KEY_FILE in .env.local");
  process.exit(1);
}

const key = JSON.parse(readFileSync(keyFile, "utf8"));
const b64url = (v) => Buffer.from(v).toString("base64url");

const now = Math.floor(Date.now() / 1000);
const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
const body = b64url(
  JSON.stringify({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/wallet_object.issuer",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }),
);
const sig = createSign("RSA-SHA256").update(`${head}.${body}`).sign(key.private_key);

const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: `${head}.${body}.${b64url(sig)}`,
  }),
});
if (!tokenRes.ok) {
  console.error("Could not get an access token:", tokenRes.status, await tokenRes.text());
  process.exit(1);
}
const { access_token } = await tokenRes.json();

// The template in the design hand-off, with the real issuer and image host.
const base = (
  process.env.GOOGLE_WALLET_ASSET_BASE_URL ?? "https://vaporix.net/wallet/google"
).replace(/\/$/, "");
const template = readFileSync(
  new URL("../loyalty system/wallet-design/google/loyalty-class.json", import.meta.url),
  "utf8",
)
  .replaceAll("ISSUER_ID", issuer)
  .replaceAll("https://vaporix.net/wallet/google", base);
const loyaltyClass = JSON.parse(template);

const api = "https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass";
const headers = {
  Authorization: `Bearer ${access_token}`,
  "Content-Type": "application/json",
};

let res = await fetch(api, { method: "POST", headers, body: JSON.stringify(loyaltyClass) });
if (res.status === 409) {
  // Already exists: update it in place.
  res = await fetch(`${api}/${encodeURIComponent(loyaltyClass.id)}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(loyaltyClass),
  });
}

const text = await res.text();
console.log(res.ok ? "OK" : `FAILED (${res.status})`);
console.log(text.slice(0, 1500));
process.exit(res.ok ? 0 : 1);
