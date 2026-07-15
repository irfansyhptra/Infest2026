"use client";
 
import React from "react";
import { motion } from "framer-motion";
import { montserrat } from "@/app/fonts/fonts";
 
interface NavItemProps {
  name: string;
  destinationSection: string;
  isActive: boolean;
  onClick: () => void;
}
 
export const NavItem = ({ name, destinationSection, isActive, onClick }: NavItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`font-astralaga relative px-5 py-2.5 text-sm lg:text-base font-extrabold transition-all duration-300 focus:outline-none rounded-full ${
        isActive ? "text-[#2596BE]" : "text-white/80 hover:text-white"
      }`}
    >
      <span className="relative z-10">{name}</span>
      {isActive && (
        <motion.div
          layoutId="navbar-active-pill"
          className="absolute inset-0 bg-white/5 border border-white/10 rounded-full shadow-[0_4px_12px_rgba(255,255,255,0.05)] z-0 backdrop-blur-md"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </button>
  );
};
