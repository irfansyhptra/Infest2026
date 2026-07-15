"use client";

import Image from "next/image";
import React from "react";
import Link from "next/link";
import { scrollIntoSection } from "@/libs/helpers/scrollIntoSection";
import { socialAccounts } from "@/data/socialAccount";
import { usePathname } from "next/navigation";
import { useScreenSize } from "@/libs/hooks/screenSizeValidation";


const FooterMobile = () => {
  const { isDesktop } = useScreenSize();
  if (isDesktop) return null;
  return (
    <div className={`bg-brand_02 w-full flex flex-col px-6 py-8 gap-4 text-neutral_01 items-center relative`}>
      <div className="absolute w-1/2 h-[1px] top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-neutral_01/50 to-transparent"></div>
      <button onClick={() => scrollIntoSection("hero")} className="duration-200 hover:scale-110">
        <Image
          src={"/assets/images/logo_hero.PNG?v=2"}
          width={60}
          height={60}
          alt="Informatics Festival (Infest) HMIF USK Logo"
          className="object-contain drop-shadow-lg filter drop-shadow-[0_0_6px_rgba(253,208,38,0.35)]"
        />
      </button>
      <div className="flex gap-3 mt-2">
        {socialAccounts.map((account) => (
          <Link
            key={account.id}
            target="_blank"
            href={account.url}
            className="hover:scale-110 duration-200 text-neutral_01"
            aria-label={account.id}
          >
            {account.iconComponent}
          </Link>
        ))}
      </div>
      <div className="text-sm text-center w-full">
        <p className="font-bold uppercase tracking-wide">Address</p>
        <p className="mt-2.5 text-xs">
          Jl. Syech Abdurrauf No.3, Kopelma Darussalam, Syiah Kuala District, Banda Aceh City, Aceh 23111, Indonesia
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full mt-2.5">
        <p className="text-xs text-center text-neutral_01/70">
          Copyright © {new Date().getFullYear()} | Himpunan Mahasiswa Informatika USK
        </p>
      </div>
    </div>
  );
};

export default FooterMobile;
