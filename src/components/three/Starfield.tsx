"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StarLayerProps {
  count: number;
  spread: number;
  size: number;
  color: string;
  /** Vitesse de rotation (rad/sec) — plus lent = plus loin */
  rotationSpeed: number;
  /** Réactivité au scroll — facteur d'amortissement parallaxe */
  scrollFactor: number;
}

/**
 * Une couche d'étoiles : un Points avec un shader minimal qui :
 *  - Dessine chaque vertex en rond doux (gl_PointCoord → distance au centre).
 *  - Module l'opacité par un sin(time + offset) pour un scintillement subtil.
 * Vec d'attribut `aSeed` pour décaler la phase de chaque étoile.
 */
function StarLayer({ count, spread, size, color, rotationSpeed, scrollFactor }: StarLayerProps) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);

  const { positions, seeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      let x, y, s;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        s = x * x + y * y;
      } while (s >= 1);
      const factor = 2 * Math.sqrt(1 - s);
      pos[i * 3 + 0] = x * factor * spread;
      pos[i * 3 + 1] = y * factor * spread;
      pos[i * 3 + 2] = (1 - 2 * s) * spread;
      sd[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, seeds: sd };
  }, [count, spread]);

  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.y += rotationSpeed * delta;
      const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
      points.current.position.y = -scrollY * scrollFactor;
    }
    if (material.current) {
      material.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(color) },
          uSize: { value: size },
        }}
        vertexShader={`
          uniform float uSize;
          attribute float aSeed;
          varying float vSeed;
          void main() {
            vSeed = aSeed;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uSize * (300.0 / -mv.z);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor;
          varying float vSeed;
          void main() {
            // Disque doux : 1 au centre, 0 au bord
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            float disc = smoothstep(0.5, 0.0, d);
            // Scintillement subtil : oscillation 0.6 → 1.0
            float twinkle = 0.6 + 0.4 * sin(uTime * 1.2 + vSeed);
            gl_FragColor = vec4(uColor, disc * twinkle);
          }
        `}
      />
    </points>
  );
}

export function Starfield({ mobile = false }: { mobile?: boolean }) {
  // Counts are halved on coarse-pointer devices to keep GPU cost down.
  const scale = mobile ? 0.5 : 1;
  return (
    <>
      <StarLayer
        count={Math.round(1200 * scale)}
        spread={80}
        size={1.0}
        color="#e2e8f0"
        rotationSpeed={0.005}
        scrollFactor={0.0008}
      />
      <StarLayer
        count={Math.round(500 * scale)}
        spread={50}
        size={1.6}
        color="#a78bfa"
        rotationSpeed={0.012}
        scrollFactor={0.002}
      />
      <StarLayer
        count={Math.round(200 * scale)}
        spread={28}
        size={2.4}
        color="#22d3ee"
        rotationSpeed={0.025}
        scrollFactor={0.005}
      />
    </>
  );
}
