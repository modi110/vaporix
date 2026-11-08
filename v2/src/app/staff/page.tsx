import { redirect } from "next/navigation";

import { readStaffSession } from "@/lib/auth/session";
import { Scanner } from "./Scanner";

/** Reads the session cookie, so never prerendered. */
export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const session = await readStaffSession();
  if (!session) redirect("/staff/login");

  return <Scanner />;
}
