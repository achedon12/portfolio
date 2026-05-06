"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { skills, categoryColors, type SkillCategory } from "@/lib/skills";
import { cn } from "@/lib/utils";

const SVG_SIZE = 800;
const PADDING = 60;

const toX = (x: number) => PADDING + ((x + 1) / 2) * (SVG_SIZE - PADDING * 2);
const toY = (y: number) => PADDING + ((y + 1) / 2) * (SVG_SIZE - PADDING * 2);

const CATEGORIES: SkillCategory[] = ["frontend", "backend", "devops", "tools"];

export function SkillsConstellation() {
  const t = useTranslations("Skills");
  const [activeCategory, setActiveCategory] = useState<SkillCategory | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const links = useMemo(() => {
    const out: Array<{ from: string; to: string; key: string }> = [];
    skills.forEach((s) => {
      (s.links ?? []).forEach((toId) => {
        const key = [s.id, toId].sort().join("-");
        if (!out.find((l) => l.key === key)) out.push({ from: s.id, to: toId, key });
      });
    });
    return out;
  }, []);

  const skillById = useMemo(() => Object.fromEntries(skills.map((s) => [s.id, s])), []);
  const hovered = hoveredId ? skillById[hoveredId] : null;

  const isDimmed = (cat: SkillCategory) =>
    activeCategory !== null && activeCategory !== cat;

  return (
    <section id="skills" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
            {t("kicker")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">{t("title")}</h2>
          <p className="mt-3 max-w-2xl text-slate-400">{t("intro")}</p>
        </motion.div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all",
              activeCategory === null
                ? "border-nebula-cyan/60 bg-nebula-cyan/10 text-nebula-cyan"
                : "border-white/10 bg-white/5 text-slate-400 hover:text-slate-200",
            )}
          >
            {t("all")}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all",
                activeCategory === cat
                  ? "border-current text-current"
                  : "border-white/10 bg-white/5 text-slate-400 hover:text-slate-200",
              )}
              style={
                activeCategory === cat
                  ? { color: categoryColors[cat], backgroundColor: `${categoryColors[cat]}1a` }
                  : undefined
              }
            >
              {t(`category.${cat}`)}
            </button>
          ))}
        </div>

        <div className="relative">
          <svg
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className="aspect-square w-full max-w-3xl mx-auto"
            role="img"
            aria-label={t("ariaLabel")}
          >
            <g>
              {links.map(({ from, to, key }) => {
                const a = skillById[from];
                const b = skillById[to];
                if (!a || !b) return null;
                const dim = isDimmed(a.category) || isDimmed(b.category);
                return (
                  <line
                    key={key}
                    x1={toX(a.x)}
                    y1={toY(a.y)}
                    x2={toX(b.x)}
                    y2={toY(b.y)}
                    stroke="#22d3ee"
                    strokeOpacity={dim ? 0.04 : 0.18}
                    strokeWidth={1}
                    style={{ transition: "stroke-opacity 300ms" }}
                  />
                );
              })}
            </g>

            <g>
              {skills.map((s, i) => {
                const cx = toX(s.x);
                const cy = toY(s.y);
                const dim = isDimmed(s.category);
                const isHovered = hoveredId === s.id;
                const r = 4 + s.level * 1.4;
                const color = categoryColors[s.category];
                return (
                  <motion.g
                    key={s.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-10% 0px" }}
                    transition={{ delay: i * 0.025, duration: 0.4 }}
                    onPointerEnter={() => setHoveredId(s.id)}
                    onPointerLeave={() => setHoveredId(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <g
                      opacity={dim ? 0.18 : 1}
                      style={{ transition: "opacity 300ms" }}
                    >
                      <circle
                        cx={cx}
                        cy={cy}
                        r={r * 2.2}
                        fill={color}
                        opacity={isHovered ? 0.35 : 0.12}
                        style={{ transition: "opacity 200ms" }}
                      />
                      <circle cx={cx} cy={cy} r={r} fill={color} />
                      <text
                        x={cx}
                        y={cy + r + 14}
                        textAnchor="middle"
                        className="fill-slate-300 font-mono"
                        fontSize="10"
                      >
                        {s.name}
                      </text>
                    </g>
                  </motion.g>
                );
              })}
            </g>
          </svg>

          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="pointer-events-none absolute left-4 top-4 max-w-[200px] rounded-md border border-white/10 bg-cosmos-dark/80 p-3 font-mono text-xs backdrop-blur-md"
            >
              <p className="text-sm font-semibold text-slate-100">{hovered.name}</p>
              <p
                className="mt-1 text-[10px] uppercase tracking-wider"
                style={{ color: categoryColors[hovered.category] }}
              >
                {t(`category.${hovered.category}`)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-slate-500">{t("level")}</span>
                <span className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1.5 w-3 rounded-sm",
                        i < hovered.level ? "bg-nebula-cyan" : "bg-white/10",
                      )}
                    />
                  ))}
                </span>
              </div>
              <p className="mt-1 text-slate-500">{t("yearsOfUse", { years: hovered.years })}</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
