"use client";

import { ChevronDown, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeroSceneCanvas } from "@/components/three/HeroScene";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { inlineLinks } from "@/components/InlineLinks";
import { orbitTechNames } from "@/components/three/orbit-techs";

/**
 * Premier écran. Animations d'entrée en CSS (globals.css → `.hero-rise`,
 * `.hero-fade`) plutôt qu'en framer-motion : le titre et l'intro sont
 * visibles dès le HTML serveur, sans attendre le JS (LCP mobile).
 */
export function Hero() {
  const t = useTranslations("Hero");
  const tCommon = useTranslations("Common");

  const onScrollNext = () => {
    document.getElementById("services")?.scrollIntoView();
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
        <p
          className="hero-fade font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan"
          style={{ animationDelay: "0.1s" }}
        >
          {t("kicker")}
        </p>

        <h1 className="hero-rise font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
          <span className="block bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {t("name")}
          </span>
          <span className="sr-only">, </span>
          <span className="mt-1 block bg-gradient-to-r from-nebula-violet to-nebula-cyan bg-clip-text text-3xl text-transparent md:text-5xl lg:text-6xl">
            {t("subtitle")}
          </span>
        </h1>

        <p
          className="hero-rise max-w-2xl text-base text-slate-300 md:text-lg"
          style={{ animationDelay: "0.15s" }}
        >
          {t.rich("intro", inlineLinks)}
        </p>

        <div
          className="hero-fade flex flex-wrap items-center gap-3"
          style={{ animationDelay: "0.3s" }}
        >
          <a href="#contact" className={buttonVariants({ size: "lg" })}>
            {t("ctaContact")}
          </a>
          <Link href="/projects" className={buttonVariants({ variant: "outline", size: "lg" })}>
            {t("viewProjects")}
          </Link>
          <a
            href="/leo-deroin-cv.pdf"
            download
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "group")}
          >
            <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            {tCommon("downloadCv")}
          </a>
        </div>

        <div
          className="hero-fade absolute bottom-0 right-6 hidden max-w-[180px] rounded-md border border-white/10 bg-cosmos-dark/40 p-4 font-mono text-[10px] uppercase tracking-wider text-slate-400 backdrop-blur-sm lg:block"
          style={{ animationDelay: "0.8s" }}
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
        </div>
      </div>

      <button
        type="button"
        onClick={onScrollNext}
        className="hero-fade absolute bottom-8 left-1/2 z-10 -translate-x-1/2 cursor-pointer"
        style={{ animationDelay: "1.2s" }}
      >
        <span className="hero-bob flex flex-col items-center gap-2 text-slate-400">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">{t("scrollLabel")}</span>
          <span className="sr-only">{t("scrollAria")}</span>
          <ChevronDown className="h-5 w-5" />
        </span>
      </button>
    </section>
  );
}
