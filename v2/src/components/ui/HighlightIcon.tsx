/**
 * Line glyphs for the four `Highlights` cards, drawn in `currentColor` at the
 * same hairline weight as `SocialIcon` — flat, no fill, nothing borrowed from
 * the one accent colour.
 */
export type HighlightIconId = "price" | "chat" | "clock" | "calendar";

export function HighlightIcon({
  id,
  className = "",
}: {
  id: HighlightIconId;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {id === "price" ? (
        <>
          <path d="M3.5 3.5h7.7c.4 0 .78.16 1.06.44l7.9 7.9a1.5 1.5 0 0 1 0 2.12l-6.1 6.1a1.5 1.5 0 0 1-2.12 0l-7.9-7.9A1.5 1.5 0 0 1 3.5 11.1V3.5Z" />
          <circle cx="8.1" cy="8.1" r="1.3" />
        </>
      ) : id === "chat" ? (
        <path d="M4.5 5h15A1.5 1.5 0 0 1 21 6.5v8a1.5 1.5 0 0 1-1.5 1.5H10l-4.3 3.4V16H4.5A1.5 1.5 0 0 1 3 14.5v-8A1.5 1.5 0 0 1 4.5 5Z" />
      ) : id === "clock" ? (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7.5V12l3.2 2" />
        </>
      ) : (
        /* A week with every day marked — the point of the card is that none of
           the seven is missing, so the row of marks runs edge to edge. */
        <>
          <rect x="3" y="5.5" width="18" height="15" />
          <path d="M3 10.5h18M8 3.2v4.4M16 3.2v4.4" />
          <path d="M6.6 14.3h1.2M11.4 14.3h1.2M16.2 14.3h1.2M6.6 17.6h1.2M11.4 17.6h1.2M16.2 17.6h1.2" />
        </>
      )}
    </svg>
  );
}
