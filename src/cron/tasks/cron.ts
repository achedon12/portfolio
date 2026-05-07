import { processPendingMails } from "@/lib/mail-queue";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

/**
 * Inscription des cron jobs internes.
 *
 * Appelé une seule fois au démarrage via `instrumentation.ts`.
 * Désactivé en dev pour éviter de polluer les logs et de tirer sur la DB
 * pendant qu'on développe. Lance les jobs uniquement en prod.
 *
 * Implémentation `setInterval` volontairement dépendance-free — un seul
 * job toutes les 5 min, pas besoin d'un parseur cron complet (cf. règle
 * "prefer dependency-free implementations" du repo).
 */
export function initializeCron(): void {
  if (process.env.NODE_ENV !== "production") {
    console.log("[cron] disabled in development mode");
    return;
  }

  const g = globalThis as { __portfolio_cron_started__?: boolean };
  if (g.__portfolio_cron_started__) return;
  g.__portfolio_cron_started__ = true;

  const tick = async () => {
    try {
      const summary = await processPendingMails();
      if (summary.processed > 0) {
        console.log(`[cron:mail-queue] ${new Date().toISOString()}`, summary);
      }
    } catch (err) {
      console.error("[cron:mail-queue] run failed", err);
    }
  };

  setInterval(tick, FIVE_MINUTES_MS).unref();
  // Premier tick après 30s : laisse le temps au process de démarrer pour
  // ne pas concurrencer les autres bootstraps (Prisma, Next, etc.).
  setTimeout(tick, 30_000).unref();

  console.log("[cron] mail-queue scheduled every 5 min");
}
