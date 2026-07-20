"use client";

import React from "react";
import type { SvgIconComponent } from "@mui/icons-material";

export interface TimelineNode {
  date: string;
  /** ISO date (YYYY-MM-DD) used only to space nodes proportionally to real elapsed time. */
  start: string;
  title: string;
  description: string;
  Icon: SvgIconComponent;
  accent: string;
}

type Point = { x: number; y: number };

// ponytail: uniform spacing so events that
// land days apart don't visually collide next to events months apart. Set to 0
// for perfectly uniform spacing so labels never collide and curves are precise.
const TIME_WEIGHT = 0.0;

/** Normalized [0,1] position per node — `data` must already be date-sorted. */
const computeTimeFractions = (data: TimelineNode[]): number[] => {
  const n = data.length;
  if (n <= 1) return data.map(() => 0);
  const times = data.map((d) => new Date(d.start).getTime());
  const span = times[n - 1] - times[0] || 1;
  return times.map((t, i) => {
    const raw = (t - times[0]) / span;
    const uniform = i / (n - 1);
    return TIME_WEIGHT * raw + (1 - TIME_WEIGHT) * uniform;
  });
};

/**
 * Smooth winding path through `pts`. Each segment is a cubic whose control
 * points sit halfway along `axis`, giving a tangent parallel to that axis at
 * every node — so nodes land on the crests and troughs of the curve.
 */
const windingPath = (pts: Point[], axis: "x" | "y") =>
  pts.slice(1).reduce((d, p, i) => {
    const prev = pts[i];
    const mid = axis === "x" ? (prev.x + p.x) / 2 : (prev.y + p.y) / 2;
    const c1 = axis === "x" ? `${mid},${prev.y}` : `${prev.x},${mid}`;
    const c2 = axis === "x" ? `${mid},${p.y}` : `${p.x},${mid}`;
    return `${d} C ${c1} ${c2} ${p.x},${p.y}`;
  }, `M ${pts[0].x},${pts[0].y}`);

/** Road: gradient stroke + dashed centre line, both immune to viewBox stretch. */
const Road = ({ d, viewBox, gradientId }: { d: string; viewBox: string; gradientId: string }) => (
  <svg
    className="absolute inset-0 h-full w-full"
    viewBox={viewBox}
    preserveAspectRatio="none"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDD026" />
        <stop offset="50%" stopColor="#2596BE" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
    <path
      d={d}
      stroke={`url(#${gradientId})`}
      strokeWidth={22}
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      opacity={0.9}
    />
    <path
      d={d}
      stroke="rgba(255,255,255,0.55)"
      strokeWidth={1.5}
      strokeDasharray="7 9"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

const Pin = ({ node }: { node: TimelineNode }) => (
  <div
    className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/25 shadow-[0_6px_20px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 md:h-14 md:w-14"
    style={{ backgroundColor: node.accent }}
  >
    <node.Icon className="h-5 w-5 text-[#0b1650] md:h-6 md:w-6" />
  </div>
);

const Label = ({ node, align }: { node: TimelineNode; align: "left" | "center" }) => (
  <div className={align === "center" ? "text-center" : "text-left"}>
    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: node.accent }}>
      {node.date}
    </span>
    <h3 className="font-clash-display mt-1 text-sm font-bold leading-tight text-white md:text-base">
      {node.title}
    </h3>
    <p className="mt-1 whitespace-pre-line text-[11px] leading-snug text-white/60 md:text-xs">{node.description}</p>
  </div>
);

// ── Desktop: single horizontal line, labels alternate above / below ──

// ── Desktop: single horizontal line, labels alternate above / below ──

// ── Desktop: single horizontal line, labels alternate above / below ──

const DesktopTimeline = ({ data }: { data: TimelineNode[] }) => {
  const n = data.length;
  const vbW = 1000;
  const pad = 80; // menambah padding samping (sebelumnya 30) untuk menggeser node lebih ke tengah

  return (
    <div className="relative hidden w-full md:block select-none" style={{ height: "420px" }}>
      {/* Container Jalur Tebal Horizontal */}
      <div 
        className="absolute h-[22px] rounded-full opacity-90 shadow-[0_0_12px_rgba(37,150,190,0.3)]"
        style={{ 
          left: `${(pad / vbW) * 100}%`,
          right: `${(pad / vbW) * 100}%`,
          top: "50%", 
          transform: "translateY(-50%)",
          background: "linear-gradient(to right, #FDD026 0%, #2596BE 50%, #3B82F6 100%)",
        }}
      >
        {/* Garis Putus-putus Putih di Tengah */}
        <div 
          className="absolute inset-x-0 h-[1.5px] opacity-60"
          style={{ 
            top: "50%", 
            transform: "translateY(-50%)",
            backgroundImage: "linear-gradient(to right, white 45%, transparent 45%)",
            backgroundSize: "16px 100%",
          }}
        />
      </div>

      {/* Nodes + labels */}
      {data.map((node, i) => {
        const leftPct = n > 1
          ? ((pad + (i / (n - 1)) * (vbW - pad * 2)) / vbW) * 100
          : 50;
        const labelAbove = i % 2 === 0;

        return (
          <div
            key={node.title}
            className="group absolute h-0 w-0"
            style={{ left: `${leftPct}%`, top: "50%" }}
          >
            {/* Pin */}
            <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
              <Pin node={node} />
            </div>
            {/* Label */}
            <div
              className={`absolute w-40 lg:w-48 -translate-x-1/2 ${
                labelAbove ? "bottom-[36px]" : "top-[36px]"
              }`}
              style={{ left: 0 }}
            >
              <Label node={node} align="center" />
            </div>
          </div>
        );
      })}
    </div>
  );
};


// ── Mobile: vertical winding path, pins snake at left, text in a fixed column ──

const MOBILE_ROW = 70; // viewBox units per node
const MOBILE_VB_W = 100;
const MOBILE_ROW_PX = 120; // taller rows for vertical breathing room

const MobileTimeline = ({ data }: { data: TimelineNode[] }) => {
  const t = computeTimeFractions(data);
  const vbH = MOBILE_ROW * data.length;
  const margin = MOBILE_ROW * 0.55;
  const nodeY = (i: number) => margin + t[i] * (vbH - margin * 2);
  // Path hugs the left so the label column stays wide enough to stay compact.
  const nodeX = (i: number) => (i % 2 === 0 ? 10 : 24);
  const pts: Point[] = data.map((_, i) => ({ x: nodeX(i), y: nodeY(i) }));
  // Centered start and end coordinates at x: 17 for clean vertical alignment
  const path = windingPath(
    [{ x: 17, y: 0 }, ...pts, { x: 17, y: vbH }],
    "y"
  );

  return (
    <div className="relative w-full md:hidden" style={{ height: data.length * MOBILE_ROW_PX }}>
      <Road d={path} viewBox={`0 0 ${MOBILE_VB_W} ${vbH}`} gradientId="timeline-road-mobile" />

      {data.map((node, i) => {
        const top = `${(pts[i].y / vbH) * 100}%`;
        return (
          <React.Fragment key={node.title}>
            <div
              className="absolute h-0 w-0"
              style={{ left: `${(pts[i].x / MOBILE_VB_W) * 100}%`, top }}
            >
              <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
                <Pin node={node} />
              </div>
            </div>
            <div className="absolute right-0 -translate-y-1/2 pr-1" style={{ left: "36%", top }}>
              <Label node={node} align="left" />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const Timeline = ({ data }: { data: TimelineNode[] }) => (
  <section className="w-full px-2 pt-6 pb-10 sm:px-4 md:px-6 md:pt-10 md:pb-16 lg:px-8">
    <div className="mb-8 text-center md:mb-12">
      <h2 className="flex items-baseline justify-center select-none text-balance">
        <span className="font-imperial-script translate-y-[0.05em] text-5xl font-normal leading-none text-white md:text-8xl">
          T
        </span>
        <span className="font-astralaga text-3xl font-normal lowercase leading-none tracking-widest text-white md:text-6xl">
          imeline
        </span>
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-pretty px-1 font-serif text-xs leading-relaxed text-white/70 opacity-70 md:text-base">
        Ikuti perjalanan INFEST XII 2026, dari pembukaan pendaftaran hingga malam penganugerahan.
      </p>
    </div>

    <DesktopTimeline data={data} />
    <MobileTimeline data={data} />
  </section>
);
