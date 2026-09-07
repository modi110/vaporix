/**
 * Line glyphs for the `/services` list, drawn in `currentColor` at the same
 * hairline weight as `SocialIcon` and `HighlightIcon`.
 */
export type ServiceIconId = "oil" | "brakes" | "tyre" | "battery" | "boost";

export function ServiceIcon({
  id,
  className = "",
}: {
  id: ServiceIconId;
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
      {id === "oil" ? (
        <path d="M12 3.2c-2.9 3.8-5.6 6.9-5.6 10.1A5.6 5.6 0 0 0 12 18.9a5.6 5.6 0 0 0 5.6-5.6c0-3.2-2.7-6.3-5.6-10.1Z" />
      ) : id === "brakes" ? (
        <>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
          <circle cx="17.5" cy="12" r="0.6" fill="currentColor" stroke="none" />
          <circle cx="12" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
          <circle cx="6.5" cy="12" r="0.6" fill="currentColor" stroke="none" />
        </>
      ) : id === "tyre" ? (
        <>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 8.8V5.7M15.04 11.01l2.95-.96M13.88 14.59l1.82 2.51M10.12 14.59l-1.82 2.51M8.96 10.99l-2.95-.94" />
        </>
      ) : id === "battery" ? (
        <>
          <rect x="3" y="7.5" width="16" height="9" rx="0.8" />
          <rect x="19" y="10.3" width="2" height="3.4" fill="currentColor" stroke="none" />
          <path d="M7.5 7.5v9M15 7.5v9" strokeWidth={1} opacity={0.6} />
        </>
      ) : (
        <>
          <rect x="3" y="7.5" width="16" height="9" rx="0.8" />
          <rect x="19" y="10.3" width="2" height="3.4" fill="currentColor" stroke="none" />
          <path d="M12.6 8.6 9.4 12.9h2l-.6 3.5 3.6-4.7h-2Z" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}
