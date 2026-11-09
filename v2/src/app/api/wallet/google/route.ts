import { googleWallet } from "@/lib/wallet/google";
import { getCardState } from "@/lib/loyalty/service";
import { toPassView } from "@/lib/wallet/types";

/**
 * "Add to Google Wallet" for one card: /api/wallet/google?token=<qr_token>.
 *
 * Redirects to Google's save page with a signed link that carries the pass.
 * The token in the URL is the same bearer credential as the card link, so it
 * only works for whoever already holds the card.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    if (!googleWallet.isConfigured()) {
      return new Response("Not available", { status: 404 });
    }
    const token = new URL(request.url).searchParams.get("token");
    if (!token) return new Response("Not found", { status: 404 });

    const state = await getCardState(token);
    if (!state || !state.active) return new Response("Not found", { status: 404 });

    const url = await googleWallet.saveUrl(toPassView(state));
    return Response.redirect(url, 302);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "wallet error");
    return new Response("Error", { status: 500 });
  }
}
