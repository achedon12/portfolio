"use client";

import dynamic from "next/dynamic";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { useDeferredMount } from "@/hooks/useDeferredMount";

function StarfieldFallback() {
  return (
    <div
      aria-hidden
      className="starfield-canvas fixed inset-0 -z-10 bg-cosmos-deep"
      style={{
        backgroundImage:
          "radial-gradient(1px 1px at 20% 30%, #e2e8f0 50%, transparent), radial-gradient(1px 1px at 70% 80%, #a78bfa 50%, transparent), radial-gradient(1px 1px at 40% 60%, #22d3ee 50%, transparent), radial-gradient(1px 1px at 85% 15%, #e2e8f0 50%, transparent)",
        backgroundSize: "800px 800px",
      }}
    />
  );
}

const StarfieldGL = dynamic(() => import("@/components/three/StarfieldGL"), {
  ssr: false,
  loading: StarfieldFallback,
});

export function StarfieldCanvas() {
  const reduced = usePrefersReducedMotion();
  const { coarsePointer, lowEnd } = useDeviceCapability();
  const ready = useDeferredMount();

  if (!ready || reduced || lowEnd) return <StarfieldFallback />;
  return <StarfieldGL coarsePointer={coarsePointer} />;
}
