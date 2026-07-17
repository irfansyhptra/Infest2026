"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem = ({ question, answer, isOpen, onClick }: FAQItemProps) => {
  return (
    <div 
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
        isOpen 
          ? "border-[#2596BE] bg-[#00133C]/70 shadow-[0_0_20px_rgba(37,150,190,0.15)]" 
          : "border-white/10 bg-white/5 hover:border-white/30"
      }`}
    >
      <button
        onClick={onClick}
        className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <HelpCircle className={`w-5 h-5 flex-shrink-0 ${isOpen ? "text-[#2596BE]" : "text-[#FDD026]"}`} />
          <span className="font-bold text-sm md:text-base text-white">{question}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`flex-shrink-0 ml-4 ${isOpen ? "text-[#2596BE]" : "text-white/40"}`}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 pt-2 text-white/70 text-xs md:text-sm leading-relaxed border-t border-white/5">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Apa itu Informatics Festival (InFest) XII 2026?",
      answer: "Informatics Festival (InFest) XII 2026 adalah festival teknologi tahunan terbesar di Aceh yang diselenggarakan oleh Himpunan Mahasiswa Informatika (HMIF) Universitas Syiah Kuala. Acara ini mewadahi pelajar, mahasiswa, dan profesional untuk berinovasi dan berkompetisi di bidang teknologi informasi.",
    },
    {
      question: "Kompetisi apa saja yang diselenggarakan pada InFest XII?",
      answer: "Ada tiga kompetisi utama pada tahun ini: UI/UX Design (tingkat universitas, individu/tim 1-3 orang), Hackathon (intensif coding 20+ jam untuk membuat solusi teknologi, tim 2-3 orang), dan Data Science (analisis data dan machine learning, tim 2-3 orang).",
    },
    {
      question: "Apakah kompetisi ini berskala nasional?",
      answer: "Ya, seluruh kompetisi yang diselenggarakan di InFest XII bersifat Nasional dan dapat diikuti oleh mahasiswa aktif dari seluruh perguruan tinggi di Indonesia.",
    },
    {
      question: "Bagaimana cara melakukan pendaftaran kompetisi?",
      answer: "Pendaftaran dapat dilakukan langsung melalui portal dashboard InFest. Anda perlu membuat akun, mendaftarkan tim Anda beserta data anggotanya, kemudian mengunggah bukti pembayaran dan Twibbon wajib untuk verifikasi admin.",
    },
    {
      question: "Berapa biaya pendaftaran untuk setiap kompetisi?",
      answer: "Biaya pendaftaran bervariasi untuk masing-masing lomba: UI/UX Design (IDR 75.000), Hackathon (IDR 150.000), dan Data Science (IDR 50.000). Informasi rekening pembayaran tersedia di formulir registrasi tim di dashboard.",
    },
    {
      question: "Di mana Seminar Nasional diselenggarakan dan siapa saja pembicaranya?",
      answer: "Seminar Nasional diselenggarakan secara offline di Auditorium FMIPA Universitas Syiah Kuala (USK) pada hari Minggu, 25 Oktober 2026. Pembicara yang dihadirkan merupakan pakar di bidang teknologi dan AI dari industri terkemuka.",
    },
  ];

  return (
    <section id="faq" className="py-16 md:py-24 px-4 md:px-8 lg:px-20 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-[#2596BE]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-60 h-60 bg-[#FDD026]/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#2596BE] via-[#FDD026] to-[#2596BE] mx-auto rounded-full"></div>
          <p className="text-white/60 text-xs md:text-sm mt-4">
            Temukan jawaban atas pertanyaan umum seputar pelaksanaan event, kompetisi, dan registrasi InFest XII 2026.
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
