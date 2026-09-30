/**
 * Données des satellites du hero, séparées du composant R3F pour que le
 * Hero (HUD texte) puisse lister les noms sans tirer three.js dans son bundle.
 */
export interface OrbitTech {
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

export const ORBIT_TECHS: OrbitTech[] = [
  { name: "Next.js", color: "#22d3ee", radius: 2.6, speed: 0.45, tilt: 0.0, phase: 0 },
  { name: "Symfony", color: "#7c3aed", radius: 3.0, speed: -0.3, tilt: 0.5, phase: 1.0 },
  { name: "React", color: "#22d3ee", radius: 2.4, speed: 0.6, tilt: -0.3, phase: 2.0 },
  { name: "MySQL", color: "#a78bfa", radius: 3.4, speed: 0.22, tilt: 0.8, phase: 3.0 },
  { name: "Docker", color: "#fb923c", radius: 2.85, speed: -0.4, tilt: -0.5, phase: 4.5 },
  { name: "Three.js", color: "#22d3ee", radius: 3.2, speed: 0.35, tilt: 0.2, phase: 5.5 },
];

export const orbitTechNames = ORBIT_TECHS.map((t) => t.name);
