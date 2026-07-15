"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Timeline } from "@/components/timeline";
import Shuffle from "@/components/shuffle/shuffle";
import { dm_serif_display } from "@/app/fonts/fonts";
import AOS from "aos";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

import { timelineData } from "@/data/timeline";
import { competitionData } from "@/data/competitions";
import { driveToDirect, driveToFallback } from "@/libs/helpers/convertDrivePhoto";
import { cn } from "@/libs/helpers/cn";

// Twinkling Star Component
const TwinklingStar = ({ top, left, delay, size = 2 }: { top: string; left: string; delay: number; size?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0.5, 1.2, 0.5]
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut"
    }}
    className="absolute rounded-full bg-white"
    style={{
      top,
      left,
      width: `${size}px`,
      height: `${size}px`,
      boxShadow: "0 0 8px #ffffff"
    }}
  />
);

// Floating Cloud Component
const FloatingCloud = ({ top, speed = 25, delay = 0, opacity = 0.4 }: { top: string; speed?: number; delay?: number; opacity?: number }) => (
  <motion.div
    initial={{ x: "-10%" }}
    animate={{ x: "110%" }}
    transition={{
      duration: speed,
      repeat: Infinity,
      ease: "linear",
      delay: delay
    }}
    className="absolute pointer-events-none z-10"
    style={{ top, opacity }}
  >
    <img src="/assets/svg/pixel-cloud.svg" alt="Pixel Cloud" className="w-24 md:w-36 h-auto" />
  </motion.div>
);

// Reusable Competition Card Component to avoid massive code duplication
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
    ? "flex-1 py-2.5 bg-gradient-to-r from-[#FDD026] to-[#FFE885] hover:bg-[#B89926] text-[#0d1a5c] shadow-[0_0_15px_rgba(253,208,38,0.3)] hover:shadow-[0_0_25px_rgba(253,208,38,0.5)] rounded-full text-xs font-extrabold text-center transition-all duration-300 uppercase tracking-wider"
    : "flex-1 py-2.5 bg-gradient-to-r from-[#2596BE] to-[#6EC6E8] hover:bg-[#1a6e8e] text-white shadow-[0_0_15px_rgba(37,150,190,0.3)] hover:shadow-[0_0_25px_rgba(37,150,190,0.5)] rounded-full text-xs font-extrabold text-center transition-all duration-300 uppercase tracking-wider";

  const secondaryBtnStyle = isFeatured
    ? "px-4 py-2.5 border border-[#FDD026]/40 hover:bg-[#FDD026]/10 text-[#FDD026] hover:shadow-[0_0_12px_rgba(253,208,38,0.2)] rounded-full text-xs font-bold text-center transition-all duration-300"
    : "px-4 py-2.5 border border-[#2596BE]/40 hover:bg-[#2596BE]/10 text-[#2596BE] hover:shadow-[0_0_12px_rgba(37,150,190,0.2)] rounded-full text-xs font-bold text-center transition-all duration-300";

  return (
    <div className={cn("w-full flex flex-col transition-all duration-500 h-full min-h-[420px]")}>
      <div
        className={cn(
          "relative flex flex-col justify-between rounded-[24px] backdrop-blur-[32px] border p-6 md:p-8 h-full transition-all duration-500 overflow-hidden group",
          isFeatured
            ? "bg-[#0d1a5c]/55 border-[#FDD026]/35 shadow-[0_10px_35px_rgba(255,255,255,0.06),0_0_20px_rgba(255,255,255,0.12)] hover:border-[#FDD026]/50 hover:shadow-[0_15px_45px_rgba(255,255,255,0.12),0_0_30px_rgba(255,255,255,0.22)]"
            : "bg-[#0d1a5c]/40 border-white/10 opacity-95 shadow-[0_8px_25px_rgba(255,255,255,0.04),0_0_15px_rgba(255,255,255,0.08)] hover:border-[#2596BE]/40 hover:shadow-[0_12px_35px_rgba(255,255,255,0.15),0_0_25px_rgba(255,255,255,0.18)] hover:opacity-100"
        )}
      >
        {/* Subtle noise texture overlay for realism */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
          }}
        />

        {/* Ambient internal radial glow */}
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[60px] pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-500",
          isFeatured ? "bg-[#FDD026]/10" : "bg-[#2596BE]/10"
        )} />

        {/* Corner Accents */}
        <div className={cn("absolute top-3 left-3 w-3 h-3 border-t border-l rounded-tl-[3px] pointer-events-none", isFeatured ? "border-[#FDD026]/40" : "border-[#2596BE]/40")} />
        <div className={cn("absolute top-3 right-3 w-3 h-3 border-t border-r rounded-tr-[3px] pointer-events-none", isFeatured ? "border-[#FDD026]/40" : "border-[#2596BE]/40")} />
        <div className={cn("absolute bottom-3 left-3 w-3 h-3 border-b border-l rounded-bl-[3px] pointer-events-none", isFeatured ? "border-[#FDD026]/40" : "border-[#2596BE]/40")} />
        <div className={cn("absolute bottom-3 right-3 w-3 h-3 border-b border-r rounded-br-[3px] pointer-events-none", isFeatured ? "border-[#FDD026]/40" : "border-[#2596BE]/40")} />

        {/* Slow animated shimmer reflection sheen */}
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
            {/* Rounded Glass Icon container with inner glow */}
            <div className={cn(
              "flex items-center justify-center rounded-xl w-14 h-14 backdrop-blur-md border shrink-0",
              isFeatured
                ? "bg-[#FDD026]/15 border-[#FDD026]/30 shadow-[inset_0_1px_6px_rgba(253,208,38,0.2)]"
                : "bg-[#2596BE]/15 border-[#2596BE]/30 shadow-[inset_0_1px_6px_rgba(37,150,190,0.2)]"
            )}>
              <img src={comp.iconUrl} alt={comp.name} className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h4 className="text-xl md:text-2xl font-bold font-clash-display text-white tracking-wide">{comp.name}</h4>

              {/* Category Pill Label with border and light glow */}
              <div className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-extrabold uppercase tracking-widest mt-1",
                isFeatured
                  ? "bg-[#FDD026]/10 border-[#FDD026]/30 text-[#FDD026] shadow-[0_0_8px_rgba(253,208,38,0.15)]"
                  : "bg-[#2596BE]/10 border-[#2596BE]/30 text-[#2596BE] shadow-[0_0_8px_rgba(37,150,190,0.15)]"
              )}>
                <span className={cn("w-1 h-1 rounded-full animate-pulse", isFeatured ? "bg-[#FDD026]" : "bg-[#2596BE]")} />
                {isFeatured ? "FEATURED LOMBA" : "KOMPETISI"}
              </div>
            </div>
          </div>

          <p className="text-white/70 text-xs md:text-sm leading-relaxed mt-2 opacity-75 min-h-[60px] line-clamp-3">
            {comp.description}
          </p>

          {/* Capsule Tags with Soft Glow */}
          <div className="flex flex-wrap gap-2 mt-2">
            {(comp.keywords || []).slice(0, isFeatured ? 3 : 2).map((k: string, i: number) => (
              <span
                key={i}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all duration-300",
                  isFeatured
                    ? "bg-[#FDD026]/10 border-[#FDD026]/20 text-[#FDD026] shadow-[0_0_6px_rgba(253,208,38,0.05)]"
                    : "bg-[#2596BE]/10 border-[#2596BE]/20 text-[#2596BE] shadow-[0_0_6px_rgba(37,150,190,0.05)]"
                )}
              >
                {k}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Content Area */}
        <div className="relative z-10 mt-6">
          {/* Divider Line */}
          <div className="w-full h-[1px] bg-white/10 mb-5" />

          {/* Prize Pool and Team size */}
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link href={`/dashboard?menu=kompetisi&type=${getSlug(comp.name)}`} className={btnStyle}>
              Daftar
            </Link>
            <a
              href={comp.guidebookLink}
              target="_blank"
              rel="noopener noreferrer"
              className={secondaryBtnStyle}
            >
              Guidebook
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfestWebsite = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMarqueeLoading, setIsMarqueeLoading] = useState(true);
  const [prizeCount, setPrizeCount] = useState(22500000);

  const formatNumber = (num: number) => {
    return "IDR " + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "+";
  };

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
    setPrizeCount(0); // Reset on mount so we animate from 0 on the client

    let startTimestamp: number | null = null;
    const end = 22500000;
    const duration = 1500; // 1.5 seconds

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setPrizeCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        window.requestAnimationFrame(step);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    const element = document.getElementById("prize-pool-counter");
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // Sample images for the 3D marquee
  const galleryImages = [
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMarqueeLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    // ───────────────────────────────────────────────
    // 1. Hero Content — Scale, Opacity, Blur on Scroll
    // ───────────────────────────────────────────────
    gsap.to(".hero-content", {
      y: -80,
      scale: 0.92,
      opacity: 0,
      filter: "blur(8px)",
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom 60%",
        scrub: 0.8,
      }
    });

    // ───────────────────────────────────────────────
    // 2. Hero Background Video — Parallax (deeper)
    // ───────────────────────────────────────────────
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

    // ───────────────────────────────────────────────
    // 3. Hero Marquee Ribbons — Parallax + Fade
    // ───────────────────────────────────────────────
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

    // ───────────────────────────────────────────────
    // 4. Curved SVG Divider — Organic morph on scroll
    //    Starts as deep arc, flattens as second section rises
    // ──────────────────────────
    mm.add("(min-width: 1024px)", () => {
      const sectionTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".second-section",
          start: "top top",
          end: "+=3000", // scroll distance for fully sequential fades
          scrub: 0.5,
          pin: true,
          pinSpacing: true,
        }
      });

      // Frame 1: Logo & Tagline enter in the center (scale up, fade in, blur off)
      sectionTl.fromTo(".history-intro",
        { scale: 2.2, opacity: 0, filter: "blur(15px)", y: 50 },
        { scale: 1, opacity: 1, filter: "blur(0px)", y: 0, duration: 1.0, ease: "power2.out" }
      );

      // Frame 2: Logo & Tagline exit (scale down, fade out, blur on)
      sectionTl.to(".history-intro",
        { scale: 0.5, opacity: 0, filter: "blur(20px)", y: -80, duration: 1.0, ease: "power2.in" },
        "+=0.4"
      );

      // Frame 3: The cards container fades/scales in from the background (fully centered)
      sectionTl.fromTo(".history-cards-container",
        { scale: 0.95, opacity: 0, filter: "blur(8px)" },
        { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "power2.out" },
        ">-0.4"
      );

      // Frame 4: Card 5 enters (Rightmost card)
      sectionTl.fromTo(".marquee-card-item:nth-child(5)",
        { opacity: 0, y: 80, scale: 0.9, filter: "blur(8px)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.0, ease: "power3.out" }
      );

      // Frame 5: Card 4 enters
      sectionTl.fromTo(".marquee-card-item:nth-child(4)",
        { opacity: 0, y: 80, scale: 0.9, filter: "blur(8px)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.0, ease: "power3.out" },
        "+=0.4"
      );

      // Frame 6: Card 3 enters
      sectionTl.fromTo(".marquee-card-item:nth-child(3)",
        { opacity: 0, y: 80, scale: 0.9, filter: "blur(8px)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.0, ease: "power3.out" },
        "+=0.4"
      );

      // Frame 7: Card 2 enters
      sectionTl.fromTo(".marquee-card-item:nth-child(2)",
        { opacity: 0, y: 80, scale: 0.9, filter: "blur(8px)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.0, ease: "power3.out" },
        "+=0.4"
      );

      // Frame 8: Card 1 enters (Leftmost card)
      sectionTl.fromTo(".marquee-card-item:nth-child(1)",
        { opacity: 0, y: 80, scale: 0.9, filter: "blur(8px)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.0, ease: "power3.out" },
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
        { scale: 1.3, opacity: 0, filter: "blur(8px)" },
        { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }
      );

      sectionTl.fromTo(".marquee-card-item",
        { opacity: 0, y: 60, scale: 0.95, filter: "blur(6px)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", stagger: 0.3, duration: 1.2, ease: "power3.out" },
        ">-0.2"
      );
    });

    // ───────────────────────────────────────────────
    // 6. Timeline Mascot — Reveal with blur + float
    // ───────────────────────────────────────────────
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

    // ───────────────────────────────────────────────
    // 7. Competition Section — Heading + Cards Reveal
    // ───────────────────────────────────────────────
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

  // ─── Competition Cards ───
  const allComps = [
    { comp: sideComps[0], isFeatured: false, id: 'comp-side-0' },
    { comp: featuredComp, isFeatured: true, id: 'comp-featured' },
    { comp: sideComps[1], isFeatured: false, id: 'comp-side-1' },
  ];

  return (
    <div ref={containerRef} id="home" className="w-full min-h-screen text-white relative overflow-x-clip bg-transparent">

      {/* Background twinkles & clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <TwinklingStar top="15%" left="10%" delay={0.2} size={3} />
        <TwinklingStar top="25%" left="80%" delay={1.2} size={2} />
        <TwinklingStar top="40%" left="40%" delay={0.5} size={3} />
        <TwinklingStar top="65%" left="15%" delay={2.1} size={2} />
        <TwinklingStar top="75%" left="85%" delay={1.5} size={3} />
        <TwinklingStar top="85%" left="50%" delay={0.8} size={2} />

        <FloatingCloud top="12%" speed={45} delay={0} opacity={0.3} />
        <FloatingCloud top="35%" speed={60} delay={10} opacity={0.2} />
        <FloatingCloud top="70%" speed={50} delay={5} opacity={0.25} />
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
            className="w-full h-full object-cover opacity-75"
          >
            <source src="/assets/vidio/background_vidio.webm" type="video/webm" />
          </video>
          {/* Saturated dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2652C8]/40 via-[#142f8a]/60 to-[#0a1848] -z-10" />
        </div>

        {/* Vignette Overlay */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none select-none opacity-8"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, transparent 40%, rgba(10, 24, 72, 0.6) 100%)`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%'
          }}
        />

        {/* Decorative Background Diagonal Marquees (refined opacity) */}
        <div className="hero-marquees absolute inset-0 pointer-events-none select-none overflow-hidden z-0 opacity-10">
          {/* Left Ribbon: Bottom-Left to Top-Right (angled at -45deg) */}
          <div
            className="absolute left-[-10%] bottom-[25%] w-[200%]"
            style={{ transform: 'rotate(-45deg)', transformOrigin: 'bottom left' }}
          >
            <div className="animate-marquee-left flex gap-4 text-[40px] md:text-[68px] lg:text-[96px] font-black font-clash-display tracking-widest text-white uppercase select-none">
              <span>
                INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII •
              </span>
              <span>
                INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII •
              </span>
            </div>
          </div>

          {/* Right Ribbon: Top-Right to Bottom-Left (angled at -45deg, scrolls opposite) */}
          <div
            className="absolute right-[-10%] top-[25%] w-[200%]"
            style={{ transform: 'rotate(-45deg)', transformOrigin: 'top right' }}
          >
            <div className="animate-marquee-right flex gap-4 text-[40px] md:text-[68px] lg:text-[96px] font-black font-clash-display tracking-widest text-white uppercase select-none">
              <span>
                INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII •
              </span>
              <span>
                INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII • INFEST XII •
              </span>
            </div>
          </div>
        </div>

        <div className="hero-content w-full z-20 mt-2 lg:-mt-12 px-2 md:px-8 lg:px-16 flex flex-col items-center justify-center text-center will-change-transform">
          {/* Centered Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="flex flex-col gap-4 md:gap-6 items-center text-center w-full max-w-5xl"
          >
            <h1 className="tracking-tighter leading-none font-astralaga mb-4 flex flex-col items-center select-none w-full font-normal">
              <span className="flex flex-row items-center justify-center flex-nowrap whitespace-nowrap gap-x-2 md:gap-x-4 text-5xl sm:text-6xl md:text-[6.5vw] lg:text-[7.5vw]">
                <span className="flex items-center">
                  <span className="font-imperial-script text-white text-6xl sm:text-7xl md:text-[8vw] lg:text-[9.5vw] leading-none select-none font-normal translate-y-[0.08em] mr-2">I</span>
                  <span className="text-white font-normal tracking-tighter">nformatics</span>
                </span>
                <span className="flex items-center">
                  <span className="font-imperial-script text-white text-6xl sm:text-7xl md:text-[8vw] lg:text-[9.5vw] leading-none select-none font-normal translate-y-[0.08em] mr-1.5">F</span>
                  <span className="text-white font-normal tracking-tighter">estival</span>
                </span>
              </span>
              <span className="text-3xl md:text-6xl lg:text-7xl -mt-1 md:-mt-4 font-serif font-bold drop-shadow-[0_0_15px_rgba(253,208,38,0.7)] select-all inline-flex items-center justify-center gap-x-[1px] md:gap-x-[2px]">
                {["X", "I", "I", " ", "2", "0", "2", "6"].map((char, index) => (
                  char === " " ? (
                    <span key={index} className="w-1.5 md:w-2.5" />
                  ) : (
                    <span
                      key={index}
                      className="inline-block"
                      style={{
                        backgroundImage: "linear-gradient(to bottom, rgb(255, 255, 255) 0%, rgb(255, 235, 150) 30%, rgb(253, 208, 38) 70%, rgb(255, 220, 80) 100%)",
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

            <p className="text-sm md:text-lg lg:text-xl max-w-3xl leading-relaxed mx-auto text-center font-medium drop-shadow-md text-pretty font-serif italic mt-4 md:mt-8 px-1" style={{ color: '#F5F0E1' }}>
              Infest (Informatics Festival) XI 2025 is the biggest tech event in Aceh, bringing together students, professionals, and digital creators in one vibrant arena. Carrying the theme <span className="font-bold not-italic" style={{ backgroundImage: 'linear-gradient(to bottom, rgb(255, 255, 255) 0%, rgb(255, 235, 150) 30%, rgb(253, 208, 38) 70%, rgb(255, 220, 80) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>&quot;Synthera: Creating a Harmonized, Intelligent, and Innovative Digital Ecosystem&quot;</span>, INFEST is more than a competition, it&apos;s a movement to shape the future through innovation, collaboration, and real-world impact.
            </p>
          </motion.div>
        </div>

      </section>

      {/* 3D Marquee Section */}
      <section
        className="second-section py-8 md:py-20 relative overflow-hidden z-10 lg:min-h-screen lg:flex lg:items-center lg:justify-center"
        style={{
          background: "radial-gradient(circle at 50% 50%, #2652c8 0%, #050d24 100%)"
        }}
      >
        {/* Curved transition shape at the top of the second section */}
        <div className="section-curve absolute top-0 left-0 w-full z-20 pointer-events-none -translate-y-full" style={{ height: "140px" }}>
          <svg viewBox="0 0 1440 140" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,0 C480,140 960,140 1440,0 L1440,140 L0,140 Z" fill="#050d24" />
          </svg>
        </div>

        {/* GLOBAL BACKGROUND LAYER SYSTEM: Section A */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Lighting Layer: Soft blue and purple glows */}
          <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] right-[20%] w-[450px] h-[450px] bg-purple-700/10 rounded-full blur-[120px]" />

          {/* Decorative SVG Layer: Abstract Wavy Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.08] stroke-white" fill="none" viewBox="0 0 1440 800" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,200 C300,100 600,400 900,150 C1200,-100 1300,300 1440,250" strokeWidth="2" strokeDasharray="5 5" />
            <path d="M0,350 C400,200 800,500 1100,300 C1300,150 1400,450 1500,400" strokeWidth="1.5" />
          </svg>

          {/* Space Effect: Twinkling Star Field */}
          <TwinklingStar top="15%" left="10%" delay={0.5} size={2.5} />
          <TwinklingStar top="25%" left="85%" delay={1.4} size={3} />
          <TwinklingStar top="60%" left="15%" delay={0.8} size={2} />
          <TwinklingStar top="75%" left="75%" delay={2.1} size={3} />
          <TwinklingStar top="40%" left="50%" delay={1.7} size={2} />

          {/* Texture Layer: Matte Noise Overlay */}
          <div
            className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
            }}
          />
        </div>

        {/* Left 3D Perspective Marquee (Front to Back) */}
        <div className="hidden md:flex absolute left-0 top-0 bottom-0 w-[38vw] max-w-[580px] overflow-hidden pointer-events-none z-0 items-center select-none"
             style={{
               perspective: "1000px",
               perspectiveOrigin: "center center",
               maskImage: "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)",
               WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)"
             }}>
          <div className="flex flex-col gap-12 w-[2800px] shrink-0 transform-3d items-start"
               style={{
                 transform: "rotateY(65deg)",
                 transformOrigin: "left center",
               }}>
            {/* Track 1: White */}
            <div className="animate-marquee-3d-left flex gap-12 text-[64px] md:text-[88px] lg:text-[110px] xl:text-[128px] font-black font-clash-display tracking-widest text-white/30 uppercase whitespace-nowrap"
                 style={{
                   textShadow: "0 0 25px rgba(255, 255, 255, 0.45), 0 0 50px rgba(255, 255, 255, 0.2)",
                 }}>
              <span>
                INFEST XII • SYNERGIZING THE FUTURE • DESIGNING DIGITOPIA • INFEST XII • SYNERGIZING THE FUTURE • DESIGNING DIGITOPIA •
              </span>
              <span>
                INFEST XII • SYNERGIZING THE FUTURE • DESIGNING DIGITOPIA • INFEST XII • SYNERGIZING THE FUTURE • DESIGNING DIGITOPIA •
              </span>
            </div>
            {/* Track 2: White (Smaller/Slower) */}
            <div className="animate-marquee-3d-left-slow flex gap-12 text-[44px] md:text-[60px] lg:text-[76px] xl:text-[88px] font-black font-clash-display tracking-widest text-white/18 uppercase whitespace-nowrap"
                 style={{
                   textShadow: "0 0 15px rgba(255, 255, 255, 0.25), 0 0 35px rgba(255, 255, 255, 0.1)",
                 }}>
              <span>
                CREATIVE TECH • INNOVATION • COLLABORATION • ACEH TECH EVENT • CREATIVE TECH • INNOVATION • COLLABORATION • ACEH TECH EVENT •
              </span>
              <span>
                CREATIVE TECH • INNOVATION • COLLABORATION • ACEH TECH EVENT • CREATIVE TECH • INNOVATION • COLLABORATION • ACEH TECH EVENT •
              </span>
            </div>
          </div>
        </div>

        {/* Right 3D Perspective Marquee (Front to Back) */}
        <div className="hidden md:flex absolute right-0 top-0 bottom-0 w-[38vw] max-w-[580px] overflow-hidden pointer-events-none z-0 items-center select-none"
             style={{
               perspective: "1000px",
               perspectiveOrigin: "center center",
               maskImage: "linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)",
               WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)"
             }}>
          <div className="flex flex-col gap-12 w-[2800px] shrink-0 transform-3d ml-auto items-start"
               style={{
                 transform: "rotateY(-48deg)",
                 transformOrigin: "right center",
               }}>
            {/* Track 1: White */}
            <div className="animate-marquee-3d-right flex gap-12 text-[72px] md:text-[96px] lg:text-[120px] xl:text-[144px] font-black font-clash-display tracking-widest text-white/30 uppercase whitespace-nowrap"
                 style={{
                   textShadow: "0 0 25px rgba(255, 255, 255, 0.45), 0 0 50px rgba(255, 255, 255, 0.2)",
                 }}>
              <span>
                JOIN THE REVOLUTION • SHAPING TOMORROW • DIGITAL EVOLUTION • JOIN THE REVOLUTION • SHAPING TOMORROW • DIGITAL EVOLUTION •
              </span>
              <span>
                JOIN THE REVOLUTION • SHAPING TOMORROW • DIGITAL EVOLUTION • JOIN THE REVOLUTION • SHAPING TOMORROW • DIGITAL EVOLUTION •
              </span>
            </div>
            {/* Track 2: White (Smaller/Slower) */}
            <div className="animate-marquee-3d-right-slow flex gap-12 text-[48px] md:text-[68px] lg:text-[84px] xl:text-[98px] font-black font-clash-display tracking-widest text-white/18 uppercase whitespace-nowrap"
                 style={{
                   textShadow: "0 0 15px rgba(255, 255, 255, 0.25), 0 0 35px rgba(255, 255, 255, 0.1)",
                 }}>
              <span>
                DEVELOPMENT • COMPETITIONS • SEMINARS • HACKATHON • UI/UX DESIGN • DEVELOPMENT • COMPETITIONS • SEMINARS • HACKATHON • UI/UX DESIGN •
              </span>
              <span>
                DEVELOPMENT • COMPETITIONS • SEMINARS • HACKATHON • UI/UX DESIGN • DEVELOPMENT • COMPETITIONS • SEMINARS • HACKATHON • UI/UX DESIGN •
              </span>
            </div>
          </div>
        </div>

        <div className="relative w-full z-10 flex flex-col items-center justify-center min-h-[420px] md:min-h-[600px] lg:min-h-[750px] px-3 lg:px-6 overflow-hidden">

          {/* Intro Block: Mascot Logo and Tagline (Centered on Screen for desktop entry) */}
          <div className="history-intro w-full flex flex-col items-center justify-center text-center gap-6 z-20 relative max-w-4xl mx-auto lg:absolute lg:inset-0">
            <div className="marquee-logo relative hover:scale-105 transition-all duration-500 ease-out flex items-center justify-center">
              {/* Pulsing Golden Glow behind Mascot Logo */}
              <div className="absolute w-[80%] h-[80%] bg-gradient-to-r from-[#FDD026] to-[#FFE885] rounded-full blur-[45px] opacity-60 animate-pulse z-0" style={{ animationDuration: "3.5s" }} />
              {/* Inner golden glow dot */}
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

          {/* Style to hide scrollbar tracks and run mobile infinite loop marquee */}
          <style dangerouslySetInnerHTML={{
            __html: `
              .scrollbar-none::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-none {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
              @media (max-width: 1023px) {
                .mobile-marquee-track {
                  display: flex;
                  width: max-content;
                  animation: mobile-marquee-scroll 25s infinite linear;
                }
                .mobile-marquee-track:hover, .mobile-marquee-track:active {
                  animation-play-state: paused;
                }
              }
              @keyframes mobile-marquee-scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `
          }} />

          {/* 5 Memory Cards Container (Revealed sequentially on scroll) */}
          <div className="history-cards-container w-full lg:absolute lg:inset-0 lg:flex lg:flex-row lg:items-center lg:justify-center lg:gap-4 xl:gap-5 lg:px-4 py-16 md:py-8 relative z-10 overflow-x-auto scrollbar-none overflow-y-visible px-12 gap-0">
            
            {/* Ambient Background Glow Spot */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,150,190,0.1),transparent_70%)] pointer-events-none z-0" />

            {/* Scrolling track wrapper for mobile, standard centered layout for desktop */}
            <div className="mobile-marquee-track flex flex-row items-center gap-5 lg:gap-4 xl:gap-5 w-max lg:w-full lg:justify-center overflow-y-visible">
              
              {/* ORIGINAL SET (Visible on Desktop & Mobile) */}
              {[
                {
                  id: "card-1",
                  num: "Memory #1",
                  title: "Empowering Innovation",
                  img: galleryImages[0],
                  accent: "#2596BE",
                  glow: "rgba(37,150,190,0.1)",
                  border: "border-[#2596BE]/20",
                  hoverBorder: "hover:border-[#2596BE]/50",
                  buttonBorder: "border-[#2596BE]/40",
                  buttonShadow: "shadow-[0_0_12px_rgba(37,150,190,0.4)]",
                  bg: "bg-[#0b1650]/65",
                  zIndex: "z-[1]",
                  shadow: "shadow-[0_10px_30px_rgba(0,0,0,0.4)]",
                },
                {
                  id: "card-2",
                  num: "Featured Memory",
                  title: "Designing Digitopia",
                  img: galleryImages[1],
                  accent: "#FDD026",
                  glow: "rgba(37,150,190,0.2)",
                  border: "border-[#FDD026]/30",
                  hoverBorder: "hover:border-[#FDD026]/60",
                  buttonBorder: "border-[#FDD026]/40",
                  buttonShadow: "shadow-[0_0_12px_rgba(253,208,38,0.5)]",
                  bg: "bg-[#0b1650]/75",
                  zIndex: "z-[2]",
                  shadow: "shadow-[0_15px_40px_rgba(0,0,0,0.5)]",
                },
                {
                  id: "card-3",
                  num: "Memory #3",
                  title: "Connecting Communities",
                  img: galleryImages[2],
                  accent: "#2596BE",
                  glow: "rgba(37,150,190,0.1)",
                  border: "border-[#2596BE]/20",
                  hoverBorder: "hover:border-[#2596BE]/50",
                  buttonBorder: "border-[#2596BE]/40",
                  buttonShadow: "shadow-[0_0_12px_rgba(37,150,190,0.4)]",
                  bg: "bg-[#0b1650]/65",
                  zIndex: "z-[3]",
                  shadow: "shadow-[0_10px_30px_rgba(0,0,0,0.4)]",
                },
                {
                  id: "card-4",
                  num: "Memory #4",
                  title: "Digital Evolution",
                  img: galleryImages[3],
                  accent: "#FDD026",
                  glow: "rgba(253,208,38,0.1)",
                  border: "border-[#FDD026]/20",
                  hoverBorder: "hover:border-[#FDD026]/50",
                  buttonBorder: "border-[#FDD026]/40",
                  buttonShadow: "shadow-[0_0_12px_rgba(253,208,38,0.4)]",
                  bg: "bg-[#0b1650]/65",
                  zIndex: "z-[4]",
                  shadow: "shadow-[0_10px_30px_rgba(0,0,0,0.4)]",
                },
                {
                  id: "card-5",
                  num: "Memory #5",
                  title: "Inspiring Champions",
                  img: galleryImages[4],
                  accent: "#2596BE",
                  glow: "rgba(37,150,190,0.1)",
                  border: "border-[#2596BE]/20",
                  hoverBorder: "hover:border-[#2596BE]/50",
                  buttonBorder: "border-[#2596BE]/40",
                  buttonShadow: "shadow-[0_0_12px_rgba(37,150,190,0.4)]",
                  bg: "bg-[#0b1650]/65",
                  zIndex: "z-[5]",
                  shadow: "shadow-[0_10px_30px_rgba(0,0,0,0.4)]",
                }
              ].map((card) => (
                <div
                  key={`${card.id}-original`}
                  className={`group swiper-slide-card marquee-card-item w-[180px] lg:w-[17%] lg:max-w-[245px] xl:max-w-[265px] shrink-0 lg:shrink flex flex-col relative rounded-t-[60px] lg:rounded-t-[80px] rounded-b-[16px] lg:rounded-b-[24px] border ${card.border} ${card.bg} backdrop-blur-md ${card.shadow} ${card.zIndex} hover:z-[50] active:z-[50] hover:-translate-y-6 active:-translate-y-6 ${card.hoverBorder} hover:shadow-[0_15px_40px_rgba(0,0,0,0.5),0_0_25px_${card.accent}40] transition-all duration-500 overflow-visible ml-0`}
                  style={{
                    boxShadow: `inset 0 2px 8px rgba(255,255,255,0.05), inset 0 -2px 8px rgba(0,0,0,0.4), 0 0 15px ${card.glow}`,
                    WebkitBoxReflect: "below 8px linear-gradient(transparent 75%, rgba(255,255,255,0.04))"
                  } as any}
                >
                  <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay rounded-t-[60px] lg:rounded-t-[80px] rounded-b-[16px] lg:rounded-b-[24px]"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
                  <div className="relative w-full aspect-[3/4] rounded-t-[60px] lg:rounded-t-[80px] rounded-b-[12px] overflow-hidden border-b border-white/5">
                    <Image src={card.img} alt={card.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1650] via-transparent to-transparent" />
                  </div>
                  <div className="relative bg-white/[0.04] backdrop-blur-sm border-t border-white/10 p-4 rounded-b-[16px] lg:rounded-b-[24px] flex flex-col gap-1 pb-8">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#2596BE]" style={{ color: card.accent }}>{card.num}</span>
                    <h4 className="text-xs md:text-sm font-bold text-white font-sans leading-tight">{card.title}</h4>
                    <button className={`absolute -bottom-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-[#0b1650] ${card.buttonBorder} ${card.buttonShadow} text-white hover:scale-110 active:scale-95 transition-all duration-300`}>
                      <svg className="w-4 h-4" style={{ color: card.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* DUPLICATE SET (Visible on Mobile only, creates seamless looping scroll) */}
              <div className="flex lg:hidden flex-row items-center gap-5 overflow-y-visible">
                {[
                  {
                    id: "card-1",
                    num: "Memory #1",
                    title: "Empowering Innovation",
                    img: galleryImages[0],
                    accent: "#2596BE",
                    glow: "rgba(37,150,190,0.1)",
                    border: "border-[#2596BE]/20",
                    hoverBorder: "hover:border-[#2596BE]/50",
                    buttonBorder: "border-[#2596BE]/40",
                    buttonShadow: "shadow-[0_0_12px_rgba(37,150,190,0.4)]",
                    bg: "bg-[#0b1650]/65",
                    zIndex: "z-[1]",
                    shadow: "shadow-[0_10px_30px_rgba(0,0,0,0.4)]",
                  },
                  {
                    id: "card-2",
                    num: "Featured Memory",
                    title: "Designing Digitopia",
                    img: galleryImages[1],
                    accent: "#FDD026",
                    glow: "rgba(37,150,190,0.2)",
                    border: "border-[#FDD026]/30",
                    hoverBorder: "hover:border-[#FDD026]/60",
                    buttonBorder: "border-[#FDD026]/40",
                    buttonShadow: "shadow-[0_0_12px_rgba(253,208,38,0.5)]",
                    bg: "bg-[#0b1650]/75",
                    zIndex: "z-[2]",
                    shadow: "shadow-[0_15px_40px_rgba(0,0,0,0.5)]",
                  },
                  {
                    id: "card-3",
                    num: "Memory #3",
                    title: "Connecting Communities",
                    img: galleryImages[2],
                    accent: "#2596BE",
                    glow: "rgba(37,150,190,0.1)",
                    border: "border-[#2596BE]/20",
                    hoverBorder: "hover:border-[#2596BE]/50",
                    buttonBorder: "border-[#2596BE]/40",
                    buttonShadow: "shadow-[0_0_12px_rgba(37,150,190,0.4)]",
                    bg: "bg-[#0b1650]/65",
                    zIndex: "z-[3]",
                    shadow: "shadow-[0_10px_30px_rgba(0,0,0,0.4)]",
                  },
                  {
                    id: "card-4",
                    num: "Memory #4",
                    title: "Digital Evolution",
                    img: galleryImages[3],
                    accent: "#FDD026",
                    glow: "rgba(253,208,38,0.1)",
                    border: "border-[#FDD026]/20",
                    hoverBorder: "hover:border-[#FDD026]/50",
                    buttonBorder: "border-[#FDD026]/40",
                    buttonShadow: "shadow-[0_0_12px_rgba(253,208,38,0.4)]",
                    bg: "bg-[#0b1650]/65",
                    zIndex: "z-[4]",
                    shadow: "shadow-[0_10px_30px_rgba(0,0,0,0.4)]",
                  },
                  {
                    id: "card-5",
                    num: "Memory #5",
                    title: "Inspiring Champions",
                    img: galleryImages[4],
                    accent: "#2596BE",
                    glow: "rgba(37,150,190,0.1)",
                    border: "border-[#2596BE]/20",
                    hoverBorder: "hover:border-[#2596BE]/50",
                    buttonBorder: "border-[#2596BE]/40",
                    buttonShadow: "shadow-[0_0_12px_rgba(37,150,190,0.4)]",
                    bg: "bg-[#0b1650]/65",
                    zIndex: "z-[5]",
                    shadow: "shadow-[0_10px_30px_rgba(0,0,0,0.4)]",
                  }
                ].map((card) => (
                  <div
                    key={`${card.id}-duplicate`}
                    className={`group swiper-slide-card marquee-card-item w-[180px] shrink-0 flex flex-col relative rounded-t-[60px] rounded-b-[16px] border ${card.border} ${card.bg} backdrop-blur-md ${card.shadow} ${card.zIndex} hover:z-[50] active:z-[50] hover:-translate-y-6 active:-translate-y-6 ${card.hoverBorder} hover:shadow-[0_15px_40px_rgba(0,0,0,0.5),0_0_25px_${card.accent}40] transition-all duration-500 overflow-visible ml-0`}
                    style={{
                      boxShadow: `inset 0 2px 8px rgba(255,255,255,0.05), inset 0 -2px 8px rgba(0,0,0,0.4), 0 0 15px ${card.glow}`,
                      WebkitBoxReflect: "below 8px linear-gradient(transparent 75%, rgba(255,255,255,0.04))"
                    } as any}
                  >
                    <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay rounded-t-[60px] rounded-b-[16px]"
                      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
                    <div className="relative w-full aspect-[3/4] rounded-t-[60px] rounded-b-[12px] overflow-hidden border-b border-white/5">
                      <Image src={card.img} alt={card.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1650] via-transparent to-transparent" />
                    </div>
                    <div className="relative bg-white/[0.04] backdrop-blur-sm border-t border-white/10 p-4 rounded-b-[16px] flex flex-col gap-1 pb-8">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#2596BE]" style={{ color: card.accent }}>{card.num}</span>
                      <h4 className="text-xs md:text-sm font-bold text-white font-sans leading-tight">{card.title}</h4>
                      <button className={`absolute -bottom-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-[#0b1650] ${card.buttonBorder} ${card.buttonShadow} text-white hover:scale-110 active:scale-95 transition-all duration-300`}>
                        <svg className="w-4 h-4" style={{ color: card.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Combined Timeline & Competitions Section */}
      <div className="w-full relative">

        {/* Timeline Section (Section B Background) */}
        <section
          id="timeline"
          className="w-full relative overflow-visible pt-16 pb-12 z-10"
          style={{
            background: "radial-gradient(circle at 50% 50%, #2652c8 0%, #04081c 100%)"
          }}
        >
          {/* GLOBAL BACKGROUND LAYER SYSTEM: Section B */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Lighting Layer: Purple glows */}
            <div className="absolute top-[30%] left-[10%] w-[350px] h-[350px] bg-purple-600/8 rounded-full blur-[100px]" />
            <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] bg-indigo-500/8 rounded-full blur-[110px]" />

            {/* Decorative SVG Layer: Grid Tech Pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-pattern-b" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern-b)" />
            </svg>

            {/* Space Effect: Nebula gradient fog with slow glow pulse */}
            <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes nebula-pulse {
                  0%, 100% { opacity: 0.25; transform: scale(1); }
                  50% { opacity: 0.45; transform: scale(1.15); }
                }
              `
            }} />
            <div 
              className="absolute top-[20%] right-[25%] w-[600px] h-[400px] rounded-full pointer-events-none mix-blend-screen blur-[130px]"
              style={{
                background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 100%)",
                animation: "nebula-pulse 14s infinite ease-in-out"
              }}
            />

            {/* Space Effect Add-on: Scattered Stars */}
            <TwinklingStar top="15%" left="20%" delay={0.4} size={2} />
            <TwinklingStar top="65%" left="8%" delay={1.9} size={3} />
            <TwinklingStar top="45%" left="88%" delay={0.9} size={2.5} />
            <TwinklingStar top="85%" left="72%" delay={2.3} size={2} />

            {/* Texture Layer: Matte Noise Overlay */}
            <div
              className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
              }}
            />
          </div>

          <Timeline data={timelineData} />
        </section>

        {/* Competitions Section (Section C Background) */}
        <section
          id="competition"
          className="w-full pt-16 pb-12 md:pb-20 px-3 md:px-6 lg:px-8 relative overflow-visible z-10"
          style={{
            background: "radial-gradient(circle at 50% 50%, #2652c8 0%, #020a1c 100%)"
          }}
        >
          {/* GLOBAL BACKGROUND LAYER SYSTEM: Section C */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Lighting Layer: Cyan and soft teal glow spots */}
            <div className="absolute top-[10%] right-[10%] w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />

            {/* Decorative SVG Layer: Tech circles / HUD elements */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="300" r="150" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 8" />
              <circle cx="200" cy="300" r="280" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
              <circle cx="1200" cy="600" r="220" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <path d="M-100,200 C300,50 800,450 1500,100" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </svg>

            {/* Space Effect: Aurora flowing lines (Slow waving path translation) */}
            <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes aurora-flow {
                  0%, 100% { transform: translateY(0) scaleY(1); opacity: 0.15; }
                  50% { transform: translateY(-15px) scaleY(1.08); opacity: 0.25; }
                }
              `
            }} />
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

            {/* Texture Layer: Subtle noise grain */}
            <div
              className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
              }}
            />
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
              {/* Glowing horizontal divider line */}
              <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mt-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-[2px]" />
              </div>
            </div>

            {/* Prize Pool Display (Rounded large card, center aligned, glassmorphism) */}
            <div className="prize-pool-card w-full text-center">
              <div
                className="border border-[#FDD026]/20 p-5 md:p-12 rounded-[20px] md:rounded-[28px] backdrop-blur-[32px] shadow-[0_8px_32px_rgba(255,255,255,0.08),0_0_15px_rgba(255,255,255,0.12)] hover:border-[#FDD026]/40 hover:shadow-[0_12px_48px_rgba(255,255,255,0.15),0_0_25px_rgba(255,255,255,0.22)] transition-all duration-500 relative overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01)), rgba(255, 255, 255, 0.03)",
                  WebkitBackdropFilter: "blur(32px)"
                }}
              >
                {/* Subtle noise texture overlay for realism */}
                <div
                  className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
                  }}
                />

                {/* Gold Corner Accents */}
                <div className="absolute top-5 left-5 w-4 h-4 border-t-2 border-l-2 border-[#FDD026]/50 rounded-tl-sm pointer-events-none" />
                <div className="absolute top-5 right-5 w-4 h-4 border-t-2 border-r-2 border-[#FDD026]/50 rounded-tr-sm pointer-events-none" />
                <div className="absolute bottom-5 left-5 w-4 h-4 border-b-2 border-l-2 border-[#FDD026]/50 rounded-bl-sm pointer-events-none" />
                <div className="absolute bottom-5 right-5 w-4 h-4 border-b-2 border-r-2 border-[#FDD026]/50 rounded-br-sm pointer-events-none" />

                {/* Ambient internal radial glow (White) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-white/5 rounded-full blur-[80px] pointer-events-none" />

                {/* Custom CSS keyframe style block for slow animated shimmer sheen */}
                <style dangerouslySetInnerHTML={{
                  __html: `
                @keyframes card-sheen {
                  0% { transform: skewX(-25deg) translateX(-200%); }
                  100% { transform: skewX(-25deg) translateX(200%); }
                }
              `}} />

                {/* Slow animated shimmer reflection sheen */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
                    animation: "card-sheen 8s infinite linear"
                  }}
                />

                {/* Accent Gradient Top Border Line (Gold/White reflection) */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

                {/* Exclusive Rewards Pill Label */}
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#FDD026]/30 bg-[#FDD026]/5 text-[#FDD026] text-[10px] md:text-xs font-bold uppercase tracking-widest mx-auto mb-6 shadow-[0_0_12px_rgba(255,255,255,0.2)] select-none font-serif">
                  <span className="w-1.5 h-1.5 bg-[#FDD026] rounded-full animate-ping" />
                  Exclusive Rewards
                </div>

                {/* Card Sub-heading */}
                <span className="text-white/80 text-base md:text-lg font-semibold uppercase tracking-wider block mb-2 select-none font-serif">
                  Total Prize Pool
                </span>

                {/* Main Counter Number with custom gold-white-gold linear-gradient and white text shadow drop glow */}
                <h3
                  id="prize-pool-counter"
                  className="text-4xl md:text-8xl font-black font-mono tracking-widest mt-2 mb-3 md:mb-4 font-serif"
                >
                  <div className="relative inline-block select-all">
                    {/* Background Glowing RGB Text Shadow layer */}
                    <span
                      className="absolute inset-0 font-mono font-serif select-none"
                      style={{
                        color: "transparent",
                        textShadow: "-3px -1px 8px rgba(239, 68, 68, 0.4), 3px 1px 8px rgba(34, 211, 238, 0.4), 0 0 15px rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      {formatNumber(prizeCount)}
                    </span>
                    {/* Foreground Gradient Text layer */}
                    <span
                      className="relative z-10 inline-block font-mono font-serif"
                      style={{
                        backgroundImage: "linear-gradient(to bottom, #B58A00 0%, #FFFFFF 50%, #FACC15 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {formatNumber(prizeCount)}
                    </span>
                  </div>
                </h3>

                {/* Internal Divider line */}
                <div className="w-48 h-[1px] bg-white/10 mx-auto my-6" />

                <p className="text-xs md:text-sm text-white/70 opacity-80 mt-4 max-w-2xl mx-auto font-medium font-serif">
                  Sertifikat Resmi Tingkat Nasional + Trophy + Merchandise Menarik
                </p>
              </div>
            </div>

            {/* Desktop Layout — Overlapping Swappable Cards */}
            <div className="w-full mt-8">
              <div className="comp-cards-desktop hidden lg:grid lg:grid-cols-3 w-full gap-6 xl:gap-8 pt-8 items-stretch">
                {allComps.map((card, index) => {
                  const hoverX = index === 0 ? 32 : index === 2 ? -32 : 0;
                  return (
                    <motion.div
                      key={card.id}
                      className="comp-card flex flex-col relative origin-center"
                      initial={{ scale: 1, x: 0, zIndex: 10, opacity: 0.95 }}
                      whileHover={{ 
                        scale: 1.15, 
                        x: hoverX,
                        zIndex: 40,
                        opacity: 1,
                        transition: { type: "spring", stiffness: 350, damping: 22 }
                      }}
                      style={{
                        filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.15))"
                      }}
                      whileTap={{ scale: 1.12 }}
                    >
                      <motion.div 
                        className="h-full"
                        whileHover={{
                          filter: "drop-shadow(0 30px 60px rgba(38, 82, 200, 0.45)) drop-shadow(0 15px 30px rgba(0,0,0,0.35))"
                        }}
                      >
                        <CompetitionCard
                          comp={card.comp}
                          isFeatured={card.isFeatured}
                          getSlug={getSlug}
                        />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Mobile & Tablet Card Layout */}
              <div className="comp-cards-mobile lg:hidden grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-3 md:mt-4">
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
          style={{
            background: "radial-gradient(circle at 50% 50%, #2652c8 0%, #030714 100%)"
          }}
        >
          {/* Custom CSS for animations */}
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes floating {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-12px); }
              }
              @keyframes orbit-cw {
                0% { transform: rotate(0deg) translateX(150px) rotate(0deg); }
                100% { transform: rotate(360deg) translateX(150px) rotate(-360deg); }
              }
              @keyframes orbit-ccw {
                0% { transform: rotate(360deg) translateX(180px) rotate(-360deg); }
                100% { transform: rotate(0deg) translateX(180px) rotate(0deg); }
              }
              @keyframes shimmer-line {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              @keyframes drift {
                0% { transform: translate(0, 0) rotate(0deg); }
                50% { transform: translate(30px, -40px) rotate(180deg); }
                100% { transform: translate(0, 0) rotate(360deg); }
              }
            `
          }} />

          {/* GLOBAL BACKGROUND LAYER SYSTEM: Section D */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Lighting Layer: Golden and cyan glow spots */}
            <div className="absolute top-[20%] left-[20%] w-[380px] h-[380px] bg-[#00d4ff]/8 rounded-full blur-[110px]" />
            <div className="absolute bottom-[20%] right-[20%] w-[420px] h-[420px] bg-[#ffc82c]/4 rounded-full blur-[140px]" />

            {/* Decorative SVG Layer: Abstract Organic Blobs */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
              <path d="M100,100 Q150,50 250,150 T400,200 T600,100 T900,300" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              <path d="M-50,400 Q200,600 500,350 T1100,500" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            </svg>

            {/* Space Effect: Galaxy dust clusters (Tiny blurred floating dots) */}
            <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes galaxy-drift {
                  0% { transform: translate(0, 0); }
                  50% { transform: translate(25px, -15px); }
                  100% { transform: translate(0, 0); }
                }
              `
            }} />
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

            {/* Texture Layer: Matte Noise Overlay */}
            <div
              className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
              }}
            />
          </div>

          {/* 3. Thin circular HUD rings behind card */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="w-[240px] h-[240px] md:w-[420px] md:h-[420px] rounded-full border border-[#00d4ff]/10 border-dashed animate-spin" style={{ animationDuration: '60s' }} />
            <div className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full border border-[#00d4ff]/5 animate-spin" style={{ animationDuration: '120s', animationDirection: 'reverse' }} />
            <div className="absolute w-[360px] h-[360px] md:w-[580px] md:h-[580px] rounded-full border border-[#ffc82c]/5 border-dotted animate-pulse" />
          </div>

          <div className="w-full flex flex-col items-center justify-center gap-5 md:gap-8 relative z-10">
            
            {/* 4. Mystery Speaker Card */}
            <div 
              className="relative group z-10 cursor-pointer flex flex-col items-center justify-center"
              data-aos="fade-up"
              data-aos-duration="1000"
              style={{ animation: 'floating 6s ease-in-out infinite' }}
            >
              {/* Outer glow ring behind card */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#00d4ff] via-transparent to-[#ffc82c] rounded-[30px] blur-[20px] opacity-20 group-hover:opacity-40 transition-all duration-700 z-0" />
              {/* Cinematic Top Light highlight */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-1 bg-[#00d4ff]/30 blur-[10px] rounded-full pointer-events-none" />

              {/* Glass container */}
              <div
                className="relative w-48 h-48 md:w-72 md:h-72 rounded-[22px] md:rounded-[28px] overflow-hidden border border-[#00d4ff]/20 bg-[#030712]/50 backdrop-blur-[24px] shadow-[0_24px_50px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.1)] transition-all duration-500 flex items-center justify-center p-2.5 md:p-3"
                style={{
                  boxShadow: "0 24px 50px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.1), 0 0 30px rgba(0,212,255,0.1)",
                }}
              >
                {/* Image layout with silhouette filter */}
                <div className="relative w-full h-full rounded-[20px] overflow-hidden bg-black/40">
                  <Image
                    src="/assets/images/mysteryguest.png"
                    alt="Mystery Speaker"
                    fill
                    className="object-cover object-center transition-all duration-700 ease-out grayscale brightness-[0.2] contrast-[1.2] group-hover:scale-105 group-hover:brightness-[0.4]"
                    priority
                  />
                  {/* Subtle vignette shadow gradient */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#030712_95%)] z-10" />

                  {/* Pulsing neon golden question mark */}
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <span 
                      className="text-5xl md:text-7xl font-bold text-[#ffc82c] font-sans drop-shadow-[0_0_15px_rgba(255,200,44,0.7)] animate-pulse"
                      style={{ textShadow: "0 0 20px rgba(255,200,44,0.8), 0 0 40px rgba(255,200,44,0.4)" }}
                    >
                      ?
                    </span>
                  </div>

                  {/* High tech grid matrix overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#00d4ff10_1px,transparent_1px),linear-gradient(to_bottom,#00d4ff10_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-10" />
                </div>

                {/* Cyan status underline */}
                <div className="absolute bottom-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Orbiting particles */}
              <div className="absolute inset-0 pointer-events-none z-20">
                <div className="absolute w-2 h-2 rounded-full bg-[#00d4ff] blur-[1px] shadow-[0_0_8px_#00d4ff]" style={{ animation: 'orbit-cw 12s linear infinite' }} />
                <div className="absolute w-1.5 h-1.5 rounded-full bg-[#ffc82c] blur-[1px] shadow-[0_0_8px_#ffc82c]" style={{ animation: 'orbit-ccw 16s linear infinite' }} />
              </div>
            </div>

            {/* 6. Text Section */}
            <div 
              className="max-w-2xl text-center p-4 md:p-8 rounded-xl md:rounded-2xl bg-white/[0.01] border border-white/[0.03] backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] z-10 flex flex-col items-center gap-3 md:gap-4"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <h2 className="text-balance select-none flex flex-col items-center gap-1.5 leading-none">
                <span className="flex items-baseline justify-center">
                  <span className="font-imperial-script text-[#FDD026] text-4xl md:text-8xl lg:text-[9rem] leading-none select-none font-normal translate-y-[0.05em] mr-0.5 md:mr-1">N</span>
                  <span className="font-clash-display tracking-widest text-white leading-none text-xl md:text-5xl lg:text-6xl font-extrabold uppercase mr-2 md:mr-4">ational</span>
                  <span className="font-imperial-script text-[#00d4ff] text-4xl md:text-8xl lg:text-[9rem] leading-none select-none font-normal translate-y-[0.05em] mr-0.5 md:mr-1">S</span>
                  <span className="font-clash-display tracking-widest text-white leading-none text-xl md:text-5xl lg:text-6xl font-extrabold uppercase">eminar</span>
                </span>
                <span className="flex items-baseline justify-center -mt-3 lg:-mt-6">
                  <span className="font-clash-display tracking-widest text-[#f5f7fa] leading-none text-lg md:text-4xl lg:text-5xl font-bold uppercase mr-1.5 md:mr-3">on</span>
                  <span className="font-imperial-script text-[#ffc82c] text-3xl md:text-7xl lg:text-[7.5rem] leading-none select-none font-normal translate-y-[0.05em] mr-0.5 md:mr-1">C</span>
                  <span className="font-clash-display tracking-widest text-[#f5f7fa] leading-none text-lg md:text-4xl lg:text-5xl font-bold uppercase">oming</span>
                </span>
              </h2>
              <p className="text-white/70 text-xs md:text-base max-w-xl mx-auto leading-relaxed font-serif opacity-75 px-1">
                Join us for an inspiring seminar featuring industry experts sharing insights on the latest trends and developments in AI and technology.
              </p>

              {/* Animated underline glow */}
              <div className="w-48 h-[2px] bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent mx-auto mt-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#00d4ff] blur-[3px]" />
              </div>
            </div>

          </div>
        </section>
      </div>

    </div>
  );
};

export default InfestWebsite;
