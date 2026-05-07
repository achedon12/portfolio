"use client";

import { ArrowUp, Download, Github, Linkedin, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { profile } from "@/lib/profile";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";

function scrollToTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function Footer() {
  const tNav = useTranslations("Nav");
  const t = useTranslations("Footer");
  const tCommon = useTranslations("Common");
  const tNewsletter = useTranslations("Newsletter");
  const year = new Date().getFullYear();

  const primary = [
    { href: "/projects", label: tNav("projects") },
    { href: "/blog", label: tNav("blog") },
    { href: "/#contact", label: tNav("contact") },
  ];

  const explore = [
    { href: "/lab", label: tNav("lab") },
    { href: "/now", label: tNav("now") },
    { href: "/uses", label: tNav("uses") },
    { href: "/newsletter", label: tNav("newsletter") },
  ];

  return (
    <footer className="relative z-10 mt-24">
      <div
        aria-hidden
        className="h-px bg-gradient-to-r from-transparent via-nebula-cyan/40 to-transparent"
      />

      <div className="bg-cosmos-deep/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <section
            aria-labelledby="newsletter-heading"
            className="mb-14 rounded-xl border border-white/10 bg-gradient-to-br from-nebula-cyan/5 via-transparent to-nebula-violet/5 p-6 md:p-8"
          >
            <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-center">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-nebula-cyan/80">
                  {tNewsletter("kicker")}
                </p>
                <h2
                  id="newsletter-heading"
                  className="mt-2 font-display text-xl font-semibold text-slate-100 md:text-2xl"
                >
                  {tNewsletter("title")}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {tNewsletter("intro")}
                </p>
              </div>
              <NewsletterForm variant="compact" />
            </div>
          </section>

          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Link href="/" className="inline-flex items-center gap-3 group">
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-nebula-cyan/40 bg-nebula-cyan/10 font-mono text-xs font-semibold text-nebula-cyan transition-all group-hover:shadow-[0_0_25px_rgba(34,211,238,0.45)]">
                  LD
                </span>
                <span>
                  <p className="font-display text-base font-semibold text-slate-100">
                    {profile.name}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-nebula-cyan/80">
                    {profile.role}
                  </p>
                </span>
              </Link>

              <p className="mt-6 max-w-md text-sm leading-relaxed text-slate-400">
                {t("tagline")}
              </p>

              <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">
                  {t("available")}
                </span>
              </div>
            </div>

            <nav className="lg:col-span-3" aria-label={t("navigation")}>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-nebula-cyan/80">
                {t("navigation")}
              </h3>
              <ul className="mt-5 space-y-2.5">
                {primary.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-300 transition-colors hover:text-nebula-cyan hover:underline underline-offset-4 decoration-nebula-cyan/40"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <h3 className="mt-8 font-mono text-[10px] uppercase tracking-[0.25em] text-nebula-cyan/80">
                {t("explore")}
              </h3>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5">
                {explore.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 transition-colors hover:text-slate-100 hover:underline underline-offset-4 decoration-nebula-cyan/40"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="lg:col-span-4">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-nebula-cyan/80">
                {t("letsConnect")}
              </h3>

              <a
                href={`mailto:${profile.email}`}
                className="group mt-5 inline-flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition-all hover:border-nebula-cyan/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]"
              >
                <Mail className="h-4 w-4 text-nebula-cyan transition-transform group-hover:-rotate-12" />
                <span className="font-mono text-slate-200">{profile.email}</span>
              </a>

              <a
                href="/leo-deroin-cv.pdf"
                download
                className="group mt-3 inline-flex items-center gap-3 rounded-md border border-nebula-cyan/30 bg-nebula-cyan/5 px-4 py-2.5 text-sm transition-all hover:border-nebula-cyan/60 hover:bg-nebula-cyan/10 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
              >
                <Download className="h-4 w-4 text-nebula-cyan transition-transform group-hover:-translate-y-0.5" />
                <span className="font-mono text-slate-200">{tCommon("downloadCv")}</span>
              </a>

              <div className="mt-5 flex items-center gap-2">
                <SocialLink
                  href={profile.links.github}
                  label="GitHub"
                  icon={<Github className="h-4 w-4" />}
                />
                <SocialLink
                  href={profile.links.linkedin}
                  label="LinkedIn"
                  icon={<Linkedin className="h-4 w-4" />}
                />
              </div>

              <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                {t("responseTime")}
              </p>
            </div>
          </div>

          <div className="mt-14 flex flex-col-reverse gap-4 border-t border-white/5 pt-7 md:flex-row md:items-center md:justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
              © {year} {profile.name} — {t("rights")}
            </p>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label={t("backToTop")}
              className="group inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400 transition-all hover:border-nebula-cyan/40 hover:text-nebula-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60"
            >
              <ArrowUp className="h-3 w-3 transition-transform group-hover:-translate-y-0.5" />
              {t("backToTop")}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-nebula-cyan/40 hover:text-nebula-cyan hover:shadow-[0_0_25px_rgba(34,211,238,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60"
    >
      {icon}
    </a>
  );
}
