"use client";

import { useEffect, useState } from "react";

const INTERACTION_EVENTS = ["pointerdown", "touchstart", "scroll", "keydown", "wheel"] as const;

/**
 * Retarde un rendu lourd (WebGL) pour préserver LCP et TBT : desktop après
 * `load` + idle, mobile à la première interaction.
 */
export function useDeferredMount(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const go = () => {
      if (!cancelled) setReady(true);
    };

    const mobile =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 767px)").matches;

    if (mobile) {
      const onInteract = () => {
        INTERACTION_EVENTS.forEach((e) => window.removeEventListener(e, onInteract));
        go();
      };
      INTERACTION_EVENTS.forEach((e) =>
        window.addEventListener(e, onInteract, { once: true, passive: true }),
      );
      return () => {
        cancelled = true;
        INTERACTION_EVENTS.forEach((e) => window.removeEventListener(e, onInteract));
      };
    }

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(go, { timeout: 2000 });
      } else {
        timeoutId = setTimeout(go, 200);
      }
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  return ready;
}
