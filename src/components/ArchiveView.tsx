"use client";

import React, { useState, useMemo } from "react";
import { GavenEntry, EntryType, Mood } from "@/lib/types";
import { Search, Feather, BookText, Send, Filter, X } from "lucide-react";

interface ArchiveViewProps {
  entries: GavenEntry[];
  onSelectEntry: (entry: GavenEntry) => void;
  onStartWriting: () => void;
}

export default function ArchiveView({
  entries,
  onSelectEntry,
  onStartWriting,
}: ArchiveViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<EntryType | "all">("all");
  const [selectedMood, setSelectedMood] = useState<Mood | "all">("all");
  const [selectedTag, setSelectedTag] = useState<string | "all">("all");

  // Collect all unique tags and moods
  const allTags = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => e.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [entries]);

  const allMoods = useMemo(() => {
    const set = new Set<Mood>();
    entries.forEach((e) => {
      if (e.mood) set.add(e.mood);
    });
    return Array.from(set);
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (selectedType !== "all" && e.type !== selectedType) return false;
      if (selectedMood !== "all" && e.mood !== selectedMood) return false;
      if (selectedTag !== "all" && !e.tags.includes(selectedTag)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesContent = e.content.toLowerCase().includes(q);
        const matchesTags = e.tags.some((t) => t.toLowerCase().includes(q));
        const matchesRecipient = e.recipient?.toLowerCase().includes(q);
        return matchesTitle || matchesContent || matchesTags || matchesRecipient;
      }

      return true;
    });
  }, [entries, selectedType, selectedMood, selectedTag, searchQuery]);

  // Group by Year and then by Month
  const groupedEntries = useMemo(() => {
    const sorted = [...filteredEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const groups: { [year: string]: { [month: string]: GavenEntry[] } } = {};

    sorted.forEach((e) => {
      const d = new Date(e.date);
      const year = d.getFullYear().toString();
      const month = d.toLocaleDateString("en-US", { month: "long" }).toUpperCase();

      if (!groups[year]) groups[year] = {};
      if (!groups[year][month]) groups[year][month] = [];
      groups[year][month].push(e);
    });

    return groups;
  }, [filteredEntries]);

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
      {/* Title */}
      <div className="mb-10">
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#F2F0EA] tracking-wide mb-3">
          ARCHIVE
        </h1>
        <p className="font-serif italic text-base text-[#9A9892]">
          Everything you chose to keep, ordered by time.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-12">
        <div className="relative">
          <Search className="w-4 h-4 text-[#5F5D59] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search memories, poems, tags, or thoughts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#151515] border border-white/[0.08] rounded-xl pl-11 pr-10 py-3 text-sm text-[#F2F0EA] placeholder:text-[#5F5D59] focus:outline-none focus:border-[#C8A96B]/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5F5D59] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-[#5F5D59] mr-1">Type:</span>
          {(["all", "diary", "poem", "unsent"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                selectedType === t
                  ? "bg-white/[0.12] text-[#F2F0EA] border border-white/[0.15]"
                  : "bg-white/[0.02] text-[#9A9892] hover:text-white border border-transparent"
              }`}
            >
              {t}
            </button>
          ))}

          {allMoods.length > 0 && (
            <>
              <span className="text-[#5F5D59] ml-3 mr-1">Mood:</span>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value as Mood | "all")}
                className="bg-[#151515] border border-white/[0.08] text-[#9A9892] rounded px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="all">All Moods</option>
                {allMoods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </>
          )}

          {allTags.length > 0 && (
            <>
              <span className="text-[#5F5D59] ml-3 mr-1">Tag:</span>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-[#151515] border border-white/[0.08] text-[#9A9892] rounded px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="all">All Tags</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    #{t}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Chronological List */}
      {Object.keys(groupedEntries).length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#151515]/50 border border-white/[0.04]">
          <p className="font-serif text-xl italic text-[#9A9892] mb-2">
            YOUR ARCHIVE IS EMPTY.
          </p>
          <p className="font-sans text-xs text-[#5F5D59] mb-6">
            Maybe that&apos;s okay. Some things haven&apos;t been written yet.
          </p>
          <button
            onClick={onStartWriting}
            className="px-4 py-2 rounded-lg bg-[#F2F0EA] text-[#0D0D0D] font-mono text-xs font-medium hover:bg-[#C8A96B] transition-colors cursor-pointer"
          >
            Write your first entry
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          {Object.entries(groupedEntries).map(([year, months]) => (
            <div key={year} className="space-y-8">
              <div className="text-sm font-mono tracking-[0.3em] text-[#C8A96B] border-b border-white/[0.08] pb-2">
                {year}
              </div>

              {Object.entries(months).map(([month, items]) => (
                <div key={month} className="space-y-4 pl-2 sm:pl-6">
                  <div className="text-xs font-mono tracking-[0.2em] text-[#5F5D59]">
                    {month}
                  </div>

                  <div className="space-y-3">
                    {items.map((entry) => {
                      const day = new Date(entry.date).getDate();
                      return (
                        <div
                          key={entry.id}
                          onClick={() => onSelectEntry(entry)}
                          className="group p-4 rounded-xl bg-[#151515]/40 hover:bg-[#1A1A1A] border border-white/[0.03] hover:border-white/[0.1] transition-all cursor-pointer flex items-baseline justify-between gap-4"
                        >
                          <div className="flex items-baseline gap-4">
                            <span className="font-mono text-xs text-[#5F5D59] w-6 shrink-0">
                              {day < 10 ? `0${day}` : day}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                {getTypeIcon(entry.type)}
                                <span className="font-serif text-base sm:text-lg text-[#F2F0EA] group-hover:text-[#C8A96B] transition-colors">
                                  {entry.title}
                                </span>
                              </div>
                              <p className="font-sans text-xs text-[#9A9892] line-clamp-1 max-w-xl font-light mt-1">
                                {entry.content}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {entry.mood && (
                              <span className="text-[10px] font-mono text-[#5F5D59] hidden sm:inline">
                                {entry.mood}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
