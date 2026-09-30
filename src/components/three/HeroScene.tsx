"use client";

import dynamic from "next/dynamic";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { useDeferredMount } from "@/hooks/useDeferredMount";

function PlanetFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
      <div
        className="h-[60vmin] w-[60vmin] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #7c3aed 0%, #4c1d95 40%, #0a0420 80%)",
          boxShadow: "0 0 100px 20px rgba(34,211,238,0.25)",
        }}
      />
    </div>
  );
}

const HeroSceneGL = dynamic(() => import("@/components/three/HeroSceneGL"), {
  ssr: false,
  loading: PlanetFallback,
});

export function HeroSceneCanvas() {
  const reduced = usePrefersReducedMotion();
  const { coarsePointer, lowEnd } = useDeviceCapability();
  const ready = useDeferredMount();

  if (!ready || reduced || lowEnd) return <PlanetFallback />;
  return <HeroSceneGL coarsePointer={coarsePointer} />;
}
