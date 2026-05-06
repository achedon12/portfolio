"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface OrbitTech {
  name: string;
  /** Couleur du satellite (sera émissive) */
  color: string;
  /** Rayon de l'orbite */
  radius: number;
  /** Vitesse angulaire (rad/s) */
  speed: number;
  /** Inclinaison de l'orbite (rad) */
  tilt: number;
  /** Phase initiale */
  phase: number;
}

const ORBIT_TECHS: OrbitTech[] = [
  { name: "Next.js", color: "#22d3ee", radius: 2.6, speed: 0.45, tilt: 0.0, phase: 0 },
  { name: "Symfony", color: "#7c3aed", radius: 3.0, speed: -0.3, tilt: 0.5, phase: 1.0 },
  { name: "React", color: "#22d3ee", radius: 2.4, speed: 0.6, tilt: -0.3, phase: 2.0 },
  { name: "MySQL", color: "#a78bfa", radius: 3.4, speed: 0.22, tilt: 0.8, phase: 3.0 },
  { name: "Docker", color: "#fb923c", radius: 2.85, speed: -0.4, tilt: -0.5, phase: 4.5 },
  { name: "Three.js", color: "#22d3ee", radius: 3.2, speed: 0.35, tilt: 0.2, phase: 5.5 },
];

/**
 * Satellites en orbite : pour chacun une petite sphère émissive + une "trail"
 * (ring fin) qui matérialise l'orbite. Pas de label HTML — la lecture des
 * technos est dans la HUD overlay (Hero.tsx).
 */
export function OrbitingTechs() {
  const groupRefs = useRef<(THREE.Group | null)[]>([]);

  const orbitLines = useMemo(() => {
    return ORBIT_TECHS.map((t) => {
      const segments = 96;
      const positions = new Float32Array((segments + 1) * 3);
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        positions[i * 3 + 0] = Math.cos(a) * t.radius;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = Math.sin(a) * t.radius;
      }
      return positions;
    });
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    ORBIT_TECHS.forEach((tech, i) => {
      const g = groupRefs.current[i];
      if (!g) return;
      const a = tech.phase + t * tech.speed;
      g.position.x = Math.cos(a) * tech.radius;
      g.position.z = Math.sin(a) * tech.radius;
      g.position.y = 0;
    });
  });

  return (
    <>
      {ORBIT_TECHS.map((tech, i) => (
        <group key={tech.name} rotation={[tech.tilt, 0, 0]}>
          <line>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[orbitLines[i], 3]} />
            </bufferGeometry>
            <lineBasicMaterial color={tech.color} transparent opacity={0.12} />
          </line>

          <group ref={(el) => { groupRefs.current[i] = el; }}>
            <mesh>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color={tech.color} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshBasicMaterial color={tech.color} transparent opacity={0.15} />
            </mesh>
          </group>
        </group>
      ))}
    </>
  );
}

export const orbitTechNames = ORBIT_TECHS.map((t) => t.name);
