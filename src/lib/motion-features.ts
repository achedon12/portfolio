/**
 * Async-loadable feature pack for framer-motion's LazyMotion.
 *
 * Importé dynamiquement via `() => import("@/lib/motion-features").then(m => m.default)`
 * — webpack splitte ce module dans son propre chunk, ce qui retire ~17 kB
 * de features (animate, exit, whileInView, drag…) du bundle initial.
 *
 * Les composants `m.X` à l'intérieur d'un `<LazyMotion>` n'ont pas besoin de
 * ces features pour exister (rendu HTML simple) — elles sont chargées juste
 * avant que les animations ne démarrent.
 */
export { domAnimation as default } from "framer-motion";
