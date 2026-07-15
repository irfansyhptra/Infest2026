"use client";

import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/libs/services/supabaseClient";
import { authService } from "@/libs/services/authService";
import { validatePassword, sanitizeInput } from "@/libs/security/utils";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { dm_serif_display, montserrat } from "@/app/fonts/fonts";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Save,
} from "lucide-react";

// Input Component with glass effect
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
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="text-neutral_01/60 hover:text-neutral_01 transition-colors ml-2"
          >
            {type === "password" ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>
        )}
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

// Main reset password component
function ResetPasswordContent() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    general: "",
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tokens, setTokens] = useState({
    accessToken: "",
    refreshToken: "",
  });
  // const accessToken = searchParams.get("access_token");
  // const refreshToken = searchParams.get("refresh_token");

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token") || "";
    const refreshToken = params.get("refresh_token") || "";
    setTokens({ accessToken, refreshToken });

    if (!accessToken || !refreshToken) {
      setErrors((prev) => ({
        ...prev,
        general: "Link reset password tidak valid atau sudah expired.",
      }));
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = { password: "", confirmPassword: "", general: "" };

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error || "Password tidak valid";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password harus diisi";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak sama";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!tokens.accessToken || !tokens.refreshToken) {
      setErrors((prev) => ({
        ...prev,
        general: "Link reset password tidak valid.",
      }));
      return;
    }

    try {
      setIsUpdating(true);
      setErrors({ password: "", confirmPassword: "", general: "" });

      // Set the session first
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      if (sessionError) {
        console.error("Session error:", sessionError);
        setErrors((prev) => ({
          ...prev,
          general: "Link reset password tidak valid atau sudah expired.",
        }));
        setIsUpdating(false);
        return;
      }

      // Use authService to update password
      const result = await authService.resetPassword(formData.password);

      if (result.error) {
        console.error("Update password error:", result.error);
        setErrors((prev) => ({
          ...prev,
          general: result.error || "Gagal mengupdate password. Silakan coba lagi.",
        }));
        setIsUpdating(false);
        return;
      }

      setResetSuccess(true);

      // Auto redirect to login after successful reset
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error) {
      console.error("Reset password failed:", error);
      setErrors((prev) => ({
        ...prev,
        general: "Terjadi kesalahan. Silakan coba lagi.",
      }));
      setIsUpdating(false);
    }
  };

  const handleInputChange =
    (field: "password" | "confirmPassword") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  if (resetSuccess) {
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
              Password Berhasil Diubah!
            </h1>

            <div className="space-y-4 text-neutral_01/80">
              <p>
                Password Anda telah berhasil diperbarui. Sekarang Anda dapat
                masuk dengan password baru.
              </p>
              <p className="text-sm">
                Anda akan diarahkan ke halaman login dalam beberapa detik...
              </p>
            </div>

            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-neutral_02 to-neutral_01 text-brand_01 font-bold rounded-xl hover:scale-105 transition-all duration-300"
            >
              Lanjut ke Login
            </Link>
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
                alt="InFest USK Logo"
                fill
                className="object-contain filter drop-shadow-[0_0_20px_rgba(242,233,197,0.6)]"
              />
            </div>
            <div className="text-center">
              <h1
                className={`text-2xl font-bold text-neutral_01 mb-2 ${dm_serif_display.className}`}
              >
                Reset Password
              </h1>
              <p className="text-neutral_01/80 text-sm">
                Masukkan password baru Anda
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-400/20 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Reset Form */}
          <form onSubmit={handleResetPassword} className="flex flex-col">
            <GlassInput
              type={showPassword ? "text" : "password"}
              placeholder="Password Baru"
              value={formData.password}
              onChange={handleInputChange("password")}
              icon={Lock}
              error={errors.password}
              disabled={isUpdating}
              showPasswordToggle={true}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            <GlassInput
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Konfirmasi Password Baru"
              value={formData.confirmPassword}
              onChange={handleInputChange("confirmPassword")}
              icon={Lock}
              error={errors.confirmPassword}
              disabled={isUpdating}
              showPasswordToggle={true}
              onTogglePassword={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            />

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 mt-1 bg-gradient-to-r from-neutral_02 to-neutral_01 text-brand_01 font-bold text-xs md:text-sm rounded-2xl shadow-[0_0px_30px_rgba(242,233,197,0.6)] hover:shadow-[0_0px_40px_rgba(242,233,197,0.8)] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isUpdating ? (
                <>
                  <div className="w-6 h-6 relative">
                    <div className="absolute inset-0 rounded-full border-2 border-brand_01/30"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-brand_01 border-t-transparent animate-spin"></div>
                  </div>
                  <span>Memperbarui...</span>
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  <span>Perbarui Password</span>
                </>
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-neutral_01/60 text-xs leading-relaxed">
              Pastikan password baru Anda aman dan mudah diingat.
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
