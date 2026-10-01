"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Calendar,
  Compass,
  Plus,
  Search,
  Volume2,
  VolumeX,
  Lock,
  Settings,
  Waves,
} from "lucide-react";
import { ViewState } from "@/lib/types";
import { sanctuaryAudio } from "@/lib/audio";

interface NavigationProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  onReturnToOpening: () => void;
}

export default function Navigation({
  currentView,
  onNavigate,
  onOpenCommandPalette,
  onOpenSettings,
  onReturnToOpening,
}: NavigationProps) {
  const [soundActive, setSoundActive] = useState(false);

  const toggleSound = () => {
    const nextState = !soundActive;
    setSoundActive(nextState);
    sanctuaryAudio.toggleAmbient(nextState);
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#0D0D0D]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <span className="font-serif text-2xl font-light tracking-[0.2em] text-[#F2F0EA] group-hover:text-[#C8A96B] transition-colors">
              GAVEN
            </span>
          </button>

          <span className="hidden md:inline-block w-px h-4 bg-white/10" />

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-1 font-mono text-xs">
            <button
              onClick={() => onNavigate("home")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentView === "home"
                  ? "bg-white/[0.08] text-[#F2F0EA]"
                  : "text-[#9A9892] hover:text-[#F2F0EA]"
              }`}
            >
              Sanctuary
            </button>
            <button
              onClick={() => onNavigate("archive")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentView === "archive"
                  ? "bg-white/[0.08] text-[#F2F0EA]"
                  : "text-[#9A9892] hover:text-[#F2F0EA]"
              }`}
            >
              Archive
            </button>
            <button
              onClick={() => onNavigate("timeline")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentView === "timeline"
                  ? "bg-white/[0.08] text-[#F2F0EA]"
                  : "text-[#9A9892] hover:text-[#F2F0EA]"
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => onNavigate("on_this_day")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentView === "on_this_day"
                  ? "bg-white/[0.08] text-[#F2F0EA]"
                  : "text-[#9A9892] hover:text-[#F2F0EA]"
              }`}
            >
              On This Day
            </button>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Kinetic Wave Canvas Switcher */}
          <button
            onClick={onReturnToOpening}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono text-[#9A9892] hover:text-[#C8A96B] hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="View 3D Kinetic Text Wave"
          >
            <Waves className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Wave Visual</span>
          </button>

          {/* Ambient tape sound toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              soundActive
                ? "text-[#C8A96B] bg-[#C8A96B]/10"
                : "text-[#9A9892] hover:text-[#F2F0EA] hover:bg-white/[0.04]"
            }`}
            title={soundActive ? "Mute ambient tape hiss" : "Play subtle ambient sanctuary atmosphere"}
          >
            {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Search / Command palette */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-mono text-[#9A9892] hover:text-[#F2F0EA] transition-colors cursor-pointer"
            title="Search & Commands (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden md:inline text-[10px] text-[#5F5D59] bg-white/[0.04] px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </button>

          {/* New Entry Button */}
          <button
            onClick={() => onNavigate("write")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#F2F0EA] hover:bg-[#C8A96B] text-[#0D0D0D] font-mono text-xs font-medium transition-all duration-300 cursor-pointer shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-[#9A9892] hover:text-[#F2F0EA] hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="Vault Settings & Supabase"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Lock Vault */}
          <button
            onClick={() => onNavigate("vault_gate")}
            className="p-2 rounded-lg text-[#9A9892] hover:text-[#C8A96B] hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="Lock Vault"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
