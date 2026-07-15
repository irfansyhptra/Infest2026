"use client";

import React from "react";

const CompetitionSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="h-8 bg-neutral_01/10 rounded w-40"></div>

      {/* Competition Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-neutral_01/5 rounded-lg overflow-hidden border border-neutral_01/10">
            {/* Image */}
            <div className="h-48 bg-neutral_01/10"></div>
            
            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Title and Status */}
              <div className="space-y-2">
                <div className="h-6 bg-neutral_01/10 rounded w-3/4"></div>
                <div className="h-6 bg-neutral_01/10 rounded w-24"></div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="h-4 bg-neutral_01/10 rounded w-full"></div>
                <div className="h-4 bg-neutral_01/10 rounded w-5/6"></div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-neutral_01/10 rounded"></div>
                    <div className="h-4 bg-neutral_01/10 rounded w-32"></div>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <div className="h-10 bg-neutral_01/10 rounded w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetitionSkeleton;
