import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { personJsonLd, websiteJsonLd, professionalServiceJsonLd } from "@/lib/seo";

// Below-the-fold sections: code-split into their own chunks so the initial
// bundle (Hero + above-fold) stays small. SSR is preserved (default true)
// so the HTML, headings and JSON-LD remain crawlable and visible without JS.
const About = dynamic(() =>
  import("@/components/sections/About").then((m) => ({ default: m.About })),
);
const SkillsConstellation = dynamic(() =>
  import("@/components/sections/SkillsConstellation").then((m) => ({
    default: m.SkillsConstellation,
  })),
);
const Timeline = dynamic(() =>
  import("@/components/sections/Timeline").then((m) => ({ default: m.Timeline })),
);
const ContactTerminal = dynamic(() =>
  import("@/components/sections/ContactTerminal").then((m) => ({
    default: m.ContactTerminal,
  })),
);

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === "fr";

  const title = isFr
    ? "Léo Deroin — Développeur Fullstack à Lyon · Next.js, React, Symfony"
    : "Léo Deroin — Fullstack Developer in Lyon · Next.js, React, Symfony";
  const description = isFr
    ? "Développeur fullstack basé à Lyon, en alternance chez Confluent Digital. Stack PHP/Symfony, Next.js, React, Vue.js, TypeScript. Découvrez projets, compétences et parcours."
    : "Fullstack developer based in Lyon, France, on a work-study program at Confluent Digital. Stack: PHP/Symfony, Next.js, React, Vue.js, TypeScript.";
  const ogAlt = isFr
    ? "Léo Deroin — Développeur Fullstack à Lyon"
    : "Léo Deroin — Fullstack Developer in Lyon";

  return {
    // `absolute` court-circuite le `title.template` du layout parent — sans ça
    // la marque apparaît deux fois ("...à Lyon · Léo Deroin — ...à Lyon").
    title: { absolute: title },
    description,
    alternates: {
      canonical: isFr ? "/" : "/en",
      languages: { fr: "/", en: "/en", "x-default": "/" },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: isFr ? "/" : "/en",
      locale: isFr ? "fr_FR" : "en_US",
      siteName: "Léo Deroin",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: ogAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: "/opengraph-image", alt: ogAlt }],
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
