import Link from "next/link";
import { Glass } from "@/components/glass/index";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center px-4 py-16">
      <div className="max-w-3xl w-full">
        <Glass className="flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral_02 to-neutral_01 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-brand_01" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-neutral_01">Halaman tidak ditemukan</h1>
            <p className="text-neutral_01/70 text-sm md:text-base">
              Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:justify-center">
            <Link
              href="/"
              className="flex-1 sm:flex-none sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-neutral_02 to-neutral_01 text-brand_01 font-semibold hover:opacity-80 transition"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 sm:flex-none sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl border border-neutral_01/20 bg-white/5 text-neutral_01 hover:bg-white/10 transition"
            >
              Buka Dashboard
            </Link>
          </div>
        </Glass>
      </div>
    </main>
  );
}
