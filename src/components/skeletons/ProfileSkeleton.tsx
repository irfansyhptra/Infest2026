"use client";

import React from "react";

const ProfileSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-neutral_01/10 rounded w-48"></div>
        <div className="h-10 bg-neutral_01/10 rounded w-24"></div>
      </div>

      {/* Profile Card */}
      <div className="bg-neutral_01/5 rounded-lg p-6 border border-neutral_01/10">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-neutral_01/10 rounded-full"></div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="h-6 bg-neutral_01/10 rounded w-48"></div>
              <div className="h-4 bg-neutral_01/10 rounded w-32"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-neutral_01/10 rounded"></div>
                  <div className="space-y-1 flex-1">
                    <div className="h-3 bg-neutral_01/10 rounded w-20"></div>
                    <div className="h-4 bg-neutral_01/10 rounded w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Student ID Card */}
      <div className="bg-neutral_01/5 rounded-lg p-6 border border-neutral_01/10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-neutral_01/10 rounded w-40"></div>
            <div className="h-10 bg-neutral_01/10 rounded w-32"></div>
          </div>
          
          <div className="border-2 border-dashed border-neutral_01/20 rounded-lg p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-neutral_01/10 rounded mx-auto"></div>
              <div className="space-y-2">
                <div className="h-5 bg-neutral_01/10 rounded w-48 mx-auto"></div>
                <div className="h-4 bg-neutral_01/10 rounded w-64 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
