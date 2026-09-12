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
    title: "Open Registration",
    description: "Pendaftaran seluruh cabang lomba resmi dibuka.",
    Icon: RocketLaunchIcon,
    accent: "#FDD026",
  },
  {
    start: "2026-08-20",
    date: "20 Agu – 3 Okt 2026",
    title: "Competition",
    description: "UI/UX: 27 Sep – 3 Okt\nHackathon: 20 Agu – 26 Sep\nData Science: 14 – 26 Sep 2026",
    Icon: RocketLaunchIcon,
    accent: "#2596BE",
  },
  {
    start: "2026-09-12",
    date: "12 Sep – 3 Okt 2026",
    title: "Registration Deadline",
    description: "Hackathon & Data Science: 12 September 2026\nUI/UX: 3 Oktober 2026",
    Icon: HourglassEmptyIcon,
    accent: "#3B82F6",
  },
  {
    start: "2026-10-07",
    date: "7 – 11 Okt 2026",
    title: "Finalist Announcement",
    description: "Hackathon: 7 Okt\nData Science: 8 Okt\nUI/UX: 11 Okt",
    Icon: CampaignIcon,
    accent: "#60A5FA",
  },
  {
    start: "2026-10-17",
    date: "17 – 18 Okt 2026",
    title: "Grand Final Day",
    description: "UI/UX & Data Science: 17 Okt\nHackathon: 17 – 18 Okt",
    Icon: WorkspacePremiumIcon,
    accent: "#FDD026",
  },
  {
    start: "2026-10-20",
    date: "20 Oktober 2026",
    title: "National Seminar & Awards Ceremony",
    description: "Pengumuman juara seluruh kategori lomba (20 Okt), Seminar Nasional, dan closing ceremony INFEST XII.",
    Icon: WorkspacePremiumIcon,
    accent: "#3B82F6",
  },
];
