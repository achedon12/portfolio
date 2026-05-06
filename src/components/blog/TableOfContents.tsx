"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { TocEntry } from "@/lib/blog";

export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const t = useTranslations("BlogPost");
  const [activeId, setActiveId] = useState<string | null>(entries[0]?.id ?? null);

  useEffect(() => {
    if (entries.length === 0) return;
    const headings = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (items) => {
        const visible = items
          .filter((i) => i.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav aria-label={t("tableOfContents")} className="text-sm">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-nebula-cyan">
        {t("tableOfContents")}
      </p>
      <ul className="space-y-2 border-l border-white/10">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={cn(
                "block border-l-2 pl-3 py-0.5 -ml-px transition-colors",
                entry.depth === 3 && "pl-6",
                activeId === entry.id
                  ? "border-nebula-cyan text-nebula-cyan"
                  : "border-transparent text-slate-400 hover:text-slate-200",
              )}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
