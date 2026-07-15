"use client";

import React, { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  events: Array<{
    id: string;
    title: string;
    start: string; // ISO string
    end: string;   // ISO string
    description?: string;
  }>;
};
// Unified styles (single color for all markers)
const DOT_CLASS = "bg-primary-yellow";
const BADGE_CLASS = "bg-primary-yellow/20 text-primary-yellow border-primary-yellow/40";

export default function CompetitionsCalendar({ events }: Props) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Normalize: convert ISO strings to Date once
  const normalized = useMemo(() => {
    return events.map((e) => ({
      ...e,
      _start: parseISO(e.start),
      _end: parseISO(e.end),
    }));
  }, [events]);

  const firstDay = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
  const lastDay = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });

  // Only mark first and last day of a range; single-day is both start and end
  const getEventsForDay = (d: Date) =>
    normalized.filter((e) => isSameDay(e._start, d) || isSameDay(e._end, d));

  const goPrev = () => setCurrentDate((d) => addMonths(d, -1));
  const goNext = () => setCurrentDate((d) => addMonths(d, 1));
  const goToday = () => setCurrentDate(new Date());

  return (
    <div className="w-full">
      <div className="bg-neutral_01/5 backdrop-blur-sm border border-neutral_01/10 rounded-2xl p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-neutral_01">Kalender INFEST</h2>
            <p className="text-neutral_01/60 text-sm">Tanggal penting kompetisi dan agenda utama</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={goToday} className="px-3 py-1.5 rounded-lg border border-neutral_01/20 bg-white/5 text-neutral_01 text-sm hover:bg-white/10">Hari ini</button>
            <button onClick={goPrev} className="px-3 py-1.5 rounded-lg border border-neutral_01/20 bg-white/5 text-neutral_01 text-sm hover:bg-white/10">
              <ChevronLeft />
            </button>
            <div className="text-neutral_01 font-bold text-base md:text-xl text-center md:text-start">{format(currentDate, "MMMM yyyy", { locale: idLocale })}</div>
            <button onClick={goNext} className="px-3 py-1.5 rounded-lg border border-neutral_01/20 bg-white/5 text-neutral_01 text-sm hover:bg-white/10">
              <ChevronRight />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="mt-4 grid grid-cols-7 text-xs md:text-sm text-neutral_01/70">
          {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
            <div key={d} className="px-2 py-2 text-center uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-px rounded-xl overflow-visible border border-neutral_01/10 bg-neutral_01/10">
          {days.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const inMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const totalRows = Math.ceil(days.length / 7);
            const row = Math.floor(idx / 7);
            const placeAbove = row >= totalRows - 1; // last row -> show tooltip above

            const hasEvents = dayEvents.length > 0;
            const dateBadgeClasses = [
              "flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-xs md:text-sm border",
              hasEvents ? BADGE_CLASS : "text-neutral_01/80 border-transparent",
              isToday ? "ring-2 ring-primary-yellow" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                key={day.toISOString()}
                className={`group relative min-h-[72px] md:min-h-[96px] p-2 md:p-3 bg-black/10 ${
                  inMonth ? "" : "opacity-40"
                } ${hasEvents ? "cursor-pointer md:cursor-default" : ""}`}
                onClick={() => {
                  if (hasEvents) setSelectedDay(day);
                }}
              >
                <div className="flex items-start justify-between">
                  <span className={dateBadgeClasses}>
                    {format(day, "d", { locale: idLocale })}
                  </span>
                </div>

                {/* Hover card */}
                {dayEvents.length > 0 && (
                  <div
                    className={`pointer-events-none absolute left-2 z-50 hidden md:group-hover:block ${
                      placeAbove ? "bottom-10" : "top-10"
                    }`}
                  >
                    <div className="bg-neutral_01/90 text-black/90 backdrop-blur-xl rounded-lg shadow-lg p-2 border border-neutral_01/20">
                      <div className="space-y-1">
            {dayEvents.map((e) => (
                          <div key={e.id} className="flex items-start gap-2 text-[11px] md:text-xs">
              <span className={`mt-1 w-2 h-2 rounded-full ${DOT_CLASS}`} />
                            <div className="flex-1">
                              <div className="font-semibold text-neutral-900">{e.title}</div>
                              {e.description && (
                                <div className="text-neutral-700">{e.description}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
    {/* Mobile modal for day details */}
        {selectedDay && (
          <div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm md:hidden flex items-center justify-center px-4"
            onClick={() => setSelectedDay(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="w-full max-w-md rounded-2xl bg-neutral_01 text-black shadow-xl border border-neutral_01/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
                <div className="font-semibold">
                  {format(selectedDay, "EEEE, d MMMM yyyy", { locale: idLocale })}
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  aria-label="Tutup"
                  className="text-black/60 hover:text-black"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 space-y-3">
                {getEventsForDay(selectedDay).map((e) => (
                  <div key={e.id} className="flex items-start gap-3">
                    <span className={`mt-1 w-2.5 h-2.5 rounded-full ${DOT_CLASS}`} />
                    <div className="flex-1">
                      <div className="font-semibold text-neutral-900">{e.title}</div>
                      {e.description && (
                        <div className="text-neutral-700 text-sm">{e.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Legend removed: unified styling for all events */}
      </div>
    </div>
  );
}
