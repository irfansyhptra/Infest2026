export type CalendarEventCategory =
  | "registration"
  | "deadline"
  | "jury"
  | "announcement"
  | "finale"
  | "awards"
  | "competition";

export interface CalendarEventItem {
  id: string;
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string (inclusive of the day)
  category: CalendarEventCategory;
  description?: string;
  linkText?: string;
  linkUrl?: string;
}

// Important dates derived from timelineData with normalized structure for the calendar
export const calendarEvents: CalendarEventItem[] = [
  {
    id: "reg-open",
    title: "Pendaftaran Dibuka",
    start: "2025-08-15",
    end: "2025-08-15",
    category: "registration",
    description:
      "Registrasi INFEST XI 2025 resmi dibuka untuk semua kompetisi.",
    linkText: "Buka Portal",
    linkUrl: "/dashboard/competition",
  },
  {
    id: "reg-deadline",
    title: "Batas Akhir Pendaftaran",
    start: "2025-09-28",
    end: "2025-09-28",
    category: "deadline",
    description:
      "Batas terakhir melengkapi data tim dan pembayaran. Portal tutup 23:59 WIB.",
  },
  {
    id: "jury-assessment",
    title: "Penilaian Juri",
    start: "2025-09-29",
    end: "2025-09-29",
    category: "jury",
    description:
      "Proses seleksi dan evaluasi oleh juri dari industri dan akademisi.",
  },
  {
    id: "finalist-announcement",
    title: "Pengumuman Finalis",
    start: "2025-10-06",
    end: "2025-10-06",
    category: "announcement",
    description: "Finalis diumumkan dan briefing persiapan grand final.",
  },
  {
    id: "grand-finale",
    title: "Grand Finale Day",
    start: "2025-10-17",
    end: "2025-10-17",
    category: "finale",
    description:
      "Upacara pembukaan dan presentasi final di hadapan audiens.",
  },
  {
    id: "awards-ceremony",
    title: "Awards Ceremony",
    start: "2025-10-18",
    end: "2025-10-18",
    category: "awards",
    description: "Penutupan dan pengumuman pemenang.",
  },
];
