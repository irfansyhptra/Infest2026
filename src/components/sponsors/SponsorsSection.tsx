"use client";

import { motion } from "motion/react";
import {
  sponsors as sponsorsData,
  mediaPartners as mediaPartnersData,
} from "@/data/sponsors";
import { cn } from "@/libs/helpers/cn";
import React, { useEffect, useRef, useState } from "react";
import { dm_serif_display } from "@/app/fonts/fonts";

type Sponsor = {
  id: number | string;
  name: string;
  logoUrl: string;
  className?: string;
};

// Convert Google Drive share links to a display-friendly image URL
// Prefer the thumbnail endpoint (tends to always return an image)
const driveToDirect = (url: string): string => {
  try {
    const match = url.match(/\/d\/([A-Za-z0-9_-]+)\//);
    const id = match?.[1];
    if (!id) return url;
    return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
  } catch {
    return url;
  }
};

// Fallback URL that serves the raw bytes when thumbnail fails
const driveToFallback = (url: string): string => {
  try {
    const match = url.match(/\/d\/([A-Za-z0-9_-]+)\//);
    const id = match?.[1];
    if (!id) return url;
    return `https://drive.google.com/uc?export=download&id=${id}`;
  } catch {
    return url;
  }
};

// Single sponsor tile (logo + name)
const SponsorTile: React.FC<{ sponsor: Sponsor }> = ({ sponsor }) => {
  const primary = driveToDirect(sponsor.logoUrl);
  const fallback = driveToFallback(sponsor.logoUrl);
  return (
    <div className="group relative aspect-[5/6] w-[260px] shadow-xl shadow-neutral_01/10 rounded-2xl bg-neutral_01/10 border border-primary-yellow/40 overflow-hidden transform-gpu transition-transform duration-500 ease-out hover:-translate-y-3 hover:translate-x-2 hover:shadow-2xl hover:shadow-neutral_01/30 hover:border-primary-yellow hover:z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      <div className="absolute inset-0 p-4 flex items-center justify-center">
        <img
          src={primary}
          alt={sponsor.name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            if (img.src !== fallback) img.src = fallback;
          }}
          className={cn("object-contain transition", sponsor.className)}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm border-t border-white/10 p-3">
        <p className="text-center text-sm font-semibold text-primary-yellow truncate">
          {sponsor.name}
        </p>
      </div>
    </div>
  );
};

// Animated vertical column (moves up/down) – forms the diagonal marquee when wrapped in tilted container
const AnimatedColumn: React.FC<{
  items: Sponsor[];
  colIndex: number;
  paused?: boolean;
  speedSec?: number; // duration of one cycle
  delaySec?: number; // start offset
}> = ({ items, colIndex, paused = false, speedSec = 30, delaySec = 0 }) => {
  // Duplicate the list so we can loop seamlessly
  const loopItems = [...items, ...items];
  const directionUp = colIndex % 2 === 0; // alternate direction per column

  return (
    <motion.div
      // Continuous marquee-style scrolling: move half the stack height then jump (seamless due to duplication)
      animate={
        paused
          ? { y: "0%" }
          : directionUp
          ? { y: ["0%", "-50%"] }
          : { y: ["-50%", "0%"] }
      }
      transition={{
        duration: speedSec,
        repeat: Infinity,
        ease: "linear",
        delay: delaySec,
      }}
      className="flex flex-col gap-6 will-change-transform"
    >
      {loopItems.map((s, i) => (
        <SponsorTile key={`${s.id}-${i}`} sponsor={s} />
      ))}
    </motion.div>
  );
};

const TiltedSponsors: React.FC<{
  sponsors: Sponsor[];
  mediaPartners: Sponsor[];
}> = ({ sponsors, mediaPartners }) => {
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () =>
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const cols = 3; // three independent columns using the full list

  const transformStyle = {
    transform: "rotateX(46deg) rotateZ(-32deg)",
    transformStyle: "preserve-3d",
    willChange: isMobile ? "auto" : "transform",
  } as React.CSSProperties;

  return (
    <div
      ref={containerRef}
      className="mx-auto block h-[520px] sm:h-[560px] lg:h-[600px] overflow-hidden w-full "
      style={{ perspective: 1200 }}
    >
      <div className="flex size-full items-center justify-start -translate-x-64 md:-translate-x-28 lg:-translate-x-20">
        <div className="w-full md:w-1/2 h-[1200px] shrink-0 scale-50 sm:scale-75 lg:scale-100">
          <div
            style={transformStyle}
            className="grid w-full h-full origin-center grid-cols-3 gap-x-[18rem] md:gap-x-72 lg:gap-x-20 transform-gpu md:bg-gradient-radial from-neutral_01/25 via-transparent to-transparent"
          >
            {Array.from({ length: cols }).map((_, i) => {
              const itemsForCol = i === 1 ? mediaPartners : sponsors;
              return (
                <AnimatedColumn
                  key={`col-${i}`}
                  items={itemsForCol}
                  colIndex={i}
                  speedSec={28 + i * 2}
                  delaySec={i * 1.5}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SponsorsSection: React.FC<{ className?: string }> = ({
  className,
}) => {
  const sponsors: Sponsor[] = (sponsorsData as Sponsor[]).map((s) => ({
    ...s,
  }));
  const mediaPartners: Sponsor[] = (mediaPartnersData as Sponsor[]).map(
    (s) => ({ ...s })
  );
  if (!sponsors?.length && !mediaPartners?.length) return null;

  return (
    <section
      id="sponsorships"
      className={cn(
        "relative w-full",
        "bg-gradient-to-tl from-neutral_01/10 via-transparent to-transparent",
        className
      )}
    > 
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 md:h-56 md:w-56 rounded-full bg-neutral_02/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 md:h-72 md:w-72 rounded-full bg-brand_01/10 blur-3xl" />

      <div className="relative z-10 flex gap-6 md:gap-8">
        {/* Tilted, diagonal marquee */}
        <TiltedSponsors sponsors={sponsors} mediaPartners={mediaPartners} />
        <div className="w-1/2 h-full py-4 md:py-8 lg:py-20 pr-4 md:pr-8 lg:pr-20 absolute right-0 flex flex-col gap-2 md:gap-4">
          <h2
            className={`text-3xl md:text-4xl w-full md:w-[60%] lg:w-full ml-auto lg:text-8xl text-end ${dm_serif_display.className} font-bold leading-none`}
          >
            Sponsorships and Media Partner
          </h2>
          <p className="flex md:hidden lg:flex text-[0.66rem] md:text-base text-end w-[75%] md:w-1/2 ml-auto">
            We are proud to partner with leading organizations in the tech
            industry to bring you the best experience at Infest XI.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
