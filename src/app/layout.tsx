import type { Metadata } from "next";
import Head from "next/head";
import "aos/dist/aos.css";
import "../app/css/globals.css";
import { montserrat } from "@/app/fonts/fonts";
import { Header } from "@/components/header";
import FooterDekstop from "@/components/footer/footerDekstop";
import FooterMobile from "@/components/footer/footerMobile";
import NextTopLoader from "nextjs-toploader";
import LenisProvider from "@/libs/providers/LenisProvider";

export const metadata: Metadata = {
  title: "Informatics Festival",
  description:
    "Informatics Festival (InFest) adalah acara tahunan yang diselenggarakan oleh Jurusan Informatika, Fakultas Matematika dan Ilmu Pengetahuan Alam, Universitas Syiah Kuala (USK). Acara ini bertujuan untuk merayakan dan mempromosikan inovasi dan prestasi di bidang teknologi informasi dan komputer. InFest mencakup berbagai kegiatan menarik seperti kompetisi pemrograman, seminar teknologi, workshop, pameran proyek mahasiswa, serta diskusi panel dengan pakar industri.",
  verification: {
    google: "U0T6cUdqBUUi0M9Wyr_4nWwR4X5ymHTS5GsUSL8ForI",
  },
  keywords: ["Informatics", "Festival", "Technology", "Innovation", "Infest", "Infest USK", "Infest Unsyiah", "UI/UX", "Hackathon", "Data Science", "Data Sains", "Informatics Festival", "Kompetisi", "Competitions", "National"],
  icons: {
    icon: ["/favicon.ico?v=4"],
    apple: ["/apple-touch-icon.png?v=4"],
    shortcut: ["apple-touch-icon.png"],
  },
} as const;

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
      </Head>
      <body
        className={`${montserrat.className} w-full min-h-screen textured-bg`}
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
