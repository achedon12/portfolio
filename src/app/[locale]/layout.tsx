import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import { Matomo } from "@/components/Matomo";
import { profile } from "@/lib/profile";
import { routing, type Locale } from "@/i18n/routing";

const IS_PROD = process.env.NODE_ENV === "production";
const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#030014",
  colorScheme: "dark",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: "Hero" });
  const tFooter = await getTranslations({ locale, namespace: "Footer" });

  const isFr = locale === "fr";
  const title = isFr
    ? "Léo Deroin — Développeur Fullstack à Lyon · Next.js, React, Symfony"
    : "Léo Deroin — Fullstack Developer in Lyon · Next.js, React, Symfony";
  const description = isFr
    ? "Léo Deroin — développeur fullstack à Lyon (Auvergne-Rhône-Alpes). Stack PHP/Symfony, Next.js, React, Vue, TypeScript. Découvrez mes projets, mon parcours et mon blog."
    : "Léo Deroin — fullstack developer in Lyon, France. Stack: PHP/Symfony, Next.js, React, Vue, TypeScript. Browse my projects, career and blog.";

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr"),
    title: {
      default: title,
      template: isFr
        ? "%s · Léo Deroin — Développeur Fullstack à Lyon"
        : "%s · Léo Deroin — Fullstack Developer in Lyon",
    },
    description,
    applicationName: "Léo Deroin",
    authors: [{ name: profile.name, url: profile.links.linkedin }],
    creator: profile.name,
    publisher: profile.name,
    keywords: [...profile.searchKeywords, t("subtitle"), tFooter("tagline")],
    category: "technology",
    openGraph: {
      type: "website",
      locale: isFr ? "fr_FR" : "en_US",
      siteName: "Léo Deroin",
      url: isFr ? "/" : "/en",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
        : undefined,
    },
    alternates: {
      canonical: isFr ? "/" : "/en",
      languages: {
        fr: "/",
        en: "/en",
        "x-default": "/",
      },
      types: { "application/rss+xml": "/blog/rss.xml" },
    },
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-cosmos-deep text-slate-200 antialiased font-sans">
        <NextIntlClientProvider locale={locale as Locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
        {IS_PROD && (
          <>
            <Analytics />
            {MATOMO_URL && MATOMO_SITE_ID && <Matomo url={MATOMO_URL} siteId={MATOMO_SITE_ID} />}
          </>
        )}
      </body>
    </html>
  );
}
