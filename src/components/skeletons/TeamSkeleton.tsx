"use client";

import React from "react";

const TeamSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-neutral_01/10 rounded w-32"></div>
        <div className="flex gap-3">
          <div className="h-10 bg-neutral_01/10 rounded w-24"></div>
          <div className="h-10 bg-neutral_01/10 rounded w-24"></div>
        </div>
      </div>

      {/* Team Card */}
      <div className="bg-neutral_01/5 rounded-lg p-6 border border-neutral_01/10">
        <div className="space-y-6">
          {/* Team Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-7 bg-neutral_01/10 rounded w-48"></div>
              <div className="h-4 bg-neutral_01/10 rounded w-64"></div>
            </div>
            <div className="h-10 bg-neutral_01/10 rounded w-24"></div>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center p-4 bg-neutral_01/5 rounded-lg">
                <div className="h-8 bg-neutral_01/10 rounded w-12 mx-auto mb-2"></div>
                <div className="h-4 bg-neutral_01/10 rounded w-24 mx-auto"></div>
              </div>
            ))}
          </div>

          {/* Team Code */}
          <div className="bg-neutral_01/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-neutral_01/10 rounded w-20"></div>
                <div className="h-6 bg-neutral_01/10 rounded w-32"></div>
              </div>
              <div className="h-10 bg-neutral_01/10 rounded w-20"></div>
            </div>
          </div>

          {/* Members */}
          <div className="space-y-4">
            <div className="h-6 bg-neutral_01/10 rounded w-32"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-neutral_01/5 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neutral_01/10 rounded-full"></div>
                    <div className="space-y-1">
                      <div className="h-5 bg-neutral_01/10 rounded w-32"></div>
                      <div className="h-4 bg-neutral_01/10 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 bg-neutral_01/10 rounded w-16"></div>
                    <div className="h-8 bg-neutral_01/10 rounded w-8"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSkeleton;
