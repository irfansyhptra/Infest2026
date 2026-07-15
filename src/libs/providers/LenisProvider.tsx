"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface LenisContextType {
  lenis: Lenis | null;
  scrollTo: (target: any, options?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => () => void;
}

const LenisContext = createContext<LenisContextType>({
  lenis: null,
  scrollTo: () => {},
  on: () => () => {},
});

export const useLenis = () => useContext(LenisContext);

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const pendingListenersRef = useRef<{ event: string; callback: (...args: any[]) => void }[]>([]);

  useEffect(() => {
    // Initialize Lenis with premium settings
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple-like easeOutExpo
      smoothWheel: true,
      syncTouch: false, // native touch scrolling synced with Lenis
      autoResize: true,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);
    (window as any).lenis = lenis;

    // Register GSAP ScrollTrigger to ensure it updates on Lenis scroll
    gsap.registerPlugin(ScrollTrigger);
    
    // Connect ScrollTrigger updates to Lenis scroll events
    const handleScrollTriggerUpdate = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", handleScrollTriggerUpdate);

    // Sync Lenis with GSAP's requestAnimationFrame ticker
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000); // gsap time is in seconds, lenis expects ms
    };
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    // Attach any pending listeners registered during initial render
    pendingListenersRef.current.forEach(({ event, callback }) => {
      lenis.on(event as any, callback);
    });
    pendingListenersRef.current = [];

    // Setup ResizeObserver to watch body height changes and resize Lenis
    let resizeObserver: ResizeObserver | null = null;
    if (typeof window !== "undefined" && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => {
        lenis.resize();
      });
      resizeObserver.observe(document.body);
    }

    // Intercept standard anchor links (e.g. #about) for smooth scrolling
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor && anchor.hash && anchor.origin === window.location.origin) {
        const targetElement = document.querySelector(anchor.hash) as HTMLElement | null;
        if (targetElement) {
          e.preventDefault();
          // Find if there is a fixed header to subtract height
          const header = document.querySelector("header");
          const headerOffset = header ? header.offsetHeight : 0;
          
          lenis.scrollTo(targetElement, {
            offset: -headerOffset,
            duration: 1.2,
          });
          
          // Push state without page jump
          window.history.pushState(null, "", anchor.hash);
        }
      }
    };
    document.addEventListener("click", handleAnchorClick);

    // Clean up
    return () => {
      document.removeEventListener("click", handleAnchorClick);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      gsap.ticker.remove(updateTicker);
      lenis.off("scroll", handleScrollTriggerUpdate);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
      if ((window as any).lenis === lenis) {
        delete (window as any).lenis;
      }
    };
  }, []);

  // Context methods wrapper
  const scrollTo = (target: any, options?: any) => {
    if (lenisRef.current) {
      let offset = options?.offset ?? 0;
      if (options?.useHeaderOffset) {
        const header = document.querySelector("header");
        offset = header ? -header.offsetHeight : 0;
      }
      lenisRef.current.scrollTo(target, {
        offset,
        ...options,
      });
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    if (lenisRef.current) {
      lenisRef.current.on(event as any, callback);
      return () => {
        if (lenisRef.current) {
          lenisRef.current.off(event as any, callback);
        }
      };
    } else {
      const listener = { event, callback };
      pendingListenersRef.current.push(listener);
      return () => {
        if (lenisRef.current) {
          lenisRef.current.off(event as any, callback);
        } else {
          pendingListenersRef.current = pendingListenersRef.current.filter((l) => l !== listener);
        }
      };
    }
  };

  return (
    <LenisContext.Provider value={{ lenis: lenisInstance, scrollTo, on }}>
      {children}
    </LenisContext.Provider>
  );
}
