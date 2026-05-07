import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { PlanetDemo } from "@/components/three/lab/PlanetDemo";
import { NoiseField } from "@/components/three/lab/NoiseField";
import { ParticleAttractor } from "@/components/three/lab/ParticleAttractor";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Lab" });
  const isFr = locale === "fr";
  const path = isFr ? "/lab" : "/en/lab";
  const title = t("metaTitle");
  const description = t("metaDescription");
  const ogAlt = isFr
    ? "Léo Deroin — Lab R3F et shaders"
    : "Léo Deroin — R3F lab and shaders";

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { fr: "/lab", en: "/en/lab", "x-default": "/lab" },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: path,
      locale: isFr ? "fr_FR" : "en_US",
      siteName: "Léo Deroin",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: "/opengraph-image", alt: ogAlt }],
    },
  };
}

export default async function LabPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale as Locale);

  const t = await getTranslations("Lab");
  const tCommon = await getTranslations("Common");
  const isFr = locale === "fr";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr";
  const localePrefix = isFr ? "" : "/en";
  const homeName = tCommon("home");

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: homeName, href: "/" },
    { name: t("title") },
  ];

  const breadcrumbsLd = breadcrumbJsonLd([
    { name: homeName, url: `${baseUrl}${localePrefix}/` },
    { name: t("title"), url: `${baseUrl}${localePrefix}/lab` },
  ]);

  const planetLabels = {
    speed: t("demos.planet.speed"),
    palette: t("demos.planet.palette"),
    wireframe: t("demos.planet.wireframe"),
    paletteNames: {
      cosmos: t("demos.planet.paletteNames.cosmos"),
      ember: t("demos.planet.paletteNames.ember"),
      glacier: t("demos.planet.paletteNames.glacier"),
      flora: t("demos.planet.paletteNames.flora"),
    },
  };

  const noiseLabels = {
    frequency: t("demos.noise.frequency"),
    octaves: t("demos.noise.octaves"),
    pause: t("demos.noise.pause"),
    play: t("demos.noise.play"),
  };

  const particleLabels = {
    count: t("demos.particles.count"),
    strength: t("demos.particles.strength"),
    mode: t("demos.particles.mode"),
    attract: t("demos.particles.attract"),
    repel: t("demos.particles.repel"),
    hint: t("demos.particles.hint"),
  };

  return (
    <div className="mx-auto max-w-6xl px-6 pt-32 pb-20">
      <Breadcrumbs
        items={breadcrumbItems}
        ariaLabel={tCommon("breadcrumbAria")}
        className="mb-8"
      />

      <header className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
          {t("kicker")}
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">{t("title")}</h1>
        <p className="mt-4 max-w-2xl text-slate-400">{t("intro")}</p>
      </header>

      <div className="space-y-16">
        <DemoSection
          number="01"
          title={t("demos.planet.title")}
          description={t("demos.planet.description")}
        >
          <PlanetDemo labels={planetLabels} />
        </DemoSection>

        <DemoSection
          number="02"
          title={t("demos.noise.title")}
          description={t("demos.noise.description")}
        >
          <NoiseField labels={noiseLabels} />
        </DemoSection>

        <DemoSection
          number="03"
          title={t("demos.particles.title")}
          description={t("demos.particles.description")}
        >
          <ParticleAttractor labels={particleLabels} />
        </DemoSection>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbsLd }}
      />
    </div>
  );
}

function DemoSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="order-2 lg:order-1">{children}</div>
      <div className="order-1 lg:order-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
          ◊ {number}
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-slate-100">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{description}</p>
      </div>
    </section>
  );
}
