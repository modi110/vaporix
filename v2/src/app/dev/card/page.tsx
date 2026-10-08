import { notFound } from "next/navigation";

import { LoyaltyPass } from "@/components/loyalty/LoyaltyPass";
import { renderQrSvg } from "@/lib/loyalty/qr";
import type { LoyaltyState } from "@/lib/loyalty/types";

/**
 * Every state of the card, side by side, rendered by the real component.
 *
 * No database: the states are built by hand so the whole cycle can be
 * reviewed before any of it exists as data, and so a design change can be
 * checked against all six at once rather than by registering six customers.
 */
export const dynamic = "force-dynamic";

const TOTAL = 5;
const REWARD_ES = "Lavado GRATIS";

/** Mirrors the copy the real card page builds from next-intl. */
function status(visits: number) {
  const left = TOTAL - visits;

  if (left === 0) {
    return (
      <>
        ¡Tu <b>{REWARD_ES}</b> te está esperando!
      </>
    );
  }
  if (left === 1) {
    return (
      <>
        ¡Te falta <b>1</b> lavado para conseguir tu <b>{REWARD_ES}</b>!
      </>
    );
  }
  return (
    <>
      ¡Te faltan <b>{left}</b> lavados para conseguir tu <b>{REWARD_ES}</b>!
    </>
  );
}

function fakeState(visits: number): LoyaltyState {
  return {
    qrToken: "VPR_ejemploTokenDeMuestra1234567890",
    cardNumber: "2116624",
    customerName: "Wesam",
    visits,
    visitsRequired: TOTAL,
    rewardAvailable: visits >= TOTAL,
    active: true,
    rewardLabelEs: REWARD_ES,
    rewardLabelEn: "Free wash",
  };
}

export default async function DevCardPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const qrSvg = await renderQrSvg("VPR_ejemploTokenDeMuestra1234567890");

  return (
    <main
      style={{
        display: "grid",
        gap: "32px",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        margin: "0 auto",
        maxWidth: "1280px",
        padding: "40px 24px 80px",
      }}
    >
      {Array.from({ length: TOTAL + 1 }, (_, visits) => (
        <div key={visits} style={{ display: "grid", gap: "12px" }}>
          <p
            style={{
              color: "#5a6b84",
              font: "800 12px/1.4 system-ui, sans-serif",
              letterSpacing: "0.06em",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            {visits} / {TOTAL}
            {visits === TOTAL ? " · recompensa lista" : ""}
          </p>
          <LoyaltyPass
            state={fakeState(visits)}
            qrSvg={qrSvg}
            copy={{
              washesLabel: "Tus lavados",
              status: status(visits),
              customerLabel: "N.º de cliente",
            }}
          />
        </div>
      ))}
    </main>
  );
}
