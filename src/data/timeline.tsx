import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CampaignIcon from "@mui/icons-material/Campaign";
import FestivalIcon from "@mui/icons-material/Festival";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

import type { TimelineNode } from "@/components/timeline";

// Sorted chronologically — node spacing is derived from `start`.
export const timelineData: TimelineNode[] = [
  {
    start: "2026-07-20",
    date: "20 Juli 2026",
    title: "Pendaftaran Dibuka",
    description: "UI/UX & Hackathon membuka pendaftaran. UI/UX tutup 4 Sep, Hackathon tutup 12 Sep 2026.",
    Icon: RocketLaunchIcon,
    accent: "#FDD026",
  },
  {
    start: "2026-08-10",
    date: "10 Agustus 2026",
    title: "Pendaftaran Lomba Lainnya Dibuka",
    description: "Kategori lomba lainnya membuka pendaftaran hingga 3 Oktober 2026.",
    Icon: RocketLaunchIcon,
    accent: "#FBBF24",
  },
  {
    start: "2026-09-04",
    date: "4 September 2026",
    title: "Penutupan Pendaftaran UI/UX",
    description: "Portal pendaftaran UI/UX resmi ditutup pukul 23:59 WIB.",
    Icon: HourglassEmptyIcon,
    accent: "#60A5FA",
  },
  {
    start: "2026-09-12",
    date: "12 September 2026",
    title: "Penutupan Pendaftaran Hackathon",
    description: "Portal pendaftaran Hackathon resmi ditutup pukul 23:59 WIB.",
    Icon: HourglassEmptyIcon,
    accent: "#38BDF8",
  },
  {
    start: "2026-09-14",
    date: "14 September 2026",
    title: "Pengumuman Finalis UI/UX",
    description: "Tim finalis UI/UX diumumkan setelah penilaian juri, dilanjutkan briefing tim.",
    Icon: CampaignIcon,
    accent: "#2596BE",
  },
  {
    start: "2026-10-03",
    date: "3 Oktober 2026",
    title: "Penutupan Pendaftaran Lomba Lainnya",
    description: "Portal pendaftaran kategori lomba lainnya resmi ditutup pukul 23:59 WIB.",
    Icon: HourglassEmptyIcon,
    accent: "#3B82F6",
  },
  {
    start: "2026-10-11",
    date: "11 – 12 Oktober 2026",
    title: "Pengumuman Finalis",
    description: "Finalis Lomba Kategori Lainnya (11 Okt) dan Hackathon (12 Okt) diumumkan.",
    Icon: CampaignIcon,
    accent: "#FDD026",
  },
  {
    start: "2026-10-17",
    date: "17 Oktober 2026",
    title: "Babak Final Lomba Lainnya",
    description: "Presentasi onsite babak final untuk kategori lomba lainnya.",
    Icon: EmojiEventsIcon,
    accent: "#60A5FA",
  },
  {
    start: "2026-10-23",
    date: "23 – 24 Oktober 2026",
    title: "Babak Final Hackathon & UI/UX",
    description: "Hackathon final onsite 23 Okt, UI/UX final onsite 23–24 Okt, disusul Pembukaan Infest pada 24 Okt.",
    Icon: FestivalIcon,
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
