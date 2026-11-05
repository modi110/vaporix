"use client";

import { useEffect } from "react";

/**
 * The phone half of the `.lift` effect (see globals.css): marks the item a
 * finger is on, and lets it settle back shortly after the finger lifts.
 *
 * One listener on the document rather than one per item, so items on any
 * page — including ones added later — work without opting in here.
 */
export function LiftTouch() {
  useEffect(() => {
    let current: HTMLElement | null = null;
    let timer = 0;

    const release = () => {
      current?.classList.remove("is-touched");
      current = null;
    };

    const onStart = (e: TouchEvent) => {
      const item = (e.target as Element | null)?.closest<HTMLElement>(".lift");
      window.clearTimeout(timer);
      if (item !== current) release();
      if (!item) return;
      current = item;
      item.classList.add("is-touched");
    };

    const onEnd = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(release, 600);
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchend", onEnd);
    document.addEventListener("touchcancel", onEnd);
    return () => {
      window.clearTimeout(timer);
      release();
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  return null;
}
