"use client";

import React, { useState, useEffect } from "react";
import { GavenEntry, ViewState } from "@/lib/types";
import {
  Search,
  BookText,
  Feather,
  Send,
  Archive,
  Compass,
  Sparkles,
  Lock,
  Settings,
  Waves,
  X,
} from "lucide-react";
import { sanctuaryAudio } from "@/lib/audio";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  entries: GavenEntry[];
  onNavigate: (view: ViewState) => void;
  onStartWriting: (type: "diary" | "poem" | "unsent") => void;
  onSelectEntry: (entry: GavenEntry) => void;
  onOpenSettings: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  entries,
  onNavigate,
  onStartWriting,
  onSelectEntry,
  onOpenSettings,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          sanctuaryAudio.playGentleKeypress();
          // Handled by parent or toggle
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matchedEntries = query.trim()
    ? entries.filter(
        (e) =>
          e.title.toLowerCase().includes(query.toLowerCase()) ||
          e.content.toLowerCase().includes(query.toLowerCase()) ||
          e.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-xl bg-[#151515] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08]">
          <Search className="w-4 h-4 text-[#C8A96B] mr-3" />
          <input
            type="text"
            placeholder="Search your memories or type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[#F2F0EA] placeholder:text-[#5F5D59] focus:outline-none font-mono"
            autoFocus
          />
          <button
            onClick={onClose}
            className="text-xs font-mono text-[#5F5D59] hover:text-white ml-2"
          >
            ESC
          </button>
        </div>

        {/* Content list */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 text-xs font-mono">
          {/* Matched Memories */}
          {matchedEntries.length > 0 && (
            <div className="mb-3">
              <div className="px-3 py-1.5 text-[10px] text-[#5F5D59] tracking-wider uppercase">
                Memories & Writings
              </div>
              {matchedEntries.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    onSelectEntry(e);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-[#F2F0EA] hover:bg-white/[0.06] transition-colors cursor-pointer group"
                >
                  <span className="font-serif text-sm group-hover:text-[#C8A96B]">
                    {e.title}
                  </span>
                  <span className="text-[10px] text-[#5F5D59]">{e.date}</span>
                </button>
              ))}
            </div>
          )}

          {/* Quick Writing Actions */}
          <div className="mb-3">
            <div className="px-3 py-1.5 text-[10px] text-[#5F5D59] tracking-wider uppercase">
              Write
            </div>
            <button
              onClick={() => {
                onStartWriting("diary");
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[#9A9892] hover:text-[#F2F0EA] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <BookText className="w-3.5 h-3.5 text-[#9A9892]" />
              <span>Write diary</span>
            </button>
            <button
              onClick={() => {
                onStartWriting("poem");
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[#9A9892] hover:text-[#F2F0EA] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Feather className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span>Write poem</span>
            </button>
            <button
              onClick={() => {
                onStartWriting("unsent");
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[#9A9892] hover:text-[#F2F0EA] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span>Write unsent letter</span>
            </button>
          </div>

          {/* Navigation Shortcuts */}
          <div>
            <div className="px-3 py-1.5 text-[10px] text-[#5F5D59] tracking-wider uppercase">
              Navigate
            </div>
            <button
              onClick={() => {
                onNavigate("archive");
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[#9A9892] hover:text-[#F2F0EA] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Go to archive</span>
            </button>
            <button
              onClick={() => {
                onNavigate("timeline");
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[#9A9892] hover:text-[#F2F0EA] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Go to timeline</span>
            </button>
            <button
              onClick={() => {
                onNavigate("on_this_day");
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[#9A9892] hover:text-[#F2F0EA] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span>On this day</span>
            </button>
            <button
              onClick={() => {
                onNavigate("opening");
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[#9A9892] hover:text-[#F2F0EA] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Waves className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span>View 3D Kinetic Text Wave</span>
            </button>
            <button
              onClick={() => {
                onOpenSettings();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[#9A9892] hover:text-[#F2F0EA] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                onNavigate("vault_gate");
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock vault</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
