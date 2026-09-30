"use client";

import { Canvas } from "@react-three/fiber";
import { Planet } from "@/components/three/Planet";
import { OrbitingTechs } from "@/components/three/OrbitingTechs";

/** Chargé par import() depuis HeroScene : garde three.js hors du bundle initial. */
export default function HeroSceneGL({ coarsePointer }: { coarsePointer: boolean }) {
  const dpr: [number, number] = coarsePointer ? [1, 1.25] : [1, 1.75];

  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 0.6, 6], fov: 45 }}
      dpr={dpr}
      gl={{ antialias: !coarsePointer, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.15} />
      <Planet />
      <OrbitingTechs />
    </Canvas>
  );
}
