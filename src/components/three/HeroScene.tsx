"use client";

import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { Planet } from "@/components/three/Planet";
import { OrbitingTechs } from "@/components/three/OrbitingTechs";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

function HeroSceneInner() {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
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

  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 0.6, 6], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.15} />
      <Planet />
      <OrbitingTechs />
    </Canvas>
  );
}

export const HeroSceneCanvas = dynamic(() => Promise.resolve(HeroSceneInner), { ssr: false });
