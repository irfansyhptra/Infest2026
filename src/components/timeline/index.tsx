"use client";

import { dm_serif_display } from "@/app/fonts/fonts";
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useSpring } from "framer-motion";
import Image from "next/image";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

// 1. TIMELINE CARD COMPONENT (FUTURISTIC GLASSMORPHISM WITH NEON GLOW BORDER & HOVER STATE)
interface TimelineCardProps {
  children: React.ReactNode;
  index: number;
  image?: string;
}

export const TimelineCard = ({ children, index, image }: TimelineCardProps) => {
  return (
    <motion.article 
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="timeline-card-content bg-white/5 text-white rounded-[28px] md:rounded-[36px] border border-white/10 backdrop-blur-[12px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_0_30px_rgba(255,255,255,0.15),0_0_20px_rgba(167,139,250,0.15)] hover:bg-white/8 hover:border-[#A78BFA]/40 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_0_45px_rgba(255,255,255,0.25),0_0_25px_rgba(167,139,250,0.5)] hover:scale-[1.01] transition-all duration-300 w-full h-[480px] md:h-[530px] flex flex-col justify-between animate-fade-in relative overflow-hidden [&_h3]:text-2xl [&_h3]:md:text-3xl [&_h3]:font-extrabold [&_p]:text-base [&_p]:md:text-lg [&_p]:leading-relaxed"
    >
      {/* Decorative soft glowing spot inside the card */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#A78BFA]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Card Content Node - Top Half */}
      <div className="w-full relative z-10 p-6 md:p-8 pb-2 flex-1 flex flex-col justify-center">
        {children}
      </div>

      {/* Card Image Node - Bottom Half with Padding */}
      <div className="w-full px-6 pb-6 pt-2 shrink-0">
        <div className="w-full h-[150px] md:h-[190px] relative overflow-hidden rounded-[20px] md:rounded-[24px] bg-white/5 border border-white/5 shadow-inner">
          <AnimatePresence mode="wait">
            {image ? (
              <motion.div
                key={image}
                initial={{ opacity: 0, scale: 1.05, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(6px)" }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={image}
                  alt="Timeline event photo"
                  fill
                  className="object-cover rounded-[20px] md:rounded-[24px]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/20 text-sm">
                No Image Available
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
};

// 2. TIMELINE ITEM COMPONENT (GLOWING CYAN NODES & TEXT ACTIVE STATE)
interface TimelineItemProps {
  title: string;
  content: React.ReactNode;
  index: number;
  activeCard: number;
  image?: string;
}

export const TimelineItem = ({ title, content, index, activeCard, image }: TimelineItemProps) => {
  const isActive = activeCard === index;

  return (
    <div className="timeline-item relative z-10">
      {/* Mobile Layout (Stacked Date + Card) */}
      <div className="block md:hidden">
        <div 
          className="flex items-start gap-4 mb-4"
          data-aos="fade-right"
          data-aos-delay={`${index * 150}`}
          data-aos-duration="800"
        >
          <div className="timeline-dot h-4 w-4 rounded-full bg-white/20 shadow-sm flex-shrink-0 mt-1"></div>
          <div>
            <h3 className={`text-lg font-bold text-white mb-2 ${dm_serif_display.className}`}>
              {title}
            </h3>
            <div className="w-20 h-px bg-gradient-to-r from-white/40 to-transparent mb-4"></div>
          </div>
        </div>
        <div 
          className="ml-8"
          data-aos="fade-up"
          data-aos-delay={`${index * 150 + 100}`}
          data-aos-duration="800"
        >
          <TimelineCard index={index} image={image}>{content}</TimelineCard>
        </div>
      </div>

      {/* Desktop Layout (Sticky-Swapped Date) */}
      <div className="hidden md:flex items-center gap-6 select-none pl-6 lg:pl-10 min-h-[140px]">
        {/* Dot */}
        <div className={`timeline-dot w-5 h-5 rounded-full flex-shrink-0 transition-all duration-300 ${
          isActive 
            ? "bg-[#22D3EE] scale-125 shadow-[0_0_12px_rgba(34,211,238,0.8)]" 
            : "bg-white/20 scale-100"
        }`} />
        
        {/* Title */}
        <motion.h3
          animate={{
            opacity: isActive ? 1 : 0.4,
            scale: isActive ? 1.05 : 1,
            x: isActive ? 10 : 0,
          }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          className={`text-2xl lg:text-3xl font-bold text-white ${dm_serif_display.className}`}
        >
          {title}
        </motion.h3>
      </div>
    </div>
  );
};

// 3. TIMELINE SECTION COMPONENT (MAIN EXPORT - FUTURISTIC NEON GLASS CONTAINER)
export const Timeline = ({ data }: { data: { title: string; content: React.ReactNode; image?: string }[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const columnsWrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [activeCard, setActiveCard] = useState(0);
  const [totalScroll, setTotalScroll] = useState(0);
  const [trackH, setTrackH] = useState(0);
  const cardLength = data.length;

  // Track parent scroll progress natively using Framer Motion
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 96px", "end end"], // Matches top-24 (96px) sticky offset
  });

  // Map progress to local layout translation coordinates
  const yTransform = useTransform(scrollYProgress, [0, 1], [0, -totalScroll]);
  const scaleYTransform = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const orbYTransform = useTransform(scrollYProgress, [0, 1], [0, trackH]);

  // Apply spring physics for ultra-smooth fluid motion
  const springConfig = { damping: 20, stiffness: 90, mass: 0.5 };
  const y = useSpring(yTransform, springConfig);
  const scaleY = useSpring(scaleYTransform, springConfig);
  const orbY = useSpring(orbYTransform, springConfig);

  // Listen to progress changes to trigger content swapping
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const index = Math.min(cardLength - 1, Math.floor(latest * cardLength));
    setActiveCard((prev) => (prev !== index ? index : prev));
  });

  // Calculate and watch layout sizes dynamically
  useEffect(() => {
    const measure = () => {
      if (scrollRef.current && viewportRef.current) {
        const scrollH = scrollRef.current.scrollHeight;
        const viewH = columnsWrapperRef.current ? columnsWrapperRef.current.clientHeight : viewportRef.current.clientHeight;
        setTotalScroll(Math.max(10, scrollH - viewH));
        // Desktop Line Track height is viewH minus padding-top (96px) and padding-bottom (112px)
        setTrackH(Math.max(0, viewH - 96 - 112));
      }
    };

    measure();
    window.addEventListener("resize", measure);

    let resizeObserver: ResizeObserver | null = null;
    if (scrollRef.current) {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(scrollRef.current);
    }

    return () => {
      window.removeEventListener("resize", measure);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [data]);

  return (
    <section className="w-full h-auto md:h-[300vh] relative pt-4 pb-8 md:pt-6 md:pb-10 px-6 md:px-16 lg:px-24 xl:px-36" ref={containerRef}>
      
      {/* Viewport container: Sits 16px below the 80px navbar, total 96px (top-24) */}
      <div 
        ref={viewportRef} 
        className="sticky top-24 w-full h-auto md:h-[calc(100vh-120px)] overflow-visible z-10 flex flex-col pt-8 pb-12 md:pb-20 gap-8 md:gap-12 rounded-3xl"
      >
        
        {/* Futuristic Glassmorphism Master Background Container */}
        <div className="absolute inset-0 bg-white/5 z-0 pointer-events-none overflow-hidden rounded-3xl border border-white/10 backdrop-blur-[12px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_10px_30px_rgba(0,0,0,0.3)]">
          {/* Subtle neon glow leaks at the top-left and bottom-right */}
          <div className="absolute -top-24 left-[15%] w-[40vw] h-[30vh] bg-[#22D3EE]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 right-[25%] w-[35vw] h-[25vh] bg-[#F472B6]/10 rounded-full blur-[80px] pointer-events-none" />
          
          {/* Top edge glowing gradient border highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#22D3EE]/30 to-transparent" />
          {/* Bottom edge glowing gradient border highlight */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#A78BFA]/20 to-transparent" />
        </div>

        {/* 1. Header (Title + Subtitle + Mascot - Glowing white text) */}
        <header className="w-full flex flex-col md:flex-row gap-4 items-center justify-between relative z-10 px-6 md:px-12">
          <div className="flex items-center gap-4">
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold text-white text-balance drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] ${dm_serif_display.className}`}>
              Timeline
            </h2>
            {/* Mascot Element */}
            <div className="timeline-mascot relative w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28 shrink-0 select-none pointer-events-none flex items-center justify-center">
              {/* Golden Glow Behind Mascot Logo */}
              <div className="absolute w-[80%] h-[80%] bg-gradient-to-r from-[#FDD026] to-[#FFE885] rounded-full blur-[24px] opacity-70 animate-pulse z-0" style={{ animationDuration: "3s" }} />
              {/* Inner golden glow dot */}
              <div className="absolute w-[50%] h-[50%] bg-[#FDD026] rounded-full blur-[10px] opacity-55 z-0" />
              <Image
                src="/assets/images/logo_hero.PNG?v=2"
                alt="Infest Mascot"
                fill
                className="object-contain filter drop-shadow-[0_0_15px_rgba(253,208,38,0.75)] drop-shadow-[0_0_30px_rgba(253,208,38,0.45)] relative z-10"
              />
            </div>
          </div>
          <div className="flex-1 max-w-md h-0.5 bg-gradient-to-r from-[#22D3EE]/30 via-[#A78BFA]/10 to-transparent hidden md:block"></div>
          <p className="text-white/60 text-xs md:text-sm text-center md:text-right max-w-xs font-medium">
            Alur timeline penting pelaksanaan rangkaian acara dan pendaftaran kompetisi <span className="text-[#22D3EE] font-semibold">InFest XII 2026</span>.
          </p>
        </header>

        <div 
          ref={columnsWrapperRef}
          className="w-full flex-1 flex flex-col md:flex-row md:justify-between items-center md:items-start overflow-visible relative z-10 gap-8 lg:gap-16 px-6 md:px-12"
        >
          {/* Left Column: Scrollable Dates (Desktop) or stacked elements (Mobile) */}
          <div className="w-full md:w-[38%] h-full relative overflow-visible md:overflow-hidden z-10">
            <motion.div 
              ref={scrollRef} 
              style={{ y: typeof window !== "undefined" && window.innerWidth >= 768 ? y : 0 }}
              className="relative md:absolute top-0 left-0 w-full flex flex-col gap-12 md:gap-36 pt-6 md:pt-24 pb-8 md:pb-28"
            >
              {/* Static Vertical Line - Mobile (Inside scrollable container, scrolls naturally) */}
              <div 
                className="block md:hidden absolute left-2 top-8 bottom-12 w-0.5 bg-gradient-to-b from-white/20 via-white/10 to-transparent z-20 pointer-events-none"
              />

              {data.map((item, index) => (
                <TimelineItem 
                  key={index}
                  title={item.title}
                  content={item.content}
                  index={index}
                  activeCard={activeCard}
                  image={item.image}
                />
              ))}
            </motion.div>
          </div>

          {/* Vertical Line - Mobile (Fixed inside viewport - Never spills) */}
          <div 
            className="block md:hidden absolute left-2 top-24 bottom-28 w-0.5 bg-gradient-to-b from-transparent via-white/15 to-transparent z-20 pointer-events-none"
          >
            {/* Glowing active progress line */}
            <motion.div
              style={{ scaleY, transformOrigin: "top" }}
              className="absolute inset-x-0 top-0 w-full bg-gradient-to-b from-[#22D3EE] via-[#A78BFA] to-[#F472B6] rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]"
            />
            {/* Glowing active progress orb tip */}
            <motion.div 
              style={{ y: orbY }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.5)] z-30"
            >
              {/* Outer pulsing ring */}
              <div className="absolute inset-[-4px] rounded-full border border-[#22D3EE] animate-ping opacity-75" />
            </motion.div>
          </div>
          
          {/* Vertical Line - Desktop (Fixed inside viewport - Never spills) */}
          <div
            className="hidden md:block absolute left-[34px] lg:left-[50px] top-24 bottom-28 w-1 bg-gradient-to-b from-transparent via-white/15 to-transparent z-20 pointer-events-none"
          >
            {/* Glowing active progress line */}
            <motion.div
              style={{ scaleY, transformOrigin: "top" }}
              className="absolute inset-x-0 top-0 w-full bg-gradient-to-b from-[#22D3EE] via-[#A78BFA] to-[#F472B6] rounded-full shadow-[0_0_10px_rgba(34,211,238,0.6),0_0_20px_rgba(167,139,250,0.3)]"
            />
            {/* Glowing active progress orb tip */}
            <motion.div 
              style={{ y: orbY }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#22D3EE] shadow-[0_0_12px_rgba(34,211,238,0.8),0_0_20px_rgba(167,139,250,0.5)] z-30"
            >
              {/* Outer pulsing ring */}
              <div className="absolute inset-[-6px] rounded-full border border-[#22D3EE] animate-ping opacity-75" />
            </motion.div>
          </div>

          {/* Right Column: Sticky Active Card Content (Desktop only) */}
          <div className="hidden md:flex w-full md:w-[58%] h-full items-center justify-center pr-6 lg:pr-10 z-10">
            <div className="w-full relative z-20">
              <TimelineCard index={activeCard} image={data[activeCard].image}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCard}
                    initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    {data[activeCard].content}
                  </motion.div>
                </AnimatePresence>
              </TimelineCard>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};