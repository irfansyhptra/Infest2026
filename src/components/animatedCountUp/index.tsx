"use client";

import { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";

interface AnimatedCountUpProps {
  start?: number;
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  separator?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const AnimatedCountUp = ({
  start=0,
  end,
  prefix = "",
  suffix = "",
  duration = 2,
  separator = ",",
  className,
  style,
}: AnimatedCountUpProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!ref.current || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect(); // stop observing once triggered
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <div ref={ref}>
      {hasAnimated && (
        <CountUp
          separator={separator}
          start={start}
          end={end}
          prefix={prefix}
          suffix={suffix}
          duration={duration}
          className={className}
          style={style}
        />
      )}
    </div>
  );
};
