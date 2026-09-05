/**
 * Social glyphs drawn in `currentColor` at hairline weight, so they inherit
 * the rail's hover swap instead of carrying brand colour into a palette that
 * only ever uses one accent.
 */
export type SocialIconId = "instagram" | "whatsapp";

export function SocialIcon({
  id,
  className = "",
}: {
  id: SocialIconId;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {id === "instagram" ? (
        <>
          <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" />
          <circle cx="12" cy="12" r="4.1" />
          <circle cx="17.1" cy="6.9" r="1.05" fill="currentColor" stroke="none" />
        </>
      ) : (
        <>
          <path d="M20.9 11.7a8.5 8.5 0 0 1-12.6 7.4l-4.8 1.4 1.4-4.7A8.5 8.5 0 1 1 20.9 11.7Z" />
          {/* the handset, scaled down so it sits inside the bubble */}
          <g transform="translate(6.7 6.15) scale(0.44)" strokeWidth={3.4}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
          </g>
        </>
      )}
    </svg>
  );
}
