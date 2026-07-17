"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/libs/services/authService";
import { scrollIntoSection } from "@/libs/helpers/scrollIntoSection";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { montserrat, dm_serif_display } from "@/app/fonts/fonts";
import dynamic from "next/dynamic";

const LiquidGlassNav = dynamic(
  () => import("@/components/glass/liquid/LiquidGlassNav").then((m) => m.LiquidGlassNav),
  { ssr: false }
);

// --- SVG Icons ---
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const TimelineIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CompetitionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
    <path d="M12 2a6 6 0 0 0-6 6v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6V8a6 6 0 0 0-6-6z" />
  </svg>
);

const SeminarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const LoginIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

export const Navbar = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const isManualScrollRef = useRef(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const headerRef = useRef<HTMLElement>(null);

  // Fase 3 of the page's load sequence: desktop navbar slides in only after
  // the hero entrance (page.tsx) reports it has finished, so they never
  // visually compete. Falls back to a timed reveal if that event never
  // arrives (e.g. hero timeline errors out) — nav must not stay hidden.
  useGSAP(() => {
    const el = headerRef.current;
    if (!el) return;
    gsap.set(el, { y: "-100%", opacity: 0 });
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      gsap.to(el, { y: "0%", opacity: 1, duration: 0.9, ease: "power3.out" });
    };
    window.addEventListener("infest:hero-ready", reveal, { once: true });
    const fallback = window.setTimeout(reveal, 2500);
    return () => {
      window.removeEventListener("infest:hero-ready", reveal);
      window.clearTimeout(fallback);
    };
  }, []);

  const navMenuItems = [
    { id: "home", name: "Home", icon: <HomeIcon />, destinationSection: "home" },
    { id: "competition", name: "Competition", icon: <CompetitionIcon />, destinationSection: "competition" },
    { id: "timeline", name: "Timeline", icon: <TimelineIcon />, destinationSection: "timeline" },
    { id: "seminar", name: "Seminar", icon: <SeminarIcon />, destinationSection: "seminar" },
  ];

  // Detect desktop vs mobile/tablet using lg breakpoint (1024px)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsDesktop(e.matches);
    handler(mediaQuery);
    mediaQuery.addEventListener("change", handler as (e: MediaQueryListEvent) => void);
    return () => mediaQuery.removeEventListener("change", handler as (e: MediaQueryListEvent) => void);
  }, []);

  // Check user authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { user } = await authService.getCurrentUser();
      setIsUserAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isManualScrollRef.current) return;
      const triggerPoint = 300;
      let currentActive = "home";
      const sectionsToCheck = [...navMenuItems].reverse();
      for (const item of sectionsToCheck) {
        if (item.destinationSection === "home") continue;
        const el = document.getElementById(item.destinationSection);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerPoint) {
            currentActive = item.id;
            break;
          }
        }
      }
      setActiveSection(currentActive);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (dest: string) => {
    isManualScrollRef.current = true;
    setActiveSection(dest);
    if (dest === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      scrollIntoSection(dest, 80);
    }
    setTimeout(() => {
      isManualScrollRef.current = false;
    }, 1500);
  };

  const handleAuthClick = () => {
    if (isUserAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  };

  // Hide header on auth/dashboard pages
  const hideOnPages = ["/auth", "/dashboard"];
  if (hideOnPages.some((path) => pathname.startsWith(path))) return null;

  const items = navMenuItems.map((item) => ({
    id: item.id,
    label: item.name,
    icon: item.icon,
    onClick: () => handleNavClick(item.destinationSection),
  }));

  // ─── DESKTOP: Top Bar ───────────────────────────────────────
  if (isDesktop) {
    return (
      <header
        ref={headerRef}
        className="fixed top-5 left-0 right-0 mx-auto w-[94%] max-w-7xl z-[100] pointer-events-none"
      >
        <div className="w-full h-20 rounded-full border border-white/10 px-6 md:px-8 flex items-center justify-between backdrop-blur-xl relative overflow-hidden bg-slate-950/40 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.65),inset_0_1px_0px_rgba(255,255,255,0.15)]">
          {/* Left Side: Logo */}
          <div className="flex items-center pointer-events-auto">
            <button
              onClick={() => handleNavClick("home")}
              className="flex items-center gap-2 hover:scale-105 transition-all duration-300 focus:outline-none"
            >
              <Image
                src="/assets/images/logo_hero.PNG?v=2"
                alt="INFEST Logo"
                width={68}
                height={68}
                className="object-contain filter drop-shadow-[0_0_10px_rgba(37,150,190,0.4)] w-14 h-14 md:w-16 md:h-16"
                priority
              />
            </button>
          </div>

          {/* Center Side: Desktop LiquidGlass Nav */}
          <div className="flex items-center pointer-events-auto">
            <LiquidGlassNav
              items={items}
              activeItem={activeSection}
              onItemChange={setActiveSection}
              activeColor="rgba(255, 255, 255, 0.95)"
              inactiveColor="rgba(255, 255, 255, 0.55)"
              style={{
                position: 'relative',
                bottom: 'auto',
                left: 'auto',
                transform: 'none',
                height: '64px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '32px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: 'none',
                zIndex: 'auto',
                display: 'flex',
                alignItems: 'center',
                padding: '0 4px'
              }}
            />
          </div>

          {/* Right Side: Desktop Login */}
          <div className="flex items-center gap-4 pointer-events-auto">
            <button
              onClick={handleAuthClick}
              className="font-astralaga relative overflow-hidden px-12 py-3 rounded-full bg-gradient-to-r from-amber-500 via-yellow-100 to-amber-500 text-slate-950 font-bold text-sm md:text-base tracking-wide border border-yellow-300/60 shadow-[0_0_30px_rgba(245,158,11,0.45),0_0_12px_rgba(255,255,255,0.3),inset_0_2px_1px_rgba(255,255,255,0.85),inset_0_-2px_1px_rgba(0,0,0,0.15)] hover:scale-105 hover:shadow-[0_0_35px_rgba(245,158,11,0.6),0_0_15px_rgba(255,255,255,0.45),inset_0_2px_1px_rgba(255,255,255,0.95)] transition-all duration-300 active:scale-95"
            >
              <span className="relative z-10">{isUserAuthenticated ? "Dashboard" : "Login"}</span>
              <motion.div
                className="absolute inset-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/75 to-transparent -skew-x-12 pointer-events-none"
                animate={{ left: ["-120%", "220%"] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                  repeatDelay: 1.2
                }}
              />
            </button>
          </div>
        </div>
      </header>
    );
  }

  // ─── MOBILE / TABLET: macOS-style Bottom Dock ───────────────
  const activeIndex = navMenuItems.findIndex(i => i.id === activeSection);
  const totalItems = navMenuItems.length + 1; // +1 for login button

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto w-[94%] max-w-[420px] mb-3 pointer-events-auto">
        <div
          ref={dockRef}
          className="relative flex items-end justify-around rounded-[22px] border border-white/[0.12] px-2 pt-2 pb-2.5"
          style={{
            background: "linear-gradient(135deg, rgba(10, 24, 72, 0.82), rgba(10, 24, 72, 0.6))",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            boxShadow: "0 -4px 30px rgba(0,0,0,0.35), 0 0 1px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.15)"
          }}
        >
          {/* Nav Items */}
          {navMenuItems.map((item, index) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                ref={(el) => { itemRefs.current[index] = el; }}
                onClick={() => handleNavClick(item.destinationSection)}
                className="relative flex flex-col items-center justify-end focus:outline-none z-10 min-w-0"
                style={{ flex: 1 }}
              >
                {/* Glassmorphic floating bubble — positioned pixel-perfectly above active item */}
                {isActive && (
                  <motion.div
                    layoutId="dock-bubble"
                    className="absolute pointer-events-none z-0"
                    style={{
                      width: 52,
                      height: 64, // taller bubble stretching upwards
                      borderRadius: 20,
                      top: -20, // pushed further up
                      left: "50%",
                      marginLeft: -26, // centered perfectly relative to the button's middle point
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                      mass: 0.7,
                    }}
                  >
                    {/* Bubble glass layers */}
                    <div
                      className="absolute inset-0 rounded-[20px]"
                      style={{
                        background: "linear-gradient(135deg, rgba(37, 150, 190, 0.3), rgba(253, 208, 38, 0.15), rgba(37, 150, 190, 0.2))",
                        backdropFilter: "blur(20px) saturate(160%)",
                        WebkitBackdropFilter: "blur(20px) saturate(160%)",
                        border: "1px solid rgba(255, 255, 255, 0.22)",
                        boxShadow: "0 8px 32px rgba(37, 150, 190, 0.35), inset 0 1px 2px rgba(255,255,255,0.25), 0 0 15px rgba(253, 208, 38, 0.12)",
                      }}
                    />
                    {/* Inner highlight reflection */}
                    <div
                      className="absolute top-[2px] left-[3px] right-[3px] h-[45%] rounded-t-[16px] pointer-events-none"
                      style={{
                        background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)",
                      }}
                    />
                  </motion.div>
                )}

                {/* Icon container */}
                <motion.div
                  animate={{
                    y: isActive ? -16 : 0,
                    scale: isActive ? 1.2 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 450, damping: 24 }}
                >
                  <div
                    className={`transition-all duration-300 ${
                      isActive
                        ? "text-white drop-shadow-[0_0_10px_rgba(37,150,190,0.7)]"
                        : "text-white/40"
                    }`}
                  >
                    {item.icon}
                  </div>
                </motion.div>

                {/* Label */}
                <motion.span
                  animate={{
                    opacity: isActive ? 1 : 0.4,
                    y: isActive ? -10 : 0,
                    scale: isActive ? 1.05 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 450, damping: 24 }}
                  className="text-[8px] font-bold mt-0.5 tracking-wider uppercase select-none"
                  style={{
                    fontFamily: "Astralaga, serif",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {item.name}
                </motion.span>

                {/* Active dot */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#2596BE] shadow-[0_0_6px_rgba(37,150,190,0.8)]"
                    />
                  )}
                </AnimatePresence>
              </button>
            );
          })}

          {/* Login / Dashboard Button */}
          <button
            onClick={handleAuthClick}
            className="relative flex flex-col items-center justify-end focus:outline-none z-10 min-w-0"
            style={{ flex: 1 }}
          >
            <div className="text-[#FDD026] drop-shadow-[0_0_6px_rgba(253,208,38,0.4)]">
              <LoginIcon />
            </div>
            <span
              className="text-[8px] font-bold mt-0.5 text-[#FDD026]/70 tracking-wider uppercase select-none"
              style={{ fontFamily: "Astralaga, serif" }}
            >
              {isUserAuthenticated ? "Panel" : "Login"}
            </span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};
