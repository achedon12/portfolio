"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";

const PLANET_VERT = /* glsl */ `
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vPos = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const PLANET_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3  uLightDir;
  uniform vec3  uOcean;
  uniform vec3  uLand;
  uniform vec3  uPolar;
  uniform vec3  uAtmosphere;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                   mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                   mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * vnoise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec3 q = vPos * 1.6 + vec3(uTime * 0.02, 0.0, 0.0);
    float continents = fbm(q);
    float landMask = smoothstep(0.45, 0.62, continents);
    float polarMask = smoothstep(0.78, 0.95, abs(normalize(vPos).y));

    vec3 surface = mix(uOcean, uLand, landMask);
    surface = mix(surface, uPolar, polarMask);

    float ndl = dot(normalize(vNormal), normalize(uLightDir));
    float light = clamp(ndl * 0.5 + 0.5, 0.0, 1.0);
    vec3 lit = surface * (0.18 + light * 0.95);

    float fres = pow(1.0 - max(0.0, dot(normalize(vNormal), normalize(vViewDir))), 3.0);
    lit += uAtmosphere * fres * 0.9;

    gl_FragColor = vec4(lit, 1.0);
  }
`;

interface Palette {
  ocean: string;
  land: string;
  polar: string;
  atmosphere: string;
}

const PALETTES: Record<string, Palette> = {
  cosmos: { ocean: "#0a0420", land: "#7c3aed", polar: "#bae6fd", atmosphere: "#22d3ee" },
  ember: { ocean: "#1a0a05", land: "#dc2626", polar: "#fef3c7", atmosphere: "#fb923c" },
  glacier: { ocean: "#0c1e2e", land: "#3b82f6", polar: "#f0f9ff", atmosphere: "#7dd3fc" },
  flora: { ocean: "#052e16", land: "#16a34a", polar: "#ecfccb", atmosphere: "#86efac" },
};

interface PlanetMeshProps {
  speed: number;
  palette: Palette;
  wireframe: boolean;
}

function PlanetMesh({ speed, palette, wireframe }: PlanetMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += speed * delta;
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta;
      matRef.current.uniforms.uOcean.value.set(palette.ocean);
      matRef.current.uniforms.uLand.value.set(palette.land);
      matRef.current.uniforms.uPolar.value.set(palette.polar);
      matRef.current.uniforms.uAtmosphere.value.set(palette.atmosphere);
      matRef.current.wireframe = wireframe;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 96, 96]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={PLANET_VERT}
        fragmentShader={PLANET_FRAG}
        wireframe={wireframe}
        uniforms={{
          uTime: { value: 0 },
          uLightDir: { value: new THREE.Vector3(1.0, 0.5, 0.8).normalize() },
          uOcean: { value: new THREE.Color(palette.ocean) },
          uLand: { value: new THREE.Color(palette.land) },
          uPolar: { value: new THREE.Color(palette.polar) },
          uAtmosphere: { value: new THREE.Color(palette.atmosphere) },
        }}
      />
    </mesh>
  );
}

interface PlanetDemoProps {
  labels: {
    speed: string;
    palette: string;
    wireframe: string;
    paletteNames: Record<string, string>;
  };
}

function PlanetDemoInner({ labels }: PlanetDemoProps) {
  const reduced = usePrefersReducedMotion();
  const { coarsePointer, lowEnd } = useDeviceCapability();
  const [speed, setSpeed] = useState(0.15);
  const [paletteKey, setPaletteKey] = useState<keyof typeof PALETTES>("cosmos");
  const [wireframe, setWireframe] = useState(false);

  if (reduced || lowEnd) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-white/10 bg-cosmos-dark/40">
        <div
          className="h-3/5 w-3/5 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #7c3aed 0%, #4c1d95 40%, #0a0420 80%)",
            boxShadow: "0 0 80px 10px rgba(34,211,238,0.25)",
          }}
        />
      </div>
    );
  }

  const dpr: [number, number] = coarsePointer ? [1, 1.25] : [1, 1.75];

  return (
    <div className="space-y-4">
      <div className="aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-cosmos-dark/40">
        <Canvas
          camera={{ position: [0, 0, 4.2], fov: 45 }}
          dpr={dpr}
          gl={{ antialias: !coarsePointer, alpha: true, powerPreference: "high-performance" }}
        >
          <ambientLight intensity={0.15} />
          <PlanetMesh speed={speed} palette={PALETTES[paletteKey]} wireframe={wireframe} />
        </Canvas>
      </div>

      <div className="space-y-3 rounded-lg border border-white/10 bg-cosmos-dark/40 p-4">
        <label className="block">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
              {labels.speed}
            </span>
            <span className="font-mono text-[10px] text-nebula-cyan">{speed.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="mt-1.5 w-full accent-nebula-cyan"
          />
        </label>

        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
            {labels.palette}
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(PALETTES) as Array<keyof typeof PALETTES>).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setPaletteKey(key)}
                aria-pressed={paletteKey === key}
                className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60 ${
                  paletteKey === key
                    ? "border-nebula-cyan/60 bg-nebula-cyan/10 text-nebula-cyan"
                    : "border-white/10 bg-white/5 text-slate-400 hover:text-slate-200"
                }`}
              >
                {labels.paletteNames[key] ?? key}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={wireframe}
            onChange={(e) => setWireframe(e.target.checked)}
            className="h-4 w-4 accent-nebula-cyan"
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-300">
            {labels.wireframe}
          </span>
        </label>
      </div>
    </div>
  );
}

export const PlanetDemo = dynamic(() => Promise.resolve(PlanetDemoInner), { ssr: false });
