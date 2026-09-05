"use client";

import { useEffect, useRef } from "react";
import { Monogram } from "@/components/brand/Monogram";

export const PRELOAD_KEY = "vaporix:preloaded";

/**
 * How long the CSS curtain takes to clear, plus a margin. Only used as a
 * backstop for unlocking the scroll if `animationend` never arrives.
 */
const CURTAIN_MS = 1600;

/**
 * Blocking script for <head>. Stamps the document *before first paint* when
 * the curtain has already run this session, so a second page view never
 * flashes it. React state cannot act early enough to prevent that flash.
 */
export const preloadFlagScript = `try{if(sessionStorage.getItem(${JSON.stringify(
  PRELOAD_KEY,
)})==="1")document.documentElement.dataset.preloaded="1"}catch(e){}`;

/**
 * The site's one orchestrated moment: the mark wipes in, then the curtain
 * lifts.
 *
 * **The animation is CSS, in `globals.css`, and that is deliberate.** v2's
 * first phone test found the whole site unreachable behind this overlay when
 * its script did not finish — no menu, no carousel, no scrolling. A loading
 * screen must not be able to do that, so the lift now runs as a keyframe
 * animation whether or not any JavaScript executes.
 *
 * What is left here is only what genuinely needs a script: locking the scroll
 * while the curtain is up, unlocking it after, and remembering that it has
 * played so it does not repeat on every navigation. Each of those fails safe —
 * if this component never runs at all, the scroll was simply never locked and
 * the CSS still clears the curtain.
 *
 * It is a second long, once per session. Apple's guidance is that a launch
 * screen is not a branding opportunity, and the cost is measurable: the hero
 * photograph loads behind this rather than after it, but a longer curtain
 * still delays when anyone can act on it.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    // Already seen this session: the head script has hidden it via CSS.
    if (document.documentElement.dataset.preloaded === "1") return;

    const html = document.documentElement;
    html.style.overflow = "hidden";

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      html.style.overflow = "";
      html.dataset.preloaded = "1";
      try {
        sessionStorage.setItem(PRELOAD_KEY, "1");
      } catch {
        // Private browsing can throw; worst case the curtain plays again.
      }
    };

    el.addEventListener("animationend", finish);
    // Backstop, in case the animation is skipped or the event never lands.
    const timer = window.setTimeout(finish, CURTAIN_MS);

    return () => {
      el.removeEventListener("animationend", finish);
      window.clearTimeout(timer);
      html.style.overflow = "";
    };
  }, []);

  return (
    <div
      ref={root}
      id="preloader"
      aria-hidden="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-void"
    >
      {/* The mark wipes in from the left rather than fading: a stencilled
          mark revealing itself edge-first suits the artwork, where an opacity
          ramp would just read as a slow image load. */}
      <div className="preloader-mark w-[min(220px,52vw)]">
        <Monogram priority />
      </div>
    </div>
  );
}
