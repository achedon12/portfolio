"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ProjectCard, type ProjectCardData } from "@/components/projects/ProjectCard";
import { cn } from "@/lib/utils";

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all",
        active
          ? "border-nebula-cyan/60 bg-nebula-cyan/10 text-nebula-cyan"
          : "border-white/10 bg-white/5 text-slate-400 hover:text-slate-200",
      )}
    >
      {children}
    </button>
  );
}

export function ProjectsGrid({ projects }: { projects: ProjectCardData[] }) {
  const t = useTranslations("Projects");
  const [tech, setTech] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const allTechs = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.techStack.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [projects]);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => set.add(p.category));
    return Array.from(set).sort();
  }, [projects]);

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        if (tech && !p.techStack.includes(tech)) return false;
        if (category && p.category !== category) return false;
        return true;
      }),
    [projects, tech, category],
  );

  return (
    <>
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            {t("filterCategory")}
          </span>
          <Pill active={category === null} onClick={() => setCategory(null)}>
            {t("all")}
          </Pill>
          {allCategories.map((c) => (
            <Pill key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Pill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            {t("filterStack")}
          </span>
          <Pill active={tech === null} onClick={() => setTech(null)}>
            {t("all")}
          </Pill>
          {allTechs.map((tn) => (
            <Pill key={tn} active={tech === tn} onClick={() => setTech(tn)}>
              {tn}
            </Pill>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-md border border-white/10 bg-cosmos-dark/40 p-8 text-center font-mono text-sm text-slate-500">
          {t("noResults")}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
