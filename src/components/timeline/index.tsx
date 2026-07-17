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
    <p className="mt-1 text-[11px] leading-snug text-white/60 md:text-xs">{node.description}</p>
  </div>
);

// ── Desktop: horizontal serpentine (S-curve) winding road, nodes alternating above / below ──

const DESKTOP_VB = { w: 1200, h: 680 };

const computePoints = (data: TimelineNode[], width: number, leftMargin: number, rightMargin: number): Point[] => {
  const rowSizes = [5, 4, 4];
  const rowYs = [170, 380, 590];
  const pts: Point[] = [];

  let currentIndex = 0;
  rowSizes.forEach((size, rowIndex) => {
    const isLeftToRight = rowIndex % 2 === 0;
    const y = rowYs[rowIndex];
    for (let i = 0; i < size; i++) {
      if (currentIndex >= data.length) break;
      const t = size > 1 ? i / (size - 1) : 0.5;
      const xFraction = isLeftToRight ? t : 1 - t;
      const x = leftMargin + xFraction * (width - leftMargin - rightMargin);
      pts.push({ x, y });
      currentIndex++;
    }
  });

  return pts;
};

const serpentinePath = (pts: Point[], width: number, leftMargin: number, rightMargin: number): string => {
  if (pts.length === 0) return "";
  let d = `M ${pts[0].x},${pts[0].y}`;
  const rowSizes = [5, 4, 4];
  const bulge = 75; // turnaround radius fits 100px margins perfectly without clipping

  // Row 0: index 0 to 4
  for (let i = 1; i < rowSizes[0]; i++) {
    d += ` L ${pts[i].x},${pts[i].y}`;
  }
  // Turnaround 1: Node 4 to Node 5
  if (pts.length > 5) {
    const p4 = pts[4];
    const p5 = pts[5];
    d += ` C ${p4.x + bulge},${p4.y} ${p5.x + bulge},${p5.y} ${p5.x},${p5.y}`;
  }

  // Row 1: index 5 to 8
  const row1End = Math.min(pts.length - 1, 8);
  for (let i = 6; i <= row1End; i++) {
    d += ` L ${pts[i].x},${pts[i].y}`;
  }
  // Turnaround 2: Node 8 to Node 9
  if (pts.length > 9) {
    const p8 = pts[8];
    const p9 = pts[9];
    d += ` C ${p8.x - bulge},${p8.y} ${p9.x - bulge},${p9.y} ${p9.x},${p9.y}`;
  }

  // Row 2: index 9 to 12
  const row2End = Math.min(pts.length - 1, 12);
  for (let i = 10; i <= row2End; i++) {
    d += ` L ${pts[i].x},${pts[i].y}`;
  }

  return d;
};

const DesktopTimeline = ({ data }: { data: TimelineNode[] }) => {
  const leftMargin = 100; // Left turnaround margin
  const rightMargin = 100; // Right turnaround margin
  const pathPts = computePoints(data, DESKTOP_VB.w, leftMargin, rightMargin);
  const path = serpentinePath(pathPts, DESKTOP_VB.w, leftMargin, rightMargin);

  // Position points: Shift the 6th mark (index 5) left and the 10th mark (index 9) right along the road path
  const nodePts = pathPts.map((pt, i) => {
    if (i === 5) {
      const xFraction = 0.90;
      const x = leftMargin + xFraction * (DESKTOP_VB.w - leftMargin - rightMargin);
      return { ...pt, x };
    }
    if (i === 9) {
      const xFraction = 0.10;
      const x = leftMargin + xFraction * (DESKTOP_VB.w - leftMargin - rightMargin);
      return { ...pt, x };
    }
    return pt;
  });

  return (
    <div className="relative hidden h-[740px] w-full md:block select-none">
      <div className="absolute left-0 top-1/2 h-[680px] -translate-y-1/2 w-full">
        <Road d={path} viewBox={`0 0 ${DESKTOP_VB.w} ${DESKTOP_VB.h}`} gradientId="timeline-road-desktop" />

        {data.map((node, i) => {
          return (
            <div
              key={node.title}
              className="group absolute h-0 w-0"
              style={{ left: `${(nodePts[i].x / DESKTOP_VB.w) * 100}%`, top: `${(nodePts[i].y / DESKTOP_VB.h) * 100}%` }}
            >
              <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
                <Pin node={node} />
              </div>
              <div
                className="absolute left-0 w-44 -translate-x-1/2 lg:w-52 bottom-[36px]"
              >
                <Label node={node} align="center" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Mobile: vertical winding path, pins snake at left, text in a fixed column ──

const MOBILE_ROW = 100; // viewBox units per node
const MOBILE_VB_W = 100;
const MOBILE_ROW_PX = 152; // must clear a 3–4 line label, or rows collide

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
  <section className="w-full px-4 pt-6 pb-10 sm:px-8 md:px-16 md:pt-10 md:pb-16 lg:px-24 xl:px-32">
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
