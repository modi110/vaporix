import { applePassTypeId, authorized } from "@/lib/wallet/apple";
import { register, unregister } from "@/lib/wallet/apple-registry";

/**
 * Apple web service: a phone registers (POST) or forgets (DELETE) a pass.
 * Authorised by the per-pass token Apple sends back from the pass itself.
 */
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ deviceId: string; passTypeId: string; serial: string }> };

function reject(passTypeId: string, serial: string, request: Request) {
  if (passTypeId !== applePassTypeId()) return new Response(null, { status: 404 });
  if (!authorized(request.headers.get("authorization"), serial)) {
    return new Response(null, { status: 401 });
  }
  return null;
}

export async function POST(request: Request, { params }: Ctx) {
  try {
    const { deviceId, passTypeId, serial } = await params;
    const denied = reject(passTypeId, serial, request);
    if (denied) return denied;

    const body = (await request.json().catch(() => null)) as { pushToken?: unknown } | null;
    const pushToken = body?.pushToken;
    if (typeof pushToken !== "string" || !/^[0-9a-fA-F]{16,200}$/.test(pushToken)) {
      return new Response(null, { status: 400 });
    }

    const result = await register(deviceId, passTypeId, serial, pushToken);
    return new Response(null, { status: result === "created" ? 201 : 200 });
  } catch (error) {
    console.error(error instanceof Error ? error.message : "apple register error");
    return new Response(null, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const { deviceId, passTypeId, serial } = await params;
    const denied = reject(passTypeId, serial, request);
    if (denied) return denied;

    await unregister(deviceId, passTypeId, serial);
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(error instanceof Error ? error.message : "apple unregister error");
    return new Response(null, { status: 500 });
  }
}
