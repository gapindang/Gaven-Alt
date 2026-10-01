"use client";

import React, { useState, useEffect } from "react";
import KineticWavyText from "@/components/KineticWavyText";
import VaultGate from "@/components/VaultGate";
import Navigation from "@/components/Navigation";
import VaultHome from "@/components/VaultHome";
import WriteEditor from "@/components/WriteEditor";
import ReadingMode from "@/components/ReadingMode";
import ArchiveView from "@/components/ArchiveView";
import TimelineView from "@/components/TimelineView";
import OnThisDayView from "@/components/OnThisDayView";
import CommandPalette from "@/components/CommandPalette";
import SettingsModal from "@/components/SettingsModal";

import {
  GavenEntry,
  ViewState,
  EntryType,
} from "@/lib/types";
import {
  getStoredEntries,
  saveStoredEntries,
  getStoredSettings,
  saveStoredSettings,
  VaultSettings,
} from "@/lib/storage";

export default function Home() {
  const [view, setView] = useState<ViewState>("opening");
  const [entries, setEntries] = useState<GavenEntry[]>([]);
  const [settings, setSettings] = useState<VaultSettings>({
    userName: "Gavin",
    theme: "dark",
    soundEnabled: false,
    reducedMotion: false,
  });

  const [activeEntry, setActiveEntry] = useState<GavenEntry | null>(null);
  const [initialWriteType, setInitialWriteType] = useState<EntryType>("diary");
  const [editingEntry, setEditingEntry] = useState<GavenEntry | null>(null);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const loadedEntries = getStoredEntries();
    const loadedSettings = getStoredSettings();
    setEntries(loadedEntries);
    setSettings(loadedSettings);

    // If Supabase has remote entries, sync them
    import("@/lib/supabase").then(({ fetchRemoteEntries }) => {
      fetchRemoteEntries().then((remote) => {
        if (remote && remote.length > 0) {
          setEntries((prev) => {
            const merged = [...remote];
            prev.forEach((local) => {
              if (!merged.some((r) => r.id === local.id)) {
                merged.push(local);
              }
            });
            saveStoredEntries(merged);
            return merged;
          });
        }
      });
    });
  }, []);

  // Sync entries whenever changed
  const handleSaveEntry = (newOrUpdated: GavenEntry) => {
    setEntries((prev) => {
      const index = prev.findIndex((e) => e.id === newOrUpdated.id);
      let updated: GavenEntry[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = newOrUpdated;
      } else {
        updated = [newOrUpdated, ...prev];
      }
      saveStoredEntries(updated);
      return updated;
    });

    // Also attempt remote Supabase sync in background
    import("@/lib/supabase").then(({ syncEntryToRemote }) => {
      syncEntryToRemote(newOrUpdated);
    });

    setActiveEntry(newOrUpdated);
    setEditingEntry(null);
    setView("read");
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveStoredEntries(updated);
      return updated;
    });

    import("@/lib/supabase").then(({ deleteRemoteEntry }) => {
      deleteRemoteEntry(id);
    });

    setActiveEntry(null);
    setView("archive");
  };

  const handleStartWriting = (type: EntryType = "diary") => {
    setEditingEntry(null);
    setInitialWriteType(type);
    setView("write");
  };

  const handleEditEntry = (entry: GavenEntry) => {
    setEditingEntry(entry);
    setInitialWriteType(entry.type);
    setView("write");
  };

  const handleSelectEntry = (entry: GavenEntry) => {
    setActiveEntry(entry);
    setView("read");
  };

  const handleResetSeedData = () => {
    localStorage.removeItem("gaven_vault_entries_v1");
    const fresh = getStoredEntries();
    setEntries(fresh);
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-[#F2F0EA] flex flex-col relative selection:bg-[#C8A96B] selection:text-[#0D0D0D]">
      {/* 1. Cinematic Opening View with 3D Kinetic Typography */}
      {view === "opening" && (
        <KineticWavyText
          onEnterClick={() => setView("vault_gate")}
          showControls={true}
        />
      )}

      {/* 2. Private Vault Gate Authentication */}
      {view === "vault_gate" && (
        <VaultGate
          onUnlock={() => setView("home")}
          onBackToOpening={() => setView("opening")}
        />
      )}

      {/* 3. Sanctuary Inner Vault Views with Navigation */}
      {view !== "opening" && view !== "vault_gate" && (
        <div className="flex-1 flex flex-col">
          <Navigation
            currentView={view}
            onNavigate={(newView) => setView(newView)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onReturnToOpening={() => setView("opening")}
          />

          <div className="flex-1">
            {view === "home" && (
              <VaultHome
                entries={entries}
                userName={settings.userName}
                onSelectEntry={handleSelectEntry}
                onStartWriting={(type) => handleStartWriting(type || "diary")}
                onViewAllArchive={() => setView("archive")}
                onViewOnThisDay={() => setView("on_this_day")}
              />
            )}

            {view === "write" && (
              <WriteEditor
                initialType={initialWriteType}
                editingEntry={editingEntry}
                onSave={handleSaveEntry}
                onCancel={() => (activeEntry ? setView("read") : setView("home"))}
              />
            )}

            {view === "read" && activeEntry && (
              <ReadingMode
                entry={activeEntry}
                onBack={() => setView("home")}
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
              />
            )}

            {view === "archive" && (
              <ArchiveView
                entries={entries}
                onSelectEntry={handleSelectEntry}
                onStartWriting={() => handleStartWriting("diary")}
              />
            )}

            {view === "timeline" && (
              <TimelineView
                entries={entries}
                onSelectEntry={handleSelectEntry}
              />
            )}

            {view === "on_this_day" && (
              <OnThisDayView
                entries={entries}
                onSelectEntry={handleSelectEntry}
                onStartWriting={() => handleStartWriting("diary")}
              />
            )}
          </div>
        </div>
      )}

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        entries={entries}
        onNavigate={(newView) => setView(newView)}
        onStartWriting={(type) => handleStartWriting(type)}
        onSelectEntry={handleSelectEntry}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Settings & Supabase Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(newSettings)}
        entries={entries}
        onResetSeedData={handleResetSeedData}
      />
    </main>
  );
}
