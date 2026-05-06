import { profile } from "@/lib/profile";

export function personJsonLd(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr";
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    description: profile.bio[0],
    url,
    image: `${url}/profile.jpg`,
    email: `mailto:${profile.email}`,
    sameAs: [profile.links.github, profile.links.linkedin, profile.links.malt],
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.address.locality,
      addressRegion: profile.address.region,
      addressCountry: profile.address.country,
    },
    workLocation: {
      "@type": "Place",
      name: `${profile.address.locality}, France`,
      address: {
        "@type": "PostalAddress",
        addressLocality: profile.address.locality,
        addressRegion: profile.address.region,
        addressCountry: profile.address.country,
      },
    },
    knowsAbout: [...profile.knowsAbout],
    nationality: { "@type": "Country", name: "France" },
  };
  return JSON.stringify(data);
}

/**
 * ProfessionalService — pour la SEO locale (Google Maps, Knowledge Panel).
 * Indique que Léo Deroin est un service de développement web basé à Lyon
 * et qu'il intervient dans la région.
 */
export function professionalServiceJsonLd(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr";
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: profile.name,
    description: `Services de développement web fullstack à ${profile.address.locality} et en ${profile.address.region} : applications Next.js, React, Symfony, Vue.js, intégrations API, refontes.`,
    url,
    image: `${url}/profile.jpg`,
    provider: { "@type": "Person", name: profile.name },
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.address.locality,
      addressRegion: profile.address.region,
      addressCountry: profile.address.country,
    },
    areaServed: [
      { "@type": "City", name: profile.address.locality },
      { "@type": "AdministrativeArea", name: profile.address.region },
      { "@type": "Country", name: "France" },
    ],
    serviceType: "Développement web fullstack",
    knowsAbout: [...profile.knowsAbout],
  };
  return JSON.stringify(data);
}

export function websiteJsonLd(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr";
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: profile.name,
    alternateName: "leoderoin.fr",
    description: `Portfolio de ${profile.name}, ${profile.role.toLowerCase()} basé à ${profile.address.locality}.`,
    url,
    inLanguage: "fr-FR",
    publisher: {
      "@type": "Person",
      name: profile.name,
      url,
    },
    keywords: profile.searchKeywords.join(", "),
  };
  return JSON.stringify(data);
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  });
}

export function blogIndexJsonLd(args: {
  url: string;
  posts: Array<{ slug: string; title: string; description: string; publishedAt: string }>;
}): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Carnets de bord — Léo Deroin",
    url: args.url,
    inLanguage: "fr-FR",
    author: { "@type": "Person", name: profile.name, url: args.url.replace(/\/blog$/, "") },
    blogPost: args.posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.publishedAt,
      url: `${args.url}/${p.slug}`,
    })),
  });
}

export function projectJsonLd(args: {
  title: string;
  description: string;
  slug: string;
  publishedAt: Date;
  updatedAt?: Date;
  techStack?: string[];
  coverImage?: string | null;
  category?: string;
  liveUrl?: string | null;
  githubUrl?: string | null;
}): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr";
  const fullUrl = `${url}/projects/${args.slug}`;
  const image =
    args.coverImage && args.coverImage.startsWith("http")
      ? args.coverImage
      : args.coverImage
        ? `${url}${args.coverImage}`
        : undefined;

  const data = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: args.title,
    description: args.description,
    url: fullUrl,
    image,
    author: {
      "@type": "Person",
      name: profile.name,
      url,
    },
    creator: {
      "@type": "Person",
      name: profile.name,
      url,
    },
    datePublished: args.publishedAt.toISOString(),
    dateModified: (args.updatedAt ?? args.publishedAt).toISOString(),
    keywords: args.techStack?.join(", "),
    inLanguage: "fr-FR",
    about: args.category,
    sameAs: [args.liveUrl, args.githubUrl].filter(Boolean) as string[],
  };
  return JSON.stringify(data);
}
