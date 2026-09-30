import { AppWindow, RefreshCw, Workflow, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { inlineLinks } from "@/components/InlineLinks";

const SERVICES: Array<{ id: "build" | "redesign" | "tools"; icon: LucideIcon }> = [
  { id: "build", icon: AppWindow },
  { id: "redesign", icon: RefreshCw },
  { id: "tools", icon: Workflow },
];

const STEPS = ["problem", "solution", "result"] as const;

/**
 * Offre : pour chaque type de mission, problème client → prestation → résultat.
 * Composant serveur, sans animation : tout le texte est dans le HTML initial.
 */
export function Services() {
  const t = useTranslations("Services");

  return (
    <section id="services" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
            {t("kicker")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-slate-100 md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 max-w-2xl text-slate-400">{t("intro")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {SERVICES.map(({ id, icon: Icon }) => (
            <Card key={id} className="flex flex-col p-6">
              <Icon className="h-6 w-6 text-nebula-cyan" aria-hidden />
              <h3 className="mt-4 font-display text-xl font-semibold text-slate-100">
                {t(`items.${id}.title`)}
              </h3>
              <dl className="mt-4 space-y-4 text-sm">
                {STEPS.map((step) => (
                  <div key={step}>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      {t(`labels.${step}`)}
                    </dt>
                    <dd className="mt-1 leading-relaxed text-slate-300">
                      {t(`items.${id}.${step}`)}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl text-slate-300">{t.rich("outro", inlineLinks)}</p>
          <a href="#contact" className={buttonVariants({ size: "lg" })}>
            {t("cta")}
          </a>
        </div>
      </div>
    </section>
  );
}
