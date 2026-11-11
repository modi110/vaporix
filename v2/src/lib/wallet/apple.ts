import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { connect } from "node:http2";
import path from "node:path";

import { PKPass } from "passkit-generator";

import { site, siteUrl } from "@/content/site";
import type { PassView } from "./types";

/**
 * Apple Wallet, in three parts:
 *   1. `buildPass`   — a signed .pkpass for one card in its current state.
 *   2. `push`        — an empty APNs push that tells a phone to fetch the pass
 *                      again. The phone then calls our web service
 *                      (`/api/wallet/apple/v1/...`), gets the new pass, and
 *                      shows the `changeMessage` of any field whose value
 *                      changed. That alert is the "thank you" / "free wash"
 *                      notification.
 *   3. `passAuthToken` — the per-pass secret Apple sends back to the web
 *                      service. Derived, never stored.
 *
 * Configuration, all from the environment (never committed). A PEM value may
 * be the PEM text itself (literal "\n" allowed) or the same text base64-encoded,
 * which is easier to paste into Vercel:
 *   APPLE_PASS_TYPE_ID        e.g. pass.net.vaporix.loyalty
 *   APPLE_TEAM_ID             the 10-character Team ID
 *   APPLE_PASS_CERT           pass-type certificate (PEM)
 *   APPLE_PASS_KEY            its private key (PEM)
 *   APPLE_PASS_KEY_PASSPHRASE only if the key is encrypted
 *   APPLE_WWDR_CERT           Apple WWDR intermediate certificate (PEM)
 *   APPLE_PASS_AUTH_SECRET    32+ random bytes; derives every pass's token
 */

const ASSET_DIR = path.join(process.cwd(), "src", "lib", "wallet", "apple-assets");

function readPem(name: string): string | null {
  const raw = process.env[name]?.trim();
  if (!raw) return null;
  if (raw.includes("BEGIN")) return raw.replace(/\\n/g, "\n");
  try {
    return Buffer.from(raw, "base64").toString("utf8");
  } catch {
    return null;
  }
}

type AppleConfig = {
  passTypeId: string;
  teamId: string;
  cert: string;
  key: string;
  passphrase: string | undefined;
  wwdr: string;
  authSecret: string;
};

function config(): AppleConfig | null {
  const passTypeId = process.env.APPLE_PASS_TYPE_ID;
  const teamId = process.env.APPLE_TEAM_ID;
  const authSecret = process.env.APPLE_PASS_AUTH_SECRET;
  const cert = readPem("APPLE_PASS_CERT");
  const key = readPem("APPLE_PASS_KEY");
  const wwdr = readPem("APPLE_WWDR_CERT");
  if (!passTypeId || !teamId || !authSecret || !cert || !key || !wwdr) return null;
  return {
    passTypeId,
    teamId,
    cert,
    key,
    passphrase: process.env.APPLE_PASS_KEY_PASSPHRASE || undefined,
    wwdr,
    authSecret,
  };
}

export const appleConfigured = () => config() !== null;

/** The pass type id, for routes that must reject a request for another type. */
export const applePassTypeId = () => process.env.APPLE_PASS_TYPE_ID ?? null;

/** The token Apple sends back in `Authorization: ApplePass <token>`. */
export function passAuthToken(cardNumber: string): string {
  const cfg = config();
  if (!cfg) throw new Error("Apple Wallet is not configured");
  return createHmac("sha256", cfg.authSecret).update(`apple:${cardNumber}`).digest("hex");
}

/** Constant-time check of the Authorization header for one card. */
export function authorized(header: string | null, cardNumber: string): boolean {
  if (!appleConfigured() || !header?.startsWith("ApplePass ")) return false;
  const given = Buffer.from(header.slice("ApplePass ".length));
  const expected = Buffer.from(passAuthToken(cardNumber));
  return given.length === expected.length && timingSafeEqual(given, expected);
}

const IMAGE_NAMES = ["icon", "logo"] as const;
const SCALES = ["", "@2x", "@3x"] as const;

const imageCache = new Map<string, Buffer>();
function image(file: string): Buffer {
  let buffer = imageCache.get(file);
  if (!buffer) {
    buffer = readFileSync(path.join(ASSET_DIR, file));
    imageCache.set(file, buffer);
  }
  return buffer;
}

/** The .pkpass bytes for a card in its current state. */
export function buildPass(view: PassView): Buffer {
  const cfg = config();
  if (!cfg) throw new Error("Apple Wallet is not configured");

  // One alert per update, never two: a `changeMessage` fires for every field
  // whose value changed, and at 3/3 both the washes and the reward change. So
  // the message sits on `premio` when the reward is ready and on `lavados`
  // otherwise. A new pass has no previous version, so it shows no alert.
  const message = view.message.full;

  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: cfg.passTypeId,
    teamIdentifier: cfg.teamId,
    serialNumber: view.cardNumber,
    organizationName: "Vaporix",
    description: "Tarjeta de fidelidad Vaporix",
    logoText: "VAPORIX",
    backgroundColor: "rgb(0, 95, 211)",
    foregroundColor: "rgb(255, 255, 255)",
    labelColor: "rgb(220, 232, 248)",
    webServiceURL: `${siteUrl}/api/wallet/apple`,
    authenticationToken: passAuthToken(view.cardNumber),
    storeCard: {
      headerFields: [
        {
          key: "lavados",
          label: "LAVADOS",
          value: view.washes,
          ...(view.ready ? {} : { changeMessage: message }),
        },
      ],
      primaryFields: [
        {
          key: "progreso",
          label: view.ready ? "¡TU PRÓXIMO LAVADO ES GRATIS!" : "PARA TU LAVADO GRATIS",
          value: view.ready ? "GRATIS" : view.remaining,
        },
      ],
      secondaryFields: [{ key: "socio", label: "SOCIO", value: view.customerName }],
      auxiliaryFields: [
        {
          key: "premio",
          label: "PREMIO",
          value: view.ready ? "Listo para usar" : "4º lavado gratis",
          ...(view.ready ? { changeMessage: message } : {}),
        },
      ],
      backFields: [
        {
          key: "como",
          label: "Cómo funciona",
          value:
            "Paga 3 lavados y el 4º es gratis. Enseña este código al personal después de cada lavado.",
        },
        { key: "numero", label: "Número de cliente", value: view.cardNumber },
        { key: "web", label: "Web", value: siteUrl },
        {
          key: "contacto",
          label: "Contacto",
          value: `${site.phone} · ${site.address.street}, ${site.address.city} (${site.address.region})`,
        },
        { key: "privacidad", label: "Privacidad", value: `${siteUrl}/es/privacidad` },
      ],
    },
    barcodes: [
      {
        format: "PKBarcodeFormatQR",
        // The bare token, never the URL: the staff scanner sends whatever the
        // QR holds straight to /api/loyalty/scan.
        message: view.qrToken,
        messageEncoding: "iso-8859-1",
        altText: view.cardNumber,
      },
    ],
  };

  const files: Record<string, Buffer> = {
    "pass.json": Buffer.from(JSON.stringify(passJson)),
  };
  for (const name of IMAGE_NAMES) {
    for (const scale of SCALES) files[`${name}${scale}.png`] = image(`${name}${scale}.png`);
  }
  for (const scale of SCALES) {
    files[`strip${scale}.png`] = image(`strip_${view.gauge}${scale}.png`);
  }

  const pass = new PKPass(files, {
    wwdr: cfg.wwdr,
    signerCert: cfg.cert,
    signerKey: cfg.key,
    signerKeyPassphrase: cfg.passphrase,
  });
  return pass.getAsBuffer();
}

/**
 * Tell one phone to fetch the pass again. Resolves to "gone" when Apple says
 * the token is dead (the customer removed the pass), so the caller can forget
 * it. Never throws.
 */
export function push(pushToken: string): Promise<"ok" | "gone" | "error"> {
  const cfg = config();
  if (!cfg) return Promise.resolve("error");

  return new Promise((resolve) => {
    let settled = false;
    const done = (result: "ok" | "gone" | "error") => {
      if (settled) return;
      settled = true;
      client.close();
      resolve(result);
    };

    // The pass certificate doubles as the TLS client certificate for APNs.
    const client = connect("https://api.push.apple.com", {
      cert: cfg.cert,
      key: cfg.key,
      passphrase: cfg.passphrase,
    });
    client.on("error", () => done("error"));
    client.setTimeout(10_000, () => done("error"));

    const request = client.request({
      ":method": "POST",
      ":path": `/3/device/${pushToken}`,
      "apns-topic": cfg.passTypeId,
      "content-type": "application/json",
    });
    request.on("response", (headers) => {
      const status = Number(headers[":status"]);
      request.resume();
      done(status === 200 ? "ok" : status === 410 || status === 400 ? "gone" : "error");
    });
    request.on("error", () => done("error"));
    request.end("{}");
  });
}
