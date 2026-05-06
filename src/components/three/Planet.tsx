"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Planète procédurale entièrement shader-based — pas de texture chargée.
 *
 * Surface (vertex → fragment) :
 *   - On reçoit la position locale (vPos) et la normale (vNormal).
 *   - On calcule des bandes "continent / océan" via un bruit empilé (fbm).
 *   - On mélange deux palettes : profondeurs (#0a0420 → #4c1d95) et terres (#22d3ee → #a78bfa).
 *
 * Lumière :
 *   - Directionnel (vec3 lightDir) → wrap-Lambert pour adoucir le terminator.
 *   - Ambient subtil pour ne pas perdre les zones nuit.
 *
 * Atmosphère :
 *   - Fresnel = pow(1 - dot(N, V), 3) → halo lumineux en bord.
 *   - Couleur cyan additive sur l'edge.
 */
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

  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }
  float vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                     mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                 mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                     mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
    return n;
  }
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * vnoise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Continents : fbm sur la position + lent drift dans le temps
    vec3 q = vPos * 1.6 + vec3(uTime * 0.02, 0.0, 0.0);
    float continents = fbm(q);
    float landMask = smoothstep(0.45, 0.62, continents);

    // Calotte polaire : forte aux pôles (|y| proche de 1)
    float polarMask = smoothstep(0.78, 0.95, abs(normalize(vPos).y));

    vec3 surface = mix(uOcean, uLand, landMask);
    surface = mix(surface, uPolar, polarMask);

    // Lumière wrap-Lambert (terminator doux)
    float ndl = dot(normalize(vNormal), normalize(uLightDir));
    float light = clamp(ndl * 0.5 + 0.5, 0.0, 1.0);
    vec3 lit = surface * (0.18 + light * 0.95);

    // Atmosphère : fresnel cubique
    float fres = pow(1.0 - max(0.0, dot(normalize(vNormal), normalize(vViewDir))), 3.0);
    lit += uAtmosphere * fres * 0.9;

    gl_FragColor = vec4(lit, 1.0);
  }
`;

const ATMO_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const ATMO_FRAG = /* glsl */ `
  uniform vec3 uAtmosphere;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float fres = pow(1.0 - max(0.0, dot(normalize(vNormal), normalize(vViewDir))), 2.5);
    gl_FragColor = vec4(uAtmosphere, fres * 0.55);
  }
`;

interface PlanetProps {
  radius?: number;
  rotationSpeed?: number;
}

export function Planet({ radius = 1.6, rotationSpeed = 0.06 }: PlanetProps) {
  const surfaceRef = useRef<THREE.Mesh>(null);
  const surfaceMat = useRef<THREE.ShaderMaterial>(null);
  const atmoMat = useRef<THREE.ShaderMaterial>(null);

  useFrame((_, delta) => {
    if (surfaceRef.current) surfaceRef.current.rotation.y += rotationSpeed * delta;
    if (surfaceMat.current) surfaceMat.current.uniforms.uTime.value += delta;
  });

  return (
    <group>
      <mesh ref={surfaceRef}>
        <sphereGeometry args={[radius, 96, 96]} />
        <shaderMaterial
          ref={surfaceMat}
          vertexShader={PLANET_VERT}
          fragmentShader={PLANET_FRAG}
          uniforms={{
            uTime: { value: 0 },
            uLightDir: { value: new THREE.Vector3(1.0, 0.5, 0.8).normalize() },
            uOcean: { value: new THREE.Color("#0a0420") },
            uLand: { value: new THREE.Color("#7c3aed") },
            uPolar: { value: new THREE.Color("#bae6fd") },
            uAtmosphere: { value: new THREE.Color("#22d3ee") },
          }}
        />
      </mesh>

      <mesh scale={1.06}>
        <sphereGeometry args={[radius, 64, 64]} />
        <shaderMaterial
          ref={atmoMat}
          vertexShader={ATMO_VERT}
          fragmentShader={ATMO_FRAG}
          uniforms={{
            uAtmosphere: { value: new THREE.Color("#22d3ee") },
          }}
          transparent
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
