import { Monogram } from "./Monogram";

type Props = {
  /** "nav" sits inline in the header; "stacked" is for the footer. */
  variant?: "nav" | "stacked";
  className?: string;
};

/**
 * The VRK mark, white, matching the sign above the studio door.
 *
 * In the bar the mark stands alone — it is centred there, and pairing it with
 * the word would unbalance a three-column header on a 390px screen. The
 * footer has the room for the full lockup.
 */
export function Wordmark({ variant = "nav", className = "" }: Props) {
  if (variant === "stacked") {
    return (
      <span className={`inline-grid justify-items-start gap-3 ${className}`}>
        <span className="block w-24">
          <Monogram title="Vaporix" />
        </span>
        <span className="t-sub font-medium leading-none">Vaporix</span>
      </span>
    );
  }

  return (
    <span className={`block w-[52px] ${className}`}>
      <Monogram title="Vaporix" />
    </span>
  );
}
