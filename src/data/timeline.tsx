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
    start: "2026-09-04",
    date: "4 Sep – 3 Okt 2026",
    title: "Registration Deadline",
    description: "UI/UX: 3 Oktober 2026\nHackathon: 4 September 2026\nData Science: 12 September 2026",
    Icon: HourglassEmptyIcon,
    accent: "#3B82F6",
  },
  {
    start: "2026-08-20",
    date: "20 Agu – 30 Okt 2026",
    title: "Competition",
    description: "UI/UX: 27 Sep – 3 Okt\nHackathon: 20 Agustus – 12 Sep\nData Science: 18 – 30 Oktober 2026",
    Icon: RocketLaunchIcon,
    accent: "#2596BE",
  },
  {
    start: "2026-09-14",
    date: "Sep – Okt 2026",
    title: "Finalist Announcement",
    description: "UI/UX: 11 Oktober\nHackathon: 14 September\nData Science: 12 Oktober",
    Icon: CampaignIcon,
    accent: "#60A5FA",
  },
  {
    start: "2026-10-17",
    date: "17 – 23 Okt 2026",
    title: "Grand Final Day",
    description: "UI/UX: 17 Oktober\nHackathon: 23 Oktober\nData Science: 23 Oktober",
    Icon: WorkspacePremiumIcon,
    accent: "#FDD026",
  },
  {
    start: "2026-10-25",
    date: "25 Oktober 2026",
    title: "National Seminar & Awards Ceremony",
    description: "Seminar Nasional, pengumuman juara seluruh kategori lomba, dan closing ceremony INFEST XII.",
    Icon: WorkspacePremiumIcon,
    accent: "#3B82F6",
  },
];
