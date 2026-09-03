import { BrandMark } from "./BrandMark";

type Props = {
  /** "nav" sits inline in the header; "stacked" is for the footer. */
  variant?: "nav" | "stacked";
  className?: string;
  label?: string;
};

export function Wordmark({ variant = "nav", className = "", label }: Props) {
  if (variant === "stacked") {
    return (
      <span className={`inline-grid justify-items-start gap-3 ${className}`}>
        <BrandMark className="h-8 text-ink" label={label} />
        <span className="t-label text-[0.5625rem] tracking-[0.3em]">
          Detailing &amp; Care
        </span>
      </span>
    );
  }

  return (
    <BrandMark
      className={`h-[22px] text-ink sm:h-6 ${className}`}
      label={label}
    />
  );
}
