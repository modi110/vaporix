import { Fragment } from "react";

/**
 * Splits a heading into per-word masks at render time.
 *
 * Deliberately server-rendered rather than done with GSAP SplitText: the
 * markup ships complete, so there is no flash of unsplit text and the words
 * still read as one sentence to a screen reader.
 */
export function SplitText({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);

  return (
    <>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="split-word" aria-hidden="true">
            <i style={{ transitionDelay: `${i * 45}ms` }}>{word}</i>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
      <span className="sr-only">{text}</span>
    </>
  );
}
