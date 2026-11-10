import { cardFont } from "@/lib/fonts";
import type { LoyaltyState } from "@/lib/loyalty/types";
import "./loyalty-pass.css";

/** The gauge artwork exists for 0 to 3 paid washes, one image per count. */
const GAUGE_MAX = 3;

/**
 * The customer's loyalty card: the "Redline Gauge" design, the same artwork
 * as the Apple and Google Wallet passes (`loyalty system/wallet-design/`).
 *
 * The dial is one picture per count, so this component only chooses which
 * picture to show and prints the numbers around it. Every value comes from
 * `state`, which comes from the database — nothing here is computed in the
 * browser, which is the whole reason a customer cannot award themselves a wash.
 */
export function LoyaltyPass({
  state,
  qrSvg,
  copy,
  celebrating = false,
  nameTag: Name = "h1",
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
   * the database, but it keeps showing the finished dial for a few hours so
   * the customer sees what they earned instead of an empty card.
   */
  celebrating?: boolean;
  /**
   * The customer's own card is the page, so its name is the page's heading.
   * A sample card on a marketing page is an illustration and must not add a
   * second <h1> to that page's outline.
   */
  nameTag?: "h1" | "p";
}) {
  const filled = celebrating ? state.visitsRequired : state.visits;
  // The artwork stops at three washes. A longer programme would need more dial
  // images; until they exist the dial stays at its last picture.
  const gauge = Math.min(Math.max(filled, 0), GAUGE_MAX);
  const base = `/images/card/gauge/strip-${gauge}`;

  return (
    <div className={`pass-scope ${cardFont.variable}`}>
      <article className="pass">
        <header className="pass__head">
          <div className="pass__brand">
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed 150px mark, already optimised */}
            <img src="/images/card/gauge/mark.png" alt="" width={150} height={150} />
            <span>VAPORIX</span>
          </div>
          <div className="pass__count">
            <span>{copy.washesLabel}</span>
            <b>
              {filled}/{state.visitsRequired}
            </b>
          </div>
        </header>

        {/* `key` restarts the fade when a wash is counted. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- the dial is a fixed pair of files per count */}
        <img
          key={gauge}
          className="pass__gauge"
          src={`${base}.png`}
          srcSet={`${base}.png 1x, ${base}@3x.png 1.5x`}
          alt=""
          width={750}
          height={288}
        />

        <div className="pass__body">
          <Name className="pass__name">{state.customerName}</Name>
          <p className="pass__status">{copy.status}</p>
        </div>

        <div className="pass__code">
          {/* Server-rendered SVG: crisp at any size, no image request, and no
              client JavaScript to draw it. White plate behind it: a scanner
              needs a black code on a light ground. */}
          <div className="pass__qr" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <p className="pass__custlabel">{copy.customerLabel}</p>
          <p className="pass__custnum">{state.cardNumber}</p>
        </div>
      </article>
    </div>
  );
}
