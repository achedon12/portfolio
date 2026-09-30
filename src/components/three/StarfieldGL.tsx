"use client";

import { Canvas } from "@react-three/fiber";
import { Starfield } from "@/components/three/Starfield";

/**
 * Canvas du fond étoilé. Chargé uniquement via `import()` depuis
 * StarfieldCanvas.tsx pour garder three.js hors du bundle initial.
 */
export default function StarfieldGL({ coarsePointer }: { coarsePointer: boolean }) {
  const dpr: [number, number] = coarsePointer ? [1, 1] : [1, 1.5];

  return (
    <div aria-hidden className="starfield-canvas fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        dpr={dpr}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <Starfield mobile={coarsePointer} />
      </Canvas>
    </div>
  );
}
