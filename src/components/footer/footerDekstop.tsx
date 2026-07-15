"use client";

import Image from "next/image";
import React from "react";
import Link from "next/link";
import { scrollIntoSection } from "@/libs/helpers/scrollIntoSection";
import { socialAccounts } from "@/data/socialAccount";
import { usePathname } from "next/navigation";
import { useScreenSize } from "@/libs/hooks/screenSizeValidation";


const FooterDekstop = () => {
  const pathname = usePathname();
  const { isDesktop } = useScreenSize();
  if (!isDesktop) return null; // Only render on desktop
  return (
    <div className={`bg-brand_02 w-full flex justify-between px-8 md:px-12 py-8 text-neutral_01 relative ${pathname === "/dashboard" && 'ml-72'}`}>
      <div className="absolute w-2/3 h-[1px] top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-neutral_01/50 to-transparent"></div>
      <div className="flex flex-col justify-end text-sm w-1/3">
        <p className="font-bold text-base uppercase tracking-wide">Address</p>
        <p className="text-sm mt-3 text-balance">
          Jl. Syech Abdurrauf No.3, Kopelma Darussalam, Syiah Kuala District, Banda Aceh City, Aceh 23111, Indonesia
        </p>
      </div>
      <button onClick={() => scrollIntoSection("hero")} className="duration-200 hover:scale-110">
        <Image
          src={"/assets/images/logo_hero.PNG?v=2"}
          width={80}
          height={80}
          alt="Informatics Festival (Infest) HMIF USK"
          className="object-contain drop-shadow-lg filter drop-shadow-[0_0_8px_rgba(253,208,38,0.35)]"
        />
      </button>
      <div className="flex flex-col gap-2 justify-end text-sm items-end w-1/3">
        <div className="flex gap-2 mb-2">
          {socialAccounts.map((account) => (
            <Link key={account.id} href={account.url} className={`hover:scale-110 duration-200 text-neutral_01`} target="_blank">
              {account.iconComponent}
            </Link>
          ))}
        </div>
        <p className="text-xs text-end text-neutral_01/70">Copyright © {new Date().getFullYear()} | Himpunan Mahasiswa Informatika USK</p>
      </div>
    </div>
  );
};

export default FooterDekstop;
