"use client";

import React, { useMemo } from "react";
import { GavenEntry } from "@/lib/types";
import { Calendar, Compass, ArrowRight } from "lucide-react";

interface TimelineViewProps {
  entries: GavenEntry[];
  onSelectEntry: (entry: GavenEntry) => void;
}

export default function TimelineView({
  entries,
  onSelectEntry,
}: TimelineViewProps) {
  // Group entries by year
  const yearStats = useMemo(() => {
    const map = new Map<number, GavenEntry[]>();

    entries.forEach((e) => {
      const year = new Date(e.date).getFullYear();
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(e);
    });

    const sortedYears = Array.from(map.keys()).sort((a, b) => b - a);
    return sortedYears.map((y) => ({
      year: y,
      items: map.get(y)!.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    }));
  }, [entries]);

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 md:py-16 font-sans">
      <div className="mb-14">
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#F2F0EA] tracking-wide mb-3">
          TIMELINE
        </h1>
        <p className="font-serif italic text-base text-[#9A9892]">
          A personal map of where your mind has been.
        </p>
      </div>

      <div className="space-y-16">
        {yearStats.map(({ year, items }) => (
          <div key={year} className="relative pl-8 border-l border-white/[0.08]">
            {/* Timeline node marker */}
            <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-[#0D0D0D] border-2 border-[#C8A96B] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C8A96B]" />
            </div>

            {/* Year Header */}
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-mono text-2xl text-[#F2F0EA] tracking-widest">
                {year}
              </h2>
              <span className="font-mono text-xs text-[#5F5D59]">
                {items.length} {items.length === 1 ? "entry" : "entries"} kept
              </span>
            </div>

            {/* Timeline cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => onSelectEntry(entry)}
                  className="group p-5 rounded-xl bg-[#151515]/60 hover:bg-[#1A1A1A] border border-white/[0.04] hover:border-[#C8A96B]/30 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#5F5D59] mb-2">
                      <span>
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="capitalize text-[#9A9892]">
                        {entry.type}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg text-[#F2F0EA] group-hover:text-[#C8A96B] transition-colors mb-2">
                      {entry.title}
                    </h3>
                    <p className="font-sans text-xs text-[#9A9892] line-clamp-2 leading-relaxed font-light">
                      {entry.content}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-[#5F5D59]">
                    <span>{entry.mood || "Archived"}</span>
                    <span className="text-[#C8A96B] group-hover:translate-x-1 transition-transform">
                      Read →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
