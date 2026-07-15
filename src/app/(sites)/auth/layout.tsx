"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  return (
    <div className="w-full h-full relative">
      <Link
        href={pathname !== `/auth/login` ? `/auth/login` : `/`}
        className="absolute top-8 left-8 flex items-center gap-2 text-neutral_01 hover:text-neutral_02 transition-colors duration-300 z-20"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">{pathname !== `/auth/login` ? `Kembali ke Login` : `Kembali ke Beranda`}</span>
      </Link>
      {children}
    </div>
  );
};

export default AuthLayout;
