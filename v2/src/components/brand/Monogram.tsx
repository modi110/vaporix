import Image from "next/image";

/**
 * The VRK mark, from the studio's own artwork.
 *
 * v1 drew this by hand as SVG paths. The client's own file has eroded,
 * stencilled edges that hand paths cannot reproduce honestly, so this is the
 * real artwork instead — converted once by `sharp` from white-on-black to
 * white-on-transparent, using the source's own luminance as the alpha channel
 * so the rough edges survive as real soft alpha rather than a hard cutout.
 *
 * White only. The mark sits exclusively on the dark bands, and the design
 * system has no second accent for it to take.
 */
export const MARK_RATIO = 2042 / 737;

export function Monogram({
  className = "",
  title,
  priority = false,
}: {
  className?: string;
  title?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/images/vrk.webp"
      alt={title ?? ""}
      width={2042}
      height={737}
      priority={priority}
      // Height follows from the width the caller sets; the ratio is fixed.
      className={`h-auto w-full ${className}`}
      aria-hidden={title ? undefined : true}
    />
  );
}
