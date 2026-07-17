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
    description: "Pendaftaran seluruh kategori lomba dibuka, yaitu Hackathon dan Data Science.",
    Icon: RocketLaunchIcon,
    accent: "#FDD026",
  },
  {
    start: "2026-07-30",
    date: "30 Juli 2026",
    title: "Early Bird Hackathon Berakhir",
    description: "Batas akhir pendaftaran Early Bird untuk kategori Hackathon.",
    Icon: HourglassEmptyIcon,
    accent: "#FBBF24",
  },
  {
    start: "2026-08-10",
    date: "10 Agustus 2026",
    title: "Early Bird Data Science Berakhir",
    description: "Deadline pendaftaran Early Bird untuk kategori Data Science.",
    Icon: HourglassEmptyIcon,
    accent: "#60A5FA",
  },
  {
    start: "2026-08-13",
    date: "13 Agustus 2026",
    title: "Middle Bird Hackathon Ditutup",
    description: "Penutupan pendaftaran gelombang Middle Bird untuk kategori Hackathon.",
    Icon: HourglassEmptyIcon,
    accent: "#38BDF8",
  },
  {
    start: "2026-08-20",
    date: "20 Agustus 2026",
    title: "Submission Hackathon Dibuka",
    description: "Periode pengumpulan proposal/submission untuk kategori Hackathon dimulai.",
    Icon: RocketLaunchIcon,
    accent: "#2596BE",
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
    start: "2026-10-12",
    date: "12 Oktober 2026",
    title: "Pengumuman Finalis Data Science",
    description: "Tim finalis Data Science diumumkan setelah penilaian juri.",
    Icon: CampaignIcon,
    accent: "#2596BE",
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
