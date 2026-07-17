"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/libs/helpers/cn";

// Same gradient as .textured-bg (globals.css) — copied as a literal instead of
// reusing the class, because .textured-bg's ::before/::after glows are
// position:fixed, and this root gets a transform during its fade-out exit;
// a transformed ancestor becomes the containing block for fixed descendants,
// which would warp those glows mid-transition.
const LANDING_GRADIENT =
  "linear-gradient(180deg, #5B9CF6 0%, #4285F4 7%, #2563EB 18%, #1D4ED8 32%, #1E40AF 48%, #1E3A8A 62%, #172554 78%, #0f1e42 90%, #060d26 100%)";

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Progress reflects the page's real readiness (window `load` + custom fonts),
// not a fabricated fixed-duration timer — it creeps toward 92% on its own so
// it never looks stalled, then only the actual ready signal closes it to 100.
const MIN_VISIBLE_MS = 600; // floor: don't flash for an instant cached load
const CREEP_CEILING = 92;
const CREEP_MS = 1400;
const HARD_MAX_MS = 6000; // safety net if `load` never fires for some reason

export const LandingLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    let ready = false;
    let settled = false;

    const markReady = () => { ready = true; };
    if (document.readyState === "complete") markReady();
    else window.addEventListener("load", markReady, { once: true });

    Promise.resolve(document.fonts?.ready).then(markReady).catch(markReady);

    const tick = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;

      if (!settled && (ready || elapsed >= HARD_MAX_MS) && elapsed >= MIN_VISIBLE_MS) {
        settled = true;
        setProgress(100);
        setTimeout(() => setIsFadingOut(true), 250);
        return;
      }

      const creep = Math.min(elapsed / CREEP_MS, 1) * CREEP_CEILING;
      setProgress((prev) => Math.max(prev, Math.floor(creep)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("load", markReady);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!isFadingOut) return;
    const timer = setTimeout(onComplete, 700); // matches duration-700 below
    return () => clearTimeout(timer);
  }, [isFadingOut, onComplete]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isFadingOut ? "opacity-0 scale-[1.03] pointer-events-none" : "opacity-100"
      )}
      style={{ background: LANDING_GRADIENT }}
    >
      {/* Same twinkle motif as the landing page — five cheap dots, no blur, no
          continuous large-area animation. */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute rounded-full bg-white star-twinkle w-0.5 h-0.5 top-[15%] left-[20%]" style={{ animationDelay: "0.2s" }} />
        <div className="absolute rounded-full bg-white star-twinkle w-[3px] h-[3px] top-[25%] left-[75%] shadow-[0_0_8px_#3b82f6]" style={{ animationDelay: "1s" }} />
        <div className="absolute rounded-full bg-white star-twinkle w-1 h-1 top-[45%] left-[40%]" style={{ animationDelay: "0.5s" }} />
        <div className="absolute rounded-full bg-white star-twinkle w-0.5 h-0.5 top-[65%] left-[15%]" style={{ animationDelay: "1.8s" }} />
        <div className="absolute rounded-full bg-white star-twinkle w-[3px] h-[3px] top-[80%] left-[80%] shadow-[0_0_8px_#fdd026]" style={{ animationDelay: "1.2s" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 text-center select-none">

        {/* Logo inside a thin ring that traces real progress — no blurred
            pulsing glow, no infinite-loop decoration. */}
        <div className="relative mb-8 w-[136px] h-[136px] flex items-center justify-center">
          <svg width="136" height="136" viewBox="0 0 136 136" className="-rotate-90 absolute inset-0">
            <circle cx="68" cy="68" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
            <circle
              cx="68" cy="68" r={RING_RADIUS} fill="none"
              stroke="#FDD026" strokeWidth="2" strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress / 100)}
              style={{ transition: "stroke-dashoffset 120ms linear" }}
            />
          </svg>
          <Image
            src="/assets/images/logo_hero.PNG?v=2"
            alt="Informatics Festival Logo"
            width={140}
            height={140}
            className="relative object-contain w-16 h-16 md:w-20 md:h-20 select-none pointer-events-none"
            priority
          />
        </div>

        <h2 className="font-clash-display text-white text-xl font-bold tracking-widest uppercase mb-1">
          InFest <span className="text-[#FDD026]">XII</span>
        </h2>
        <p className="text-white/40 text-[9px] uppercase tracking-[0.25em] font-semibold mb-8">
          Universitas Syiah Kuala
        </p>

        <div className="w-40 flex items-center justify-center font-mono text-xs text-white/50">
          <span className="font-bold text-[#FDD026] tabular-nums">{progress}%</span>
        </div>

      </div>
    </div>
  );
};
