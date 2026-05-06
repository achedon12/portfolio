import { createHash } from "node:crypto";

/**
 * Hash SHA-256 d'une IP avec un pepper côté serveur.
 * Permet de dédupliquer les votes/views par IP sans jamais stocker l'IP brute.
 *
 * Si `IP_HASH_PEPPER` n'est pas défini en prod, on log un warn et on utilise
 * un fallback constant — moins sécurisé mais empêche les hash de devenir cassés.
 */
export function hashIp(ip: string): string {
  const pepper = process.env.IP_HASH_PEPPER;
  if (!pepper && process.env.NODE_ENV === "production") {
    console.warn("[ip-hash] IP_HASH_PEPPER not set — using insecure fallback");
  }
  return createHash("sha256")
    .update(`${ip}:${pepper ?? "portfolio-default-pepper"}`)
    .digest("hex");
}
