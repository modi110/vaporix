/**
 * Line glyphs for the services lists, drawn in `currentColor` at the same
 * hairline weight as `SocialIcon` and `HighlightIcon`.
 */
export type ServiceIconId =
  | "oil"
  | "brakes"
  | "tyre"
  | "battery"
  | "boost"
  | "repairs"
  | "bulbs"
  | "inspection"
  | "mobile";

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
      ) : id === "repairs" ? (
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
      ) : id === "bulbs" ? (
        <>
          <path d="M9 17.5h6M9.8 20.5h4.4" />
          <path d="M9 17.5v-1.8c0-1-.5-1.8-1.2-2.6A5.5 5.5 0 1 1 16.2 13c-.7.8-1.2 1.7-1.2 2.7v1.8" />
        </>
      ) : id === "inspection" ? (
        <>
          <rect x="5" y="4.5" width="14" height="16.5" rx="1" />
          <path d="M9 3h6v3H9Z" />
          <path d="m8.8 13.2 2.2 2.2 4.4-4.6" />
        </>
      ) : id === "mobile" ? (
        <>
          <path d="M2.5 16.5V9.5a1 1 0 0 1 1-1h9.5v8" />
          <path d="M13 11h4l3.5 3v2.5H19" />
          <path d="M5 16.5h1.5M11 16.5h4" />
          <circle cx="8.7" cy="16.8" r="1.7" />
          <circle cx="17" cy="16.8" r="1.7" />
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
