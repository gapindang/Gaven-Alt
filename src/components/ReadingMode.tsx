"use client";

import React from "react";
import { GavenEntry } from "@/lib/types";
import { ArrowLeft, Edit3, Trash2, Share2, Feather, Send, BookText } from "lucide-react";
import { sanctuaryAudio } from "@/lib/audio";

interface ReadingModeProps {
  entry: GavenEntry;
  onBack: () => void;
  onEdit: (entry: GavenEntry) => void;
  onDelete: (id: string) => void;
}

export default function ReadingMode({
  entry,
  onBack,
  onEdit,
  onDelete,
}: ReadingModeProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).toUpperCase();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to remove this piece from your vault?")) {
      onDelete(entry.id);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-12 md:py-20 font-sans animate-fadeIn">
      {/* Top minimal action bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-16">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono text-[#9A9892] hover:text-[#F2F0EA] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sanctuary</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(entry)}
            className="p-2 rounded-lg text-[#9A9892] hover:text-[#F2F0EA] hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="Edit entry"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-[#9A9892] hover:text-red-400 hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="Delete entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Editorial Reading Layout */}
      <article className="space-y-12">
        {/* Date header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-xs font-mono text-[#C8A96B] tracking-[0.25em]">
            <span>{formatDate(entry.date)}</span>
            {entry.mood && (
              <>
                <span className="text-white/20">·</span>
                <span className="text-[#9A9892]">{entry.mood}</span>
              </>
            )}
          </div>

          {/* Unsent recipient banner */}
          {entry.type === "unsent" && entry.recipient && (
            <div className="font-mono text-xs text-[#9A9892] tracking-wider pt-1">
              TO: <span className="text-[#F2F0EA]">{entry.recipient}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#F2F0EA] tracking-wide leading-tight">
          {entry.title}
        </h1>

        {/* Content */}
        <div
          className={`leading-relaxed text-[#F2F0EA] ${
            entry.type === "poem"
              ? "font-serif text-lg md:text-xl whitespace-pre-line tracking-wide py-4 text-[#F2F0EA]/95"
              : "font-sans text-base md:text-lg font-light space-y-6 leading-8 text-[#F2F0EA]/90 whitespace-pre-wrap"
          }`}
        >
          {entry.content}
        </div>

        {/* Signature */}
        <div className="pt-8 border-t border-white/[0.04] flex items-center justify-between">
          <span className="font-serif italic text-base text-[#9A9892]">
            — Gavin
          </span>

          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] font-mono text-[#5F5D59] bg-white/[0.03] px-2 py-0.5 rounded"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
