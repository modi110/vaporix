import { SplitText } from "@/components/ui/SplitText";

/**
 * Shared masthead for every sub-page: the label, the statement, and an
 * optional lede. Keeps the type rhythm identical across the site so the
 * pages read as one publication.
 */
export function PageHeader({
  label,
  title,
  lede,
}: {
  label: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="section relative pb-0 pt-[clamp(9rem,16vw,14rem)]">
      <div
        aria-hidden="true"
        className="glow-vapor pointer-events-none absolute -left-[10%] -top-[10%] size-[620px] rounded-full"
        data-speed="0.88"
      />
      <div className="wrap relative">
        <p className="t-label mb-6" data-reveal>
          {label}
        </p>
        <h1 className="t-h1 max-w-[16ch]" data-split>
          <SplitText text={title} />
        </h1>
        {lede ? (
          <p className="t-lede mt-7" data-reveal>
            {lede}
          </p>
        ) : null}
      </div>
    </header>
  );
}
