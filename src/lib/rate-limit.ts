import { prisma } from "@/lib/prisma";

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Rate limit DB-backed (table RateLimit).
 * Pas de Redis — simple, suffisant pour un portfolio.
 *
 * @param key      Clé unique (ex: "contact:1.2.3.4")
 * @param max      Nombre max de hits pendant la fenêtre
 * @param windowMs Durée de la fenêtre en ms
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = new Date();

  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  if (!existing || existing.resetAt <= now) {
    const resetAt = new Date(now.getTime() + windowMs);
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, resetAt },
      update: { count: 1, resetAt },
    });
    return { ok: true, remaining: max - 1, resetAt };
  }

  if (existing.count >= max) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  const updated = await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
  return { ok: true, remaining: Math.max(0, max - updated.count), resetAt: updated.resetAt };
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "0.0.0.0";
}
