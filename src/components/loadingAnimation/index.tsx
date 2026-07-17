import { dm_serif_display } from "@/app/fonts/fonts";
import Image from "next/image";
import React from "react";

// interface LoadingAnimationProps {
//   loadingText: string;
//   variant?: "floating" | "standard";
// }

export const LoadingAnimation = ({ loadingText } : { loadingText: string }) => {
  return (
    <div className={`h-screen w-screen overflow-hidden bg-brand_02/60 flex flex-col justify-center items-center z-50`}>
      <Image
        src="/assets/images/logo_hero.PNG?v=2"
        alt="Informatics Festival (Infest) HMIF USK Logo"
        width={500}
        height={500}
        className="object-contain h-24 w-24 filter drop-shadow-[0_0_40px_rgba(242,233,197,0.8)] mb-4"
      />
      <p
        className={`font-bold text-lg ${dm_serif_display.className} animate-blink text-neutral_01`}
      >
        {loadingText}...
      </p>
    </div>
  );
};
