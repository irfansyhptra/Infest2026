"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import AOS from "aos";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { timelineData } from "@/data/timeline";
import { competitionData } from "@/data/competitions";
import { cn } from "@/libs/helpers/cn";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Timeline = dynamic(
  () => import("@/components/timeline").then((mod) => ({ default: mod.Timeline })),
  { ssr: false }
);

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
      <img src="/assets/svg/awan.webp" alt="" aria-hidden="true" className={`${sizeClass} h-auto`} style={{ transform: flip ? "scaleX(-1)" : undefined }} loading="lazy" />
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
    ? "px-4 py-2.5 border border-[#FDD026]/50 hover:bg-[#FDD026]/10 text-[#FDD026] hover:border-[#FDD026]/75 hover:shadow-[0_4px_16px_rgba(253,208,38,0.22)] rounded-full text-xs font-bold text-center transition-all duration-300 backdrop-blur-sm"
    : "px-4 py-2.5 border border-[#60A5FA]/40 hover:bg-[#3B82F6]/10 text-[#93C5FD] hover:border-[#60A5FA]/65 hover:shadow-[0_4px_16px_rgba(59,130,246,0.22)] rounded-full text-xs font-bold text-center transition-all duration-300 backdrop-blur-sm";

  return (
    <div className={cn("w-full flex flex-col transition-all duration-500 h-full min-h-[280px] sm:min-h-[340px] md:min-h-[420px]")}>
      <div
        className={cn(
          "relative flex flex-col justify-between rounded-[24px] backdrop-blur-md border p-6 md:p-8 h-full transition-all duration-500 overflow-hidden group",
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

        {/* Shimmer sheen */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: "linear-gradient(120deg, transparent, rgba(255,255,255,0.03), transparent)",
            animation: "card-sheen 6s infinite linear"
          }}
        />

        {/* Top Content Area */}
        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center justify-center rounded-xl w-14 h-14 backdrop-blur-md border shrink-0",
              isFeatured
                ? "bg-[#FDD026]/15 border-[#FDD026]/30 shadow-[inset_0_1px_6px_rgba(253,208,38,0.2)]"
                : "bg-[#2596BE]/15 border-[#2596BE]/30 shadow-[inset_0_1px_6px_rgba(37,150,190,0.2)]"
            )}>
              <img src={comp.iconUrl} alt={comp.name} className="w-8 h-8 object-contain" loading="lazy" />
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
  "/assets/images/infest-24.webp",
  "/assets/images/infest-1.webp",
  "/assets/images/infest-2.webp",
  "/assets/images/infest-5.webp",
  "/assets/images/infest-19.webp",
  "/assets/images/infest-25.webp",
  "/assets/images/infest-3.webp",
  "/assets/images/infest-4.webp",
  "/assets/images/infest-6.webp",
  "/assets/images/infest-22.webp",
  "/assets/images/infest-7.webp",
  "/assets/images/infest-26.webp",
  "/assets/images/infest-18.webp",
  "/assets/images/infest-9.webp",
  "/assets/images/infest-8.webp",
  "/assets/images/infest-11.webp",
  "/assets/images/infest-10.webp",
  "/assets/images/infest-12.webp",
  "/assets/images/infest-13.webp",
];

const MEMORY_CARDS = [
  {
    id: "card-1",
    num: "Memory #1",
    title: "Empowering Innovation",
    img: GALLERY_IMAGES[0],
    accent: "#60A5FA",
    glow: "rgba(59,130,246,0.14)",
    border: "border-[#FDD026]/28",
    hoverBorder: "hover:border-[#FDD026]/60",
    buttonBorder: "border-[#FDD026]/42",
    buttonShadow: "shadow-[0_0_14px_rgba(253,208,38,0.42),inset_0_1px_0_rgba(255,255,255,0.12)]",
    bg: "bg-gradient-to-b from-[#152d6a]/55 to-[#0b1650]/78",
    zIndex: "z-[1]",
    shadow: "shadow-[0_16px_50px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]",
  },
  {
    id: "card-2",
    num: "Featured Memory",
    title: "Designing Digitopia",
    img: GALLERY_IMAGES[1],
    accent: "#FDD026",
    glow: "rgba(253,208,38,0.18)",
    border: "border-[#FDD026]/40",
    hoverBorder: "hover:border-[#FDD026]/70",
    buttonBorder: "border-[#FDD026]/50",
    buttonShadow: "shadow-[0_0_16px_rgba(253,208,38,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]",
    bg: "bg-gradient-to-b from-[#1e3a8a]/60 to-[#0b1650]/82",
    zIndex: "z-[2]",
    shadow: "shadow-[0_20px_60px_-10px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.10)]",
  },
  {
    id: "card-3",
    num: "Memory #3",
    title: "Connecting Communities",
    img: GALLERY_IMAGES[2],
    accent: "#60A5FA",
    glow: "rgba(59,130,246,0.14)",
    border: "border-[#FDD026]/28",
    hoverBorder: "hover:border-[#FDD026]/60",
    buttonBorder: "border-[#FDD026]/42",
    buttonShadow: "shadow-[0_0_14px_rgba(253,208,38,0.42),inset_0_1px_0_rgba(255,255,255,0.12)]",
    bg: "bg-gradient-to-b from-[#152d6a]/55 to-[#0b1650]/78",
    zIndex: "z-[3]",
    shadow: "shadow-[0_16px_50px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]",
  },
  {
    id: "card-4",
    num: "Memory #4",
    title: "Digital Evolution",
    img: GALLERY_IMAGES[3],
    accent: "#FDD026",
    glow: "rgba(253,208,38,0.12)",
    border: "border-[#FDD026]/30",
    hoverBorder: "hover:border-[#FDD026]/62",
    buttonBorder: "border-[#FDD026]/40",
    buttonShadow: "shadow-[0_0_14px_rgba(253,208,38,0.45),inset_0_1px_0_rgba(255,255,255,0.10)]",
    bg: "bg-gradient-to-b from-[#152d6a]/55 to-[#0b1650]/78",
    zIndex: "z-[4]",
    shadow: "shadow-[0_16px_50px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]",
  },
  {
    id: "card-5",
    num: "Memory #5",
    title: "Inspiring Champions",
    img: GALLERY_IMAGES[4],
    accent: "#60A5FA",
    glow: "rgba(59,130,246,0.14)",
    border: "border-[#FDD026]/28",
    hoverBorder: "hover:border-[#FDD026]/60",
    buttonBorder: "border-[#FDD026]/42",
    buttonShadow: "shadow-[0_0_14px_rgba(253,208,38,0.42),inset_0_1px_0_rgba(255,255,255,0.12)]",
    bg: "bg-gradient-to-b from-[#152d6a]/55 to-[#0b1650]/78",
    zIndex: "z-[5]",
    shadow: "shadow-[0_16px_50px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]",
  },
];

// ── MemoryCard renderer (used for both original & duplicate sets) ──

const MemoryCardItem = ({ card, desktop = false }: { card: typeof MEMORY_CARDS[0]; desktop?: boolean }) => (
  <div
    className={cn(
      "group swiper-slide-card marquee-card-item shrink-0 flex flex-col relative border backdrop-blur-xl transition-all duration-500 overflow-visible ml-0",
      "w-[180px] rounded-t-[60px] rounded-b-[16px]",
      desktop && "lg:w-[17%] lg:max-w-[245px] xl:max-w-[265px] lg:shrink lg:rounded-t-[80px] lg:rounded-b-[24px]",
      card.border, card.bg, card.shadow, card.zIndex,
      "hover:z-[50] active:z-[50] hover:-translate-y-8 active:-translate-y-6",
      card.hoverBorder,
      "hover:shadow-[0_24px_60px_-8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)]"
    )}
    style={{
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.25), 0 0 22px ${card.glow}`,
      WebkitBoxReflect: "below 10px linear-gradient(transparent 68%, rgba(255,255,255,0.07))"
    } as React.CSSProperties}
  >
    <div className="absolute inset-0 noise-texture opacity-[0.015] pointer-events-none mix-blend-overlay rounded-t-[60px] rounded-b-[16px]" />
    <div className="relative w-full aspect-[3/4] rounded-t-[60px] rounded-b-[12px] overflow-hidden border-b border-[#FDD026]/20">
      <Image src={card.img} alt={card.title} fill loading="lazy" className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1650] via-transparent to-transparent" />
    </div>
    <div className="relative bg-white/[0.04] backdrop-blur-sm border-t border-[#FDD026]/18 p-4 rounded-b-[16px] flex flex-col gap-1 pb-8">
      <span className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: card.accent }}>{card.num}</span>
      <h4 className="text-xs md:text-sm font-bold text-white font-sans leading-tight">{card.title}</h4>
      <button className={`absolute -bottom-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-b from-[#1e3a8a] to-[#0b1650] backdrop-blur-sm border ${card.buttonBorder} ${card.buttonShadow} text-white hover:scale-110 hover:brightness-110 active:scale-95 transition-all duration-300`}>
        <svg className="w-4 h-4" style={{ color: card.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
      </button>
    </div>
  </div>
);

function usePrizeCounter(target: number, animDuration = 1500) {
  const [count, setCount] = useState(target);
  useEffect(() => {
    setCount(0);
    let raf: number;
    let startTs: number | null = null;
    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const progress = Math.min((ts - startTs) / animDuration, 1);
      setCount(Math.floor(progress * target));
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
  const prizeCount = usePrizeCounter(22_500_000);
  const [activeCompCard, setActiveCompCard] = useState(0);
  const compCarouselRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) =>
    "IDR " + new Intl.NumberFormat("id-ID").format(num) + "+";

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // Dot tracker for mobile competition carousel
  useEffect(() => {
    const container = compCarouselRef.current;
    if (!container) return;
    const onScroll = () => {
      const slides = container.querySelectorAll<HTMLElement>(".mobile-comp-slide");
      const containerLeft = container.getBoundingClientRect().left;
      let closest = 0;
      let minDist = Infinity;
      slides.forEach((slide, i) => {
        const dist = Math.abs(slide.getBoundingClientRect().left - containerLeft);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      setActiveCompCard(closest);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    // 1. Hero Content — Scale & Opacity on Scroll (no filter:blur during scrub = faster)
    gsap.to(".hero-content", {
      y: -80,
      scale: 0.92,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom 60%",
        scrub: 0.8,
      }
    });

    // 2. Hero Background Video — Parallax
    gsap.to(".hero-video-bg", {
      yPercent: 30,
      scale: 1.08,
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
      }
    });

    // 3. Hero Marquee Ribbons — Parallax + Fade
    gsap.to(".hero-marquees", {
      yPercent: -25,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom 60%",
        scrub: 0.6,
      }
    });

    // 4. Second Section — Pinned sequential reveal (blur removed from scrub for perf)
    mm.add("(min-width: 1024px)", () => {
      const sectionTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".second-section",
          start: "top top",
          end: "+=3000",
          scrub: 0.5,
          pin: true,
          pinSpacing: true,
        }
      });

      sectionTl.fromTo(".history-intro",
        { scale: 2.2, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 1.0, ease: "power2.out" }
      );

      sectionTl.to(".marquee-tagline",
        { opacity: 0, y: -30, duration: 0.8, ease: "power2.in" },
        "+=0.4"
      );
      sectionTl.to(".marquee-logo",
        { scale: 0.45, y: "-22vh", duration: 1.0, ease: "power2.inOut" },
        "<"
      );

      sectionTl.fromTo(".history-cards-container",
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" },
        ">-0.4"
      );

      sectionTl.fromTo(".marquee-card-item:nth-child(5)",
        { opacity: 0, y: 80, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: "power3.out" }
      );

      sectionTl.fromTo(".marquee-card-item:nth-child(4)",
        { opacity: 0, y: 80, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: "power3.out" },
        "+=0.4"
      );

      sectionTl.fromTo(".marquee-card-item:nth-child(3)",
        { opacity: 0, y: 80, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: "power3.out" },
        "+=0.4"
      );

      sectionTl.fromTo(".marquee-card-item:nth-child(2)",
        { opacity: 0, y: 80, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: "power3.out" },
        "+=0.4"
      );

      sectionTl.fromTo(".marquee-card-item:nth-child(1)",
        { opacity: 0, y: 80, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: "power3.out" },
        "+=0.4"
      );
    });

    mm.add("(max-width: 1023px)", () => {
      const sectionTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".second-section",
          start: "top 75%",
          end: "bottom 25%",
          scrub: 0.5,
        }
      });

      sectionTl.fromTo(".history-intro",
        { scale: 1.3, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" }
      );

      sectionTl.fromTo(".marquee-card-item",
        { opacity: 0, y: 60, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.3, duration: 1.2, ease: "power3.out" },
        ">-0.2"
      );
    });

    // 6. Timeline Mascot — Reveal with blur + float (one-shot, not scrub — filter OK)
    const mascotFloat = gsap.to(".timeline-mascot", {
      y: -10, duration: 2.0, repeat: -1, yoyo: true, ease: "sine.inOut", paused: true,
    });

    gsap.fromTo(".timeline-mascot",
      { opacity: 0, y: 80, scale: 0.4, filter: "blur(8px)" },
      {
        opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
        duration: 1.0, ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: "#timeline",
          start: "top 80%",
          toggleActions: "play none none none",
        },
        onComplete: () => mascotFloat.play(),
      }
    );

    // 7. Competition Section — one-shot reveals (filter OK)
    gsap.fromTo("#competition .section-heading",
      { opacity: 0, y: 40, filter: "blur(6px)" },
      {
        opacity: 1, y: 0, filter: "blur(0px)",
        duration: 0.8, ease: "power3.out",
        scrollTrigger: {
          trigger: "#competition",
          start: "top 80%",
          toggleActions: "play none none none",
        }
      }
    );

    gsap.fromTo("#competition .prize-pool-card",
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.8, ease: "power3.out",
        scrollTrigger: {
          trigger: "#competition .prize-pool-card",
          start: "top 85%",
          toggleActions: "play none none none",
        }
      }
    );

    mm.add("(min-width: 1024px)", () => {
      gsap.fromTo("#competition .comp-card",
        { opacity: 0, y: 60, filter: "blur(4px)" },
        {
          opacity: 1, y: 0, filter: "blur(0px)",
          duration: 0.7, ease: "power3.out", stagger: 0.15,
          scrollTrigger: {
            trigger: "#competition .comp-cards-desktop",
            start: "top 80%",
            toggleActions: "play none none none",
          }
        }
      );
    });

    mm.add("(max-width: 1023px)", () => {
      gsap.fromTo("#competition .comp-card-mobile",
        { opacity: 0, y: 50, filter: "blur(4px)" },
        {
          opacity: 1, y: 0, filter: "blur(0px)",
          duration: 0.7, ease: "power3.out", stagger: 0.15,
          scrollTrigger: {
            trigger: "#competition .comp-cards-mobile",
            start: "top 85%",
            toggleActions: "play none none none",
          }
        }
      );
    });

  }, { scope: containerRef });

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
        <FloatingCloud top="7%"  left="58%"  speed={5.5} delay={1.4} opacity={0.24} size="md" flip />
        <FloatingCloud top="12%" left="84%"  speed={5}   delay={0.6} opacity={0.30} size="sm" />
        <FloatingCloud top="19%" left="30%"  speed={6}   delay={2.1} opacity={0.20} size="xl" flip />
        <FloatingCloud top="27%" left="70%"  speed={4.8} delay={0.9} opacity={0.32} size="md" />
        <FloatingCloud top="35%" left="6%"   speed={5.8} delay={1.7} opacity={0.26} size="lg" flip />
        <FloatingCloud top="43%" left="48%"  speed={5.2} delay={0.3} opacity={0.18} size="sm" />
        <FloatingCloud top="51%" left="80%"  speed={4.5} delay={2.4} opacity={0.34} size="md" flip />
        <FloatingCloud top="59%" left="22%"  speed={6}   delay={1.1} opacity={0.22} size="xl" />
        <FloatingCloud top="67%" left="62%"  speed={5}   delay={0.7} opacity={0.28} size="lg" flip />
        <FloatingCloud top="75%" left="4%"   speed={5.5} delay={1.9} opacity={0.30} size="sm" />
        <FloatingCloud top="83%" left="44%"  speed={4.8} delay={0.4} opacity={0.20} size="md" flip />
        <FloatingCloud top="91%" left="78%"  speed={5.2} delay={2.2} opacity={0.32} size="lg" />
        <FloatingCloud top="97%" left="34%"  speed={5}   delay={1.3} opacity={0.24} size="md" flip />
      </div>

      {/* Hero Section */}
      <section
        id="hero"
        className="w-full min-h-screen flex flex-col justify-center items-center relative py-14 md:py-20 px-3 md:px-8 lg:px-20 overflow-hidden z-10"
      >
        {/* Background Video */}
        <div className="hero-video-bg absolute inset-0 w-full h-full -z-20 pointer-events-none select-none overflow-hidden bg-black">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover opacity-75"
          >
            <source src="/assets/vidio/background_vidio.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#1e40af]/32 via-[#1e3a8a]/58 to-[#0f172a]/96 -z-10" />
        </div>

        {/* Vignette Overlay */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none select-none opacity-8"
          style={{
            backgroundImage: `radial-gradient(ellipse 120% 100% at 50% 50%, transparent 38%, rgba(15, 23, 42, 0.58) 100%)`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 100%"
          }}
        />

        {/* Decorative Diagonal Marquees */}
        <div className="hero-marquees absolute inset-0 pointer-events-none select-none overflow-hidden z-0 opacity-10">
          <div
            className="absolute left-[-10%] bottom-[25%] w-[200%]"
            style={{ transform: "rotate(-45deg)", transformOrigin: "bottom left" }}
          >
            <div className="animate-marquee-left flex gap-4 text-[40px] md:text-[68px] lg:text-[96px] font-black font-clash-display tracking-widest text-white uppercase select-none">
              <span>INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII •</span>
              <span>INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII •</span>
            </div>
          </div>

          <div
            className="absolute right-[-10%] top-[25%] w-[200%]"
            style={{ transform: "rotate(-45deg)", transformOrigin: "top right" }}
          >
            <div className="animate-marquee-right flex gap-4 text-[40px] md:text-[68px] lg:text-[96px] font-black font-clash-display tracking-widest text-white uppercase select-none">
              <span>INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII •</span>
              <span>INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII •</span>
            </div>
          </div>
        </div>

        <div className="hero-content w-full z-[99] -mt-16 md:mt-2 lg:-mt-12 px-2 md:px-8 lg:px-16 flex flex-col items-center justify-center text-center will-change-transform">
          <div
            className="flex flex-col gap-4 md:gap-6 items-center text-center w-full px-2 md:px-12 lg:px-24"
            style={{ animation: "hero-fade-in 1s ease-out both" }}
          >
            <h1 className="tracking-tighter leading-none font-astralaga mb-4 flex flex-col items-center select-none w-full font-normal">
              <span className="flex flex-col sm:flex-row items-center justify-center sm:flex-nowrap sm:whitespace-nowrap gap-y-0.5 sm:gap-y-0 sm:gap-x-2 md:gap-x-4 text-6xl sm:text-6xl md:text-[7.5vw] lg:text-[8.5vw]">
                <span className="flex items-center">
                  <span className="font-imperial-script text-white text-7xl sm:text-7xl md:text-[9vw] lg:text-[10.5vw] leading-none select-none font-normal translate-y-[0.08em] mr-2">I</span>
                  <span className="text-white font-normal tracking-tighter">nformatics</span>
                </span>
                <span className="flex items-center">
                  <span className="font-imperial-script text-white text-7xl sm:text-7xl md:text-[9vw] lg:text-[10.5vw] leading-none select-none font-normal translate-y-[0.08em] mr-1.5">F</span>
                  <span className="text-white font-normal tracking-tighter">estival</span>
                </span>
              </span>
              <span className="text-5xl md:text-7xl lg:text-8xl mt-1 md:-mt-4 font-serif font-bold drop-shadow-[0_0_15px_rgba(253,208,38,0.7)] select-all inline-flex items-center justify-center gap-x-[1px] md:gap-x-[2px]">
                {["X", "I", "I", " ", "2", "0", "2", "6"].map((char, index) => (
                  char === " " ? (
                    <span key={index} className="w-1.5 md:w-2.5" />
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

            <p className="text-sm md:text-xl lg:text-2xl leading-relaxed mx-auto text-center font-medium drop-shadow-md text-pretty font-serif italic mt-3 md:mt-10 px-2 md:px-16 lg:px-32" style={{ color: "#F5F0E1" }}>
              Infest (Informatics Festival) XI 2025 is the biggest tech event in Aceh, bringing together students, professionals, and digital creators in one vibrant arena. Carrying the theme <span className="font-bold not-italic" style={{ backgroundImage: "radial-gradient(ellipse at 50% 45%, #FFFFFF 0%, #FEFCE8 20%, #FEF08A 48%, #FDD026 80%, #EAB308 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>&quot;Synthera: Creating a Harmonized, Intelligent, and Innovative Digital Ecosystem&quot;</span>, INFEST is more than a competition, it&apos;s a movement to shape the future through innovation, collaboration, and real-world impact.
            </p>
          </div>
        </div>
      </section>

      {/* Non-Hero Sections — shared background */}
      <div style={{ background: "radial-gradient(ellipse at 50% 18%, #2563eb 0%, #1d4ed8 28%, #1e3a8a 58%, #020a1c 100%)" }}>

      {/* 3D Marquee Section */}
      <section
        className="second-section py-8 md:py-20 relative overflow-x-clip overflow-y-visible z-10 lg:min-h-screen lg:flex lg:items-center lg:justify-center"
      >
        {/* Decorative Doll Graphic */}
        <div className="hidden md:block absolute right-0 top-0 w-[240px] sm:w-[320px] md:w-[420px] lg:w-[500px] h-[240px] sm:h-[320px] md:h-[420px] lg:h-[500px] pointer-events-none z-[99] opacity-100 select-none"
             style={{ transform: "translateY(-84.6%)" }}>
          <Image
            src="/assets/images/boneka.webp"
            alt="Doll Decoration"
            fill
            className="object-contain object-right-bottom"
            priority
          />
        </div>

        {/* Decorative Flower Graphic (background element, left side) */}
        <div className="hidden md:block absolute left-0 top-0 w-[240px] sm:w-[320px] md:w-[420px] lg:w-[500px] h-[240px] sm:h-[320px] md:h-[420px] lg:h-[500px] pointer-events-none z-0 opacity-100 select-none"
             style={{ transform: "translateY(-100%)" }}>
          <div className="relative w-full h-full" style={{ animation: "hero-fade-in 1s ease-out both" }}>
            <img
              src="/assets/svg/bunga.webp"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-contain object-left-bottom"
            />
          </div>
        </div>

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

        {/* Left 3D Perspective Marquee */}
        <div className="hidden md:flex absolute left-0 top-0 bottom-0 w-[38vw] max-w-[580px] overflow-hidden pointer-events-none z-0 items-center select-none"
             style={{
               perspective: "1000px",
               perspectiveOrigin: "center center",
               maskImage: "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)",
               WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)"
             }}>
          <div className="flex flex-col gap-12 w-[2800px] shrink-0 transform-3d items-start"
               style={{ transform: "rotateY(65deg)", transformOrigin: "left center" }}>
            <div className="animate-marquee-3d-left flex text-[64px] md:text-[88px] lg:text-[110px] xl:text-[128px] font-black font-clash-display tracking-widest text-white/28 uppercase whitespace-nowrap"
                 style={{ textShadow: "0 0 22px rgba(147,197,253,0.52), 0 0 45px rgba(96,165,250,0.28)" }}>
              <span>INFEST XII • SYNERGIZING THE FUTURE • DESIGNING DIGITOPIA • INFEST XII • SYNERGIZING THE FUTURE • DESIGNING DIGITOPIA • </span>
              <span>INFEST XII • SYNERGIZING THE FUTURE • DESIGNING DIGITOPIA • INFEST XII • SYNERGIZING THE FUTURE • DESIGNING DIGITOPIA • </span>
            </div>
            <div className="animate-marquee-3d-left-slow flex text-[44px] md:text-[60px] lg:text-[76px] xl:text-[88px] font-black font-clash-display tracking-widest text-white/16 uppercase whitespace-nowrap"
                 style={{ textShadow: "0 0 14px rgba(147,197,253,0.30), 0 0 30px rgba(96,165,250,0.15)" }}>
              <span>CREATIVE TECH • INNOVATION • COLLABORATION • ACEH TECH EVENT • CREATIVE TECH • INNOVATION • COLLABORATION • ACEH TECH EVENT • </span>
              <span>CREATIVE TECH • INNOVATION • COLLABORATION • ACEH TECH EVENT • CREATIVE TECH • INNOVATION • COLLABORATION • ACEH TECH EVENT • </span>
            </div>
          </div>
        </div>

        {/* Right 3D Perspective Marquee */}
        <div className="hidden md:flex absolute right-0 top-0 bottom-0 w-[38vw] max-w-[580px] overflow-hidden pointer-events-none z-0 items-center select-none"
             style={{
               perspective: "1000px",
               perspectiveOrigin: "center center",
               maskImage: "linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)",
               WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)"
             }}>
          <div className="flex flex-col gap-12 w-[2800px] shrink-0 transform-3d ml-auto items-start"
               style={{ transform: "rotateY(-48deg)", transformOrigin: "right center" }}>
            <div className="animate-marquee-3d-right flex text-[64px] md:text-[88px] lg:text-[110px] xl:text-[128px] font-black font-clash-display tracking-widest text-white/28 uppercase whitespace-nowrap"
                 style={{ textShadow: "0 0 22px rgba(147,197,253,0.52), 0 0 45px rgba(96,165,250,0.28)" }}>
              <span>JOIN THE REVOLUTION • SHAPING TOMORROW • DIGITAL EVOLUTION • JOIN THE REVOLUTION • SHAPING TOMORROW • DIGITAL EVOLUTION • </span>
              <span>JOIN THE REVOLUTION • SHAPING TOMORROW • DIGITAL EVOLUTION • JOIN THE REVOLUTION • SHAPING TOMORROW • DIGITAL EVOLUTION • </span>
            </div>
            <div className="animate-marquee-3d-right-slow flex text-[44px] md:text-[60px] lg:text-[76px] xl:text-[88px] font-black font-clash-display tracking-widest text-white/16 uppercase whitespace-nowrap"
                 style={{ textShadow: "0 0 14px rgba(147,197,253,0.30), 0 0 30px rgba(96,165,250,0.15)" }}>
              <span>DEVELOPMENT • COMPETITIONS • SEMINARS • HACKATHON • UI/UX DESIGN • DEVELOPMENT • COMPETITIONS • SEMINARS • HACKATHON • UI/UX DESIGN • </span>
              <span>DEVELOPMENT • COMPETITIONS • SEMINARS • HACKATHON • UI/UX DESIGN • DEVELOPMENT • COMPETITIONS • SEMINARS • HACKATHON • UI/UX DESIGN • </span>
            </div>
          </div>
        </div>

        <div className="relative w-full z-10 flex flex-col items-center justify-center min-h-[420px] md:min-h-[600px] lg:min-h-[750px] px-3 lg:px-6 overflow-hidden">

          {/* Intro Block */}
          <div className="history-intro w-full flex flex-col items-center justify-center text-center gap-6 z-20 relative max-w-4xl mx-auto lg:absolute lg:inset-0">
            <div className="marquee-logo relative hover:scale-105 transition-all duration-500 ease-out flex items-center justify-center">
              <div className="absolute w-[80%] h-[80%] bg-gradient-to-r from-[#FDD026] to-[#FFE885] rounded-full blur-[45px] opacity-60 animate-pulse z-0" style={{ animationDuration: "3.5s" }} />
              <div className="absolute w-[50%] h-[50%] bg-[#FDD026] rounded-full blur-[20px] opacity-50 z-0" />
              <Image
                src="/assets/images/logo_hero.PNG?v=2"
                alt="INFEST Logo Large"
                width={440}
                height={440}
                className="object-contain w-44 h-44 md:w-80 md:h-80 lg:w-[360px] lg:h-[360px] xl:w-[420px] xl:h-[420px] logo-glow-gold relative z-10"
                priority
              />
            </div>

            <div className="marquee-tagline flex flex-col gap-2 max-w-sm md:max-w-md lg:max-w-lg">
              <h2 className="font-clash-display text-xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white tracking-wide leading-tight text-balance">
                Empowering the Digital Generation
              </h2>
              <div className="marquee-divider w-24 h-[3px] bg-gradient-to-r from-[#2596BE] to-[#FDD026] rounded-full mt-2 mx-auto shadow-sm" />
            </div>
          </div>

          {/* 5 Memory Cards Container */}
          <div className="history-cards-container w-full lg:absolute lg:inset-0 lg:flex lg:flex-row lg:items-center lg:justify-center lg:gap-4 xl:gap-5 lg:px-4 py-16 md:py-8 relative z-10 overflow-x-auto scrollbar-none overflow-y-visible px-12 gap-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,150,190,0.1),transparent_70%)] pointer-events-none z-0" />

            <div className="mobile-marquee-track flex flex-row items-center gap-5 lg:gap-4 xl:gap-5 w-max lg:w-full lg:justify-center overflow-y-visible">

              {/* Original set (desktop + mobile visible) */}
              {MEMORY_CARDS.map((card) => (
                <MemoryCardItem key={`${card.id}-original`} card={card} desktop />
              ))}

              {/* Duplicate set — mobile marquee seamless loop only */}
              <div className="flex lg:hidden flex-row items-center gap-5 overflow-y-visible">
                {MEMORY_CARDS.map((card) => (
                  <MemoryCardItem key={`${card.id}-duplicate`} card={card} />
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Combined Timeline & Competitions Section */}
      <div className="w-full relative">

        {/* Timeline Section */}
        <section
          id="timeline"
          className="w-full relative overflow-visible pt-16 pb-12 z-10"
        >
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[25%] left-[8%] w-[400px] h-[400px] bg-[#2563eb]/14 rounded-full blur-[105px]" />
            <div className="absolute bottom-[15%] right-[12%] w-[450px] h-[450px] bg-[#3b82f6]/10 rounded-full blur-[115px]" />

            <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-pattern-b" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern-b)" />
            </svg>

            <div
              className="absolute top-[20%] right-[25%] w-[600px] h-[400px] rounded-full pointer-events-none mix-blend-screen blur-[130px]"
              style={{
                background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 100%)",
                animation: "nebula-pulse 14s infinite ease-in-out"
              }}
            />

            <TwinklingStar top="15%" left="20%" delay={0.4} size={2} />
            <TwinklingStar top="65%" left="8%" delay={1.9} size={3} />
            <TwinklingStar top="45%" left="88%" delay={0.9} size={2.5} />
            <TwinklingStar top="85%" left="72%" delay={2.3} size={2} />

            <div className="absolute inset-0 noise-texture opacity-[0.03] mix-blend-overlay" />
          </div>

          <Timeline data={timelineData} />
        </section>

        {/* Competitions Section */}
        <section
          id="competition"
          className="w-full pt-10 md:pt-16 pb-10 md:pb-20 px-3 md:px-6 lg:px-8 relative overflow-visible z-10"
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
                className="border border-[#FDD026]/28 p-5 md:p-12 rounded-[20px] md:rounded-[28px] backdrop-blur-xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.4),0_0_0_1px_rgba(253,208,38,0.10),inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-[#FDD026]/46 hover:shadow-[0_28px_80px_-12px_rgba(253,208,38,0.18),0_0_0_1px_rgba(253,208,38,0.22),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-500 relative overflow-hidden group"
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

                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#FDD026]/30 bg-[#FDD026]/5 text-[#FDD026] text-[10px] md:text-xs font-bold uppercase tracking-widest mx-auto mb-6 shadow-[0_0_12px_rgba(255,255,255,0.2)] select-none font-serif">
                  <span className="w-1.5 h-1.5 bg-[#FDD026] rounded-full animate-ping" />
                  Exclusive Rewards
                </div>

                <span className="text-white/80 text-base md:text-lg font-semibold uppercase tracking-wider block mb-2 select-none font-serif">
                  Total Prize Pool
                </span>

                <h3 id="prize-pool-counter" className="text-[1.7rem] sm:text-4xl md:text-8xl font-black font-mono tracking-widest mt-2 mb-3 md:mb-4 font-serif">
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

                <div className="w-48 h-[1px] bg-white/10 mx-auto my-6" />
                <p className="text-xs md:text-sm text-white/70 opacity-80 mt-4 max-w-2xl mx-auto font-medium font-serif">
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

              {/* ── Mobile Horizontal Carousel (< 768px) ── */}
              <div className="md:hidden w-full mt-4">
                <div
                  ref={compCarouselRef}
                  className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none px-4"
                  style={{ scrollPaddingLeft: "1rem" }}
                >
                  {[
                    { comp: featuredComp, isFeatured: true, id: "comp-featured" },
                    { comp: sideComps[0], isFeatured: false, id: "comp-side-0" },
                    { comp: sideComps[1], isFeatured: false, id: "comp-side-1" },
                  ].map((card, i) => (
                    <div
                      key={card.id}
                      className={cn(
                        "mobile-comp-slide snap-start shrink-0 w-[83vw] max-w-[320px]",
                        i === 2 && "mr-4"
                      )}
                    >
                      <CompetitionCard comp={card.comp} isFeatured={card.isFeatured} getSlug={getSlug} />
                    </div>
                  ))}
                </div>

                {/* Swipe indicator dots */}
                <div className="flex justify-center items-center gap-2 mt-3 pb-1">
                  {[true, false, false].map((isFeatured, i) => (
                    <button
                      key={i}
                      aria-label={`Lihat kompetisi ${i + 1}`}
                      onClick={() => {
                        const slides = compCarouselRef.current?.querySelectorAll<HTMLElement>(".mobile-comp-slide");
                        slides?.[i]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
                      }}
                      className={cn(
                        "rounded-full transition-all duration-300 focus:outline-none cursor-pointer",
                        activeCompCard === i
                          ? cn("h-2 w-5", isFeatured ? "bg-[#FDD026]" : "bg-[#2596BE]")
                          : "h-2 w-2 bg-white/25 hover:bg-white/45"
                      )}
                    />
                  ))}
                </div>
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

        {/* Seminar Section */}
        <section
          id="seminar"
          className="w-full py-16 md:py-28 px-3 md:px-6 lg:px-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[80vh] md:min-h-screen"
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
              className="relative group z-10 cursor-pointer flex flex-col items-center justify-center"
              data-aos="fade-up"
              data-aos-duration="1000"
              style={{ animation: "float 6s ease-in-out infinite" }}
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-[#3B82F6] via-transparent to-[#FDD026] rounded-[32px] blur-[24px] opacity-18 group-hover:opacity-35 transition-all duration-700 z-0" />
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-52 h-1.5 bg-[#60A5FA]/35 blur-[12px] rounded-full pointer-events-none" />

              <div
                className="relative w-48 h-48 md:w-72 md:h-72 rounded-[22px] md:rounded-[28px] overflow-hidden border border-[#FDD026]/32 bg-[#0f172a]/55 backdrop-blur-xl transition-all duration-500 flex items-center justify-center p-2.5 md:p-3"
                style={{ boxShadow: "0 28px 60px rgba(0,0,0,0.62), 0 0 0 1px rgba(253,208,38,0.12), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 35px rgba(253,208,38,0.10)" }}
              >
                <div className="relative w-full h-full rounded-[20px] overflow-hidden bg-black/40">
                  <Image
                    src="/assets/images/mysteryguest.png"
                    alt="Mystery Speaker"
                    fill
                    loading="lazy"
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
              className="max-w-2xl text-center p-4 md:p-8 rounded-xl md:rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.03] border border-[#FDD026]/22 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45),0_0_0_1px_rgba(253,208,38,0.08),inset_0_1px_0_rgba(255,255,255,0.12)] z-10 flex flex-col items-center gap-3 md:gap-4"
              data-aos="fade-up"
              data-aos-delay="300"
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
