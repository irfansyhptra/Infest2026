import { Montserrat, Imperial_Script } from "next/font/google";

export const montserrat = Montserrat({
  subsets: ["latin"],
});

export const imperialScript = Imperial_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-imperial-script",
});

export const dm_serif_display = {
    className: "font-clash-display",
};

export const public_sans = {
    className: "font-sans",
};

export const nuosu_sil = {
    className: "font-sans",
};

export const plus_jakarta_sans = {
    className: "font-sans",
};