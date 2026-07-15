"use client";

import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/libs/services/supabaseClient";
import { authService } from "@/libs/services/authService";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { dm_serif_display, montserrat } from "@/app/fonts/fonts";
import {
  ArrowLeft,
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import {
  validateEmail,
  validatePassword,
  logSecurityEvent,
  sanitizeInput,
} from "@/libs/security/utils";
import { SECURITY_CONFIG } from "@/libs/security/constants";
import GuestLayout from "@/app/(layouts)/guestLayout";
import useRateLimit from "@/libs/hooks/useRateLimit";
import { PrivacyPolicyModal } from "@/components/modals/privacyPolicyModal";

// Input Component with glass effect - Mobile optimized
const GlassInput = ({
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  disabled = false,
  showPasswordToggle = false,
  onTogglePassword,
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ComponentType<any>;
  error?: string;
  disabled?: boolean;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
}) => (
  <div className="relative mb-3 md:mb-4">
    <div className="relative">
      <div
        className={`flex items-center w-full px-3 md:px-4 py-2.5 md:py-3 bg-neutral_01/10 backdrop-blur-md border ${
          error ? "border-red-400/50" : "border-neutral_01/20"
        } rounded-xl transition-all duration-300 focus-within:border-neutral_02/50 focus-within:bg-neutral_01/15`}
      >
        {Icon && (
          <Icon className="w-4 h-4 md:w-5 md:h-5 text-neutral_01/60 mr-2 md:mr-3" />
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="flex-1 bg-transparent text-neutral_01 placeholder-neutral_01/60 outline-none disabled:opacity-50 text-xs md:text-sm"
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="text-neutral_01/60 hover:text-neutral_01 transition-colors ml-2"
          >
            {type === "password" ? (
              <Eye className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <EyeOff className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>
        )}
      </div>
    </div>
    {error && (
      <div className="flex items-center gap-2 mt-1.5 md:mt-2 text-red-400 text-xs md:text-sm">
        <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

// Divider Component
const Divider = ({ text }: { text: string }) => (
  <div className="relative flex items-center">
    <div className="flex-grow border-t border-neutral_01/20"></div>
    <span className="flex-shrink mx-4 text-neutral_01/60 text-sm font-medium">
      {text}
    </span>
    <div className="flex-grow border-t border-neutral_01/20"></div>
  </div>
);

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

// Loading component for session check
function LoginLoading() {
  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-b from-brand_01 to-brand_02 p-4 relative overflow-hidden ${montserrat.className}`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute rounded-full blur-3xl animate-pulse"
          style={{
            width: "300px",
            height: "300px",
            backgroundColor: "rgba(76, 13, 40, 0.3)",
            animationDuration: "4s",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl animate-pulse"
          style={{
            width: "200px",
            height: "200px",
            backgroundColor: "rgba(242, 233, 197, 0.2)",
            animationDelay: "2s",
            animationDuration: "4s",
          }}
        />
      </div>

      <div className="glass-container glass-container--rounded p-12 max-w-md w-full">
        <div className="glass-filter" />
        <div className="glass-specular" />
        <div className="glass-content flex-col items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neutral_02 to-neutral_01 animate-spin"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-b from-brand_01 to-brand_02"></div>
            </div>
            <p className="text-neutral_01 font-medium text-lg">
              Mengecek status login...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main login page component
function LoginPageContent() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const router = useRouter();
  const rateLimit = useRateLimit();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Clear errors when changing input
  useEffect(() => {
    // Clear errors when user starts typing in any field
    if (formData.email || formData.password) {
      setErrors((prev) => ({ ...prev, general: "" }));
    }
  }, [formData.email, formData.password]);

  // Check for OAuth callback errors
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    const details = urlParams.get("details");

    if (error) {
      let errorMessage = "";
      switch (error) {
        case "oauth":
          errorMessage = "Login Google gagal. Silakan coba lagi.";
          break;
        case "oauth_token":
          errorMessage = "Token Google tidak valid. Silakan coba login ulang.";
          break;
        case "oauth_session":
          errorMessage = "Gagal membuat session Google. Silakan coba lagi.";
          break;
        case "oauth_profile":
          errorMessage =
            "Login berhasil, namun gagal membuat profil. Anda dapat melengkapi profil di dashboard.";
          break;
        case "oauth_failed":
          errorMessage = details
            ? `Login Google gagal: ${details}`
            : "Login Google gagal. Silakan coba lagi.";
          break;
        case "code_exchange_failed":
          errorMessage = details
            ? `Gagal memproses login Google: ${details}`
            : "Gagal memproses login Google. Silakan coba lagi.";
          break;
        case "session_failed":
          errorMessage = details
            ? `Gagal membuat session: ${details}`
            : "Gagal membuat session. Silakan coba lagi.";
          break;
        case "no_session":
          errorMessage =
            "Login Google tidak berhasil. Session tidak ditemukan. Silakan coba lagi.";
          break;
        case "callback_failed":
          errorMessage = details
            ? `Terjadi kesalahan saat memproses login: ${details}`
            : "Terjadi kesalahan saat memproses login. Silakan coba lagi.";
          break;
        default:
          errorMessage = details
            ? `Terjadi kesalahan: ${details}`
            : "Terjadi kesalahan. Silakan coba lagi.";
      }

      setErrors((prev) => ({ ...prev, general: errorMessage }));

      // Clear error from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const validateForm = () => {
    const newErrors = { email: "", password: "", general: "" };

    // Email validation using security utility
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error || "Email tidak valid";
    }

    // Password validation using security utility
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error || "Password tidak valid";
    }

    setErrors(newErrors);
    return emailValidation.isValid && passwordValidation.isValid;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limiting
    if (rateLimit.isLocked) {
      setErrors((prev) => ({
        ...prev,
        general: `Terlalu banyak percobaan login gagal. Coba lagi dalam ${Math.ceil(
          rateLimit.remainingTime / 60
        )} menit.`,
      }));
      return;
    }

    if (!validateForm()) return;

    try {
      setIsLoggingIn(true);
      setErrors({ email: "", password: "", general: "" });

      const sanitizedEmail = sanitizeInput(formData.email).toLowerCase();

      // Gunakan authService untuk login dengan database integration
      const result = await authService.signIn(
        sanitizedEmail,
        formData.password
      );

      if (result.error) {
        console.error("Login error:", result.error);

        // Record failed attempt
        rateLimit.recordFailedAttempt();

        // Handle specific error cases untuk better UX
        if (result.error.includes("Email atau password salah")) {
          setErrors((prev) => ({
            ...prev,
            general: `Email atau password salah. Percobaan ke-${
              rateLimit.attempts + 1
            } dari ${SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS}.`,
          }));
        } else if (result.error.includes("Email belum diverifikasi")) {
          setErrors((prev) => ({
            ...prev,
            general:
              "Email belum diverifikasi. Silakan cek email Anda untuk konfirmasi.",
          }));
        } else if (result.error.includes("Too many")) {
          setErrors((prev) => ({
            ...prev,
            general:
              "Terlalu banyak percobaan login. Silakan tunggu beberapa menit.",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            general:
              result.error || "Terjadi kesalahan sistem. Silakan coba lagi.",
          }));
        }
        return;
      }

      if (result.user) {
        // Reset attempts on successful login
        rateLimit.resetAttempts();

        // Jika belum ada profile, user tetap bisa masuk tapi akan diarahkan untuk melengkapi profil
        if (!result.profile) {
          console.warn(
            "User login tanpa profile, akan diarahkan untuk melengkapi profil"
          );
        }

        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      rateLimit.recordFailedAttempt();
      setErrors((prev) => ({
        ...prev,
        general: "Terjadi kesalahan sistem. Silakan coba lagi.",
      }));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Check rate limiting
    if (rateLimit.isLocked) {
      setErrors((prev) => ({
        ...prev,
        general: `Terlalu banyak percobaan login gagal. Coba lagi dalam ${Math.ceil(
          rateLimit.remainingTime / 60
        )} menit.`,
      }));
      return;
    }

    try {
      setIsLoggingIn(true);
      setErrors({ email: "", password: "", general: "" });

      // Gunakan authService untuk OAuth login
      const result = await authService.signInWithOAuth("google");

      if (result.error) {
        console.error("Google login error:", result.error);
        rateLimit.recordFailedAttempt();
        setErrors((prev) => ({
          ...prev,
          general: `Gagal login dengan Google: ${result.error}`,
        }));
        setIsLoggingIn(false);
      } else if (result.url) {
        // Redirect ke OAuth provider
        window.location.href = result.url;
      }
    } catch (error: any) {
      console.error("💥 Google login failed:", error);
      rateLimit.recordFailedAttempt();
      setErrors((prev) => ({
        ...prev,
        general: "Terjadi kesalahan saat memulai login Google.",
      }));
      setIsLoggingIn(false);
    }
  };

  const handleInputChange =
    (field: "email" | "password") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      // Input sanitization using security utility
      if (field === "email") {
        value = sanitizeInput(value).toLowerCase();
      } else if (field === "password") {
        // For password, only remove control characters
        value = value.replace(/[\x00-\x1F\x7F]/g, "");
      }

      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear field-specific error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }

      // Clear general error as well
      if (errors.general) {
        setErrors((prev) => ({ ...prev, general: "" }));
      }
    };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-b from-brand_01 to-brand_02 p-4 relative overflow-hidden ${montserrat.className}`}
    >
      {/* Background Effects - Hidden on mobile for cleaner look */}
      <div className="absolute inset-0 overflow-hidden hidden md:block">
        <GlowingOrb size={400} color="brand_01" delay={0} />
        <GlowingOrb size={300} color="neutral_01" delay={2} />
        <GlowingOrb size={200} color="brand_01" delay={4} />

        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-neutral_01/60 rounded-full animate-twinkle"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-neutral_02/80 rounded-full animate-twinkle-delayed"></div>
        <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-neutral_01/50 rounded-full animate-twinkle-slow"></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-neutral_02/70 rounded-full animate-twinkle-fast"></div>
      </div>

      {/* Background pattern - Simplified for mobile */}
      <div className="absolute inset-0 opacity-3 md:opacity-5">
        <div className="absolute top-0 left-0 w-full h-1/4 hidden md:block">
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

      {/* Main Login Container - Mobile optimized */}
      <div className="relative z-10 w-full max-w-sm md:max-w-6xl">
        <GlassContainer className="p-4 md:p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-8 lg:gap-12 items-center">
            {/* Left Side - Logo and Info - Simplified for mobile */}
            <div className="flex-1 text-center lg:text-left">
              <div className="w-16 h-16 md:w-32 md:h-32 lg:w-40 lg:h-40 mx-auto lg:mx-0 mb-3 md:mb-6 relative">
                <Image
                  src="/assets/images/Infest 2025 1st Logo Outline.png"
                  alt="Infest USK Logo"
                  fill
                  className="object-contain filter drop-shadow-[0_0_20px_rgba(242,233,197,0.6)] md:drop-shadow-[0_0_30px_rgba(242,233,197,0.8)]"
                />
              </div>
              <div className="mb-4 md:mb-8">
                <h1
                  className={`text-xl md:text-3xl lg:text-4xl font-bold text-neutral_01 mb-1 md:mb-3 ${dm_serif_display.className}`}
                >
                  Welcome Back
                </h1>
                <p className="text-neutral_01/80 text-xs md:text-base lg:text-lg">
                  Masuk ke Dashboard Informatics Festival
                </p>
              </div>

              {/* Bottom Info - Hidden on mobile to reduce clutter */}
              <div className="text-center lg:text-left hidden md:block">
                <p className="text-neutral_01/60 text-xs md:text-sm">
                  Informatics Festival XI 2025
                </p>
                <p className="text-neutral_01/40 text-xs mt-1">
                  Powered by HMIF USK
                </p>
              </div>
            </div>

            {/* Right Side - Login Form - Mobile optimized */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="space-y-3 md:space-y-6 w-full">
                {/* Header - Simplified for mobile */}
                <div className="text-center mb-3 md:mb-6">
                  <h2 className="text-base md:text-3xl font-bold text-neutral_01 mb-1 md:mb-2">
                    Login
                  </h2>
                  <p className="text-neutral_01/70 text-xs md:text-sm hidden md:block">
                    Gunakan email & password atau akun Google Anda
                  </p>
                </div>

                {/* Error Message */}
                {errors.general && (
                  <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-400/20 rounded-xl text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.general}</span>
                  </div>
                )}

                {/* Rate Limiting Warning */}
                {rateLimit.attempts > 0 && !rateLimit.isLocked && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-400/20 rounded-xl text-yellow-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Percobaan login gagal: {rateLimit.attempts}/
                      {SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS}.
                      {rateLimit.attempts >= 3 &&
                        ` Hati-hati, akun akan terkunci setelah ${SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS} percobaan gagal.`}
                    </span>
                  </div>
                )}

                {/* Email Login Form - Compact mobile version */}
                <form
                  onSubmit={handleEmailLogin}
                  className="flex flex-col w-full"
                >
                  <GlassInput
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    icon={Mail}
                    error={errors.email}
                    disabled={isLoggingIn}
                  />

                  <GlassInput
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    icon={Lock}
                    error={errors.password}
                    disabled={isLoggingIn}
                    showPasswordToggle={true}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                  />

                  <button
                    type="submit"
                    disabled={isLoggingIn || !!rateLimit.isLocked}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-1 bg-gradient-to-r from-neutral_02 to-neutral_01 text-brand_01 font-bold text-xs md:text-sm rounded-xl shadow-[0_0px_20px_rgba(242,233,197,0.4)] md:shadow-[0_0px_30px_rgba(242,233,197,0.6)] hover:shadow-[0_0px_30px_rgba(242,233,197,0.6)] md:hover:shadow-[0_0px_40px_rgba(242,233,197,0.8)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {rateLimit.isLocked ? (
                      <>
                        <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
                        <span>
                          Terkunci ({Math.ceil(rateLimit.remainingTime / 60)}{" "}
                          menit)
                        </span>
                      </>
                    ) : isLoggingIn ? (
                      <>
                        <div className="w-4 h-4 md:w-5 md:h-5 relative">
                          <div className="absolute inset-0 rounded-full border-2 border-brand_01/30"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-brand_01 border-t-transparent animate-spin"></div>
                        </div>
                        <span>Sedang Masuk...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 md:w-5 md:h-5" />
                        <span>Masuk dengan Email</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <Divider text="atau" />

                {/* Google Login Button - Compact mobile version */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn || !!rateLimit.isLocked}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-neutral_01/20 text-neutral_01 font-bold text-xs md:text-sm rounded-xl hover:bg-white/15 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {rateLimit.isLocked ? (
                    <>
                      <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
                      <span>
                        Terkunci ({Math.ceil(rateLimit.remainingTime / 60)}{" "}
                        menit)
                      </span>
                    </>
                  ) : isLoggingIn ? (
                    <>
                      <div className="w-4 h-4 md:w-5 md:h-5 relative">
                        <div className="absolute inset-0 rounded-full border-2 border-neutral_01/30"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-neutral_01 border-t-transparent animate-spin"></div>
                      </div>
                      <span>Sedang Masuk...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Masuk dengan Google</span>
                    </>
                  )}
                </button>

                {/* Register and Forgot Password Links - Compact mobile */}
                <div className="text-center space-y-1 md:space-y-3 mt-3 md:mt-6">
                  <p className="text-neutral_01/60 text-xs md:text-sm">
                    Belum punya akun?{" "}
                    <Link
                      href="/auth/register"
                      className="text-neutral_02 hover:text-neutral_01 font-medium transition-colors"
                    >
                      Daftar di sini
                    </Link>
                  </p>
                  {/* <p className="text-neutral_01/60 text-xs md:text-sm">
                    <Link
                      href="/auth/forgot-password"
                      className="text-neutral_02 hover:text-neutral_01 font-medium transition-colors"
                    >
                      Lupa password?
                    </Link>
                  </p> */}
                </div>

                {/* Additional Info - Hidden on mobile for cleaner look */}
                <div className="mt-4 md:mt-8 text-center hidden md:block">
                  <p className="text-neutral_01/60 text-xs leading-relaxed">
                    Dengan mendaftar, Anda menyetujui{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-neutral_02 hover:text-neutral_01 transition-colors underline underline-offset-4"
                    >
                      Syarat & Ketentuan
                    </button>{" "}
                    dan{" "}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-neutral_02 hover:text-neutral_01 transition-colors underline underline-offset-4"
                    >
                      Kebijakan Privasi
                    </button>{" "}
                    kami.
                  </p>
                </div>

                {/* Mobile: small text with modal triggers */}
                <div className="mt-3 text-center md:hidden">
                  <p className="text-neutral_01/60 text-[11px] leading-relaxed">
                    Dengan mendaftar, Anda menyetujui
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="ml-1 text-neutral_02 hover:text-neutral_01 underline underline-offset-2"
                    >
                      S&K
                    </button>{" "}
                    dan
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="ml-1 text-neutral_02 hover:text-neutral_01 underline underline-offset-2"
                    >
                      Privasi
                    </button>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GlassContainer>
        a{/* Decorative Elements - Hidden on mobile for cleaner look */}
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
      {/* Terms & Conditions Modal */}
      <PrivacyPolicyModal
        title="Syarat & Ketentuan"
        open={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      >
        <ol className="list-decimal pl-5 space-y-2">
          <li>Pendaftaran akun wajib menggunakan email aktif dan valid.</li>
          <li>
            Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda.
          </li>
          <li>Data yang Anda berikan harus akurat dan terbaru.</li>
          <li>Panitia berhak memperbarui ketentuan sewaktu-waktu.</li>
          <li>
            Pelanggaran terhadap ketentuan dapat berakibat pembatasan akses.
          </li>
        </ol>
        <p className="mt-4 text-neutral_03">
          Dengan melanjutkan, Anda menyatakan setuju terhadap seluruh Syarat &
          Ketentuan di atas.
        </p>
      </PrivacyPolicyModal>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        title="Kebijakan Privasi"
        open={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      >
        <p>
          Kami menghargai privasi Anda. Informasi pribadi seperti nama dan email
          digunakan untuk keperluan pendaftaran, autentikasi, dan komunikasi
          terkait acara.
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Kami tidak menjual data Anda kepada pihak ketiga.</li>
          <li>
            Data dapat dibagikan ke pihak terkait pelaksanaan acara jika
            diperlukan.
          </li>
          <li>Keamanan data diterapkan sesuai praktik terbaik yang wajar.</li>
          <li>
            Anda dapat meminta pembaruan atau penghapusan data sesuai kebijakan.
          </li>
        </ul>
        <p className="mt-4 text-neutral_03">
          Untuk pertanyaan privasi, hubungi panitia melalui kanal resmi.
        </p>
      </PrivacyPolicyModal>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <GuestLayout>
        <LoginPageContent />
      </GuestLayout>
    </Suspense>
  );
}
