---
name: Informatics Festival XI 2025
description: Vibrant, high-energy tech festival brand system
colors:
  primary: "#001540"
  secondary: "#000d2a"
  accent-yellow: "#FDD026"
  accent-yellow-dim: "#B89926"
  accent-teal: "#2596BE"
  neutral-white: "#FFFFFF"
  navy-dominant: "#00133C"
  navy-blackish: "#000a24"
  teal-dark: "#143d52"
  teal-medium: "#1a6e8e"
typography:
  display:
    fontFamily: "Astralaga, serif"
    fontSize: "clamp(2rem, 5vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.1
  body:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "4px"
  md: "8px"
  lg: "18px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent-yellow}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-white}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
---

# Design System: Informatics Festival XI 2025

## 1. Overview

**Creative North Star: "The Electric Tech Arena"**

The Informatics Festival XI 2025 (InFest) brand system is built as a high-contrast, energetic tech arena. It draws inspiration from night-time digital venues, e-sports, and hackathons. It intentionally rejects the muted, warm-neutral "beige SaaS" monoculture of standard AI-generated layouts, choosing instead saturated deep navy blues, bright cyan accents, and hot solar gold highlights. 

Design elements are crisp and high-contrast, conveying academic prestige through clean organization while maintaining youthful, tech-focused excitement. Spacing is dense but legible, and layout structures utilize a modular grid that is responsive and readable.

**Key Characteristics:**
- **Dominant Saturated Backgrounds**: Saturated primary blue (#2652C8) and dark navy backdrops.
- **Electric Highlights**: High-impact gold and cyan accents reserved strictly for CTAs and highlights.
- **Impact Typography**: Pairing high-personality display headings (Clash Display) with functional geometric body text (Montserrat).
- **Tactile Transitions**: Instant, snappy hover states instead of sluggish or bouncing animations.

## 2. Colors

The color palette is divided into deep, dominant backgrounds, vibrant active highlights, and clean, readable neutrals.

### Primary
- **Midnight Cyber Blue** (#001540): Used for primary layout backgrounds and heavy container fills.
- **Abyssal Navy** (#000d2a): The deepest shade, used for dark sections, cards, and page backdrops.

### Accent
- **Electric Gold** (#FDD026): High-voltage yellow-gold used for primary actions, loaders, and key focal points.
- **Solar Gold** (#B89926): A dimmer gold used for borders, secondary accents, and hover-state borders.
- **Teal Cyan** (#2596BE): An energetic teal used for technology markers, status elements, and cyan illustrations.

### Neutral
- **Crisp White** (#FFFFFF): Used for body text, main titles, and neutral buttons to ensure maximum legibility.

### Named Rules
**The Gold Rarity Rule.** Electric Gold must be used on ≤10% of any given screen. Its rarity is the key to its power; if it is overused, it ceases to guide the eye.
**The Saturated Backdrop Rule.** Never use warm parchment, cream, sand, or light gray backgrounds. Layouts must remain either deeply saturated or clean off-white tinted towards cyan/blue.

## 3. Typography

**Hero Title Font:** Astralaga (with serif fallback)
**Display/Headline Font:** Clash Display (with sans-serif fallback)
**Body Font:** Montserrat (with sans-serif fallback)

### Hierarchy
- **Display** (Bold (600), clamp(2rem, 5vw, 4rem), 1.1): Used for large hero titles and section headings.
- **Headline** (Semi-Bold (600), 1.5rem to 2rem, 1.2): Used for card titles and category headers.
- **Body** (Regular (400), 1rem, 1.5): Used for paragraph content and descriptive text. Maximum line length capped at 75ch.
- **Label** (Medium (500), 0.875rem, letter-spacing: 0.05em): Used for status tags, buttons, and captions.

### Named Rules
**The Balanced Headline Rule.** All h1-h3 display headings must use `text-wrap: balance` to prevent single-word line wraps on mobile.

## 4. Elevation

The visual system uses flat surfaces layered on top of distinct background tints to create depth rather than soft, fuzzy dropshadows.

### Shadow Vocabulary
- **Ambient Yellow Glow** (`box-shadow: 0px 0px 8px 1px rgba(253, 208, 38, 0.4)`): Used under active hover states of primary cards or buttons to create a digital "glowing" effect.

### Named Rules
**The Flat-by-Default Rule.** Surfaces are flat at rest. Glowing shadows appear only as a response to interactive state changes (hover, focus).

## 5. Components

### Buttons
- **Shape:** Rounded corners (8px radius, `rounded-md`).
- **Primary:** Electric Gold background with Abyssal Navy text. Snappy opacity/border shift on hover.
- **Secondary / Ghost:** Transparent background with Crisp White border (1px) and text.

### Cards / Containers
- **Corner Style:** Large rounded corners (18px radius, `rounded-[18px]`).
- **Background:** Deep Navy (#00133C) or Abyssal Navy (#000d2a) to contrast against the brighter blue base page.
- **Border:** Sharp, fine 1px border using Solar Gold or Teal Cyan.
- **Internal Padding:** Generous padding (24px to 32px) to prevent layout crowding.

### Inputs / Fields
- **Style:** Flat background with a 1.5px border of Solar Gold or white.
- **Focus:** Border shifts to Electric Gold with a subtle outline glow.

### Navigation
- **Header:** Sticky top bar with a glassmorphism backdrop filter (blur 12px) over Midnight Cyber Blue, anchored with clean Montserrat links.

## 6. Do's and Don'ts

### Do:
- **Do** check contrast of body text on all backgrounds to maintain WCAG AA readability.
- **Do** wrap display text with `text-wrap: balance` to prevent awkward typography orphans.
- **Do** use Montserrat for high legibility in code snippets, tables, and dashboards.
- **Do** preserve the saturated electric blue/gold identity which represents the Informatics Festival.

### Don't:
- **Don't** use side-stripe borders (e.g. `border-l-2`) on cards. It is an overused AI layout tell.
- **Don't** use background-clip text gradients. Use solid colors (Electric Gold or white) for display titles.
- **Don't** use warm, beige, sand, or parchment backgrounds (e.g. `--paper`, `--cream`) that clash with the blue tech theme.
- **Don't** animate image elements on hover. Keep card background/border transition separate.
- **Don't** use bounce or elastic easing curves. Use clean exponential easing (`ease-out`).
