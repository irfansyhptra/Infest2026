"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ImageSliderProps {
  images: string[];
  className?: string;
  animateOnScroll?: boolean;
}

export const ImageSlider: React.FC<ImageSliderProps> = ({ images, className, animateOnScroll = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!animateOnScroll) return;
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll(".gallery-card");
      
      // Initialize all cards to hidden state for smooth entry
      gsap.set(cards, {
        opacity: 0,
        y: 80,
        scale: 0.9,
        filter: "blur(8px)",
      });

      // Use ScrollTrigger.batch to stagger cards entering the viewport together
      ScrollTrigger.batch(cards, {
        start: "top 90%",
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            stagger: 0.15,
            duration: 1.2,
            ease: "power3.out",
            overwrite: "auto",
          });
        },
        // We only animate once as they scroll down
        once: true,
      });
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={`w-full ${className || ""}`}>
      <div
        className={`grid gap-6 ${
          images.length <= 3
            ? "grid-cols-1 sm:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
        }`}
      >
        {images.map((img, index) => (
          <div
            key={index}
            className="gallery-card swiper-slide-card marquee-card-item w-full relative bg-white rounded-t-full rounded-b-[24px] p-3 pb-6 shadow-xl hover:-translate-y-2 hover:shadow-[0_20px_35px_rgba(0,0,0,0.15)] transition-all duration-500 flex flex-col group border border-slate-100"
          >
            {/* Arch Top Image Container */}
            <div className="relative w-full aspect-[2/3] rounded-t-full rounded-b-xl overflow-hidden bg-slate-50 shadow-inner">
              <img
                src={img}
                alt={`Memory ${index + 1}`}
                loading="lazy"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
            </div>
            {/* Bottom Card Content */}
            <div className="flex flex-col items-center justify-center pt-5 pb-1 flex-grow">
              <span className="text-[#00133C]/40 font-mono text-[10px] font-bold tracking-widest uppercase">
                INFEST GALLERY
              </span>
              <h4 className="text-[#00133C] font-clash-display text-sm md:text-base font-bold mt-1 tracking-wide">
                Memory #{index + 1}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
