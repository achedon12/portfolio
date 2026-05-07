"use client";

import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { Starfield } from "@/components/three/Starfield";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

function StarfieldCanvasInner() {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
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

  return (
    <div aria-hidden className="starfield-canvas fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <Starfield />
      </Canvas>
    </div>
  );
}

export const StarfieldCanvas = dynamic(() => Promise.resolve(StarfieldCanvasInner), {
  ssr: false,
});
