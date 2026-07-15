"use client";

import { supabase } from "@/libs/services/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { 
  User, 
  Trophy, 
  Users, 
  LogOut, 
  Menu, 
  X,
  ChevronRight 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  query: string;
}

const menuItems: MenuItem[] = [
  {
    id: "profil",
    label: "Profil",
    icon: User,
    query: "profil"
  },
  {
    id: "tim",
    label: "Tim Anda",
    icon: Users,
    query: "tim"
  },
  {
    id: "kompetisi",
    label: "Kompetisi",
    icon: Trophy,
    query: "kompetisi"
  }
];

export const Sidebar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const currentMenu = searchParams.get("menu") || "profil";
  
  const handleLogout = async () => {
    const toastId = toast.loading("Memproses logout...");
    try {
      await supabase.auth.signOut();
      toast.success("Berhasil logout!", { id: toastId });
      router.push("/auth/login");
    } catch (error) {
      toast.error("Gagal logout!", { id: toastId });
    }
  };

  const handleMenuClick = (query: string) => {
    router.push(`/dashboard?menu=${query}`);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 right-4 z-[60] p-2 bg-neutral_01/10 backdrop-blur-md border border-neutral_01/20 rounded-xl text-neutral_01 hover:bg-neutral_01/20 transition-all duration-300"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 z-50 h-screen w-80 sm:w-72 lg:w-72 xl:w-80
        bg-neutral_01/5 backdrop-blur-xl border-neutral_01/10
        transition-all duration-300 ease-in-out
        lg:left-0 lg:translate-x-0 lg:border-r lg:shadow-none lg:z-40
        ${isMobileMenuOpen 
          ? 'right-0 translate-x-0 border-l shadow-2xl' 
          : 'right-0 translate-x-full lg:translate-x-0 lg:shadow-none'
        }
      `}>
        <div className="flex flex-col h-full p-4 sm:p-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8 pt-16 lg:pt-0">
            <Link href="/" className="flex items-center gap-3 mb-2">
              <Image
                src={'/assets/images/Infest 2025 1st Logo Outline.png'}
                alt="Infest 2025 Logo"
                width={100}
                height={100}
                className="w-10 h-10 sm:w-11 sm:h-11 filter drop-shadow-[0_0_10px_rgba(242,233,197,0.8)]"
              />
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-neutral_01">Dashboard</h2>
                <p className="text-xs sm:text-sm text-neutral_01/60">Infest 2025</p>
              </div>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentMenu === item.query;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.query)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 sm:px-4 sm:py-3 rounded-xl text-left
                      transition-all duration-300 group relative overflow-hidden touch-target
                      ${isActive 
                        ? 'bg-gradient-to-r from-neutral_02/20 to-primary-yellow/20 text-neutral_01 border border-neutral_02/30' 
                        : 'text-neutral_01/70 hover:text-neutral_01 hover:bg-neutral_01/5'
                      }
                    `}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-neutral_02 to-primary-yellow rounded-r-full" />
                    )}
                    
                    <Icon className={`w-5 h-5 transition-colors flex-shrink-0 ${isActive ? 'text-neutral_02' : ''}`} />
                    <span className="font-medium flex-1 text-sm sm:text-base">{item.label}</span>
                    
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-neutral_02 flex-shrink-0" />
                    )}
                    
                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-neutral_02/5 to-primary-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Logout Button */}
          <div className="pt-4 sm:pt-6 border-t border-neutral_01/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 sm:px-4 sm:py-3 rounded-xl text-left text-neutral_01/70 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 group touch-target"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
