import { getCardState } from "@/lib/loyalty/service";
import { appleConfigured, buildPass } from "@/lib/wallet/apple";
import { currentPass } from "@/lib/wallet/apple-registry";

/**
 * "Add to Apple Wallet" for one card: /api/wallet/apple?token=<qr_token>.
 *
 * Returns the signed .pkpass; Safari on iPhone offers to add it. The token is
 * the same bearer credential as the card link, so it only works for whoever
 * already holds the card.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    if (!appleConfigured()) return new Response("Not available", { status: 404 });

    const token = new URL(request.url).searchParams.get("token");
    if (!token) return new Response("Not found", { status: 404 });

    const state = await getCardState(token);
    if (!state || !state.active) return new Response("Not found", { status: 404 });

    const pass = await currentPass(state.cardNumber);
    if (!pass) return new Response("Not found", { status: 404 });

    return new Response(new Uint8Array(buildPass(pass.view)), {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": 'attachment; filename="vaporix.pkpass"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : "wallet error");
    return new Response("Error", { status: 500 });
  }
}
