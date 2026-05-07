"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";

const NOISE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NOISE_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uFrequency;
  uniform int   uOctaves;
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  varying vec2 vUv;

  // Simplex-ish 2D noise via hashed gradients
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  float fbm(vec2 p, int octaves) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 8; i++) {
      if (i >= octaves) break;
      v += a * vnoise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uFrequency + vec2(uTime * 0.08, uTime * 0.05);
    float n = fbm(p, uOctaves);
    // Two-band ramp
    float band = smoothstep(0.35, 0.65, n);
    vec3 col = mix(uColorA, uColorB, band);
    // Subtle vignette
    float vig = 1.0 - length(vUv - 0.5) * 0.7;
    gl_FragColor = vec4(col * vig, 1.0);
  }
`;

interface FieldProps {
  frequency: number;
  octaves: number;
  paused: boolean;
}

function Field({ frequency, octaves, paused }: FieldProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((_, delta) => {
    if (!matRef.current) return;
    if (!paused) matRef.current.uniforms.uTime.value += delta;
    matRef.current.uniforms.uFrequency.value = frequency;
    matRef.current.uniforms.uOctaves.value = octaves;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={NOISE_VERT}
        fragmentShader={NOISE_FRAG}
        uniforms={{
          uTime: { value: 0 },
          uFrequency: { value: frequency },
          uOctaves: { value: octaves },
          uColorA: { value: new THREE.Color("#0a0420") },
          uColorB: { value: new THREE.Color("#22d3ee") },
        }}
      />
    </mesh>
  );
}

interface NoiseFieldProps {
  labels: {
    frequency: string;
    octaves: string;
    pause: string;
    play: string;
  };
}

function NoiseFieldInner({ labels }: NoiseFieldProps) {
  const reduced = usePrefersReducedMotion();
  const { coarsePointer, lowEnd } = useDeviceCapability();
  const [frequency, setFrequency] = useState(4);
  const [octaves, setOctaves] = useState(4);
  const [paused, setPaused] = useState(false);

  if (reduced || lowEnd) {
    return (
      <div
        className="aspect-square w-full overflow-hidden rounded-xl border border-white/10"
        style={{
          background:
            "radial-gradient(circle at 35% 40%, #22d3ee33 0%, #0a042055 40%, #030014 90%)",
        }}
      />
    );
  }

  const dpr: [number, number] = coarsePointer ? [1, 1.25] : [1, 1.75];

  return (
    <div className="space-y-4">
      <div className="aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-cosmos-dark/40">
        <Canvas
          orthographic
          camera={{ zoom: 1, position: [0, 0, 1] }}
          dpr={dpr}
          gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        >
          <Field frequency={frequency} octaves={octaves} paused={paused} />
        </Canvas>
      </div>

      <div className="space-y-3 rounded-lg border border-white/10 bg-cosmos-dark/40 p-4">
        <label className="block">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
              {labels.frequency}
            </span>
            <span className="font-mono text-[10px] text-nebula-cyan">{frequency.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={1}
            max={16}
            step={0.5}
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="mt-1.5 w-full accent-nebula-cyan"
          />
        </label>

        <label className="block">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
              {labels.octaves}
            </span>
            <span className="font-mono text-[10px] text-nebula-cyan">{octaves}</span>
          </div>
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={octaves}
            onChange={(e) => setOctaves(Number(e.target.value))}
            className="mt-1.5 w-full accent-nebula-cyan"
          />
        </label>

        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-300 transition-colors hover:border-nebula-cyan/40 hover:text-nebula-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60"
        >
          {paused ? labels.play : labels.pause}
        </button>
      </div>
    </div>
  );
}

export const NoiseField = dynamic(() => Promise.resolve(NoiseFieldInner), { ssr: false });
