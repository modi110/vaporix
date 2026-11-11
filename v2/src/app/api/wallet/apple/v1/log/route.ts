/**
 * Apple web service: phones post error messages here. Logged, capped, never
 * trusted. Each line is a plain string from a device.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { logs?: unknown } | null;
  if (Array.isArray(body?.logs)) {
    for (const line of body.logs.slice(0, 20)) {
      console.error("Apple Wallet device log:", String(line).slice(0, 300));
    }
  }
  return new Response(null, { status: 200 });
}
