import "server-only";

import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

import { siteUrl } from "@/content/site";
import type { PassView, WalletAdapter } from "./types";

/**
 * Google Wallet, without the Google SDK.
 *
 * Two things need a signature, and both are plain RS256 JWTs, so `node:crypto`
 * and `fetch` are enough and no dependency is added:
 *   1. the "Add to Google Wallet" link (a JWT that carries the pass), and
 *   2. the OAuth token used to update a pass the customer already saved.
 *
 * Configuration, all from the environment (never committed):
 *   GOOGLE_WALLET_ISSUER_ID        the Issuer ID from the Wallet console
 *   GOOGLE_WALLET_KEY_FILE         path to the service-account JSON (local dev)
 *   GOOGLE_WALLET_KEY_JSON         the same JSON as one string (production, Vercel)
 *   GOOGLE_WALLET_ASSET_BASE_URL   where hero_N.png is served; defaults to
 *                                  `<site>/wallet/google`. Google downloads the
 *                                  images itself, so it must be public HTTPS.
 *
 * The key is read here and nowhere else. It is never logged.
 */

const API = "https://walletobjects.googleapis.com/walletobjects/v1";
const SCOPE = "https://www.googleapis.com/auth/wallet_object.issuer";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

type ServiceAccountKey = { client_email: string; private_key: string };

let cachedKey: ServiceAccountKey | null | undefined;

function loadKey(): ServiceAccountKey | null {
  if (cachedKey !== undefined) return cachedKey;
  try {
    const inline = process.env.GOOGLE_WALLET_KEY_JSON;
    const file = process.env.GOOGLE_WALLET_KEY_FILE;
    const raw = inline ?? (file ? readFileSync(file, "utf8") : null);
    const parsed = raw ? (JSON.parse(raw) as Partial<ServiceAccountKey>) : null;
    cachedKey =
      parsed?.client_email && parsed.private_key
        ? { client_email: parsed.client_email, private_key: parsed.private_key }
        : null;
  } catch {
    // Wrong path or bad JSON: treat as "not configured". The message is
    // deliberately not logged — it could include a path or a fragment of key.
    cachedKey = null;
  }
  return cachedKey;
}

function issuerId(): string | null {
  // Issuer IDs are digits only; strip stray spaces or a pasted trailing "."
  // (it produced class ids like "..vaporix_club").
  return process.env.GOOGLE_WALLET_ISSUER_ID?.trim().replace(/\.+$/, "") || null;
}

function assetBase(): string {
  return (
    process.env.GOOGLE_WALLET_ASSET_BASE_URL?.replace(/\/$/, "") ??
    `${siteUrl}/wallet/google`
  );
}

const classId = (issuer: string) => `${issuer}.vaporix_club`;
const objectId = (issuer: string, view: PassView) =>
  `${issuer}.vpx_${view.cardNumber}`;

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function signJwt(claims: Record<string, unknown>, key: ServiceAccountKey) {
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(claims));
  const signature = createSign("RSA-SHA256")
    .update(`${header}.${body}`)
    .sign(key.private_key);
  return `${header}.${body}.${b64url(signature)}`;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken(key: ServiceAccountKey): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }
  const now = Math.floor(Date.now() / 1000);
  const assertion = signJwt(
    { iss: key.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 },
    key,
  );
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) throw new Error(`Google token request failed (${res.status})`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return cachedToken.value;
}

/** The fields that change with the card. Used for both create and update. */
function dynamicFields(view: PassView) {
  return {
    heroImage: {
      sourceUri: { uri: `${assetBase()}/hero_${view.gauge}.png` },
      contentDescription: {
        defaultValue: {
          language: "es",
          value: `Progreso: ${view.washes.replace("/", " de ")} lavados`,
        },
      },
    },
    textModulesData: [
      { id: "lavados", header: "Lavados", body: view.washes },
      { id: "restantes", header: view.remainingLabel, body: view.remaining },
      { id: "socio", header: "Socio", body: view.customerName },
      { id: "premio", header: "Premio", body: view.reward },
    ],
  };
}

function loyaltyObject(issuer: string, view: PassView) {
  return {
    id: objectId(issuer, view),
    classId: classId(issuer),
    state: "ACTIVE",
    accountId: view.cardNumber,
    accountName: view.customerName,
    barcode: {
      type: "QR_CODE",
      // The bare token, never the URL: the staff scanner sends whatever the QR
      // holds straight to /api/loyalty/scan.
      value: view.qrToken,
      alternateText: view.cardNumber,
    },
    ...dynamicFields(view),
  };
}

async function api(path: string, init: RequestInit, key: ServiceAccountKey) {
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${await accessToken(key)}`,
      "Content-Type": "application/json",
    },
  });
}

export const googleWallet: WalletAdapter = {
  isConfigured() {
    return Boolean(issuerId() && loadKey());
  },

  async saveUrl(view) {
    const issuer = issuerId();
    const key = loadKey();
    if (!issuer || !key) throw new Error("Google Wallet is not configured");

    const jwt = signJwt(
      {
        iss: key.client_email,
        aud: "google",
        typ: "savetowallet",
        iat: Math.floor(Date.now() / 1000),
        origins: [siteUrl],
        // The full object travels inside the link, so Google creates it when
        // the customer taps save. No separate create call is needed.
        payload: { loyaltyObjects: [loyaltyObject(issuer, view)] },
      },
      key,
    );
    return `https://pay.google.com/gp/v/save/${jwt}`;
  },

  /**
   * Never throws: by the time this runs the database has already committed the
   * visit. A staff member who saw an error would scan again and double-count a
   * wash that was already recorded. Failures are logged and the pass catches up
   * on the next change.
   */
  async update(view) {
    try {
      const issuer = issuerId();
      const key = loadKey();
      if (!issuer || !key) return;

      const id = encodeURIComponent(objectId(issuer, view));
      const res = await api(
        `/loyaltyObject/${id}`,
        { method: "PATCH", body: JSON.stringify(dynamicFields(view)) },
        key,
      );

      // 404 = this customer never added the pass. Nothing to update.
      if (res.status === 404) return;
      if (!res.ok) {
        console.error(`Google Wallet update failed (${res.status})`);
        return;
      }

      const msg = await api(
        `/loyaltyObject/${id}/addMessage`,
        {
          method: "POST",
          body: JSON.stringify({
            message: {
              // Google rejects a message without an id; one per send, so a
              // repeat visit never collides with an earlier message.
              id: `visit_${Date.now()}`,
              header: view.message.title,
              body: view.message.body,
              messageType: "TEXT_AND_NOTIFY",
            },
          }),
        },
        key,
      );
      if (!msg.ok) {
        // Google's error text says which field it refused; it holds no secret.
        const detail = (await msg.text().catch(() => "")).slice(0, 500);
        console.error(`Google Wallet message failed (${msg.status}): ${detail}`);
      }
    } catch (error) {
      console.error(
        "Google Wallet update error:",
        error instanceof Error ? error.message : "unknown",
      );
    }
  },
};
