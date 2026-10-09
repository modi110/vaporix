"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";

import { ProgressTrack } from "@/components/loyalty/ProgressTrack";
import type { LoyaltyState } from "@/lib/loyalty/types";

/**
 * The staff screen.
 *
 * One decision at a time. Scanning only *looks up* the customer — nothing is
 * written until someone taps "Registrar visita". A scanner that counted on
 * sight would count every wallet it happened to see in a queue.
 */
type Screen =
  | { kind: "scanning" }
  | { kind: "found"; state: LoyaltyState }
  | { kind: "done"; state: LoyaltyState; message: string; tone: Tone };

type Tone = "ok" | "warn" | "stop";

/** Server result codes, in the language the counter actually needs. */
const MESSAGES: Record<string, { text: string; tone: Tone }> = {
  INVALID_TOKEN: { text: "Ese código no es de Vaporix.", tone: "stop" },
  CARD_INACTIVE: { text: "Esta tarjeta está desactivada.", tone: "stop" },
  STAFF_INVALID: { text: "Tu cuenta ya no está activa.", tone: "stop" },
  REWARD_PENDING: {
    text: "Esta tarjeta ya tiene la recompensa lista. Canjéala antes de sumar otra visita.",
    tone: "warn",
  },
  NO_REWARD: { text: "Esta tarjeta no tiene ninguna recompensa pendiente.", tone: "warn" },
  UNAUTHENTICATED: { text: "Tu sesión ha caducado. Vuelve a entrar.", tone: "stop" },
};

export function Scanner() {
  const [screen, setScreen] = useState<Screen>({ kind: "scanning" });
  const [notice, setNotice] = useState<{ text: string; tone: Tone } | null>(null);
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  // Guards against the camera firing the same code dozens of times a second
  // while it stays in frame.
  const lookingUp = useRef(false);

  const lookUp = useCallback(async (token: string) => {
    if (lookingUp.current) return;
    lookingUp.current = true;
    setNotice(null);

    try {
      const response = await fetch(
        `/api/loyalty/scan?token=${encodeURIComponent(token)}`,
      );
      const body = (await response.json()) as { code: string; state?: LoyaltyState };

      if (response.ok && body.state) {
        setScreen({ kind: "found", state: body.state });
      } else {
        setNotice(MESSAGES[body.code] ?? MESSAGES.INVALID_TOKEN);
      }
    } catch {
      setNotice({ text: "Sin conexión. Comprueba el wifi.", tone: "stop" });
    } finally {
      lookingUp.current = false;
    }
  }, []);

  // The camera runs only while the scanning screen is up — leaving it live
  // behind a result screen drains the battery and keeps the light on.
  useEffect(() => {
    if (screen.kind !== "scanning") return;

    const reader = new BrowserQRCodeReader();
    let controls: { stop: () => void } | undefined;
    let cancelled = false;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result) => {
        if (result) void lookUp(result.getText());
      })
      .then((c) => {
        if (cancelled) c.stop();
        else controls = c;
      })
      .catch(() => {
        setNotice({
          text: "No hay acceso a la cámara. Escribe el código a mano.",
          tone: "warn",
        });
      });

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [screen.kind, lookUp]);

  async function act(endpoint: "scan" | "redeem", qrToken: string) {
    if (busy) return;
    setBusy(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/loyalty/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken }),
      });
      const body = (await response.json()) as {
        code: string;
        state?: LoyaltyState;
        retryAfterSeconds?: number;
      };

      if (body.code === "OK" && body.state) {
        const full = body.state.rewardAvailable;
        setScreen({
          kind: "done",
          state: body.state,
          message:
            endpoint === "redeem"
              ? "Recompensa canjeada. La tarjeta vuelve a empezar."
              : full
                ? "Visita registrada. ¡Ya tiene la recompensa!"
                : "Visita registrada.",
          tone: "ok",
        });
        return;
      }

      if (body.code === "COOLDOWN") {
        setNotice({
          text: `Esta visita ya se registró hace unos segundos. Espera ${body.retryAfterSeconds ?? 0}s si de verdad es otra.`,
          tone: "warn",
        });
        if (body.state) setScreen({ kind: "found", state: body.state });
        return;
      }

      setNotice(MESSAGES[body.code] ?? MESSAGES.INVALID_TOKEN);
      if (body.state) setScreen({ kind: "found", state: body.state });
    } catch {
      setNotice({ text: "Sin conexión. Comprueba el wifi.", tone: "stop" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="staff-shell">
      <div className="staff-head">
        <p className="staff-wordmark">Vaporix</p>
        <form action="/api/staff/logout" method="post">
          <button className="staff-who staff-linkish" type="submit">
            Salir
          </button>
        </form>
      </div>

      {screen.kind === "scanning" ? (
        <>
          <div>
            <h1 className="staff-title">Escanear</h1>
            <p className="staff-lede">Apunta al código del cliente.</p>
          </div>

          <div className="staff-viewport">
            {/* muted + playsInline, or iOS refuses to start the preview. */}
            <video ref={videoRef} muted playsInline />
            <div className="staff-reticle" />
          </div>

          {notice ? (
            <p role="alert" className={`staff-note staff-note--${notice.tone}`}>
              {notice.text}
            </p>
          ) : null}

          <p className="staff-divider">o a mano</p>

          <form
            className="staff-card"
            onSubmit={(event) => {
              event.preventDefault();
              if (manual.trim()) void lookUp(manual.trim());
            }}
          >
            <div>
              <label className="staff-label" htmlFor="manual">
                N.º de cliente
              </label>
              {/* The seven digits printed under the QR. `inputMode` only asks
                  the phone for a number pad — the field still takes a pasted
                  token, which is what a tester with a copied link will use. */}
              <input
                id="manual"
                className="staff-field"
                value={manual}
                onChange={(event) => setManual(event.target.value)}
                placeholder="1234567"
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <button
              className="staff-button staff-button--quiet"
              type="submit"
              disabled={!manual.trim()}
            >
              Buscar
            </button>
          </form>
        </>
      ) : (
        <Customer
          screen={screen}
          notice={notice}
          busy={busy}
          onVisit={() => void act("scan", screen.state.qrToken)}
          onRedeem={() => void act("redeem", screen.state.qrToken)}
          onBack={() => {
            setNotice(null);
            setManual("");
            setScreen({ kind: "scanning" });
          }}
        />
      )}
    </main>
  );
}

function Customer({
  screen,
  notice,
  busy,
  onVisit,
  onRedeem,
  onBack,
}: {
  screen: Extract<Screen, { kind: "found" | "done" }>;
  notice: { text: string; tone: Tone } | null;
  busy: boolean;
  onVisit: () => void;
  onRedeem: () => void;
  onBack: () => void;
}) {
  const { state } = screen;
  const settled = screen.kind === "done";

  return (
    <>
      <div className="staff-card">
        <div className="staff-customer">
          <p className="staff-name">{state.customerName}</p>
          <p className="staff-count">
            <b>{state.visits}</b>
            <em>/ {state.visitsRequired}</em>
          </p>
        </div>

        <ProgressTrack
          visits={state.visits}
          total={state.visitsRequired}
          variant="ink"
        />

        {settled ? (
          <p className={`staff-note staff-note--${screen.tone}`}>{screen.message}</p>
        ) : null}

        {notice ? (
          <p role="alert" className={`staff-note staff-note--${notice.tone}`}>
            {notice.text}
          </p>
        ) : null}

        {!settled && state.rewardAvailable ? (
          <p className="staff-note staff-note--ok">
            Recompensa lista: {state.rewardLabelEs}
          </p>
        ) : null}

        {/* Redeeming stays offered on the confirmation screen, because the
            visit that fills the card is the visit the free wash belongs to —
            sending staff back to scan the same card again, at the one moment
            the customer is owed something, is where a reward gets forgotten.
            After a redemption the card is back to zero and `rewardAvailable`
            is false, so this collapses to no button at all. */}
        {state.rewardAvailable ? (
          <button className="staff-button" onClick={onRedeem} disabled={busy}>
            {busy ? "Canjeando…" : "Canjear recompensa"}
          </button>
        ) : settled ? null : (
          <button className="staff-button" onClick={onVisit} disabled={busy}>
            {busy ? "Registrando…" : "Registrar visita"}
          </button>
        )}
      </div>

      <button className="staff-button staff-button--quiet" onClick={onBack}>
        Escanear otro
      </button>
    </>
  );
}
