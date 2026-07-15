import ProtectedLayout from "@/app/(layouts)/protectedLayout";
import { LoadingAnimation } from "@/components/loadingAnimation";
import { Sidebar } from "@/components/sidebar";
import React, { Suspense } from "react";

const DashboardContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand_01/20 via-brand_02 to-brand_02 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <div className="flex-1 py-4 px-1 sm:p-4 lg:p-8 w-full lg:mr-0">
          {children}
        </div>
      </div>
    </div>
  );
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense
      fallback={<LoadingAnimation loadingText="Loading Dashboard..." />}
    >
      <ProtectedLayout>
        <DashboardContent>{children}</DashboardContent>
      </ProtectedLayout>
    </Suspense>
  );
};

export default DashboardLayout;
