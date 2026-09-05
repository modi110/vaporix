/**
 * The opener on every page that is not the home page.
 *
 * Sits on the navy band because it meets the fixed nav directly — a light
 * header would put a hard seam right under the bar. The top padding clears
 * that bar plus the notch.
 */
export function PageHeader({
  title,
  lede,
}: {
  title: string;
  lede?: string;
}) {
  return (
    <header className="bg-navy text-pearl">
      <div
        className="wrap pb-[var(--pad-section)]"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 8rem)",
        }}
      >
        <h1 className="t-display-lg max-w-[14ch]">{title}</h1>
        {lede ? <p className="t-body mt-6 text-muted-invert">{lede}</p> : null}
      </div>
    </header>
  );
}
