import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CampaignIcon from "@mui/icons-material/Campaign";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

import type { TimelineNode } from "@/components/timeline";

// Sorted chronologically — node spacing is derived from `start`.
export const timelineData: TimelineNode[] = [
  {
    start: "2026-07-20",
    date: "20 Juli 2026",
    title: "Pendaftaran Dibuka",
    description: "Pendaftaran seluruh cabang lomba resmi dibuka.",
    Icon: RocketLaunchIcon,
    accent: "#FDD026",
  },
  {
    start: "2026-08-10",
    date: "10 Agustus 2026",
    title: "Pendaftaran UI/UX & Umum Dibuka",
    description: "Pendaftaran resmi UI/UX dan kategori umum dibuka, sekaligus dimulainya skema Early Bird (10 Agustus–5 September 2026).",
    Icon: RocketLaunchIcon,
    accent: "#60A5FA",
  },
  {
    start: "2026-09-04",
    date: "4 September 2026",
    title: "Penutupan Pendaftaran Hackathon",
    description: "Pendaftaran Hackathon secara keseluruhan resmi ditutup.",
    Icon: HourglassEmptyIcon,
    accent: "#3B82F6",
  },
  {
    start: "2026-09-05",
    date: "5 September 2026",
    title: "Early Bird UI/UX & Umum Berakhir",
    description: "Skema Early Bird untuk lomba UI/UX dan kategori umum berakhir.",
    Icon: HourglassEmptyIcon,
    accent: "#FBBF24",
  },
  {
    start: "2026-09-06",
    date: "6 September 2026",
    title: "Normal Price UI/UX & Umum Dimulai",
    description: "Skema Normal Price berlaku untuk UI/UX dan kategori umum hingga 3 Oktober 2026.",
    Icon: RocketLaunchIcon,
    accent: "#38BDF8",
  },
  {
    start: "2026-09-12",
    date: "12 September 2026",
    title: "Deadline Data Science & Proposal Hackathon",
    description: "Batas akhir pendaftaran Data Science sekaligus deadline pengumpulan proposal Hackathon.",
    Icon: HourglassEmptyIcon,
    accent: "#FDD026",
  },
  {
    start: "2026-09-14",
    date: "14 September 2026",
    title: "Pengumuman Finalis Hackathon",
    description: "Tim finalis Hackathon diumumkan setelah penilaian proposal.",
    Icon: CampaignIcon,
    accent: "#60A5FA",
  },
  {
    start: "2026-09-27",
    date: "27 September 2026",
    title: "Pengumpulan Karya UI/UX Dibuka",
    description: "Periode pengumpulan karya untuk lomba UI/UX berlangsung hingga 3 Oktober 2026.",
    Icon: RocketLaunchIcon,
    accent: "#2596BE",
  },
  {
    start: "2026-10-03",
    date: "3 Oktober 2026",
    title: "Pendaftaran UI/UX & Umum Ditutup",
    description: "Pendaftaran UI/UX dan kategori umum resmi ditutup, sekaligus batas akhir pengumpulan karya UI/UX.",
    Icon: HourglassEmptyIcon,
    accent: "#3B82F6",
  },
  {
    start: "2026-10-04",
    date: "4 Oktober 2026",
    title: "Penilaian Karya UI/UX Dimulai",
    description: "Proses penilaian karya UI/UX berlangsung hingga 10 Oktober 2026.",
    Icon: HourglassEmptyIcon,
    accent: "#FBBF24",
  },
  {
    start: "2026-10-11",
    date: "11 Oktober 2026",
    title: "Pengumuman Finalis UI/UX",
    description: "Tim finalis UI/UX diumumkan setelah proses penilaian selesai.",
    Icon: CampaignIcon,
    accent: "#60A5FA",
  },
  {
    start: "2026-10-12",
    date: "12 Oktober 2026",
    title: "Pengumuman Finalis Data Science",
    description: "Tim finalis Data Science diumumkan setelah penilaian juri.",
    Icon: CampaignIcon,
    accent: "#2596BE",
  },
  {
    start: "2026-10-24",
    date: "24 Oktober 2026",
    title: "Pembukaan Acara INFEST & Hackathon",
    description: "Pembukaan Acara Infest dan Pembukaan Acara Hackathon.",
    Icon: RocketLaunchIcon,
    accent: "#FDD026",
  },
  {
    start: "2026-10-25",
    date: "25 Oktober 2026",
    title: "Puncak Acara & Penutupan",
    description: "Seminar Nasional, pengumuman juara seluruh kategori lomba, dan closing ceremony INFEST XII.",
    Icon: WorkspacePremiumIcon,
    accent: "#3B82F6",
  },
];
