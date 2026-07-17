"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, type UserProfile } from "@/libs/services/authService";
import { validateEmail, sanitizeInput } from "@/libs/security/utils";
import { cloudinaryService } from "@/libs/services/cloudinaryService";
import { ProfileSkeleton } from "@/components/skeletons";
import type { User } from "@supabase/supabase-js";
import {
  User as UserIcon,
  Save,
  Edit3,
  MapPin,
  Phone,
  Mail,
  Calendar,
  GraduationCap,
  Hash,
  Building2,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Upload,
  Image,
  Eye,
  Download,
} from "lucide-react";

const ProfileContent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Student ID Image Upload states
  const [studentIdFile, setStudentIdFile] = useState<File | null>(null);
  const [studentIdPreview, setStudentIdPreview] = useState<string | null>(null);
  const [isUploadingStudentId, setIsUploadingStudentId] = useState(false);
  const [studentIdImageUrl, setStudentIdImageUrl] = useState<string | null>(
    null
  );

  // Student ID Image Modal states
  const [showStudentIdModal, setShowStudentIdModal] = useState(false);

  const router = useRouter();

  const [formData, setFormData] = useState({
    // Data Dasar
    fullName: "",
    email: "",
    whatsapp: "",
    dateOfBirth: "",
    gender: "",

    // Data Akademik
    university: "",
    faculty: "",
    major: "",
    studentId: "",
    semester: "",
    graduationYear: "",

    // Data Alamat
    province: "",
    city: "",
    address: "",
    postalCode: "",
  });

  // Load user data saat component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const result = await authService.getCurrentUser();

      if (result.error) {
        console.error("Error loading user:", result.error);
        // Jika user tidak terautentikasi, redirect ke login
        router.push("/auth/login");
        return;
      }

      if (result.user) {
        setUser(result.user);

        if (result.profile) {
          setProfile(result.profile);
          setStudentIdImageUrl(result.profile.student_id_image_url || null);
          // Populate form dengan data profile yang ada
          setFormData({
            fullName: result.profile.full_name || "",
            email: result.profile.email || "",
            whatsapp: result.profile.whatsapp || "",
            dateOfBirth: result.profile.date_of_birth || "",
            gender: result.profile.gender || "",
            university: result.profile.university || "",
            faculty: result.profile.faculty || "",
            major: result.profile.major || "",
            studentId: result.profile.student_id || "",
            semester: result.profile.semester?.toString() || "",
            graduationYear: result.profile.graduation_year?.toString() || "",
            province: result.profile.province || "",
            city: result.profile.city || "",
            address: result.profile.address || "",
            postalCode: result.profile.postal_code || "",
          });
        } else {
          // Jika belum ada profile, set email dari auth user
          setFormData((prev) => ({
            ...prev,
            email: result.user?.email || "",
          }));
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      router.push("/auth/login");
    } finally {
      setIsLoading(false);
    }
  };

  // Validasi form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validasi data wajib
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Nama lengkap harus diisi";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Nama lengkap minimal 2 karakter";
    }

    // Validasi email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error || "Email tidak valid";
    }

    if (
      formData.whatsapp &&
      !/^(\+62|62|0)[0-9]{9,13}$/.test(formData.whatsapp.replace(/\s/g, ""))
    ) {
      newErrors.whatsapp = "Format nomor WhatsApp tidak valid";
    }

    if (
      formData.semester &&
      (parseInt(formData.semester) < 1 || parseInt(formData.semester) > 14)
    ) {
      newErrors.semester = "Semester harus antara 1-14";
    }

    if (formData.graduationYear) {
      const year = parseInt(formData.graduationYear);
      const currentYear = new Date().getFullYear();
      if (year < 2020 || year > currentYear + 10) {
        newErrors.graduationYear = `Tahun angkatan harus antara 2020-${
          currentYear + 10
        }`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Sanitize input berdasarkan jenis field
    let sanitizedValue = value;
    if (name === "email") {
      sanitizedValue = sanitizeInput(value).toLowerCase();
    } else if (name === "phone" || name === "whatsapp") {
      // Hanya angka, +, dan spasi untuk nomor telepon
      sanitizedValue = value.replace(/[^0-9+\s]/g, "");
    } else if (name === "semester" || name === "graduationYear") {
      // Hanya angka untuk semester dan tahun
      sanitizedValue = value.replace(/[^0-9]/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    // Clear error untuk field yang sedang diubah
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear save message
    if (saveMessage) {
      setSaveMessage(null);
    }
  };

  // Handle Student ID Image Upload
  const handleStudentIdImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file
    const validation = cloudinaryService.validateFile(selectedFile);
    if (!validation.isValid) {
      setErrors((prev) => ({
        ...prev,
        studentIdImage: validation.error || "File tidak valid",
      }));
      return;
    }

    setStudentIdFile(selectedFile);
    setErrors((prev) => ({
      ...prev,
      studentIdImage: "",
    }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setStudentIdPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const uploadStudentIdImage = async (): Promise<string | null> => {
    if (!studentIdFile) return studentIdImageUrl;

    setIsUploadingStudentId(true);

    try {
      const result = await cloudinaryService.uploadFile(studentIdFile);

      if (result.success && result.data) {
        const uploadedUrl = result.data.secure_url;
        setStudentIdImageUrl(uploadedUrl);
        setStudentIdFile(null);
        setStudentIdPreview(null);
        return uploadedUrl;
      } else {
        setErrors((prev) => ({
          ...prev,
          studentIdImage: result.error || "Gagal upload gambar",
        }));
        return null;
      }
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        studentIdImage: error.message || "Terjadi kesalahan saat upload",
      }));
      return null;
    } finally {
      setIsUploadingStudentId(false);
    }
  };

  const removeStudentIdImage = () => {
    setStudentIdFile(null);
    setStudentIdPreview(null);
    setStudentIdImageUrl(null);
    setErrors((prev) => ({
      ...prev,
      studentIdImage: "",
    }));
  };

  const downloadStudentIdImage = async () => {
    if (!studentIdImageUrl) return;

    try {
      // Fetch the image
      const response = await fetch(studentIdImageUrl);
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename
      const fileName = `kartu-mahasiswa-${
        profile?.full_name?.replace(/\s+/g, "-") || "student-id"
      }.${blob.type.split("/")[1] || "jpg"}`;
      link.download = fileName;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
      // You could add a toast notification here if you have one
    }
  };

  const handleSave = async () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (!validateForm()) {
      setSaveMessage({
        type: "error",
        message: "Mohon periksa kembali data yang Anda masukkan",
      });
      return;
    }

    if (!user) {
      setSaveMessage({
        type: "error",
        message: "User tidak ditemukan. Silakan login ulang.",
      });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Upload student ID image jika ada file baru
      let uploadedStudentIdUrl = studentIdImageUrl;
      if (studentIdFile) {
        uploadedStudentIdUrl = await uploadStudentIdImage();
        if (!uploadedStudentIdUrl && studentIdFile) {
          // Jika upload gagal, hentikan proses save
          return;
        }
      }

      // Prepare data untuk update profile
      const updateData: Partial<UserProfile> = {
        full_name: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        whatsapp: formData.whatsapp.trim() || null,
        date_of_birth: formData.dateOfBirth || null,
        gender: (formData.gender as "male" | "female") || null,
        university: formData.university.trim() || null,
        faculty: formData.faculty.trim() || null,
        major: formData.major.trim() || null,
        student_id: formData.studentId.trim() || null,
        student_id_image_url: uploadedStudentIdUrl,
        semester: formData.semester ? parseInt(formData.semester) : null,
        graduation_year: formData.graduationYear
          ? parseInt(formData.graduationYear)
          : null,
        province: formData.province.trim() || null,
        city: formData.city.trim() || null,
        address: formData.address.trim() || null,
        postal_code: formData.postalCode.trim() || null,
      };

      const result = await authService.updateProfile(user.id, updateData);

      if (result.error) {
        console.error("Error updating profile:", result.error);
        setSaveMessage({
          type: "error",
          message: result.error,
        });
        return;
      }

      if (result.profile) {
        setProfile(result.profile);
        setIsEditing(false);
        setSaveMessage({
          type: "success",
          message: "Profil berhasil diperbarui!",
        });

        // Clear success message setelah 3 detik
        setTimeout(() => {
          setSaveMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveMessage({
        type: "error",
        message: "Terjadi kesalahan sistem. Silakan coba lagi.",
      });
    } finally {
      setIsSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCancel = () => {
    // Reset form ke data profile yang tersimpan
    if (profile) {
      setFormData({
        fullName: profile.full_name || "",
        email: profile.email || "",
        whatsapp: profile.whatsapp || "",
        dateOfBirth: profile.date_of_birth || "",
        gender: profile.gender || "",
        university: profile.university || "",
        faculty: profile.faculty || "",
        major: profile.major || "",
        studentId: profile.student_id || "",
        semester: profile.semester?.toString() || "",
        graduationYear: profile.graduation_year?.toString() || "",
        province: profile.province || "",
        city: profile.city || "",
        address: profile.address || "",
        postalCode: profile.postal_code || "",
      });
      // Reset student ID image ke data tersimpan
      setStudentIdImageUrl(profile.student_id_image_url || null);
    }

    // Reset upload states
    setStudentIdFile(null);
    setStudentIdPreview(null);
    setIsEditing(false);
    setErrors({});
    setSaveMessage(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-neutral_02 to-neutral_01 rounded-xl flex items-center justify-center">
            <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-brand_01" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral_01">
              Profil
            </h1>
            <p className="text-neutral_01/60 text-sm sm:text-base">
              Kelola informasi profil Anda
            </p>
          </div>
        </div>
        <button
          onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
          className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 w-full sm:w-auto justify-center ${
            !isEditing
              ? "bg-neutral_02 hover:bg-neutral_02/80"
              : "bg-red-800 hover:bg-red-800/80"
          } border border-neutral_01/20 rounded-xl transition-colors w-fit`}
        >
          {!isEditing ? (
            <Edit3 className="w-4 h-4 text-neutral_01" />
          ) : (
            <X className="w-4 h-4 text-neutral_01" />
          )}
          <span className="text-sm font-medium text-neutral_01">
            {isEditing ? "Batal" : "Edit"}
          </span>
        </button>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Success/Error Message */}
        {saveMessage && (
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border ${
              saveMessage.type === "success"
                ? "bg-green-500/10 border-green-400/20 text-green-400"
                : "bg-red-500/10 border-red-400/20 text-red-400"
            }`}
          >
            {saveMessage.type === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <span className="text-sm font-medium">{saveMessage.message}</span>
          </div>
        )}

        {/* Data Dasar */}
        <div className="bg-neutral_01/5 backdrop-blur-sm border border-neutral_01/10 rounded-2xl p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-neutral_01 mb-4 sm:mb-6 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-neutral_02" />
            Data Dasar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-neutral_01 mb-2">
                <UserIcon className="w-4 h-4 inline mr-2" />
                Nama Lengkap
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2.5 sm:py-3 bg-neutral_01/10 border ${
                  errors.fullName ? "border-red-400/50" : "border-neutral_01/20"
                } rounded-lg text-neutral_01 placeholder-neutral_01/40 disabled:opacity-50 focus:outline-none focus:ring-2 ${
                  errors.fullName
                    ? "focus:ring-red-400/50"
                    : "focus:ring-neutral_02/50"
                } transition-all duration-200`}
                placeholder="Masukkan nama lengkap anda"
              />
              {errors.fullName && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.fullName}
                </p>
              )}
            </div>
            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-neutral_01 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                disabled
                className={`w-full px-3 py-2.5 sm:py-3 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 placeholder-neutral_01/40 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral_02/50 transition-all duration-200`}
                placeholder="contoh@email.com"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral_01 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                No. WhatsApp
              </label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2.5 sm:py-3 bg-neutral_01/10 border ${
                  errors.whatsapp ? "border-red-400/50" : "border-neutral_01/20"
                } rounded-lg text-neutral_01 placeholder-neutral_01/40 disabled:opacity-50 focus:outline-none focus:ring-2 ${
                  errors.whatsapp
                    ? "focus:ring-red-400/50"
                    : "focus:ring-neutral_02/50"
                } transition-all duration-200`}
                placeholder="Masukkan nomor whatsapp anda (08...)"
              />
              {errors.whatsapp && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.whatsapp}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral_01 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Tanggal Lahir
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2.5 sm:py-3 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 placeholder-neutral_01/40 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral_02/50 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral_01 mb-2">
                Jenis Kelamin
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2.5 sm:py-3 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral_02/50 transition-all duration-200"
              >
                <option className="text-brand_02" value="">
                  Pilih Jenis Kelamin
                </option>
                <option className="text-brand_02" value="male">
                  Laki-laki
                </option>
                <option className="text-brand_02" value="female">
                  Perempuan
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Akademik */}
        <div className="bg-neutral_01/5 backdrop-blur-sm border border-neutral_01/10 rounded-2xl p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-neutral_01 mb-4 sm:mb-6 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-neutral_02" />
            Data Akademik
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-neutral_01 mb-2">
                <Building2 className="w-4 h-4 inline mr-2" />
                Universitas/Institusi
              </label>
              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2.5 sm:py-3 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 placeholder-neutral_01/40 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral_02/50 transition-all duration-200"
                placeholder="Masukkan nama universitas anda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral_01 mb-2">
                <GraduationCap className="w-4 h-4 inline mr-2" />
                Fakultas
              </label>
              <input
                type="text"
                name="faculty"
                value={formData.faculty}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2.5 sm:py-3 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 placeholder-neutral_01/40 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral_02/50 transition-all duration-200"
                placeholder="Masukkan fakultas anda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral_01 mb-2">
                Jurusan/Program Studi
              </label>
              <input
                type="text"
                name="major"
                value={formData.major}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2.5 sm:py-3 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 placeholder-neutral_01/40 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral_02/50 transition-all duration-200"
                placeholder="Masukkan jurusan/program studi anda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral_01 mb-2">
                <Hash className="w-4 h-4 inline mr-2" />
                NIM/NIS
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2.5 sm:py-3 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 placeholder-neutral_01/40 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral_02/50 transition-all duration-200"
                placeholder="Masukkan NIS/NIM anda"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral_01 mb-2">
                Semester
              </label>
              <input
                type="number"
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                disabled={!isEditing}
                min="1"
                max="14"
                className={`w-full px-3 py-2.5 sm:py-3 bg-neutral_01/10 border ${
                  errors.semester ? "border-red-400/50" : "border-neutral_01/20"
                } rounded-lg text-neutral_01 placeholder-neutral_01/40 disabled:opacity-50 focus:outline-none focus:ring-2 ${
                  errors.semester
                    ? "focus:ring-red-400/50"
                    : "focus:ring-neutral_02/50"
                } transition-all duration-200`}
                placeholder="Semester anda sekarang (1-14)"
              />
              {errors.semester && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.semester}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral_01 mb-2">
                Tahun Angkatan
              </label>
              <input
                type="number"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleInputChange}
                disabled={!isEditing}
                min="2020"
                max="2030"
                className={`w-full px-3 py-2.5 sm:py-3 bg-neutral_01/10 border ${
                  errors.graduationYear
                    ? "border-red-400/50"
                    : "border-neutral_01/20"
                } rounded-lg text-neutral_01 placeholder-neutral_01/40 disabled:opacity-50 focus:outline-none focus:ring-2 ${
                  errors.graduationYear
                    ? "focus:ring-red-400/50"
                    : "focus:ring-neutral_02/50"
                } transition-all duration-200`}
                placeholder="Tahun angkatan anda"
              />
              {errors.graduationYear && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.graduationYear}
                </p>
              )}
            </div>
            {/* Student ID Image Upload */}
            <div className="">
              <label className="block text-sm font-medium text-neutral_01 mb-2">
                <Image className="w-4 h-4 inline mr-2" />
                Foto Kartu Mahasiswa/Pelajar
              </label>

              {/* Current Image or Upload Area */}
              {!isEditing && studentIdImageUrl ? (
                // Display mode - show current image
                <div className="relative group">
                  <img
                    src={studentIdImageUrl}
                    alt="Kartu Mahasiswa/Pelajar"
                    className="w-full h-48 object-cover rounded-lg border border-neutral_01/20"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => setShowStudentIdModal(true)}
                      className="px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat
                    </button>
                  </div>
                </div>
              ) : isEditing ? (
                // Edit mode - show upload interface
                <div className="space-y-4">
                  {/* Current image preview or file preview */}
                  {(studentIdPreview || studentIdImageUrl) && (
                    <div className="relative">
                      <img
                        src={studentIdPreview || studentIdImageUrl || ""}
                        alt="Preview Kartu Mahasiswa"
                        className="w-full h-48 object-cover rounded-lg border border-neutral_01/20"
                      />
                      <button
                        onClick={removeStudentIdImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Upload area */}
                  {!studentIdPreview && !studentIdImageUrl && (
                    <div className="border-2 border-dashed border-neutral_01/20 rounded-lg p-6 text-center hover:border-neutral_01/40 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleStudentIdImageSelect}
                        className="hidden"
                        id="student-id-upload"
                      />
                      <label
                        htmlFor="student-id-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <div className="w-12 h-12 bg-neutral_01/10 rounded-full flex items-center justify-center">
                          <Upload className="w-6 h-6 text-neutral_01/60" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral_01">
                            Upload Foto Kartu Mahasiswa/Pelajar
                          </p>
                          <p className="text-sm text-neutral_01/60 mt-1">
                            JPG, PNG, atau WEBP (maks. 10MB)
                          </p>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Upload new file button if already has image */}
                  {(studentIdImageUrl || studentIdPreview) && (
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleStudentIdImageSelect}
                        className="hidden"
                        id="student-id-upload-new"
                      />
                      <label
                        htmlFor="student-id-upload-new"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 hover:bg-neutral_01/20 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Ganti Gambar
                      </label>
                    </div>
                  )}

                  {/* Error message */}
                  {errors.studentIdImage && (
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.studentIdImage}
                    </p>
                  )}

                  {/* Upload progress */}
                  {isUploadingStudentId && (
                    <div className="flex items-center gap-2 text-sm text-neutral_01/60">
                      <div className="w-4 h-4 border-2 border-neutral_01/60 border-t-transparent rounded-full animate-spin"></div>
                      Mengupload gambar...
                    </div>
                  )}
                </div>
              ) : (
                // No image state
                <div className="border-2 border-dashed border-neutral_01/20 rounded-lg p-6 text-center">
                  <Image className="w-12 h-12 text-neutral_01/40 mx-auto mb-2" />
                  <p className="text-neutral_01/60 text-sm">
                    Belum ada foto kartu mahasiswa/pelajar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Alamat */}
        <div className="bg-neutral_01/5 backdrop-blur-sm border border-neutral_01/10 rounded-2xl p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-neutral_01 mb-4 sm:mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-neutral_02" />
            Data Alamat
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral_01 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Provinsi
              </label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2.5 sm:py-3 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 placeholder-neutral_01/40 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral_02/50 transition-all duration-200"
                placeholder="Masukkan provinsi domisili anda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral_01 mb-2">
                Kabupaten/Kota
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2.5 sm:py-3 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 placeholder-neutral_01/40 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral_02/50 transition-all duration-200"
                placeholder="Masukkan kota domisili anda"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-neutral_01 mb-2">
                Alamat Lengkap
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2.5 sm:py-3 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 placeholder-neutral_01/40 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral_02/50 resize-none transition-all duration-200"
                placeholder="Masukkan alamat anda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral_01 mb-2">
                Kode Pos
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2.5 sm:py-3 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 placeholder-neutral_01/40 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral_02/50 transition-all duration-200"
                placeholder="Masukkan kode pos anda"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:px-6 bg-neutral_01/10 border border-neutral_01/20 text-neutral_01 font-semibold rounded-xl hover:bg-neutral_01/15 transition-all duration-300 disabled:opacity-50 order-2 sm:order-1"
            >
              <X className="w-4 h-4" />
              <span>Batal</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:px-6 bg-gradient-to-r from-neutral_02 to-neutral_01 text-brand_01 font-semibold rounded-xl hover:opacity-70 transition-all duration-200 disabled:opacity-50 order-1 sm:order-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Student ID Image Modal */}
      {showStudentIdModal && studentIdImageUrl && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border overflow-scroll border-neutral_01/30 rounded-2xl w-full max-w-2xl max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral_01/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-neutral_02 to-neutral_01 rounded-xl flex items-center justify-center">
                  <Image className="w-5 h-5 text-brand_01" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-neutral_01">
                    Kartu Mahasiswa/Pelajar
                  </h3>
                  <p className="text-sm text-neutral_01/60">
                    {profile?.full_name || "Nama tidak tersedia"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStudentIdModal(false)}
                className="p-2 hover:bg-neutral_01/20 rounded-lg text-neutral_01/60 hover:text-neutral_01 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              <div className="relative bg-neutral_01/10 rounded-xl overflow-hidden">
                <img
                  src={studentIdImageUrl}
                  alt="Kartu Mahasiswa/Pelajar"
                  className="w-full h-auto max-h-[60vh] object-contain"
                  onError={(e) => {
                    console.error("Error loading image:", e);
                    setShowStudentIdModal(false);
                  }}
                />
              </div>

              {/* Action Buttons */}
              <button
                onClick={downloadStudentIdImage}
                className="mt-6 flex items-center ml-auto justify-center gap-2 px-4 py-2.5 bg-green-600/20 border border-green-500/30 rounded-xl text-green-400 hover:bg-green-600/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileContent;
