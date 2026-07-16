import type { Metadata } from "next";
import Head from "next/head";
import "aos/dist/aos.css";
import "../app/css/globals.css";
import { montserrat, imperialScript } from "@/app/fonts/fonts";
import { Header } from "@/components/header";
import FooterDekstop from "@/components/footer/footerDekstop";
import FooterMobile from "@/components/footer/footerMobile";
import NextTopLoader from "nextjs-toploader";
import LenisProvider from "@/libs/providers/LenisProvider";

const BASE_DESCRIPTION =
  "InFest XII 2026 adalah acara teknologi terbesar di Aceh, menghadirkan kompetisi UI/UX, Hackathon, dan Data Science berskala nasional, seminar industri, serta pameran inovasi digital mahasiswa Universitas Syiah Kuala.";

export const metadata: Metadata = {
  title: {
    default: "Informatics Festival XII 2026 | InFest USK",
    template: "%s | InFest",
  },
  description: BASE_DESCRIPTION,
  verification: {
    google: "U0T6cUdqBUUi0M9Wyr_4nWwR4X5ymHTS5GsUSL8ForI",
  },
  keywords: ["Informatics", "Festival", "Technology", "Innovation", "Infest", "Infest USK", "Infest Unsyiah", "UI/UX", "Hackathon", "Data Science", "Data Sains", "Informatics Festival", "Kompetisi", "Competitions", "National"],
  openGraph: {
    title: "Informatics Festival XII 2026 | InFest USK",
    description: BASE_DESCRIPTION,
    type: "website",
    locale: "id_ID",
    siteName: "InFest USK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Informatics Festival XII 2026 | InFest USK",
    description: BASE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: ["/favicon.ico?v=4"],
    apple: ["/apple-touch-icon.png?v=4"],
    shortcut: ["apple-touch-icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <Head>
        <title>{String(metadata.title) || ""}</title>
        <meta name="description" content={metadata.description ?? ""} />
        <meta
          name="google-site-verification"
          content={String(metadata.verification?.google) ?? ""}
        />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.fontshare.com" />
      </Head>
      <body
        className={`${montserrat.className} ${imperialScript.variable} w-full min-h-screen textured-bg`}
      >
        <LenisProvider>
          <NextTopLoader
            color="#FDD026"
            initialPosition={0.2}
            crawlSpeed={200}
            height={2}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={300}
            shadow="0 0 10px rgba(253, 208, 38, 0.6)"
            zIndex={9999}
          />
          <Header />
          {children}
          <div className="flex w-full">
            <FooterMobile />
          </div>
          <div className="flex w-full">
            <FooterDekstop />
          </div>
        </LenisProvider>
      </body>
    </html>
  );
}
