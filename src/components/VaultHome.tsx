"use client";

import React, { useMemo } from "react";
import { GavenEntry } from "@/lib/types";
import { Plus, ArrowRight, Sparkles, Feather, BookText, Send } from "lucide-react";

interface VaultHomeProps {
  entries: GavenEntry[];
  userName: string;
  onSelectEntry: (entry: GavenEntry) => void;
  onStartWriting: (type?: "diary" | "poem" | "unsent") => void;
  onViewAllArchive: () => void;
  onViewOnThisDay: () => void;
}

export default function VaultHome({
  entries,
  userName,
  onSelectEntry,
  onStartWriting,
  onViewAllArchive,
  onViewOnThisDay,
}: VaultHomeProps) {
  // Determine greeting based on current local hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 18) return "Good afternoon";
    if (hour >= 18 && hour < 23) return "Good evening";
    return "Quiet hours";
  }, []);

  // Find an On This Day memory (same month and day from any previous year)
  const onThisDayEntry = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const currentYear = today.getFullYear();

    // Check for exact month/day match from different years
    const match = entries.find((e) => {
      const d = new Date(e.date);
      return (
        d.getMonth() + 1 === currentMonth &&
        d.getDate() === currentDay &&
        d.getFullYear() !== currentYear
      );
    });

    if (match) return match;

    // Fallback to entry-4 if available or any nostalgic entry
    return entries.find((e) => e.tags.includes("on-this-day")) || entries[entries.length - 1];
  }, [entries]);

  // Sort recently written
  const recentEntries = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [entries]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "poem":
        return <Feather className="w-3.5 h-3.5 text-[#C8A96B]" />;
      case "unsent":
        return <Send className="w-3.5 h-3.5 text-[#C8A96B]" />;
      default:
        return <BookText className="w-3.5 h-3.5 text-[#9A9892]" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 md:py-16 font-sans">
      {/* Editorial Header */}
      <section className="mb-16">
        <span className="text-xs font-mono tracking-[0.25em] text-[#C8A96B] uppercase block mb-3">
          {greeting}, {userName}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-[#F2F0EA] leading-tight mb-4">
          <span className="text-[#C8A96B]">{entries.length}</span> things you chose to keep.
        </h1>
        <p className="font-serif italic text-base md:text-lg text-[#9A9892] max-w-xl">
          Write it. Keep it. Forget it. Find it again.
        </p>
      </section>

      {/* ON THIS DAY HIGHLIGHT CARD */}
      <section className="mb-16">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C8A96B]" />
            <h2 className="text-xs font-mono tracking-[0.25em] text-[#9A9892] uppercase">
              On This Day
            </h2>
          </div>
          <button
            onClick={onViewOnThisDay}
            className="text-xs font-mono text-[#5F5D59] hover:text-[#C8A96B] transition-colors cursor-pointer"
          >
            Explore all years →
          </button>
        </div>

        {onThisDayEntry ? (
          <div
            onClick={() => onSelectEntry(onThisDayEntry)}
            className="group relative p-8 md:p-10 rounded-2xl bg-gradient-to-b from-[#181818] to-[#121212] border border-white/[0.08] hover:border-[#C8A96B]/40 transition-all duration-500 cursor-pointer shadow-xl hover:shadow-[0_10px_35px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center justify-between text-xs font-mono text-[#9A9892] mb-4">
              <span className="text-[#C8A96B]">{formatDate(onThisDayEntry.date)}</span>
              <span className="capitalize px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                {onThisDayEntry.type}
              </span>
            </div>

            <h3 className="font-serif text-2xl md:text-3xl font-light text-[#F2F0EA] mb-4 group-hover:text-white transition-colors">
              &ldquo;{onThisDayEntry.title}&rdquo;
            </h3>

            <p className="font-sans text-sm md:text-base text-[#9A9892] line-clamp-3 leading-relaxed mb-6 font-light">
              {onThisDayEntry.content}
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-[#C8A96B] group-hover:translate-x-1 transition-transform">
              <span>Read entry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#151515] border border-white/[0.06] text-center">
            <p className="font-serif italic text-lg text-[#9A9892] mb-2">
              Nothing was written on this day.
            </p>
            <p className="text-xs font-mono text-[#5F5D59]">
              Maybe today will become something worth remembering.
            </p>
          </div>
        )}
      </section>

      {/* RECENTLY WRITTEN SECTION */}
      <section className="mb-16">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-6">
          <h2 className="text-xs font-mono tracking-[0.25em] text-[#9A9892] uppercase">
            Recently Written
          </h2>
          <button
            onClick={onViewAllArchive}
            className="text-xs font-mono text-[#5F5D59] hover:text-[#C8A96B] transition-colors cursor-pointer"
          >
            View archive ({entries.length}) →
          </button>
        </div>

        <div className="space-y-3">
          {recentEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => onSelectEntry(entry)}
              className="group p-5 rounded-xl bg-[#151515]/60 hover:bg-[#1A1A1A] border border-white/[0.04] hover:border-white/[0.12] transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getTypeIcon(entry.type)}
                  <h3 className="font-serif text-lg text-[#F2F0EA] group-hover:text-[#C8A96B] transition-colors">
                    {entry.title || "Untitled"}
                  </h3>
                  {entry.mood && (
                    <span className="text-[10px] font-mono text-[#5F5D59] bg-white/[0.03] px-2 py-0.5 rounded">
                      {entry.mood}
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs text-[#9A9892] line-clamp-1 max-w-xl font-light">
                  {entry.content}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-[#5F5D59] sm:self-center shrink-0">
                <span>{formatDate(entry.date)}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#C8A96B]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK WRITING ACTION BAR */}
      <section className="pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs font-mono text-[#5F5D59]">
          Press <kbd className="text-[#9A9892] bg-white/[0.05] px-1.5 py-0.5 rounded">Ctrl + K</kbd> anytime
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onStartWriting("diary")}
            className="px-4 py-2 rounded-lg border border-white/[0.08] hover:border-[#C8A96B]/50 hover:bg-white/[0.04] text-xs font-mono text-[#F2F0EA] transition-colors cursor-pointer"
          >
            + Diary
          </button>
          <button
            onClick={() => onStartWriting("poem")}
            className="px-4 py-2 rounded-lg border border-white/[0.08] hover:border-[#C8A96B]/50 hover:bg-white/[0.04] text-xs font-mono text-[#F2F0EA] transition-colors cursor-pointer"
          >
            + Poem
          </button>
          <button
            onClick={() => onStartWriting("unsent")}
            className="px-4 py-2 rounded-lg border border-white/[0.08] hover:border-[#C8A96B]/50 hover:bg-white/[0.04] text-xs font-mono text-[#F2F0EA] transition-colors cursor-pointer"
          >
            + Unsent
          </button>
        </div>
      </section>
    </div>
  );
}
