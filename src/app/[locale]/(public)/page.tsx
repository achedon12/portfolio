import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { SkillsConstellation } from "@/components/sections/SkillsConstellation";
import { Timeline } from "@/components/sections/Timeline";
import { ContactTerminal } from "@/components/sections/ContactTerminal";
import { personJsonLd, websiteJsonLd, professionalServiceJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === "fr";
  return {
    title: isFr
      ? "Léo Deroin — Développeur Fullstack à Lyon · Next.js, React, Symfony"
      : "Léo Deroin — Fullstack Developer in Lyon · Next.js, React, Symfony",
    description: isFr
      ? "Développeur fullstack basé à Lyon, en alternance chez Confluent Digital. Stack PHP/Symfony, Next.js, React, Vue.js, TypeScript. Découvrez projets, compétences et parcours."
      : "Fullstack developer based in Lyon, France, on a work-study program at Confluent Digital. Stack: PHP/Symfony, Next.js, React, Vue.js, TypeScript.",
    alternates: {
      canonical: isFr ? "/" : "/en",
      languages: { fr: "/", en: "/en", "x-default": "/" },
    },
    openGraph: {
      title: isFr
        ? "Léo Deroin — Développeur Fullstack à Lyon"
        : "Léo Deroin — Fullstack Developer in Lyon",
      description: isFr
        ? "Portfolio immersif de Léo Deroin — développeur fullstack à Lyon, spécialisé Next.js / React / Symfony / Vue."
        : "Immersive portfolio by Léo Deroin — fullstack developer in Lyon, specialised in Next.js, React, Symfony, Vue.",
      type: "website",
      url: isFr ? "/" : "/en",
      locale: isFr ? "fr_FR" : "en_US",
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <About />
      <SkillsConstellation />
      <Timeline />
      <ContactTerminal />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: personJsonLd() }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: websiteJsonLd() }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: professionalServiceJsonLd() }}
      />
    </>
  );
}
