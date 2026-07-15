import { UserProfile } from "../services/authService";

// Helper function to check if profile is complete
export const isProfileComplete = (profile: UserProfile | null): boolean => {
  if (!profile) return false;

  const requiredFields = [
    "full_name",
    "email",
    "whatsapp",
    "date_of_birth",
    "gender",
    "university",
    "faculty",
    "major",
    "student_id",
    "student_id_image_url",
    "semester",
    "graduation_year",
    "province",
    "city",
    "address",
    "postal_code",
  ];

  return requiredFields.every((field) => {
    const value = profile[field as keyof UserProfile];
    return value !== null && value !== undefined && String(value).trim() !== "";
  });
};

// Helper function to get missing profile fields
export const getMissingProfileFields = (profile: UserProfile | null): string[] => {
  if (!profile) return ["Semua field profil"];

  const fieldLabels: Record<string, string> = {
    full_name: "Nama Lengkap",
    email: "Email",
    whatsapp: "WhatsApp",
    date_of_birth: "Tanggal Lahir",
    gender: "Jenis Kelamin",
    university: "Universitas",
    faculty: "Fakultas",
    major: "Jurusan",
    student_id: "NIM",
    semester: "Semester",
    graduation_year: "Tahun Angkatan",
    province: "Provinsi",
    city: "Kota",
    address: "Alamat",
    postal_code: "Kode Pos",
  };

  const missingFields: string[] = [];

  Object.entries(fieldLabels).forEach(([field, label]) => {
    const value = profile[field as keyof UserProfile];
    if (value === null || value === undefined || String(value).trim() === "") {
      missingFields.push(label);
    }
  });

  return missingFields;
};