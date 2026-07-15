import React from "react";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CampaignIcon from "@mui/icons-material/Campaign";
import FestivalIcon from "@mui/icons-material/Festival";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

export const timelineData = [
  {
    title: "August 17, 2025",
    image: "/assets/images/infest-24.webp",
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-yellow to-brand_01 flex items-center justify-center shadow-lg text-white">
            <RocketLaunchIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-neutral_01">Registration Opens</h3>
        </div>
        <p className="text-sm md:text-base text-neutral_01/80 leading-relaxed">
          Welcome to INFEST XI 2026. Registration is now open for all competitions.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-neutral_01/10 text-neutral_01 text-xs font-semibold">All Competitions</span>
          <span className="px-3 py-1 rounded-full bg-neutral_01/10 text-neutral_01 text-xs font-semibold">Digitopia Theme</span>
          <span className="px-3 py-1 rounded-full bg-neutral_01/10 text-neutral_01 text-xs">Online Portal</span>
        </div>
        <div className="bg-gradient-to-r from-primary-yellow/10 to-brand_01/10 rounded-xl p-3 border border-primary-yellow/30 flex flex-col gap-2">
          <p className="text-xs md:text-sm text-neutral_01/80">
            Early Bird for Hackathon & UI/UX: <span className="text-primary-yellow font-semibold">until Sep 14, 2025</span>
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "September - October, 2025",
    image: "/assets/images/infest-1.webp",
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral_02 to-brand_01 flex items-center justify-center shadow-lg text-white">
            <HourglassEmptyIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-neutral_01">Registration Deadline</h3>
        </div>
        <p className="text-sm md:text-base text-neutral_01/80 leading-relaxed">
          Final call. Complete your registration and team details for Hackathon. Portal closes 23:59 WIB.
        </p>
        <div className="bg-gradient-to-r from-primary-yellow/10 to-brand_01/10 rounded-xl p-3 border border-primary-yellow/30 flex flex-col gap-2">
          <p className="text-xs md:text-sm text-neutral_01/80">
            Hackathon Registration Deadline: <span className="text-primary-yellow font-semibold">Sep 21, 2025</span>
          </p>
          <p className="text-xs md:text-sm text-neutral_01/80">
            UI/UX Registration Deadline: <span className="text-primary-yellow font-semibold">Oct 5, 2025</span>
          </p>
          <p className="text-xs md:text-sm text-neutral_01/80">
            Data Science Registration Deadline: <span className="text-primary-yellow font-semibold">Oct 13, 2025</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-neutral_01/10 text-neutral_01 text-xs font-semibold">Complete Team</span>
          <span className="px-3 py-1 rounded-full bg-neutral_01/10 text-neutral_01 text-xs">Upload Documents</span>
          <span className="px-3 py-1 rounded-full bg-neutral_01/10 text-neutral_01 text-xs">Confirm Payment</span>
        </div>
      </div>
    ),
  },
  {
    title: "Oct, 2025",
    image: "/assets/images/infest-2.webp",
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand_01 to-neutral_02 flex items-center justify-center shadow-lg text-white">
            <EmojiEventsIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-neutral_01">Competitions</h3>
        </div>
        <p className="text-sm md:text-base text-neutral_01/80 leading-relaxed">
          Team-based competitions qualification submission
        </p>
        <div className="bg-gradient-to-r from-primary-yellow/10 to-brand_01/10 rounded-xl p-3 border border-primary-yellow/30 flex flex-col gap-2">
          <p className="text-xs md:text-sm text-neutral_01/80">
            Hackathon Qualification: <span className="text-primary-yellow font-semibold">Sep 23 - 05 Oct, 2025</span>
          </p>
          <p className="text-xs md:text-sm text-neutral_01/80">
            UI/UX Qualification: <span className="text-primary-yellow font-semibold">Sep 27 - Oct 5, 2025</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-neutral_01/10 text-neutral_01 text-xs">Industry & Academia</span>
          <span className="px-3 py-1 rounded-full bg-neutral_01/10 text-neutral_01 text-xs">Innovation • Technical • Impact</span>
        </div>
      </div>
    ),
  },
  {
    title: "October 11 - 12, 2025",
    image: "/assets/images/infest-5.webp",
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-yellow to-neutral_01 flex items-center justify-center shadow-lg text-brand_01">
            <CampaignIcon className="w-5 h-5 text-brand_01" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-neutral_01">Finalist Announcement (Hackathon & UI/UX)</h3>
        </div>
        <p className="text-sm md:text-base text-neutral_01/80 leading-relaxed">
          Finalists announced after rigorous evaluation. Get ready for the grand finale.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-neutral_01/10 text-neutral_01 text-xs">Top Teams</span>
          <span className="px-3 py-1 rounded-full bg-neutral_01/10 text-neutral_01 text-xs">Briefing & Mentoring</span>
        </div>
      </div>
    ),
  },
  {
    title: "October 17, 2025",
    image: "/assets/images/infest-19.webp",
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand_01 to-primary-yellow flex items-center justify-center shadow-lg text-white">
            <FestivalIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-neutral_01">Grand Finale Day</h3>
        </div>
        <p className="text-sm md:text-base text-neutral_01/80 leading-relaxed">
          Opening ceremony and final stage for all competitions.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-neutral_01/10 text-neutral_01 text-xs">Hackathon Finals</span>
          <span className="px-3 py-1 rounded-full bg-neutral_01/10 text-neutral_01 text-xs">UI/UX Finals</span>
          <span className="px-3 py-1 rounded-full bg-neutral_01/10 text-neutral_01 text-xs">Data Science Finals</span>
        </div>
      </div>
    ),
  },
  {
    title: "October 19, 2025",
    image: "/assets/images/infest-25.webp",
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-yellow to-brand_01 flex items-center justify-center shadow-lg text-white">
            <WorkspacePremiumIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-neutral_01">National Seminar & Awards Ceremony</h3>
        </div>
        <p className="text-sm md:text-base text-neutral_01/80 leading-relaxed">
          Grand closing ceremony. Celebrating achievements and announcing winners.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-neutral_01/10 text-neutral_01 text-xs">Seminar</span>
          <span className="px-3 py-1 rounded-full bg-neutral_01/10 text-neutral_01 text-xs">Champions</span>
          <span className="px-3 py-1 rounded-full bg-neutral_01/10 text-neutral_01 text-xs">Runner-up</span>
          <span className="px-3 py-1 rounded-full bg-neutral_01/10 text-neutral_01 text-xs">Third Place</span>
        </div>
      </div>
    ),
  },
];
