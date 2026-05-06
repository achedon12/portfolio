"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";

export interface ProjectCardData {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  techStack: string[];
  category: string;
  featured?: boolean;
}

export function ProjectCard({ project, index }: { project: ProjectCardData; index: number }) {
  const t = useTranslations("Projects.card");
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="group"
    >
      <Link
        href={`/projects/${project.slug}`}
        className="block overflow-hidden rounded-xl border border-white/10 bg-cosmos-dark/40 backdrop-blur-md transition-all hover:border-nebula-cyan/40 hover:shadow-[0_0_60px_rgba(34,211,238,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-nebula-violet/40 via-cosmos-dark to-nebula-cyan/20">
          {project.coverImage && project.coverImage.startsWith("/") && (
            <img
              src={project.coverImage}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(3,0,20,0)_0%,rgba(3,0,20,0.7)_100%)]"
          />
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-cosmos-deep/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-300 backdrop-blur-sm">
            {project.category}
          </span>
          {project.featured && (
            <span className="absolute right-4 top-4 rounded-full border border-solar-orange/40 bg-solar-orange/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-solar-orange">
              {t("featured")}
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-semibold text-slate-100 transition-colors group-hover:text-nebula-cyan">
              {project.title}
            </h3>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-500 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-nebula-cyan" />
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-slate-400">{project.description}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 5).map((tn) => (
              <Badge key={tn} variant="default">
                {tn}
              </Badge>
            ))}
            {project.techStack.length > 5 && (
              <Badge variant="default">+{project.techStack.length - 5}</Badge>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
