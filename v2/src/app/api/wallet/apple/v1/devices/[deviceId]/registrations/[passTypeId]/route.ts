import { applePassTypeId, appleConfigured } from "@/lib/wallet/apple";
import { changedSerials } from "@/lib/wallet/apple-registry";

/**
 * Apple web service: which passes on this phone changed since the last check.
 * Apple sends no token here, only the opaque device id it chose; the answer is
 * a list of card numbers, which is no more than the phone already holds.
 */
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ deviceId: string; passTypeId: string }> },
) {
  try {
    const { deviceId, passTypeId } = await params;
    if (!appleConfigured() || passTypeId !== applePassTypeId()) {
      return new Response(null, { status: 404 });
    }

    const since = new URL(request.url).searchParams.get("passesUpdatedSince");
    const result = await changedSerials(deviceId, passTypeId, since);
    if (!result) return new Response(null, { status: 204 });
    return Response.json(result);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "apple list error");
    return new Response(null, { status: 500 });
  }
}
