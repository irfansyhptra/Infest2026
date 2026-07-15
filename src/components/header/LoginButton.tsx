"use client";
 
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { montserrat } from "@/app/fonts/fonts";
 
interface LoginButtonProps {
  isUserAuthenticated: boolean;
}
 
export const LoginButton = ({ isUserAuthenticated }: LoginButtonProps) => {
  return (
    <Link href={isUserAuthenticated ? "/dashboard" : "/auth/login"} className="block">
      <motion.div
        whileHover={{ 
          scale: 1.05,
          boxShadow: "0 0 25px rgba(255, 200, 44, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
          filter: "brightness(1.05)"
        }}
        whileTap={{ scale: 0.95 }}
        className="font-astralaga relative flex items-center justify-center gap-2 px-6 py-2.5 md:py-3 rounded-full bg-gradient-to-b from-[#ffd24d] via-[#ffc82c] to-[#d99e00] text-[#00133C] font-extrabold text-sm md:text-base border-t border-white/60 border-b border-[#a67400]/40 shadow-[0_4px_12px_rgba(0,0,0,0.35),_0_8px_20px_-6px_rgba(255,200,44,0.5),_inset_0_1px_0_rgba(255,255,255,0.5)] cursor-pointer transition-all duration-300 relative overflow-hidden"
      >
        {/* Glossy light reflection effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none" />
        
        <User size={14} className="flex-shrink-0 text-[#00133C]" />
        <span>Login</span>
      </motion.div>
    </Link>
  );
};
