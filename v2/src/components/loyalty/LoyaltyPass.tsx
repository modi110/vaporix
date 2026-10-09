import { cardFont } from "@/lib/fonts";
import type { LoyaltyState } from "@/lib/loyalty/types";
import "./loyalty-pass.css";

/**
 * The customer's loyalty card.
 *
 * The artwork underneath is the owner's own file; this component draws only
 * the parts that change. Every one of those values comes from `state`, which
 * comes from the database — nothing here is computed in the browser, which is
 * the whole reason a customer cannot award themselves a wash.
 */
export function LoyaltyPass({
  state,
  qrSvg,
  copy,
  celebrating = false,
}: {
  state: LoyaltyState;
  /** Pre-rendered on the server by `renderQrSvg`. */
  qrSvg: string;
  copy: {
    washesLabel: string;
    /** Already localized, with the emphasis markup resolved by the caller. */
    status: React.ReactNode;
    customerLabel: string;
  };
  /**
   * The free wash has just been given. The card is already back to zero in
   * the database, but it keeps showing the finished row for a few hours so
   * the customer sees what they earned instead of an empty card.
   */
  celebrating?: boolean;
}) {
  // The last slot is the free wash, so the row is one longer than the number
  // of washes the customer pays for.
  const slots = state.visitsRequired + 1;
  const filled = celebrating ? state.visitsRequired : state.visits;
  const giftLit = celebrating || state.rewardAvailable;

  return (
    <div className={`pass-scope ${cardFont.variable}`}>
      <article className="pass">
        <div className="pass__logo" role="img" aria-label="Vaporix" />

        <h1 className="pass__name">{state.customerName}</h1>
        <p className="pass__eyebrow">{copy.washesLabel}</p>
        <p className="pass__score">
          <b>{filled}</b>
          <span>/ {state.visitsRequired}</span>
        </p>

        <ol className="pass__stamps" style={{ ["--stamp-count" as string]: slots }}>
          {Array.from({ length: state.visitsRequired }, (_, index) => (
            <li
              key={index}
              className={`stamp ${index < filled ? "stamp--on" : ""}`}
            />
          ))}
          <li className={`stamp stamp--gift ${giftLit ? "stamp--gift-on" : ""}`} />
        </ol>

        <div className="pass__rule" />
        <p className="pass__status">{copy.status}</p>

        {/* Server-rendered SVG: crisp at any size, no image request, and no
            client JavaScript to draw it. */}
        <div className="pass__qr" dangerouslySetInnerHTML={{ __html: qrSvg }} />

        <p className="pass__custlabel">{copy.customerLabel}</p>
        <p className="pass__custnum">{state.cardNumber}</p>
      </article>
    </div>
  );
}
