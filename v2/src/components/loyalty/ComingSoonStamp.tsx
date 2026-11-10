/**
 * "Coming soon", drawn as a rubber stamp pressed onto the card — the
 * programme is a stamp card, so the notice speaks the same language.
 *
 * Gold on the blue bands (the card's own free-wash colour), deep navy on
 * white. Purely visual: the text is real, so screen readers read it.
 *
 * Remove it, and the overlay in `loyalty/page.tsx`, when signups open.
 */
export function ComingSoonStamp({
  label,
  tone = "gold",
  className = "",
}: {
  label: string;
  tone?: "gold" | "navy";
  className?: string;
}) {
  const color =
    tone === "gold" ? "text-[#E8C547] border-[#E8C547]" : "text-giallo-deep border-giallo-deep";

  return (
    <span
      className={`inline-block -rotate-[8deg] border-[3px] p-[3px] ${color} ${className}`}
    >
      <span className="block border border-current px-4 py-1.5 text-center text-lg font-semibold uppercase leading-none tracking-[0.14em] sm:text-xl">
        {label}
      </span>
    </span>
  );
}
