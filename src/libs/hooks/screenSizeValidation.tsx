import { useState, useEffect } from "react";

export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({
        isMobile: window.matchMedia("(max-width: 768px)").matches,
        isTablet: window.matchMedia("(min-width: 769px) and (max-width: 1024px)").matches,      
        isDesktop: window.matchMedia("(min-width: 1025px)").matches,
      });
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  return screenSize;
};
