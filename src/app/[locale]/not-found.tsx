import type { Metadata } from "next";
import { Home, ArrowRight, Compass, Newspaper } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StarfieldCanvas } from "@/components/three/StarfieldCanvas";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("NotFound");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: true },
  };
}

/**
 * 404 publique — déclenchée quand :
 *   - une route ne matche aucun segment connu
 *   - un projet ou un article appelle `notFound()` côté server component
 *   - la locale du segment dynamique n'est pas dans `routing.locales`
 *
 * On rend Header / Footer / StarfieldCanvas localement parce que ce fichier
 * remplace le rendu de `(public)/layout.tsx` quand le not-found est déclenché
 * depuis un sous-arbre qui n'a pas pu s'hydrater (ex: layout qui a appelé notFound()).
 */
export default async function LocaleNotFound() {
  const t = await getTranslations("NotFound");
  const locale = await getLocale();
  const isFr = locale === "fr";

  return (
    <>
      <StarfieldCanvas />
      <Header />
      <main className="relative isolate flex min-h-[100svh] items-center justify-center px-6 pt-20 pb-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.18)_0%,transparent_60%)]"
        />

        <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-6 text-left">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
            {t("kicker")}
          </p>

          <h1 className="font-display text-7xl font-bold leading-none tracking-tight md:text-9xl">
            <span className="bg-gradient-to-br from-nebula-violet via-nebula-cyan to-nebula-violet bg-clip-text text-transparent">
              404
            </span>
          </h1>

          <h2 className="font-display text-2xl font-semibold text-slate-100 md:text-3xl">
            {t("title")}
          </h2>

          <p className="max-w-xl text-base text-slate-400">{t("description")}</p>

          <pre
            aria-hidden
            className="rounded-md border border-white/10 bg-cosmos-dark/60 px-4 py-2 font-mono text-[11px] text-slate-500"
          >
            {`> ${t("code")}`}
          </pre>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link href="/">
              <Button size="lg" className="group">
                <Home className="h-4 w-4" />
                {t("backHome")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="outline" size="lg">
                <Compass className="h-4 w-4" />
                {t("viewProjects")}
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="outline" size="lg">
                <Newspaper className="h-4 w-4" />
                {t("viewBlog")}
              </Button>
            </Link>
          </div>

          <p className="mt-6 font-mono text-[10px] uppercase tracking-wider text-slate-600">
            {isFr ? "// uplink" : "// uplink"} : {locale.toUpperCase()} ·{" "}
            {new Date().toISOString()}
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
