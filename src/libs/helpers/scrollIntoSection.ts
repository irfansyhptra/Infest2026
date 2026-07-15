export const scrollIntoSection = (sectionId: string, offset = 80) => {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const lenis = (window as any).lenis;
  if (lenis) {
    lenis.scrollTo(section, { offset: -offset });
  } else {
    const top = section.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  }
};
