"use client";

import { useRef, type RefObject } from "react";

/** Past this a pointer gesture was a drag, and the click underneath is suppressed. */
const DRAG_SLOP = 6;

/**
 * Mouse dragging for a native scroll-snap rail. Touch already scrolls, so
 * touch pointers are ignored; this only gives a desktop visitor something to
 * grab. Spread the returned handlers on the container `ref` points at.
 */
export function useDragRail(ref: RefObject<HTMLElement | null>) {
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: 0 });

  return {
    onPointerDown: (e: React.PointerEvent) => {
      const el = ref.current;
      if (!el || e.pointerType === "touch") return;
      // Mandatory snapping fights a mouse drag: every frame the pointer moves,
      // the browser drags the scroll position back to the nearest snap point,
      // which is what made this stutter. Off while the button is down, back on
      // when it lifts so the rail still settles on a card.
      el.style.scrollSnapType = "none";
      drag.current = {
        down: true,
        startX: e.clientX,
        startScroll: el.scrollLeft,
        moved: 0,
      };
    },
    onPointerMove: (e: React.PointerEvent) => {
      const el = ref.current;
      if (!el || !drag.current.down) return;
      const dx = e.clientX - drag.current.startX;
      drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
      el.scrollLeft = drag.current.startScroll - dx;
    },
    onPointerUp: () => {
      drag.current.down = false;
      if (ref.current) ref.current.style.scrollSnapType = "";
    },
    onPointerLeave: () => {
      drag.current.down = false;
      if (ref.current) ref.current.style.scrollSnapType = "";
    },
    // A drag that ends over a link must not also follow it.
    onClickCapture: (e: React.MouseEvent) => {
      if (drag.current.moved > DRAG_SLOP) {
        e.preventDefault();
        e.stopPropagation();
        drag.current.moved = 0;
      }
    },
  };
}
