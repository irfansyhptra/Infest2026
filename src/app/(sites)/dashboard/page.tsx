"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProfileContent from "./(contents)/profileContent";
import TeamContent from "./(contents)/teamContent";
import CompetitionContent from "./(contents)/competitionContent";

const Dashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentMenu = searchParams.get("menu");

  // Set default menu with localStorage support
  useEffect(() => {
    if (!currentMenu) {
      // Get last visited menu from localStorage, default to "profil"
      const lastMenu = localStorage.getItem("dashboard-last-menu") || "profil";
  router.replace(`/dashboard?menu=${lastMenu}`);
    } else {
      // Save current menu to localStorage
      localStorage.setItem("dashboard-last-menu", currentMenu);
    }
  }, [currentMenu, router]);

  // Render content based on current menu
  const renderContent = () => {
    switch (currentMenu) {
      case "profil":
        return <ProfileContent />;
      case "kompetisi":
        return <CompetitionContent />;
      case "tim":
        return <TeamContent />;
      default:
        return <ProfileContent />;
    }
  };

  return (
    <main className="w-full">
      <div className="w-full">{renderContent()}</div>
    </main>
  );
};

export default Dashboard;
