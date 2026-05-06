"use client";

import { useRef, useState } from "react";

interface SparklineProps {
  /** Tableau de points {date, value} ordonné chronologiquement. */
  points: Array<{ date: string; value: number }>;
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  ariaLabel?: string;
  /** Suffixe affiché dans la tooltip après la valeur (ex: " visites"). */
  unitLabel?: string;
}

/**
 * Sparkline SVG interactive — au survol/touch, affiche une ligne guide
 * verticale + le point actif emphasisé + un tooltip flottant avec la valeur.
 *
 * Le rect <rect> de capture invisible est rendu en dernier pour qu'il soit
 * au-dessus des paths et capture tous les événements pointer (mouse + touch).
 */
export function Sparkline({
  points,
  width = 800,
  height = 200,
  strokeColor = "#22d3ee",
  fillColor = "rgba(34, 211, 238, 0.12)",
  ariaLabel = "Série temporelle",
  unitLabel = "",
}: SparklineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeIdx, setActiveIdx] = useState<number>(-1);

  if (points.length === 0) {
    return (
      <p className="rounded-md border border-white/10 bg-cosmos-dark/40 p-6 text-center font-mono text-xs text-slate-500">
        Aucune donnée disponible.
      </p>
    );
  }

  const padding = { top: 16, right: 12, bottom: 28, left: 12 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const max = Math.max(1, ...points.map((p) => p.value));
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;

  const coords = points.map((p, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + innerH - (p.value / max) * innerH,
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${padding.top + innerH} L ${coords[0].x.toFixed(1)} ${padding.top + innerH} Z`;

  const firstDate = formatShort(points[0].date);
  const lastDate = formatShort(points[points.length - 1].date);

  const onPointerMove = (e: React.PointerEvent<SVGRectElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const xInViewBox = ((e.clientX - rect.left) / rect.width) * width;
    const idx = Math.round((xInViewBox - padding.left) / Math.max(stepX, 1));
    setActiveIdx(Math.max(0, Math.min(points.length - 1, idx)));
  };

  const active =
    activeIdx >= 0
      ? { idx: activeIdx, point: points[activeIdx], coord: coords[activeIdx] }
      : null;

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full select-none"
        role="img"
        aria-label={ariaLabel}
      >
        <path d={areaPath} fill={fillColor} />
        <path d={linePath} fill="none" stroke={strokeColor} strokeWidth={1.5} />
        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={2}
            fill={strokeColor}
            opacity={active && active.idx !== i ? 0.4 : 1}
          />
        ))}

        {active && (
          <>
            <line
              x1={active.coord.x}
              y1={padding.top}
              x2={active.coord.x}
              y2={padding.top + innerH}
              stroke="#94a3b8"
              strokeOpacity={0.45}
              strokeDasharray="3 3"
            />
            <circle
              cx={active.coord.x}
              cy={active.coord.y}
              r={5}
              fill={strokeColor}
              stroke="#0a0420"
              strokeWidth={2}
            />
          </>
        )}

        <text
          x={padding.left}
          y={height - 8}
          fill="#64748b"
          fontFamily="ui-monospace, monospace"
          fontSize="10"
        >
          {firstDate}
        </text>
        <text
          x={width - padding.right}
          y={height - 8}
          textAnchor="end"
          fill="#64748b"
          fontFamily="ui-monospace, monospace"
          fontSize="10"
        >
          {lastDate}
        </text>
        <text
          x={width - padding.right}
          y={padding.top + 4}
          textAnchor="end"
          fill="#94a3b8"
          fontFamily="ui-monospace, monospace"
          fontSize="10"
        >
          max {max.toLocaleString("fr-FR")}
        </text>

        <rect
          x={padding.left}
          y={padding.top}
          width={innerW}
          height={innerH}
          fill="transparent"
          onPointerMove={onPointerMove}
          onPointerDown={onPointerMove}
          onPointerLeave={() => setActiveIdx(-1)}
          style={{ cursor: "crosshair", touchAction: "none" }}
        />
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute rounded-md border border-white/15 bg-cosmos-deep/95 px-3 py-2 backdrop-blur-md whitespace-nowrap shadow-[0_0_30px_rgba(34,211,238,0.18)]"
          style={{
            left: `${(active.coord.x / width) * 100}%`,
            top: `${(active.coord.y / height) * 100}%`,
            transform: "translate(-50%, calc(-100% - 14px))",
          }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
            {formatLong(active.point.date)}
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-nebula-cyan">
            {active.point.value.toLocaleString("fr-FR")}
            {unitLabel && (
              <span className="ml-1 font-mono text-xs text-slate-500">{unitLabel}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

function formatShort(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function formatLong(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
