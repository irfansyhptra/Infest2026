import React from "react";

export const Glass = ({ children, className }: { children: React.ReactNode, className: string }) => {
  return (
    <>
      <div className="glass-container glass-container--large border border-brand_01/40 p-6 rounded-[2rem]">
        <div className="glass-filter" />
        <div className="glass-overlay" />
        <div className="glass-specular" />
        <div className={`glass-content ${className}`}>
          {children}
        </div>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
        <filter
          id="lensFilter"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          filterUnits="objectBoundingBox"
        >
          <feComponentTransfer in="SourceAlpha" result="alpha">
            <feFuncA type="identity" />
          </feComponentTransfer>
          <feGaussianBlur in="alpha" stdDeviation="50" result="blur" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blur"
            scale="50"
            xChannelSelector="A"
            yChannelSelector="A"
          />
        </filter>
      </svg>
    </>
  );
};
