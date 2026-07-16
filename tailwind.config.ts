import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      "sm": "640px",
      "md": "768px",      
      "lg": "1025px",
    },
    extend: {
      boxShadow: {
        "balance-yellow-primary": "0px 0px 8px 1px rgba(253, 208, 38, 0.4)",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        blink: "blink 1.4s infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        "cattedrale": ["'Clash Display'", "sans-serif"],
        "cattedrale-outline": ["'Clash Display'", "sans-serif"],
        "imbue": ["'Clash Display'", "sans-serif"],
        "pixel-game": ["'Clash Display'", "sans-serif"],
        "clash-display": ["'Clash Display'", "sans-serif"],
        "astralaga": ["'Astralaga'", "serif"],
        "imperial-script": ["var(--font-imperial-script)", "cursive"]
      },
      colors: {  
        "primary": "#001540",      
        "secondary": "#000d2a",      
        "primary-yellow": "#FDD026",
        "secondary-yellow": "#B89926",       
        "brand_01": "#2596BE", // Teal Cyan (accent)
        "brand_02": "#00133C", // Deep Navy (dominant)
        "brand_03": "#000a24", // Blackish Navy
        "brand_04": "#143d52", // Medium Dark Teal
        "brand_05": "#1a6e8e", // Medium Teal
        "neutral_01": "#FFFFFF", // White
        "neutral_02": "#FDD026", // Gold
      },
    },
  },
  plugins: [],
};

export default config;