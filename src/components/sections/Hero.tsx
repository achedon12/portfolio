"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeroSceneCanvas } from "@/components/three/HeroScene";
import { Button } from "@/components/ui/button";
import { orbitTechNames } from "@/components/three/OrbitingTechs";

export function Hero() {
  const t = useTranslations("Hero");

  const onEmbark = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative isolate flex min-h-[100svh] w-full items-center overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0">
        <HeroSceneCanvas />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-start gap-6 px-6 pt-32">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan"
        >
          {t("kicker")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl"
        >
          <span className="block bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {t("name")}
          </span>
          <span className="mt-1 block bg-gradient-to-r from-nebula-violet to-nebula-cyan bg-clip-text text-transparent">
            {t("subtitle")}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="max-w-xl text-base text-slate-300 md:text-lg"
        >
          {t("intro")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-wrap items-center gap-3"
        >
          <Button onClick={onEmbark} size="lg" className="group">
            {t("embark")}
            <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </Button>
          <Link href="/projects">
            <Button variant="outline" size="lg">
              {t("viewProjects")}
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="absolute right-6 top-32 hidden max-w-[180px] rounded-md border border-white/10 bg-cosmos-dark/40 p-4 font-mono text-[10px] uppercase tracking-wider text-slate-400 backdrop-blur-sm md:block"
        >
          <p className="mb-2 text-nebula-cyan">{t("satellitesLabel")}</p>
          <ul className="space-y-1">
            {orbitTechNames.map((tech) => (
              <li key={tech} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-nebula-cyan/70" />
                {tech}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={onEmbark}
        aria-label={t("scrollAria")}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 cursor-pointer"
      >
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-slate-400"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">{t("scrollLabel")}</span>
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </motion.button>
    </section>
  );
}
