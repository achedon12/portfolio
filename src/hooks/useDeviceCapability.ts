"use client";

import { useEffect, useState } from "react";

/**
 * Capacités détectées pour adapter le rendu (R3F, animations).
 * - `coarsePointer` : touch device → typiquement mobile/tablette → throttle GPU/scroll natif.
 * - `lowEnd` : appareil mobile faible (low device memory ou hardware concurrency réduite).
 */
export interface DeviceCapability {
  coarsePointer: boolean;
  lowEnd: boolean;
}

export function useDeviceCapability(): DeviceCapability {
  const [caps, setCaps] = useState<DeviceCapability>({
    coarsePointer: false,
    lowEnd: false,
  });

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = navigator.hardwareConcurrency ?? 8;
    const memory = nav.deviceMemory ?? 8;
    const lowEnd = coarse && (cores <= 4 || memory <= 4);
    setCaps({ coarsePointer: coarse, lowEnd });
  }, []);

  return caps;
}
