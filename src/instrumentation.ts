/**
 * Hook Next 16 : exécuté une fois au démarrage du runtime nodejs.
 * On y inscrit les cron jobs internes (mail queue notamment).
 *
 * Edge runtime exclu — setInterval/setTimeout demandent l'event loop nodejs.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { initializeCron } = await import("@/cron/tasks/cron");
  initializeCron();
}
