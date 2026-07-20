"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { timelineData } from "@/data/timeline";
import { competitionData } from "@/data/competitions";
import { cn } from "@/libs/helpers/cn";
import { LandingLoader } from "@/components/loadingAnimation/LandingLoader";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Global, one-time GSAP perf config (module scope — must not re-run per render/mount).
// lagSmoothing(0): a backgrounded tab / long task no longer makes GSAP "catch up" with
// a jarring jump on the next tick; every pinned/scrubbed tween just resumes from where
// it visually is.
gsap.ticker.lagSmoothing(0);
// ignoreMobileResize: mobile browsers fire a resize on address-bar show/hide during
// scroll; without this, ScrollTrigger.refresh() was re-running on every one of those,
// re-measuring every trigger mid-scroll.
ScrollTrigger.config({ ignoreMobileResize: true });

import { Timeline } from "@/components/timeline";


// ── Pure-CSS decorative components (no Framer Motion overhead) ──

const TwinklingStar = ({ top, left, delay, size = 2 }: { top: string; left: string; delay: number; size?: number }) => (
  <div
    className="absolute rounded-full bg-white star-twinkle"
    style={{
      top,
      left,
      width: `${size}px`,
      height: `${size}px`,
      boxShadow: "0 0 6px rgba(219,234,254,0.95), 0 0 18px rgba(147,197,253,0.55)",
      animationDelay: `${delay}s`,
    }}
  />
);

const FloatingCloud = ({ top, left, speed = 8, delay = 0, opacity = 0.35, size = "md", flip = false }: { top: string; left: string; speed?: number; delay?: number; opacity?: number; size?: "sm" | "md" | "lg" | "xl"; flip?: boolean }) => {
  const sizeClass = { sm: "w-28 md:w-40", md: "w-40 md:w-60", lg: "w-56 md:w-80", xl: "w-72 md:w-[28rem]" }[size];
  return (
    <div
      className="absolute pointer-events-none z-0"
      style={{ top, left, opacity, animation: `cloud-drift ${speed}s ease-in-out ${delay}s infinite` }}
    >
      <img src="/assets/svg/awan.webp" alt="" aria-hidden="true" className={`${sizeClass} h-auto`} style={{ transform: flip ? "scaleX(-1)" : undefined }} />
    </div>
  );
};

// ── Competition Card ──

interface Competition {
  id: string;
  name: string;
  description: string;
  prizepool: string;
  teamMin: number;
  teamMax: number;
  guidebookLink: string;
  iconUrl: string;
  keywords?: string[];
  featured?: boolean;
}

const CompetitionCard = ({
  comp,
  isFeatured = false,
  getSlug,
}: {
  comp: Competition | undefined;
  isFeatured?: boolean;
  getSlug: (name: string) => string;
}) => {
  if (!comp) return null;

  const btnStyle = isFeatured
    ? "flex-1 py-2.5 bg-gradient-to-b from-[#FFE14D] via-[#FDD026] to-[#D4A017] text-[#0f172a] shadow-[0_4px_20px_rgba(253,208,38,0.38),inset_0_1px_0_rgba(255,255,255,0.55)] hover:brightness-110 hover:shadow-[0_6px_28px_rgba(253,208,38,0.58),inset_0_1px_0_rgba(255,255,255,0.65)] rounded-full text-xs font-extrabold text-center transition-all duration-300 uppercase tracking-widest"
    : "flex-1 py-2.5 bg-gradient-to-b from-[#60A5FA] via-[#3B82F6] to-[#2563EB] text-white shadow-[0_4px_20px_rgba(59,130,246,0.42),inset_0_1px_0_rgba(255,255,255,0.32)] hover:brightness-110 hover:shadow-[0_6px_28px_rgba(59,130,246,0.62),inset_0_1px_0_rgba(255,255,255,0.42)] rounded-full text-xs font-extrabold text-center transition-all duration-300 uppercase tracking-widest";

  const secondaryBtnStyle = isFeatured
    ? "px-4 py-2.5 border border-[#FDD026]/50 hover:bg-[#FDD026]/10 text-[#FDD026] hover:border-[#FDD026]/75 hover:shadow-[0_4px_16px_rgba(253,208,38,0.22)] rounded-full text-xs font-bold text-center transition-all duration-300 md:backdrop-blur-sm"
    : "px-4 py-2.5 border border-[#60A5FA]/40 hover:bg-[#3B82F6]/10 text-[#93C5FD] hover:border-[#60A5FA]/65 hover:shadow-[0_4px_16px_rgba(59,130,246,0.22)] rounded-full text-xs font-bold text-center transition-all duration-300 md:backdrop-blur-sm";

  return (
    <div className={cn("w-full flex flex-col transition-all duration-500 h-full min-h-[280px] sm:min-h-[340px] md:min-h-[420px]")}>
      <div
        className={cn(
          "relative flex flex-col justify-between rounded-[24px] md:backdrop-blur-md border p-6 md:p-8 h-full transition-all duration-500 overflow-hidden group",
          isFeatured
            ? "bg-gradient-to-b from-[#1e3a8a]/50 to-[#0d1a5c]/68 border-[#FDD026]/42 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.45),0_0_0_1px_rgba(253,208,38,0.12),inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-[#FDD026]/65 hover:shadow-[0_28px_80px_-10px_rgba(253,208,38,0.22),0_0_0_1px_rgba(253,208,38,0.28),inset_0_1px_0_rgba(255,255,255,0.18)]"
            : "bg-gradient-to-b from-[#1a3670]/40 to-[#0d1a5c]/58 border-[#FDD026]/22 opacity-95 shadow-[0_16px_50px_-10px_rgba(0,0,0,0.38),0_0_0_1px_rgba(253,208,38,0.08),inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-[#FDD026]/48 hover:shadow-[0_22px_65px_-10px_rgba(253,208,38,0.18),0_0_0_1px_rgba(253,208,38,0.20),inset_0_1px_0_rgba(255,255,255,0.12)] hover:opacity-100"
        )}
      >
        {/* Noise texture overlay */}
        <div className="absolute inset-0 noise-texture opacity-[0.015] pointer-events-none mix-blend-overlay" />

        {/* Ambient internal radial glow */}
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[60px] pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-500",
          isFeatured ? "bg-[#FDD026]/18" : "bg-[#3B82F6]/14"
        )} />

        {/* Corner Accents */}
        <div className={cn("absolute top-3 left-3 w-3.5 h-3.5 border-t-[1.5px] border-l-[1.5px] rounded-tl-[3px] pointer-events-none", isFeatured ? "border-[#FDD026]/55" : "border-[#60A5FA]/45")} />
        <div className={cn("absolute top-3 right-3 w-3.5 h-3.5 border-t-[1.5px] border-r-[1.5px] rounded-tr-[3px] pointer-events-none", isFeatured ? "border-[#FDD026]/55" : "border-[#60A5FA]/45")} />
        <div className={cn("absolute bottom-3 left-3 w-3.5 h-3.5 border-b-[1.5px] border-l-[1.5px] rounded-bl-[3px] pointer-events-none", isFeatured ? "border-[#FDD026]/55" : "border-[#60A5FA]/45")} />
        <div className={cn("absolute bottom-3 right-3 w-3.5 h-3.5 border-b-[1.5px] border-r-[1.5px] rounded-br-[3px] pointer-events-none", isFeatured ? "border-[#FDD026]/55" : "border-[#60A5FA]/45")} />

        {/* Shimmer sheen — animation-play-state stays paused until hovered, so it
            doesn't tick in the background on every card that's merely on screen. */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 [animation-play-state:paused] group-hover:[animation-play-state:running]"
          style={{
            background: "linear-gradient(120deg, transparent, rgba(255,255,255,0.03), transparent)",
            animation: "card-sheen 6s infinite linear"
          }}
        />

        {/* Top Content Area */}
        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center justify-center rounded-xl w-14 h-14 md:backdrop-blur-md border shrink-0",
              isFeatured
                ? "bg-[#FDD026]/15 border-[#FDD026]/30 shadow-[inset_0_1px_6px_rgba(253,208,38,0.2)]"
                : "bg-[#2596BE]/15 border-[#2596BE]/30 shadow-[inset_0_1px_6px_rgba(37,150,190,0.2)]"
            )}>
              <img src={comp.iconUrl} alt={comp.name} className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h4 className="text-xl md:text-2xl font-bold font-clash-display text-white tracking-wide">{comp.name}</h4>
              <div className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-extrabold uppercase tracking-widest mt-1",
                isFeatured
                  ? "bg-[#FDD026]/12 border-[#FDD026]/38 text-[#FDD026] shadow-[0_0_10px_rgba(253,208,38,0.18),inset_0_1px_0_rgba(255,255,255,0.1)]"
                  : "bg-[#3B82F6]/12 border-[#60A5FA]/35 text-[#93C5FD] shadow-[0_0_10px_rgba(59,130,246,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]"
              )}>
                <span className={cn("w-1 h-1 rounded-full animate-pulse", isFeatured ? "bg-[#FDD026]" : "bg-[#2596BE]")} />
                {isFeatured ? "FEATURED LOMBA" : "KOMPETISI"}
              </div>
            </div>
          </div>

          <p className="text-white/70 text-xs md:text-sm leading-relaxed mt-2 opacity-75 min-h-[60px] line-clamp-3">
            {comp.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-2">
            {(comp.keywords || []).slice(0, isFeatured ? 3 : 2).map((k: string, i: number) => (
              <span
                key={i}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all duration-300",
                  isFeatured
                    ? "bg-[#FDD026]/10 border-[#FDD026]/25 text-[#FDD026] shadow-[0_0_8px_rgba(253,208,38,0.08)]"
                    : "bg-[#3B82F6]/10 border-[#60A5FA]/22 text-[#93C5FD] shadow-[0_0_8px_rgba(59,130,246,0.08)]"
                )}
              >
                {k}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Content Area */}
        <div className="relative z-10 mt-6">
          <div className="w-full h-[1px] bg-white/10 mb-5" />
          <div className="flex items-center justify-between text-xs mb-5 font-sans">
            <div className="flex flex-col gap-0.5">
              <span className="text-white/40 uppercase tracking-widest text-[9px] font-semibold font-sans">Prize Pool</span>
              <span className={cn(
                "text-base md:text-lg font-extrabold tracking-wide font-sans",
                isFeatured
                  ? "text-[#FDD026] drop-shadow-[0_0_10px_rgba(253,208,38,0.3)]"
                  : "text-[#2596BE] drop-shadow-[0_0_10px_rgba(37,150,190,0.3)]"
              )}>
                {comp.prizepool}
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-white/40 uppercase tracking-widest text-[9px] font-semibold font-sans">Team Size</span>
              <span className="text-white/80 font-bold text-xs font-sans">
                {comp.teamMin}-{comp.teamMax} Members
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/dashboard?menu=kompetisi&type=${getSlug(comp.name)}`} className={btnStyle}>
              Daftar
            </Link>
            <a href={comp.guidebookLink} target="_blank" rel="noopener noreferrer" className={secondaryBtnStyle}>
              Guidebook
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Card data — single source of truth for both desktop & mobile marquee ──

const GALLERY_IMAGES = [
  "/assets/images/IMG_0877.webp",
  "/assets/images/IMG_0428.webp",
  "/assets/images/IMG_2655.webp",
  "/assets/images/IMG_2781.webp",
  "/assets/images/IMG_3053.webp",
  "/assets/images/IMG_3100.webp",
  "/assets/images/IMG_3169.webp",
];

// ── Bento Grid — clean photo tiles, dense flow keeps mobile compact ──

// Spans total 12 cells and are ordered to tile exactly at both breakpoints:
// 4x3 on desktop, 2x6 on mobile — any other mix leaves unfillable holes.
const BENTO_TILES = [
  { src: GALLERY_IMAGES[0], span: "col-span-2 row-span-2" },
  { src: GALLERY_IMAGES[1], span: "col-span-1 row-span-2" },
  { src: GALLERY_IMAGES[2], span: "col-span-1 row-span-1" },
  { src: GALLERY_IMAGES[3], span: "col-span-1 row-span-1" },
  { src: GALLERY_IMAGES[4], span: "col-span-1 row-span-1" },
  { src: GALLERY_IMAGES[5], span: "col-span-1 row-span-1" },
  { src: GALLERY_IMAGES[6], span: "col-span-2 row-span-1" },
];

const BentoTile = ({ src, span }: { src: string; span: string }) => (
  <div
    className={cn(
      "bento-item transform-gpu group relative overflow-hidden rounded-xl md:rounded-2xl",
      "border-2 border-[#FDD026]/60 bg-black/20 shadow-[0_0_12px_rgba(0,0,0,0.5),0_0_16px_rgba(253,208,38,0.35)]",
      "transition-[transform,box-shadow,border-color] duration-500 ease-out hover:z-10 hover:scale-[1.03] hover:border-[#FDD026] hover:shadow-[0_0_12px_rgba(0,0,0,0.5),0_0_28px_rgba(253,208,38,0.65)]",
      span
    )}
  >
    <Image
      src={src}
      alt=""
      aria-hidden="true"
      fill
      // eager, not lazy: the LandingLoader gates the page on `window.load`, so
      // these decode behind the loader instead of popping in blank mid-scroll.
      loading="eager"
      sizes="(max-width: 768px) 50vw, 25vw"
      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-40" />
  </div>
);

// Ease-out cubic: fast start, gentle settle — reads as a deliberate "count up
// and land" instead of a mechanical linear tick.
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function usePrizeCounter(target: number, animDuration = 1500) {
  // Starts at 0 (not `target`) — the old initial value of `target` painted the
  // full number for one frame before the effect reset it to 0, a visible
  // flash-then-restart glitch on every mount.
  const [count, setCount] = useState(0);
  useEffect(() => {
    let raf: number;
    let startTs: number | null = null;
    let lastValue = -1;
    const step = (ts: number) => {
      if (startTs === null) startTs = ts;
      const progress = Math.min((ts - startTs) / animDuration, 1);
      const next = Math.floor(easeOutCubic(progress) * target);
      // Skip the setState (and re-render) entirely when the displayed value
      // hasn't actually changed since the last frame — fewer redundant paints.
      if (next !== lastValue) {
        lastValue = next;
        setCount(next);
      }
      if (progress < 1) raf = window.requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { raf = window.requestAnimationFrame(step); observer.disconnect(); }
      },
      { threshold: 0.1 }
    );
    const el = document.getElementById("prize-pool-counter");
    if (el) observer.observe(el);
    return () => { observer.disconnect(); cancelAnimationFrame(raf); };
  }, [target, animDuration]);
  return count;
}

const InfestWebsite = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaderFinished, setIsLoaderFinished] = useState(false);
  const prizeCount = usePrizeCounter(20_000_000, 5000);
  const seminarCardRef = useRef<HTMLDivElement>(null);
  const seminarTextRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) =>
    "IDR " + new Intl.NumberFormat("id-ID").format(num) + "+";

  // Reset scroll to top on mount to avoid ScrollTrigger alignment errors
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }
  }, []);

  // Scroll-into-view reveal for the seminar section — one shared
  // IntersectionObserver + a CSS transition (.reveal-up), no library.
  useEffect(() => {
    const targets = [seminarCardRef.current, seminarTextRef.current].filter(
      (el): el is HTMLDivElement => el !== null
    );
    if (!targets.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // While the page is scrolling, skip hover/hit-test paint work on every interactive
  // element (cards, buttons, links all have hover transitions) by disabling pointer
  // events on <body> — CSS pointer-events inherits, so this is one class, not N.
  // Restored 150ms after scrolling actually stops.
  useEffect(() => {
    let scrollEndTimer: number;
    const onScroll = () => {
      document.body.classList.add("is-scrolling");
      window.clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(() => {
        document.body.classList.remove("is-scrolling");
      }, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(scrollEndTimer);
      document.body.classList.remove("is-scrolling");
    };
  }, []);

  useGSAP(() => {
    if (!isLoaderFinished) return;

    const mm = gsap.matchMedia();

    // Master timeline — Fase 2: hero entrance. Background (pure CSS on <body>,
    // .textured-bg) is already painted with zero FOUC before any JS runs, so
    // there's nothing to sequence for Fase 1. Runs once, autoplay (not
    // scroll-linked), so it plays immediately on load regardless of scroll.
    const heroEntrance = gsap.timeline({
      onComplete: () => {
        // Fase 3: Navbar. Dispatched only after hero has visually settled, so
        // the pinned ScrollTrigger below (which force-renders its start state
        // the instant it's created) never fights the entrance tween for
        // control of the same opacity/y properties.
        window.dispatchEvent(new Event("infest:hero-ready"));
        mountHeroScrollTriggers();
      },
    });
    heroEntrance
      .fromTo(".marquee-logo",
        { opacity: 0, scale: 0.85, y: -24 },
        { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "power3.out" }
      )
      .fromTo(".marquee-tagline",
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        "-=0.35"
      );

    // Hero / Second Section — Pinned sequential reveal (blur removed from scrub for perf).
    // Deferred until heroEntrance finishes so its forced initial ScrollTrigger
    // render (opacity:1/y:0) matches reality instead of stomping mid-entrance.
    function mountHeroScrollTriggers() {
      // will-change is only worth its VRAM cost while this pinned sequence is
      // actually the one being scrubbed — applied on enter, cleared on leave
      // (both directions), instead of sitting on these elements permanently.
      const pinnedHeroTargets = ".marquee-tagline, .marquee-logo, .history-cards-container, .memories-heading, .bento-item";
      const promoteHeroLayer = () => gsap.set(pinnedHeroTargets, { willChange: "transform, opacity" });
      const releaseHeroLayer = () => gsap.set(pinnedHeroTargets, { willChange: "auto" });

      mm.add("(min-width: 1024px)", () => {
        const sectionTl = gsap.timeline({
          scrollTrigger: {
            trigger: ".second-section",
            start: "top top",
            // Pin duration reduced to +=1800 to eliminate dead scroll area
            end: "+=1800",
            scrub: 0.5,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            fastScrollEnd: true,
            onEnter: promoteHeroLayer,
            onEnterBack: promoteHeroLayer,
            onLeave: releaseHeroLayer,
            onLeaveBack: releaseHeroLayer,
          }
        });

        // Logo + tagline are visible at rest — hold briefly, then fade out on scroll
        sectionTl.to(".marquee-tagline",
          { opacity: 0, y: -30, duration: 0.8, ease: "power2.in" },
          "+=0.4"
        );
        sectionTl.to(".marquee-logo",
          { opacity: 0, scale: 0.8, y: -40, duration: 0.8, ease: "power2.in" },
          "<"
        );

        sectionTl.fromTo(".history-cards-container",
          { scale: 0.95, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" },
          "+=0.1"
        );

        sectionTl.fromTo(".memories-heading",
          { opacity: 0, y: 24, scale: 0.92 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out" },
          "<0.1"
        );

        sectionTl.fromTo(".bento-item",
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power2.out" },
          "-=0.3"
        );

        // Brief hold on the finished grid before the pin releases
        sectionTl.to({}, { duration: 0.2 });
      });

      ScrollTrigger.refresh();
    }

    // Competition Section — entrance reveals. Trigger at 95% viewport entry
    // to ensure they fire reliably even on short scroll containers.
    const belowHeroScrollOpts = {
      toggleActions: "play none none reverse",
    };

    mm.add("(min-width: 1024px)", () => {
      gsap.fromTo("#competition .section-heading",
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.7, ease: "power3.out", overwrite: "auto",
          scrollTrigger: {
            trigger: "#competition",
            start: "top 95%",
            end: "bottom top",
            ...belowHeroScrollOpts,
          }
        }
      );

      gsap.fromTo("#competition .prize-pool-card",
        { opacity: 0, y: 40, scale: 0.96 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.7, ease: "power3.out", overwrite: "auto",
          scrollTrigger: {
            trigger: "#competition .prize-pool-card",
            start: "top 95%",
            end: "bottom top",
            ...belowHeroScrollOpts,
          }
        }
      );

      gsap.fromTo("#competition .comp-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 0.6, ease: "power3.out", stagger: 0.12, overwrite: "auto",
          scrollTrigger: {
            trigger: "#competition .comp-cards-desktop",
            start: "top 95%",
            end: "bottom top",
            ...belowHeroScrollOpts,
          }
        }
      );
    });

    // Custom @font-face fonts (Astralaga, Cattedrale, Pixel Game) swap in after
    // the CSS cascade paints fallback metrics — recompute trigger positions once
    // they've actually loaded, and again on any layout-affecting resize.
    document.fonts?.ready?.then(() => ScrollTrigger.refresh());

    // Width-only guard. ScrollTrigger.refresh() re-measures every trigger (a
    // forced synchronous layout of the whole page). On mobile the address bar
    // shows/hides during scroll, which changes the container's *height* — the
    // unguarded observer fired refresh() on every one of those, mid-scroll,
    // which is what made fast scrolling stutter and mis-render. That's the same
    // case ScrollTrigger.config({ignoreMobileResize:true}) covers for its own
    // listener; this observer was bypassing it. Only a width change (rotation /
    // real layout change) actually invalidates the measurements.
    let lastWidth = containerRef.current!.offsetWidth;
    const resizeObserver = new ResizeObserver(() => {
      const width = containerRef.current?.offsetWidth ?? lastWidth;
      if (width === lastWidth) return;
      lastWidth = width;
      ScrollTrigger.refresh();
    });
    resizeObserver.observe(containerRef.current!);

    return () => resizeObserver.disconnect();
  }, { dependencies: [isLoaderFinished], scope: containerRef });

  const slugMap: Record<string, string> = {
    "UI/UX Design": "uiux",
    Hackathon: "hackathon",
    "Data Science": "datascience",
  };

  const getSlug = (name: string) =>
    slugMap[name] ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "");

  const competitions = competitionData;
  const featuredComp = competitions.find((c) => c.featured) as Competition | undefined;
  const sideComps = competitions.filter((c) => !c.featured) as Competition[];

  const allComps = [
    { comp: sideComps[0], isFeatured: false, id: "comp-side-0" },
    { comp: featuredComp, isFeatured: true, id: "comp-featured" },
    { comp: sideComps[1], isFeatured: false, id: "comp-side-1" },
  ];

  return (
    <main ref={containerRef} id="home" aria-label="Halaman Utama InFest XII 2026" className="w-full min-h-screen text-white relative overflow-x-clip bg-transparent">
      {!isLoaderFinished && (
        <LandingLoader onComplete={() => setIsLoaderFinished(true)} />
      )}

      {/* Background twinkles (scroll with page) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <TwinklingStar top="15%" left="10%" delay={0.2} size={3} />
        <TwinklingStar top="25%" left="80%" delay={1.2} size={2} />
        <TwinklingStar top="40%" left="40%" delay={0.5} size={3} />
        <TwinklingStar top="65%" left="15%" delay={2.1} size={2} />
        <TwinklingStar top="75%" left="85%" delay={1.5} size={3} />
        <TwinklingStar top="85%" left="50%" delay={0.8} size={2} />
      </div>

      {/* Floating clouds — full page height (scrolls with sections), above background, below content */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <FloatingCloud top="3%"  left="2%"   speed={4.5} delay={0}   opacity={0.38} size="lg" />
        <FloatingCloud top="12%" left="84%"  speed={5}   delay={0.6} opacity={0.30} size="sm" />
        <FloatingCloud top="27%" left="70%"  speed={4.8} delay={0.9} opacity={0.32} size="md" />
        <FloatingCloud top="43%" left="48%"  speed={5.2} delay={0.3} opacity={0.18} size="sm" />
        <FloatingCloud top="59%" left="22%"  speed={6}   delay={1.1} opacity={0.22} size="xl" />
        <FloatingCloud top="75%" left="4%"   speed={5.5} delay={1.9} opacity={0.30} size="sm" />
        <FloatingCloud top="91%" left="78%"  speed={5.2} delay={2.2} opacity={0.32} size="lg" />
      </div>

      {/* Second cloud layer — desktop only. Each cloud is a large always-animating
          image layer; 14 of them is real VRAM/compositor pressure on a phone, and
          they're purely decorative, so mobile keeps the 7 above and drops these. */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 hidden md:block">
        <FloatingCloud top="7%"  left="58%"  speed={5.5} delay={1.4} opacity={0.24} size="md" flip />
        <FloatingCloud top="19%" left="30%"  speed={6}   delay={2.1} opacity={0.20} size="xl" flip />
        <FloatingCloud top="35%" left="6%"   speed={5.8} delay={1.7} opacity={0.26} size="lg" flip />
        <FloatingCloud top="51%" left="80%"  speed={4.5} delay={2.4} opacity={0.34} size="md" flip />
        <FloatingCloud top="67%" left="62%"  speed={5}   delay={0.7} opacity={0.28} size="lg" flip />
        <FloatingCloud top="83%" left="44%"  speed={4.8} delay={0.4} opacity={0.20} size="md" flip />
        <FloatingCloud top="97%" left="34%"  speed={5}   delay={1.3} opacity={0.24} size="md" flip />
      </div>

      {/* Non-Hero Sections — shared background */}
      <div style={{ background: "radial-gradient(ellipse at 50% 18%, #2563eb 0%, #1d4ed8 28%, #1e3a8a 58%, #020a1c 100%)" }}>

      {/* Hero Section — 3D Marquee */}
      <section
        id="hero"
        className="second-section py-6 md:py-12 relative overflow-x-clip overflow-y-visible z-10 lg:min-h-screen lg:flex lg:items-center lg:justify-center"
      >
        {/* Background Layer */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[5%] left-[12%] w-[520px] h-[520px] bg-[#3b82f6]/18 rounded-full blur-[110px]" />
          <div className="absolute bottom-[5%] right-[12%] w-[520px] h-[520px] bg-[#2563eb]/14 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] left-[45%] w-[300px] h-[300px] bg-[#60A5FA]/8 rounded-full blur-[80px]" />

          <svg className="absolute inset-0 w-full h-full opacity-[0.08] stroke-white" fill="none" viewBox="0 0 1440 800" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,200 C300,100 600,400 900,150 C1200,-100 1300,300 1440,250" strokeWidth="2" strokeDasharray="5 5" />
            <path d="M0,350 C400,200 800,500 1100,300 C1300,150 1400,450 1500,400" strokeWidth="1.5" />
          </svg>

          <TwinklingStar top="15%" left="10%" delay={0.5} size={2.5} />
          <TwinklingStar top="25%" left="85%" delay={1.4} size={3} />
          <TwinklingStar top="60%" left="15%" delay={0.8} size={2} />
          <TwinklingStar top="75%" left="75%" delay={2.1} size={3} />
          <TwinklingStar top="40%" left="50%" delay={1.7} size={2} />

          <div className="absolute inset-0 noise-texture opacity-[0.025] mix-blend-overlay" />
        </div>

        <div className="relative w-full z-10 flex flex-col items-center justify-start lg:justify-center min-h-[420px] md:min-h-[600px] lg:min-h-[750px] px-3 lg:px-6 overflow-hidden">

          {/* Intro Block — logo left, hero text right, whole group anchored right */}
          <div className="history-intro w-full flex flex-col lg:flex-row items-center justify-center lg:justify-end text-center lg:text-left gap-8 lg:gap-16 xl:gap-20 z-30 relative px-4 sm:px-8 md:px-14 lg:px-20 xl:px-28 lg:absolute lg:inset-0">
            <div className="marquee-logo opacity-0 transform-gpu shrink-0 relative z-30 hover:scale-105 transition-all duration-500 ease-out flex items-center justify-center">
              <Image
                src="/assets/images/logo_hero.PNG?v=2"
                alt="INFEST Logo Large"
                width={440}
                height={440}
                className="object-contain w-56 h-56 md:w-96 md:h-96 lg:w-[400px] lg:h-[400px] xl:w-[440px] xl:h-[440px] relative z-10"
                priority
              />
            </div>

            <div className="marquee-tagline opacity-0 transform-gpu relative z-30 flex flex-col gap-4 md:gap-6 items-center lg:items-start">
              <h1 className="tracking-tighter leading-none font-astralaga flex flex-col items-center lg:items-start select-none w-full font-normal">
                <span className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start sm:flex-nowrap sm:whitespace-nowrap gap-y-0.5 sm:gap-y-0 sm:gap-x-2 md:gap-x-4 text-7xl sm:text-7xl md:text-8xl lg:text-[6.2vw] xl:text-8xl">
                  <span className="flex items-center">
                    <span className="font-imperial-script text-white text-8xl sm:text-8xl md:text-9xl lg:text-[7.8vw] xl:text-9xl leading-none select-none font-normal translate-y-[0.08em] mr-2">I</span>
                    <span className="text-white font-normal tracking-tighter">nformatics</span>
                  </span>
                  <span className="flex items-center">
                    <span className="font-imperial-script text-white text-8xl sm:text-8xl md:text-9xl lg:text-[7.8vw] xl:text-9xl leading-none select-none font-normal translate-y-[0.08em] mr-1.5">F</span>
                    <span className="text-white font-normal tracking-tighter">estival</span>
                  </span>
                </span>
                <span className="text-6xl md:text-8xl lg:text-8xl mt-1 font-serif font-bold drop-shadow-[0_0_15px_rgba(253,208,38,0.7)] select-all inline-flex items-center justify-center lg:justify-start gap-x-[1px] md:gap-x-[2px]">
                  {["X", "I", "I", " ", "2", "0", "2", "6"].map((char, index) => (
                    char === " " ? (
                      <span key={index} className="w-1 md:w-2" />
                    ) : (
                      <span
                        key={index}
                        className="inline-block"
                        style={{
                          backgroundImage: "radial-gradient(ellipse at 50% 45%, #FFFFFF 0%, #FEFCE8 20%, #FEF08A 48%, #FDD026 80%, #EAB308 100%)",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          color: "transparent"
                        }}
                      >
                        {char}
                      </span>
                    )
                  ))}
                </span>
              </h1>

              <p className="text-base md:text-xl lg:text-2xl leading-relaxed text-center lg:text-left font-medium text-pretty font-serif italic mt-3 md:mt-4" style={{ color: "rgba(255,255,255,0.95)", textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
                Infest (Informatics Festival) XII 2026 is the biggest tech event in Aceh, bringing together students, professionals, and digital creators in one vibrant arena. Carrying the theme <span className="font-bold not-italic" style={{ backgroundImage: "radial-gradient(ellipse at 50% 45%, #FFFFFF 0%, #FEFCE8 20%, #FEF08A 48%, #FDD026 80%, #EAB308 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>&quot;Synthera: Creating a Harmonized, Intelligent, and Innovative Digital Ecosystem&quot;</span>, INFEST is more than a competition, it&apos;s a movement to shape the future through innovation, collaboration, and real-world impact.
              </p>

              <div className="marquee-divider w-24 h-[3px] bg-gradient-to-r from-[#2596BE] to-[#FDD026] rounded-full mx-auto lg:mx-0 shadow-sm" />
            </div>
          </div>

          {/* Bento Grid — fills the viewport under the logo; spans tile exactly at
              2x6 (mobile) and 4x3 (desktop), so rows are fixed, not auto. */}
          <div className="history-cards-container lg:opacity-0 transform-gpu w-full h-[75vh] md:h-screen lg:h-auto relative z-10 p-2 md:p-3 lg:absolute lg:inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,150,190,0.1),transparent_70%)] pointer-events-none z-0" />

            <div className="memories-heading transform-gpu absolute inset-0 z-20 flex items-center justify-center pointer-events-none select-none">
              <h3
                className="flex items-baseline text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                style={{ WebkitTextStroke: "1px #FDD026", textStroke: "1px #FDD026" } as React.CSSProperties}
              >
                <span className="font-imperial-script text-6xl sm:text-8xl md:text-[11rem] lg:text-[13rem] leading-none translate-y-[0.12em]">I</span>
                <span className="font-serif lowercase text-3xl sm:text-4xl md:text-7xl lg:text-8xl tracking-wide">n</span>
                <span className="w-2 md:w-6" />
                <span className="font-imperial-script text-6xl sm:text-8xl md:text-[11rem] lg:text-[13rem] leading-none translate-y-[0.12em]">M</span>
                <span className="font-serif lowercase text-3xl sm:text-4xl md:text-7xl lg:text-8xl tracking-wide">emories</span>
              </h3>
            </div>

            <div className="relative z-10 grid h-full w-full grid-cols-2 grid-rows-6 gap-2 md:grid-cols-4 md:grid-rows-3 md:gap-3">
              {BENTO_TILES.map((tile) => (
                <BentoTile key={tile.src} src={tile.src} span={tile.span} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Combined Competitions & Timeline Section */}
      <div className="w-full relative">

        {/* Competitions Section */}
        <section
          id="competition"
          className="w-full pt-6 md:pt-10 pb-6 md:pb-12 px-3 md:px-6 lg:px-8 relative overflow-visible z-10"
        >
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[8%] right-[8%] w-[500px] h-[500px] bg-[#3b82f6]/16 rounded-full blur-[120px]" />
            <div className="absolute bottom-[8%] left-[8%] w-[460px] h-[460px] bg-[#2563eb]/13 rounded-full blur-[105px]" />

            <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="300" r="150" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 8" />
              <circle cx="200" cy="300" r="280" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
              <circle cx="1200" cy="600" r="220" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <path d="M-100,200 C300,50 800,450 1500,100" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </svg>

            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
              xmlns="http://www.w3.org/2000/svg"
              style={{ animation: "aurora-flow 18s infinite ease-in-out" }}
            >
              <path d="M-200,600 Q200,300 600,700 T1400,500 T1800,800" fill="none" stroke="url(#aurora-cyan-grad)" strokeWidth="3" filter="url(#aurora-glow)" />
              <defs>
                <linearGradient id="aurora-cyan-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0" />
                  <stop offset="50%" stopColor="#0891B2" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                </linearGradient>
                <filter id="aurora-glow">
                  <feGaussianBlur stdDeviation="8" />
                </filter>
              </defs>
            </svg>

            <div className="absolute inset-0 noise-texture opacity-[0.025] mix-blend-overlay" />
          </div>

          <div className="w-full flex flex-col items-center gap-8 md:gap-12 relative z-10">

            <div className="section-heading text-center">
              <h2 className="text-balance select-none flex items-baseline justify-center">
                <span className="font-imperial-script text-white text-5xl md:text-9xl lg:text-[10rem] leading-none select-none font-normal translate-y-[0.05em] mr-1">C</span>
                <span className="font-astralaga lowercase tracking-widest text-white leading-none text-3xl md:text-6xl lg:text-7xl font-normal">ompetitions</span>
              </h2>
              <p className="text-white/70 text-xs md:text-base max-w-2xl mx-auto text-pretty mt-3 md:mt-6 leading-relaxed font-serif opacity-70 px-1">
                Uji kemampuan tim Anda dalam kompetisi berskala Nasional. Tunjukkan karya terbaik di hadapan para juri profesional.
              </p>
              <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mt-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-[2px]" />
              </div>
            </div>

            {/* Prize Pool Card */}
            <div className="prize-pool-card w-full text-center">
              <div
                className="border border-[#FDD026]/28 p-4 md:p-6 rounded-[20px] md:rounded-[28px] md:backdrop-blur-xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.4),0_0_0_1px_rgba(253,208,38,0.10),inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-[#FDD026]/46 hover:shadow-[0_28px_80px_-12px_rgba(253,208,38,0.18),0_0_0_1px_rgba(253,208,38,0.22),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-500 relative overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04)), rgba(30,58,138,0.14)",
                  WebkitBackdropFilter: "blur(40px)"
                }}
              >
                <div className="absolute inset-0 noise-texture opacity-[0.015] pointer-events-none mix-blend-overlay" />

                <div className="absolute top-5 left-5 w-4 h-4 border-t-2 border-l-2 border-[#FDD026]/50 rounded-tl-sm pointer-events-none" />
                <div className="absolute top-5 right-5 w-4 h-4 border-t-2 border-r-2 border-[#FDD026]/50 rounded-tr-sm pointer-events-none" />
                <div className="absolute bottom-5 left-5 w-4 h-4 border-b-2 border-l-2 border-[#FDD026]/50 rounded-bl-sm pointer-events-none" />
                <div className="absolute bottom-5 right-5 w-4 h-4 border-b-2 border-r-2 border-[#FDD026]/50 rounded-br-sm pointer-events-none" />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-white/5 rounded-full blur-[80px] pointer-events-none" />

                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
                    animation: "card-sheen 8s infinite linear"
                  }}
                />

                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

                <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full border border-[#FDD026]/30 bg-[#FDD026]/5 text-[#FDD026] text-[10px] md:text-xs font-bold uppercase tracking-widest mx-auto mb-3.5 shadow-[0_0_12px_rgba(255,255,255,0.2)] select-none font-serif">
                  <span className="w-1.5 h-1.5 bg-[#FDD026] rounded-full animate-ping" />
                  Exclusive Rewards
                </div>

                <span className="text-white/80 text-sm md:text-base font-semibold uppercase tracking-wider block mb-1 select-none font-serif">
                  Total Prize Pool
                </span>

                <h3 id="prize-pool-counter" className="text-[2.2rem] sm:text-[3.2rem] md:text-[6.8rem] lg:text-[7.2rem] font-black font-mono tracking-widest mt-0 mb-1 md:mb-1.5 font-serif">
                  <div className="relative inline-block select-all">
                    <span
                      className="absolute inset-0 font-mono font-serif select-none"
                      style={{
                        color: "transparent",
                        textShadow: "-3px -1px 8px rgba(239, 68, 68, 0.4), 3px 1px 8px rgba(34, 211, 238, 0.4), 0 0 15px rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      {formatNumber(prizeCount)}
                    </span>
                    <span
                      className="relative z-10 inline-block font-mono font-serif"
                      style={{
                        backgroundImage: "radial-gradient(ellipse at 50% 45%, #FFFFFF 0%, #FEFCE8 20%, #FEF08A 48%, #FDD026 80%, #EAB308 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {formatNumber(prizeCount)}
                    </span>
                  </div>
                </h3>

                <div className="w-48 h-[1px] bg-white/10 mx-auto my-3" />
                <p className="text-[10px] md:text-xs text-white/70 opacity-80 mt-1 max-w-2xl mx-auto font-medium font-serif">
                  Sertifikat Resmi Tingkat Nasional + Trophy + Merchandise Menarik
                </p>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="w-full mt-8">
              <div className="comp-cards-desktop hidden lg:grid lg:grid-cols-3 w-full gap-6 xl:gap-8 pt-8 items-stretch">
                {allComps.map((card, index) => (
                  <div
                    key={card.id}
                    className={cn(
                      "comp-card flex flex-col relative origin-center transition-all duration-300 ease-out cursor-pointer",
                      "opacity-[0.95] hover:opacity-100 hover:scale-[1.15] hover:z-40 active:scale-[1.12]",
                      index === 0 && "hover:translate-x-8",
                      index === 2 && "hover:-translate-x-8"
                    )}
                    style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.15))" }}
                  >
                    <CompetitionCard comp={card.comp} isFeatured={card.isFeatured} getSlug={getSlug} />
                  </div>
                ))}
              </div>

              {/* ── Mobile: vertical stack, no side-scrolling (< 768px) ── */}
              <div className="md:hidden w-full mt-4 flex flex-col gap-4 px-4">
                {[
                  { comp: featuredComp, isFeatured: true, id: "comp-featured" },
                  { comp: sideComps[0], isFeatured: false, id: "comp-side-0" },
                  { comp: sideComps[1], isFeatured: false, id: "comp-side-1" },
                ].map((card) => (
                  <div key={card.id} className="w-full">
                    <CompetitionCard comp={card.comp} isFeatured={card.isFeatured} getSlug={getSlug} />
                  </div>
                ))}
              </div>

              {/* ── Tablet 3-col Grid (768px – 1024px) ── */}
              <div className="hidden md:grid lg:hidden md:grid-cols-3 gap-3 mt-4 comp-cards-mobile items-stretch">
                <div className="comp-card-mobile">
                  <CompetitionCard comp={featuredComp} isFeatured={true} getSlug={getSlug} />
                </div>
                <div className="comp-card-mobile"><CompetitionCard comp={sideComps[0]} getSlug={getSlug} /></div>
                <div className="comp-card-mobile"><CompetitionCard comp={sideComps[1]} getSlug={getSlug} /></div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section id="timeline" className="w-full relative z-10">
          <Timeline data={timelineData} />
        </section>

        {/* Seminar Section */}
        <section
          id="seminar"
          className="w-full py-10 md:py-16 px-3 md:px-6 lg:px-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[80vh] md:min-h-screen"
        >
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[18%] left-[18%] w-[420px] h-[420px] bg-[#3b82f6]/14 rounded-full blur-[115px]" />
            <div className="absolute bottom-[18%] right-[18%] w-[460px] h-[460px] bg-[#FDD026]/5 rounded-full blur-[145px]" />

            <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
              <path d="M100,100 Q150,50 250,150 T400,200 T600,100 T900,300" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              <path d="M-50,400 Q200,600 500,350 T1100,500" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            </svg>

            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 1px, transparent 1px),
                  radial-gradient(circle at 75% 15%, rgba(255,255,255,0.6) 1.5px, transparent 1.5px),
                  radial-gradient(circle at 85% 65%, rgba(255,255,255,0.3) 1px, transparent 1px),
                  radial-gradient(circle at 45% 75%, rgba(255,255,255,0.5) 1.5px, transparent 1.5px),
                  radial-gradient(circle at 10% 85%, rgba(255,255,255,0.4) 1px, transparent 1px)
                `,
                backgroundSize: "200px 200px",
                animation: "galaxy-drift 22s infinite ease-in-out"
              }}
            />

            <div className="absolute inset-0 noise-texture opacity-[0.03] mix-blend-overlay" />
          </div>

          {/* HUD rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="w-[240px] h-[240px] md:w-[420px] md:h-[420px] rounded-full border border-[#60A5FA]/14 border-dashed animate-spin" style={{ animationDuration: "60s" }} />
            <div className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full border border-[#60A5FA]/8 animate-spin" style={{ animationDuration: "120s", animationDirection: "reverse" }} />
            <div className="absolute w-[360px] h-[360px] md:w-[580px] md:h-[580px] rounded-full border border-[#FDD026]/6 border-dotted animate-pulse" />
          </div>

          <div className="w-full flex flex-col items-center justify-center gap-5 md:gap-8 relative z-10">

            {/* Mystery Speaker Card */}
            <div
              ref={seminarCardRef}
              className="reveal-up relative group z-10 cursor-pointer flex flex-col items-center justify-center"
              style={{ animation: "float 6s ease-in-out infinite" }}
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-[#3B82F6] via-transparent to-[#FDD026] rounded-[32px] blur-[24px] opacity-18 group-hover:opacity-35 transition-all duration-700 z-0" />
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-52 h-1.5 bg-[#60A5FA]/35 blur-[12px] rounded-full pointer-events-none" />

              <div
                className="relative w-48 h-48 md:w-72 md:h-72 rounded-[22px] md:rounded-[28px] overflow-hidden border border-[#FDD026]/32 bg-[#0f172a]/55 md:backdrop-blur-xl transition-all duration-500 flex items-center justify-center p-2.5 md:p-3"
                style={{ boxShadow: "0 28px 60px rgba(0,0,0,0.62), 0 0 0 1px rgba(253,208,38,0.12), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 35px rgba(253,208,38,0.10)" }}
              >
                <div className="relative w-full h-full rounded-[20px] overflow-hidden bg-black/40">
                  <Image
                    src="/assets/images/mysteryguest.png"
                    alt="Mystery Speaker"
                    fill
                    loading="eager"
                    className="object-cover object-center transition-all duration-700 ease-out grayscale brightness-[0.2] contrast-[1.2] group-hover:scale-105 group-hover:brightness-[0.4]"
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,#0f172a_95%)] z-10" />

                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <span
                      className="text-5xl md:text-7xl font-bold text-[#ffc82c] font-sans drop-shadow-[0_0_15px_rgba(255,200,44,0.7)] animate-pulse"
                      style={{ textShadow: "0 0 20px rgba(255,200,44,0.8), 0 0 40px rgba(255,200,44,0.4)" }}
                    >
                      ?
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(96,165,250,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(96,165,250,0.07)_1px,transparent_1px)] bg-[size:18px_18px] pointer-events-none z-10" />
                </div>

                <div className="absolute bottom-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#FDD026] to-transparent opacity-65 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Orbiting particles */}
              <div className="absolute inset-0 pointer-events-none z-20">
                <div className="absolute w-2 h-2 rounded-full bg-[#60A5FA] blur-[1px] shadow-[0_0_10px_rgba(96,165,250,0.9)]" style={{ animation: "orbit-cw 12s linear infinite" }} />
                <div className="absolute w-1.5 h-1.5 rounded-full bg-[#FDD026] blur-[1px] shadow-[0_0_10px_rgba(253,208,38,0.85)]" style={{ animation: "orbit-ccw 16s linear infinite" }} />
              </div>
            </div>

            {/* Text Section */}
            <div
              ref={seminarTextRef}
              className="reveal-up reveal-delay-300 max-w-2xl text-center p-4 md:p-8 rounded-xl md:rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.03] border border-[#FDD026]/22 md:backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45),0_0_0_1px_rgba(253,208,38,0.08),inset_0_1px_0_rgba(255,255,255,0.12)] z-10 flex flex-col items-center gap-3 md:gap-4"
            >
              <h2 className="text-balance select-none flex flex-col items-center gap-1.5 leading-none">
                <span className="flex items-baseline justify-center">
                  <span className="font-imperial-script text-[#FDD026] text-4xl md:text-8xl lg:text-[9rem] leading-none select-none font-normal translate-y-[0.05em] mr-0.5 md:mr-1">N</span>
                  <span className="font-clash-display tracking-widest text-white leading-none text-xl md:text-5xl lg:text-6xl font-extrabold uppercase mr-2 md:mr-4">ational</span>
                  <span className="font-imperial-script text-[#93C5FD] text-4xl md:text-8xl lg:text-[9rem] leading-none select-none font-normal translate-y-[0.05em] mr-0.5 md:mr-1">S</span>
                  <span className="font-clash-display tracking-widest text-white leading-none text-xl md:text-5xl lg:text-6xl font-extrabold uppercase">eminar</span>
                </span>
                <span className="flex items-baseline justify-center -mt-3 lg:-mt-6">
                  <span className="font-clash-display tracking-widest text-[#f5f7fa] leading-none text-lg md:text-4xl lg:text-5xl font-bold uppercase mr-1.5 md:mr-3">on</span>
                  <span className="font-imperial-script text-[#FDD026] text-3xl md:text-7xl lg:text-[7.5rem] leading-none select-none font-normal translate-y-[0.05em] mr-0.5 md:mr-1">C</span>
                  <span className="font-clash-display tracking-widest text-[#f5f7fa] leading-none text-lg md:text-4xl lg:text-5xl font-bold uppercase">oming</span>
                </span>
              </h2>
              <p className="text-white/70 text-xs md:text-base max-w-xl mx-auto leading-relaxed font-serif opacity-75 px-1">
                Join us for an inspiring seminar featuring industry experts sharing insights on the latest trends and developments in AI and technology.
              </p>

              <div className="w-48 h-[2px] bg-gradient-to-r from-transparent via-[#60A5FA] to-transparent mx-auto mt-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#93C5FD] blur-[3px]" />
              </div>
            </div>

          </div>
        </section>
      </div>

      </div>{/* end shared background wrapper */}

    </main>
  );
};

export default InfestWebsite;
