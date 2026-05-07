"use client";

import Image from "next/image";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { profile, getStats } from "@/lib/profile";
import { Card } from "@/components/ui/card";

function StatCounter({ value, suffix, locale }: { value: number; suffix: string; locale: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const mv = useMotionValue(0);
  const numberLocale = locale === "fr" ? "fr-FR" : "en-US";
  const rounded = useTransform(mv, (v) => `${Math.round(v).toLocaleString(numberLocale)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, { duration: 1.4, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, mv, value]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export function About() {
  const t = useTranslations("About");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  return (
    <section id="about" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
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
          <h2 className="mt-3 font-display text-3xl font-bold text-slate-100 md:text-4xl">
            {t("title")}
          </h2>
        </motion.div>

        <Card className="overflow-hidden">
          <div className="grid gap-8 p-6 md:grid-cols-[180px_1fr] md:p-10 md:gap-12">
            <div className="flex flex-col items-center md:items-start">
              <div className="relative h-44 w-44 shrink-0 md:h-40 md:w-40">
                <div
                  aria-hidden
                  className="absolute -inset-3 rounded-full bg-gradient-to-br from-nebula-violet/30 via-nebula-cyan/30 to-transparent blur-2xl"
                />
                <div className="relative h-full w-full overflow-hidden rounded-full border border-nebula-cyan/40 bg-cosmos-dark shadow-[inset_0_0_60px_rgba(34,211,238,0.2)]">
                  <Image
                    src="/profile.jpg"
                    alt={profile.name}
                    fill
                    sizes="(min-width: 768px) 160px, 176px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              <div className="mt-5 text-center md:text-left">
                <p className="font-display text-lg font-semibold">{profile.name}</p>
                <p className="font-mono text-xs uppercase tracking-wider text-nebula-cyan">
                  {profile.role}
                </p>
                <p className="mt-1 font-mono text-xs text-slate-500">📡 {profile.location}</p>
              </div>

              <a
                href="/leo-deroin-cv.pdf"
                download
                className="mt-5 inline-flex items-center gap-2 rounded-md border border-nebula-cyan/40 bg-nebula-cyan/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-nebula-cyan transition-all hover:bg-nebula-cyan/15 hover:shadow-[0_0_25px_rgba(34,211,238,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60"
              >
                <Download className="h-3.5 w-3.5" />
                {tCommon("downloadCv")}
              </a>
            </div>

            <div>
              <div className="space-y-4 text-slate-300">
                {(["bio1", "bio2", "bio3"] as const).map((key, i) => (
                  <motion.p
                    key={key}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="leading-relaxed"
                  >
                    {t(key)}
                  </motion.p>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                {getStats().map((stat) => (
                  <div key={stat.key}>
                    <p className="font-display text-3xl font-bold text-slate-100">
                      <StatCounter value={stat.value} suffix={stat.suffix} locale={locale} />
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                      {t(`stats.${stat.key}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
