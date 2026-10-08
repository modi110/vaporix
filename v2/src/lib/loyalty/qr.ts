import "server-only";

import QRCode from "qrcode";

/**
 * QR rendering.
 *
 * SVG, generated on the server: it stays crisp at any size, needs no image
 * request and ships no client JavaScript. The payload is the bare token and
 * nothing else — no visit count, no name, no phone number — so a photograph of
 * someone's card reveals only an opaque string.
 */
export async function renderQrSvg(token: string): Promise<string> {
  return QRCode.toString(token, {
    type: "svg",
    // Quiet zone trimmed to the minimum the spec allows; the surrounding
    // layout provides the rest of the breathing room.
    margin: 1,
    // Cards get shown on cracked screens in daylight. The extra redundancy is
    // worth the denser pattern.
    errorCorrectionLevel: "M",
    color: { dark: "#005fd3", light: "#ffffff" },
  });
}
