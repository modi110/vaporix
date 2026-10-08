import { redirect } from "next/navigation";

import { listActiveStaff } from "@/lib/auth/staff";
import { readStaffSession } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";

/** Reads the staff table and the session cookie, so never prerendered. */
export const dynamic = "force-dynamic";

export default async function StaffLoginPage() {
  if (await readStaffSession()) redirect("/staff");

  // Names only. They are not secrets — the PIN is — and showing them ties
  // each attempt to one account, which is what makes the lockout counter
  // work and what keeps `visits.staff_id` honest.
  const staff = await listActiveStaff();

  return (
    <main className="staff-shell">
      <div className="staff-head">
        <p className="staff-wordmark">Vaporix</p>
      </div>

      <div>
        <h1 className="staff-title">Entrar</h1>
        <p className="staff-lede">Elige tu nombre y escribe tu PIN.</p>
      </div>

      {staff.length === 0 ? (
        <p className="staff-note staff-note--warn">
          Todavía no hay personal dado de alta. Habla con el administrador.
        </p>
      ) : (
        <LoginForm staff={staff} />
      )}
    </main>
  );
}
