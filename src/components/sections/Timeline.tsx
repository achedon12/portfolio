"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { timeline, formatMonth } from "@/lib/timeline";
import { Badge } from "@/components/ui/badge";

export function Timeline() {
  const t = useTranslations("Timeline");
  const locale = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (!mounted) return;
      gsap.registerPlugin(ScrollTrigger);

      const track = trackRef.current;
      const rocket = rocketRef.current;
      if (!track || !rocket) return;

      const ctx = gsap.context(() => {
        gsap.fromTo(
          rocket,
          { y: 0 },
          {
            y: track.offsetHeight - rocket.offsetHeight,
            ease: "none",
            scrollTrigger: {
              trigger: track,
              start: "top 60%",
              end: "bottom 80%",
              scrub: 0.5,
            },
          },
        );
      }, track);

      cleanup = () => {
        ctx.revert();
      };
    })();

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, []);

  const presentLabel = t("present");

  return (
    <section id="experience" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
            {t("kicker")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">{t("title")}</h2>
        </motion.div>

        <div ref={trackRef} className="relative pl-12 md:pl-20">
          <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-transparent via-nebula-cyan/50 to-transparent md:left-7" />

          <div
            ref={rocketRef}
            aria-hidden
            className="absolute left-2 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-nebula-cyan/60 bg-cosmos-deep shadow-[0_0_25px_rgba(34,211,238,0.5)] md:left-5"
          >
            <Rocket className="h-4 w-4 text-nebula-cyan" />
          </div>

          <ol className="space-y-12">
            {timeline.map((step, i) => (
              <motion.li
                key={step.id}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="relative"
              >
                <span
                  aria-hidden
                  className="absolute -left-[31px] top-2 h-3 w-3 rounded-full border-2 border-nebula-cyan bg-cosmos-deep md:-left-[51px]"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="cyan">{t(`kind.${step.kind}`)}</Badge>
                  <span className="font-mono text-xs text-slate-500">
                    {formatMonth(step.from, locale, presentLabel)} —{" "}
                    {formatMonth(step.to, locale, presentLabel)}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-xl font-semibold text-slate-100">
                  {t(`items.${step.id}.title`)}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {t(`items.${step.id}.org`)}
                  {step.location && (
                    <span className="text-slate-500"> · {step.location}</span>
                  )}
                </p>
                <p className="mt-3 max-w-2xl text-slate-300">
                  {t(`items.${step.id}.description`)}
                </p>
                {step.stack && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {step.stack.map((s) => (
                      <Badge key={s} variant="default">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
