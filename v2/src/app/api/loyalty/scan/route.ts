import { readStaffSession } from "@/lib/auth/session";
import { lookUpCard, registerVisit } from "@/lib/loyalty/service";

/**
 * Look up a scanned code, and record a visit against it.
 *
 * GET resolves a code — a scanned token, or the number printed on the card
 * when staff type it by hand — to its current state so they can see who they
 * are about to serve; POST is the one that writes. Splitting them is what puts a
 * human confirmation between "the camera saw a code" and "the customer has
 * another visit" — a scanner pointed at a wallet in a queue would otherwise
 * count everything in front of it.
 *
 * The client sends a token. Never a count: the new value is computed inside
 * `register_visit` in the database, under a row lock.
 */
function unauthorized() {
  return Response.json({ code: "UNAUTHENTICATED" }, { status: 401 });
}

export async function GET(request: Request) {
  const session = await readStaffSession();
  if (!session) return unauthorized();

  const token = new URL(request.url).searchParams.get("token");
  if (!token) return Response.json({ code: "INVALID_TOKEN" }, { status: 400 });

  const state = await lookUpCard(token);
  if (!state) return Response.json({ code: "INVALID_TOKEN" }, { status: 404 });

  return Response.json({ code: "OK", state });
}

export async function POST(request: Request) {
  const session = await readStaffSession();
  if (!session) return unauthorized();

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

  const result = await registerVisit(qrToken, session.staffId);

  // A refusal is a real answer, not a failure: the staff screen shows
  // "already counted" or "reward pending" from these codes.
  const status = result.code === "OK" || result.state ? 200 : 404;
  return Response.json(result, { status });
}
