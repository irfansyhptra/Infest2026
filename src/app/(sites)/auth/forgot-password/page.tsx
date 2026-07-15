"use client";

import { Suspense, useEffect, useState } from "react";
import { authService } from "@/libs/services/authService";
import { validateEmail, sanitizeInput } from "@/libs/security/utils";
import Image from "next/image";
import Link from "next/link";
import { dm_serif_display, montserrat } from "@/app/fonts/fonts";
import { ArrowLeft, Mail, AlertCircle, CheckCircle, Send } from "lucide-react";

// Input Component with glass effect
const GlassInput = ({
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  disabled = false,
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ComponentType<any>;
  error?: string;
  disabled?: boolean;
}) => (
  <div className="relative mb-4">
    <div className="relative">
      <div
        className={`flex items-center w-full px-4 py-3 bg-neutral_01/10 backdrop-blur-md border ${
          error ? "border-red-400/50" : "border-neutral_01/20"
        } rounded-xl transition-all duration-300 focus-within:border-neutral_02/50 focus-within:bg-neutral_01/15`}
      >
        {Icon && <Icon className="w-5 h-5 text-neutral_01/60 mr-3" />}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="flex-1 bg-transparent text-neutral_01 placeholder-neutral_01/60 outline-none disabled:opacity-50 text-xs md:text-sm"
        />
      </div>
    </div>
    {error && (
      <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

// Glass Effect Component
const GlassContainer = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`glass-container glass-container--rounded ${className}`}>
    <div className="glass-filter" />
    <div className="glass-specular" />
    <div className="glass-content flex-col items-center justify-center">
      {children}
    </div>
  </div>
);

// Glowing Orb Effect
const GlowingOrb = ({ size = 100, color = "brand_01", delay = 0 }) => (
  <div
    className={`absolute rounded-full blur-3xl animate-pulse`}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor:
        color === "brand_01"
          ? "rgba(76, 13, 40, 0.3)"
          : "rgba(242, 233, 197, 0.2)",
      animationDelay: `${delay}s`,
      animationDuration: "4s",
    }}
  />
);

// Main forgot password page component
function ForgotPasswordContent() {
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email harus diisi");
      return;
    }

    if (!validateEmail(email).isValid) {
      setError("Format email tidak valid");
      return;
    }

    try {
      setIsSending(true);
      setError("");

      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      const result = await authService.forgotPassword(sanitizedEmail);

      if (result.error) {
        console.error("Reset password error:", result.error);
        setError(result.error);
        setIsSending(false);
        return;
      }

      setEmailSent(true);
    } catch (error) {
      console.error("Reset password failed:", error);
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError("");
    }
  };

  if (emailSent) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-b from-brand_01 to-brand_02 p-4 relative overflow-hidden ${montserrat.className}`}
      >
        <div className="absolute inset-0 overflow-hidden">
          <GlowingOrb size={400} color="brand_01" delay={0} />
          <GlowingOrb size={300} color="neutral_01" delay={2} />
          <GlowingOrb size={200} color="brand_01" delay={4} />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <GlassContainer className="p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>

            <h1
              className={`text-2xl font-bold text-neutral_01 mb-4 ${dm_serif_display.className}`}
            >
              Email Terkirim!
            </h1>

            <div className="space-y-4 text-neutral_01/80">
              <p>Kami telah mengirim link reset password ke email Anda:</p>
              <p className="font-medium text-neutral_02">{email}</p>
              <p className="text-sm">Silakan cek inbox dan folder spam Anda.</p>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-neutral_02 to-neutral_01 text-brand_01 font-bold rounded-xl hover:scale-105 transition-all duration-300"
              >
                Kembali ke Login
              </Link>

              <button
                onClick={() => {
                  setEmailSent(false);
                  setIsSending(false);
                  setEmail("");
                }}
                className="text-neutral_01/60 hover:text-neutral_01 text-sm transition-colors"
              >
                Kirim ulang ke email lain
              </button>
            </div>
          </GlassContainer>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-b from-brand_01 to-brand_02 p-4 relative overflow-hidden ${montserrat.className}`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <GlowingOrb size={400} color="brand_01" delay={0} />
        <GlowingOrb size={300} color="neutral_01" delay={2} />
        <GlowingOrb size={200} color="brand_01" delay={4} />

        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-neutral_01/60 rounded-full animate-twinkle"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-neutral_02/80 rounded-full animate-twinkle-delayed"></div>
        <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-neutral_01/50 rounded-full animate-twinkle-slow"></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-neutral_02/70 rounded-full animate-twinkle-fast"></div>
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-1/4">
          <Image
            src="/assets/images/goldconfet Infest USK.webp"
            alt="Background Pattern"
            fill
            className="object-cover"
            style={{
              maskImage:
                "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 100%)",
            }}
          />
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        <GlassContainer className="p-10">
          {/* Logo */}
          <div className="mb-8 relative">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <Image
                src="/assets/images/Infest 2025 1st Logo Outline.png"
                alt="Infest USK Logo"
                fill
                className="object-contain filter drop-shadow-[0_0_20px_rgba(242,233,197,0.6)]"
              />
            </div>
            <div className="text-center">
              <h1
                className={`text-2xl font-bold text-neutral_01 mb-2 ${dm_serif_display.className}`}
              >
                Lupa Password?
              </h1>
              <p className="text-neutral_01/80 text-sm">
                Masukkan email Anda untuk reset password
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-400/20 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Reset Form */}
          <form onSubmit={handleResetPassword} className="space-y-6">
            <GlassInput
              type="email"
              placeholder="Masukkan email Anda"
              value={email}
              onChange={handleInputChange}
              icon={Mail}
              error=""
              disabled={isSending}
            />

            <button
              type="submit"
              disabled={isSending}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-neutral_02 to-neutral_01 text-brand_01 font-bold text-xs md:text-sm rounded-xl shadow-[0_0px_30px_rgba(242,233,197,0.6)] hover:shadow-[0_0px_40px_rgba(242,233,197,0.8)] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSending ? (
                <>
                  <div className="w-6 h-6 relative">
                    <div className="absolute inset-0 rounded-full border-2 border-brand_01/30"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-brand_01 border-t-transparent animate-spin"></div>
                  </div>
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  <span>Kirim Link Reset</span>
                </>
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-neutral_01/60 text-xs leading-relaxed">
              Setelah menerima email, ikuti instruksi untuk membuat password
              baru.
            </p>
          </div>
        </GlassContainer>

        {/* Decorative Elements - Hidden on mobile for cleaner look */}
        <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-neutral_01/30 rounded-tl-xl hidden md:block"></div>
        <div className="absolute -top-4 -right-4 w-8 h-8 border-r-2 border-t-2 border-neutral_01/30 rounded-tr-xl hidden md:block"></div>
        <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l-2 border-b-2 border-neutral_01/30 rounded-bl-xl hidden md:block"></div>
        <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-neutral_01/30 rounded-br-xl hidden md:block"></div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center block lg:hidden">
        <p className="text-neutral_01/60 text-sm">
          Informatics Festival XI 2025
        </p>
        <p className="text-neutral_01/40 text-xs mt-1">Powered by HMIF USK</p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
