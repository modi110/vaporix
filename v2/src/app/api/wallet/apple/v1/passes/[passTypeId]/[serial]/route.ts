import { applePassTypeId, authorized, buildPass } from "@/lib/wallet/apple";
import { currentPass } from "@/lib/wallet/apple-registry";

/**
 * Apple web service: the latest version of one pass. The phone calls this
 * after our push. 304 when it already has the newest one.
 */
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ passTypeId: string; serial: string }> },
) {
  try {
    const { passTypeId, serial } = await params;
    if (passTypeId !== applePassTypeId()) return new Response(null, { status: 404 });
    if (!authorized(request.headers.get("authorization"), serial)) {
      return new Response(null, { status: 401 });
    }

    const pass = await currentPass(serial);
    if (!pass) return new Response(null, { status: 404 });

    // HTTP dates have one-second precision.
    const modified = new Date(Math.floor(new Date(pass.updatedAt).getTime() / 1000) * 1000);
    const since = request.headers.get("if-modified-since");
    if (since && new Date(since).getTime() >= modified.getTime()) {
      return new Response(null, { status: 304 });
    }

    return new Response(new Uint8Array(buildPass(pass.view)), {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Last-Modified": modified.toUTCString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : "apple pass error");
    return new Response(null, { status: 500 });
  }
}
