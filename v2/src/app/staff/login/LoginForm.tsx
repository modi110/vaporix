"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { StaffSummary } from "@/lib/auth/staff";

/**
 * Pick a name, type a PIN.
 *
 * Two steps rather than one field, because a PIN alone would have to be
 * checked against every staff row — and then a wrong PIN could not be
 * attributed to anyone, which is what the lockout counts.
 */
export function LoginForm({ staff }: { staff: StaffSummary[] }) {
  const router = useRouter();
  const [staffId, setStaffId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!staffId || pending) return;

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, pin }),
      });

      if (response.ok) {
        // Refresh so the server re-reads the new cookie before navigating.
        router.replace("/staff");
        router.refresh();
        return;
      }

      const body = (await response.json()) as { reason?: string };
      setError(
        body.reason === "LOCKED"
          ? "Demasiados intentos. Espera cinco minutos."
          : body.reason === "ERROR"
            ? "Algo ha fallado en el servidor. Inténtalo otra vez."
            : "PIN incorrecto.",
      );
      setPin("");
    } catch {
      setError("No hay conexión. Comprueba el wifi e inténtalo otra vez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="staff-card" onSubmit={submit}>
      <div>
        <span className="staff-label">Quién eres</span>
        <div className="staff-people">
          {staff.map((person) => (
            <button
              key={person.id}
              type="button"
              className="staff-person"
              aria-pressed={staffId === person.id}
              onClick={() => {
                setStaffId(person.id);
                setError(null);
              }}
            >
              {person.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="staff-label" htmlFor="pin">
          Tu PIN
        </label>
        <input
          id="pin"
          className="staff-field staff-pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={12}
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          disabled={!staffId}
        />
      </div>

      {error ? (
        <p role="alert" className="staff-note staff-note--stop">
          {error}
        </p>
      ) : null}

      <button
        className="staff-button"
        type="submit"
        disabled={!staffId || pin.length < 4 || pending}
      >
        {pending ? "Comprobando…" : "Entrar"}
      </button>
    </form>
  );
}
