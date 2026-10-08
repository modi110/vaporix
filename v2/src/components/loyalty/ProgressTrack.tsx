/**
 * The three-segment progress bar, shared by the customer's pass and the
 * staff screen so the two can never disagree about what 2/3 looks like.
 *
 * Decorative by design: the count is always stated in words beside it, so
 * nothing here is the only carrier of meaning.
 */
export function ProgressTrack({
  visits,
  total,
  variant = "field",
  className = "",
}: {
  visits: number;
  total: number;
  /** `ink` inverts the colours for the light staff surface. */
  variant?: "field" | "ink";
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`track ${variant === "ink" ? "track--ink" : ""} ${className}`}
      style={{ ["--track-count" as string]: total }}
    >
      {Array.from({ length: total }, (_, index) => (
        <i key={index} className={index < visits ? "is-on" : undefined} />
      ))}
    </div>
  );
}
