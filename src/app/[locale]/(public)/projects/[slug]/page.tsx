import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projectJsonLd, breadcrumbJsonLd } from "@/lib/seo";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) return { title: locale === "fr" ? "Projet introuvable" : "Project not found" };

  const techStack = Array.isArray(project.techStack) ? (project.techStack as string[]) : [];
  const isFr = locale === "fr";
  const path = `${isFr ? "" : "/en"}/projects/${project.slug}`;
  const keywords = [
    project.title.toLowerCase(),
    ...techStack.map((t) => t.toLowerCase()),
    "léo deroin",
    isFr ? "développeur fullstack lyon" : "fullstack developer lyon",
    `${isFr ? "projet" : "project"} ${project.category}`,
  ];

  return {
    title: `${project.title} — ${isFr ? "Projet" : "Project"} ${project.category}`,
    description: project.description,
    keywords,
    alternates: {
      canonical: path,
      languages: {
        fr: `/projects/${project.slug}`,
        en: `/en/projects/${project.slug}`,
        "x-default": `/projects/${project.slug}`,
      },
    },
    openGraph: {
      title: project.title,
      description: project.description,
      type: "article",
      url: path,
      images: project.coverImage ? [{ url: project.coverImage }] : undefined,
      tags: techStack,
      locale: isFr ? "fr_FR" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
      images: project.coverImage ? [project.coverImage] : undefined,
    },
  };
}

export const revalidate = 60;

export default async function ProjectDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ProjectDetail");
  const tNav = await getTranslations("Nav");

  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) notFound();

  const [prev, next] = await Promise.all([
    prisma.project.findFirst({
      where: { publishedAt: { lt: project.publishedAt } },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, title: true },
    }),
    prisma.project.findFirst({
      where: { publishedAt: { gt: project.publishedAt } },
      orderBy: { publishedAt: "asc" },
      select: { slug: true, title: true },
    }),
  ]);

  const techStack = Array.isArray(project.techStack) ? (project.techStack as string[]) : [];
  const gallery = Array.isArray(project.gallery) ? (project.gallery as string[]) : [];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr";
  const isFr = locale === "fr";
  const localePrefix = isFr ? "" : "/en";
  const homeName = isFr ? "Accueil" : "Home";

  return (
    <article className="relative">
      <header className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-cosmos-dark/0 via-cosmos-deep/40 to-cosmos-deep"
        />
        <div className="relative mx-auto max-w-5xl px-6 pt-32 pb-12">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-400 transition-colors hover:text-nebula-cyan"
          >
            <ArrowLeft className="h-3 w-3" />
            {t("back")}
          </Link>

          <p className="mt-8 font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
            ◊ {project.category}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">{project.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">{project.description}</p>

          {project.coverImage && (
            <div className="mt-10 overflow-hidden rounded-xl border border-white/10 bg-cosmos-dark/40">
              <img
                src={project.coverImage}
                alt={project.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 pb-20">
        <section className="mb-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
            {t("stackTitle")}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {techStack.map((tn) => (
              <Badge key={tn} variant="cyan">
                {tn}
              </Badge>
            ))}
          </div>
        </section>

        {project.longContent && (
          <section className="mb-10">
            <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
              {t("missionTitle")}
            </h2>
            <div className="prose-cosmos space-y-4 text-slate-300 leading-relaxed">
              {project.longContent.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>
        )}

        {gallery.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
              {t("galleryTitle")}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {gallery.map((src, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-white/10">
                  <img src={src} alt="" className="aspect-video w-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-wrap gap-3">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              <Button>
                {t("viewLive")}
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                {t("sourceCode")}
                <Github className="h-4 w-4" />
              </Button>
            </a>
          )}
        </section>

        <nav className="mt-16 grid gap-3 border-t border-white/5 pt-8 md:grid-cols-2">
          {prev ? (
            <Link
              href={`/projects/${prev.slug}`}
              className="group rounded-lg border border-white/10 bg-cosmos-dark/40 p-4 transition-colors hover:border-nebula-cyan/40"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                {t("previousMission")}
              </p>
              <p className="mt-1 font-display text-sm font-medium text-slate-200 group-hover:text-nebula-cyan">
                {prev.title}
              </p>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/projects/${next.slug}`}
              className="group rounded-lg border border-white/10 bg-cosmos-dark/40 p-4 text-right transition-colors hover:border-nebula-cyan/40"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                {t("nextMission")}
              </p>
              <p className="mt-1 font-display text-sm font-medium text-slate-200 group-hover:text-nebula-cyan">
                {next.title}
              </p>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: projectJsonLd({
            title: project.title,
            description: project.description,
            slug: project.slug,
            publishedAt: project.publishedAt,
            updatedAt: project.updatedAt,
            techStack,
            coverImage: project.coverImage,
            category: project.category,
            liveUrl: project.liveUrl,
            githubUrl: project.githubUrl,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: breadcrumbJsonLd([
            { name: homeName, url: `${baseUrl}${localePrefix}/` },
            { name: tNav("projects"), url: `${baseUrl}${localePrefix}/projects` },
            { name: project.title, url: `${baseUrl}${localePrefix}/projects/${project.slug}` },
          ]),
        }}
      />
    </article>
  );
}
