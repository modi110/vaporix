import { readStaffSession } from "@/lib/auth/session";
import { redeemReward } from "@/lib/loyalty/service";

/**
 * Redeems a waiting reward and resets the cycle to 0.
 *
 * Filling the card never does this on its own — the reward stays available
 * until a staff member actually gives it. `redeem_reward` marks the reward,
 * records who and when, and resets the card in one transaction, so the two
 * can never disagree.
 */
export async function POST(request: Request) {
  try {
    const session = await readStaffSession();
    if (!session) {
      return Response.json({ code: "UNAUTHENTICATED" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ code: "INVALID_TOKEN" }, { status: 400 });
    }

    const { qrToken } = (body ?? {}) as { qrToken?: string };
    if (typeof qrToken !== "string" || qrToken === "") {
      return Response.json({ code: "INVALID_TOKEN" }, { status: 400 });
    }

    const result = await redeemReward(qrToken, session.staffId);
    const status = result.code === "OK" || result.state ? 200 : 404;
    return Response.json(result, { status });
  } catch (error) {
    // JSON either way, so the scanner says "server error" rather than
    // misreading an HTML error page as a lost connection.
    console.error(error);
    return Response.json({ code: "SERVER_ERROR" }, { status: 500 });
  }
}
