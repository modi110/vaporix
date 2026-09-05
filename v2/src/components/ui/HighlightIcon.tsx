/**
 * Line glyphs for the four `Highlights` cards, drawn in `currentColor` at the
 * same hairline weight as `SocialIcon` — flat, no fill, nothing borrowed from
 * the one accent colour.
 */
export type HighlightIconId = "price" | "chat" | "clock" | "star";

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
        <path d="M12 3.5 14.5 9.3 20.8 9.9 16.1 14.1 17.5 20.3 12 17 6.5 20.3 7.9 14.1 3.2 9.9 9.5 9.3Z" />
      )}
    </svg>
  );
}
