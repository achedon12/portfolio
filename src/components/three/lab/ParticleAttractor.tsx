"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";

interface ParticleSystemProps {
  count: number;
  attractStrength: number;
  repel: boolean;
}

function ParticleSystem({ count, attractStrength, repel }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, pointer } = useThree();
  const target = useRef(new THREE.Vector2(0, 0));
  // Velocities live in a ref because they're mutated every frame.
  // Tied to `count` via the geometry recreation below.
  const velocitiesRef = useRef<Float32Array>(new Float32Array(count * 3));

  const { positions, seeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.5 + Math.random() * 2.5;
      pos[i * 3 + 0] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(a) * r;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      sd[i] = Math.random();
    }
    return { positions: pos, seeds: sd };
  }, [count]);

  useEffect(() => {
    velocitiesRef.current = new Float32Array(count * 3);
  }, [count]);

  useFrame((state, delta) => {
    const pts = pointsRef.current;
    if (!pts) return;
    const geo = pts.geometry as THREE.BufferGeometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    target.current.x = pointer.x * viewport.width * 0.5;
    target.current.y = pointer.y * viewport.height * 0.5;

    const dirSign = repel ? -1 : 1;
    const dt = Math.min(delta, 0.05);

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const px = arr[ix];
      const py = arr[ix + 1];
      const dx = target.current.x - px;
      const dy = target.current.y - py;
      const dist2 = dx * dx + dy * dy + 0.05;
      const force = (attractStrength * dirSign) / dist2;

      const vel = velocitiesRef.current;
      vel[ix] += dx * force * dt;
      vel[ix + 1] += dy * force * dt;
      vel[ix] *= 0.94;
      vel[ix + 1] *= 0.94;

      arr[ix] += vel[ix] * dt * 60;
      arr[ix + 1] += vel[ix + 1] * dt * 60;

      // soft bounds
      const maxR = 4;
      const r = Math.hypot(arr[ix], arr[ix + 1]);
      if (r > maxR) {
        const k = maxR / r;
        arr[ix] *= k;
        arr[ix + 1] *= k;
        velocitiesRef.current[ix] *= -0.5;
        velocitiesRef.current[ix + 1] *= -0.5;
      }
    }
    posAttr.needsUpdate = true;

    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: new THREE.Color("#22d3ee") },
        }}
        vertexShader={`
          attribute float aSeed;
          varying float vSeed;
          void main() {
            vSeed = aSeed;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (2.0 + aSeed * 4.0) * (200.0 / -mv.z);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform float uTime;
          varying float vSeed;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            float disc = smoothstep(0.5, 0.0, d);
            float twinkle = 0.5 + 0.5 * sin(uTime * 2.0 + vSeed * 6.28);
            vec3 col = mix(uColor, vec3(1.0, 1.0, 1.0), vSeed * 0.4);
            gl_FragColor = vec4(col, disc * twinkle * 0.85);
          }
        `}
      />
    </points>
  );
}

interface ParticleAttractorProps {
  labels: {
    count: string;
    strength: string;
    mode: string;
    attract: string;
    repel: string;
    hint: string;
  };
}

function ParticleAttractorInner({ labels }: ParticleAttractorProps) {
  const reduced = usePrefersReducedMotion();
  const { coarsePointer, lowEnd } = useDeviceCapability();
  const [count, setCount] = useState(1500);
  const [strength, setStrength] = useState(1.5);
  const [repel, setRepel] = useState(false);

  if (reduced || lowEnd) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-white/10 bg-cosmos-dark/40 p-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
          {labels.hint}
        </p>
      </div>
    );
  }

  const dpr: [number, number] = coarsePointer ? [1, 1.25] : [1, 1.75];
  const effectiveCount = coarsePointer ? Math.min(count, 800) : count;

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-cosmos-dark/60">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={dpr}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        >
          <ParticleSystem count={effectiveCount} attractStrength={strength} repel={repel} />
        </Canvas>
        <p className="pointer-events-none absolute bottom-3 left-3 right-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
          {labels.hint}
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-white/10 bg-cosmos-dark/40 p-4">
        <label className="block">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
              {labels.count}
            </span>
            <span className="font-mono text-[10px] text-nebula-cyan">{effectiveCount}</span>
          </div>
          <input
            type="range"
            min={200}
            max={3000}
            step={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="mt-1.5 w-full accent-nebula-cyan"
          />
        </label>

        <label className="block">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
              {labels.strength}
            </span>
            <span className="font-mono text-[10px] text-nebula-cyan">{strength.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={4}
            step={0.1}
            value={strength}
            onChange={(e) => setStrength(Number(e.target.value))}
            className="mt-1.5 w-full accent-nebula-cyan"
          />
        </label>

        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
            {labels.mode}
          </span>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setRepel(false)}
              aria-pressed={!repel}
              className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60 ${
                !repel
                  ? "border-nebula-cyan/60 bg-nebula-cyan/10 text-nebula-cyan"
                  : "border-white/10 bg-white/5 text-slate-400 hover:text-slate-200"
              }`}
            >
              {labels.attract}
            </button>
            <button
              type="button"
              onClick={() => setRepel(true)}
              aria-pressed={repel}
              className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60 ${
                repel
                  ? "border-nebula-cyan/60 bg-nebula-cyan/10 text-nebula-cyan"
                  : "border-white/10 bg-white/5 text-slate-400 hover:text-slate-200"
              }`}
            >
              {labels.repel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ParticleAttractor = dynamic(() => Promise.resolve(ParticleAttractorInner), {
  ssr: false,
});
