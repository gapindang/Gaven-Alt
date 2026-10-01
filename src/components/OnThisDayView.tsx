"use client";

import React, { useState, useMemo } from "react";
import { GavenEntry } from "@/lib/types";
import { Sparkles, ArrowRight, Calendar, Feather } from "lucide-react";

interface OnThisDayViewProps {
  entries: GavenEntry[];
  onSelectEntry: (entry: GavenEntry) => void;
  onStartWriting: () => void;
}

export default function OnThisDayView({
  entries,
  onSelectEntry,
  onStartWriting,
}: OnThisDayViewProps) {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  // Find entries for this month & day across all past years
  const matchingEntries = useMemo(() => {
    return entries.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() + 1 === selectedMonth && d.getDate() === selectedDay;
    });
  }, [entries, selectedMonth, selectedDay]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12 md:py-16 font-sans">
      <div className="mb-12">
        <div className="flex items-center gap-2 text-xs font-mono text-[#C8A96B] uppercase tracking-[0.25em] mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Memory Recall</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#F2F0EA] tracking-wide mb-3">
          ON THIS DAY
        </h1>
        <p className="font-serif italic text-base text-[#9A9892]">
          Revisiting the words you chose to preserve in years past.
        </p>
      </div>

      {/* Date selector controls */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-[#151515] border border-white/[0.08] mb-12 text-xs font-mono">
        <Calendar className="w-4 h-4 text-[#C8A96B]" />
        <span className="text-[#9A9892]">Select Day:</span>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="bg-[#1A1A1A] border border-white/[0.08] text-[#F2F0EA] px-2.5 py-1.5 rounded focus:outline-none cursor-pointer"
        >
          {monthNames.map((name, i) => (
            <option key={name} value={i + 1}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(parseInt(e.target.value))}
          className="bg-[#1A1A1A] border border-white/[0.08] text-[#F2F0EA] px-2.5 py-1.5 rounded focus:outline-none cursor-pointer"
        >
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setSelectedMonth(today.getMonth() + 1);
            setSelectedDay(today.getDate());
          }}
          className="ml-auto text-[#C8A96B] hover:underline"
        >
          Reset to Today
        </button>
      </div>

      {/* Matches */}
      {matchingEntries.length > 0 ? (
        <div className="space-y-6">
          {matchingEntries.map((entry) => {
            const year = new Date(entry.date).getFullYear();
            return (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className="group p-8 rounded-2xl bg-[#151515] hover:bg-[#1A1A1A] border border-white/[0.08] hover:border-[#C8A96B]/50 transition-all cursor-pointer shadow-lg"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#9A9892] mb-3">
                  <span className="text-[#C8A96B] tracking-widest">{year}</span>
                  <span className="capitalize">{entry.type}</span>
                </div>

                <h3 className="font-serif text-2xl text-[#F2F0EA] group-hover:text-white transition-colors mb-4">
                  &ldquo;{entry.title}&rdquo;
                </h3>

                <p className="font-sans text-sm text-[#9A9892] line-clamp-3 leading-relaxed mb-6 font-light">
                  {entry.content}
                </p>

                <div className="flex items-center gap-2 text-xs font-mono text-[#C8A96B]">
                  <span>READ →</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#151515]/60 border border-white/[0.06] space-y-4">
          <p className="font-serif italic text-2xl text-[#F2F0EA]/80 font-light">
            Nothing was written on this day.
          </p>
          <p className="font-sans text-xs text-[#9A9892] max-w-sm mx-auto leading-relaxed">
            Maybe today will become something worth remembering.
          </p>
          <div className="pt-4">
            <button
              onClick={onStartWriting}
              className="px-6 py-2.5 rounded-xl bg-[#F2F0EA] hover:bg-[#C8A96B] text-[#0D0D0D] font-mono text-xs tracking-wider transition-colors cursor-pointer"
            >
              Write for today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
