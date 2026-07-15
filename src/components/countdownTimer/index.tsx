"use client";

import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle, Calendar } from "lucide-react";

interface CountdownTimerProps {
  targetDate: string;
  label: string;
  className?: string;
  competitionStarted?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  label,
  className = "",
  competitionStarted = false,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  const calculateTimeRemaining = (targetDate: string): TimeRemaining => {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const difference = target - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      total: difference,
    };
  };

  useEffect(() => {
    const updateTimer = () => {
      const remaining = calculateTimeRemaining(targetDate);
      setTimeRemaining(remaining);
      setIsExpired(remaining.total <= 0);
    };

    // Update immediately
    updateTimer();

    // Set up interval to update every second
    const interval = setInterval(updateTimer, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [targetDate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  const getUrgencyLevel = () => {
    if (isExpired) return "expired";
    if (!competitionStarted) return "waiting";
    if (timeRemaining.days <= 1) return "critical";
    if (timeRemaining.days <= 3) return "warning";
    return "normal";
  };

  const urgencyLevel = getUrgencyLevel();

  const urgencyStyles = {
    expired: {
      container: "bg-red-500/5 border-red-400/20 backdrop-blur-sm",
      gradient: "from-red-500/10 to-red-400/5",
      text: "text-red-400",
      icon: "text-red-400",
      accent: "bg-red-400/20",
      cardBg: "bg-red-500/10",
    },
    critical: {
      container: "bg-red-500/5 border-red-400/15 backdrop-blur-sm animate-pulse",
      gradient: "from-red-500/10 to-orange-400/5",
      text: "text-red-400",
      icon: "text-red-400",
      accent: "bg-red-400/20",
      cardBg: "bg-red-500/10",
    },
    warning: {
      container: "bg-orange-500/5 border-orange-400/15 backdrop-blur-sm",
      gradient: "from-orange-500/10 to-yellow-400/5",
      text: "text-orange-400",
      icon: "text-orange-400",
      accent: "bg-orange-400/20",
      cardBg: "bg-orange-500/10",
    },
    normal: {
      container: "bg-neutral_02/5 border-neutral_02/15 backdrop-blur-sm",
      gradient: "from-neutral_02/10 to-neutral_01/5",
      text: "text-neutral_02",
      icon: "text-neutral_02",
      accent: "bg-neutral_02/20",
      cardBg: "bg-neutral_02/10",
    },
    waiting: {
      container: "bg-blue-500/5 border-blue-400/15 backdrop-blur-sm",
      gradient: "from-blue-500/10 to-blue-400/5",
      text: "text-blue-400",
      icon: "text-blue-400",
      accent: "bg-blue-400/20",
      cardBg: "bg-blue-500/10",
    },
  };

  const currentStyle = urgencyStyles[urgencyLevel];

  if (isExpired) {
    return (
      <div className={`relative overflow-hidden ${currentStyle.container} border rounded-2xl p-4 mb-6 ${className}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${currentStyle.gradient} opacity-50`} />
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className={`${currentStyle.cardBg} p-3 rounded-xl backdrop-blur-sm`}>
              <CheckCircle className={`w-6 h-6 ${currentStyle.icon}`} />
            </div>
            <div className="flex-1">
              <h3 className={`${currentStyle.text} font-bold text-lg mb-1`}>
                Deadline Telah Berakhir
              </h3>
              <div className="flex items-center gap-2 text-red-500">
                <Calendar className={`w-4 h-4 ${currentStyle.text}/70`} />
                <p className={`${currentStyle.text}/80 text-sm`}>
                  {label} berakhir pada {formatDate(targetDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${currentStyle.container} border rounded-2xl p-4 mb-6 ${className}`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentStyle.gradient} opacity-50`} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`${currentStyle.cardBg} p-3 rounded-xl backdrop-blur-sm`}>
            {urgencyLevel === "critical" ? (
              <AlertTriangle className={`w-6 h-6 ${currentStyle.icon}`} />
            ) : (
              <Clock className={`w-6 h-6 ${currentStyle.icon}`} />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`${currentStyle.text} font-bold text-lg mb-1`}>
              {label}
            </h3>
            <div className="flex items-center gap-2 text-neutral_01">
              <Calendar className={`w-4 h-4 ${currentStyle.text}/70 `} />
              <p className={`${currentStyle.text}/80 text-sm `}>
                {formatDate(targetDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Countdown Display */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { value: timeRemaining.days, label: "Hari" },
            { value: timeRemaining.hours, label: "Jam" },
            { value: timeRemaining.minutes, label: "Menit" },
            { value: timeRemaining.seconds, label: "Detik" },
          ].map(({ value, label }, index) => (
            <div key={index} className={`${currentStyle.cardBg} rounded-xl p-4 text-center backdrop-blur-sm border border-white/10`}>
              <div className={`${currentStyle.text} text-2xl font-bold mb-1 font-mono`}>
                {value.toString().padStart(2, '0')}
              </div>
              <div className={`${currentStyle.text}/70 text-xs font-medium uppercase tracking-wider text-neutral_01`}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="bg-neutral_01/10 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${currentStyle.gradient} transition-all duration-1000 ease-out`}
              style={{ 
                width: urgencyLevel === "critical" ? "90%" : 
                       urgencyLevel === "warning" ? "60%" : "30%" 
              }}
            />
          </div>
        </div>

        {/* Urgency Messages */}
        {urgencyLevel === "critical" && (
          <div className={`${currentStyle.cardBg} rounded-xl p-4 border border-red-400/20`}>
            <div className="flex items-center gap-3">
              <div className={`${currentStyle.accent} p-2 rounded-lg`}>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className={`${currentStyle.text} text-sm font-semibold mb-1`}>
                  ⚠️ Waktu Hampir Habis!
                </p>
                <p className={`${currentStyle.text}/80 text-xs`}>
                  Kurang dari 24 jam tersisa. Segera upload proposal dan orisinalitas Anda!
                </p>
              </div>
            </div>
          </div>
        )}

        {urgencyLevel === "warning" && (
          <div className={`${currentStyle.cardBg} rounded-xl p-4 border border-orange-400/20`}>
            <div className="flex items-center gap-3">
              <div className={`${currentStyle.accent} p-2 rounded-lg`}>
                <Clock className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className={`${currentStyle.text} text-sm font-semibold mb-1`}>
                  ⏰ Pengingat Deadline
                </p>
                <p className={`${currentStyle.text}/80 text-xs`}>
                  Waktu terbatas! Pastikan Anda sudah menyiapkan proposal dan orisinalitas karya.
                </p>
              </div>
            </div>
          </div>
        )}

        {urgencyLevel === "normal" && (
          <div className={`${currentStyle.cardBg} rounded-xl p-4 border border-neutral_02/20`}>
            <div className="flex items-center gap-3">
              <div className={`${currentStyle.accent} p-2 rounded-lg`}>
                <CheckCircle className="w-4 h-4 text-neutral_02" />
              </div>
              <div>
                <p className={`${currentStyle.text} text-sm font-semibold mb-1`}>
                  📝 Masa Pengumpulan Berlangsung
                </p>
                <p className={`${currentStyle.text}/80 text-xs text-neutral_01`}>
                  Anda sudah dapat mengumpulkan proposal dan orisinalitas karya. Gunakan waktu dengan baik!
                </p>
              </div>
            </div>
          </div>
        )}

        {urgencyLevel === "waiting" && (
          <div className={`${currentStyle.cardBg} rounded-xl p-4 border border-blue-400/20`}>
            <div className="flex items-center gap-3">
              <div className={`${currentStyle.accent} p-2 rounded-lg`}>
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className={`${currentStyle.text} text-sm font-semibold mb-1`}>
                  ⏳ Menunggu Kompetisi Dimulai
                </p>
                <p className={`${currentStyle.text}/80 text-xs`}>
                  Pengumpulan proposal dan orisinalitas akan dibuka setelah kompetisi dimulai.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;