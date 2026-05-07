import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Newsletter.subscribed" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function NewsletterSubscribedPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale as Locale);
  const t = await getTranslations("Newsletter.subscribed");

  return (
    <section className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
      <Mail className="mb-6 h-10 w-10 text-nebula-cyan" />
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-nebula-cyan/80">
        {t("kicker")}
      </p>
      <h1 className="mt-5 font-display text-4xl font-semibold text-slate-100 sm:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400">
        {t("description")}
      </p>
      <Link
        href="/"
        className="mt-10 rounded-md border border-nebula-cyan/40 bg-nebula-cyan/10 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-nebula-cyan transition-all hover:bg-nebula-cyan/15 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60"
      >
        {t("back")}
      </Link>
    </section>
  );
}
