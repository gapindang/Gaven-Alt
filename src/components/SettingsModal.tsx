"use client";

import React, { useState } from "react";
import { VaultSettings, saveStoredSettings } from "@/lib/storage";
import { GavenEntry } from "@/lib/types";
import { testSupabaseConnection } from "@/lib/supabase";
import { X, Download, Database, Key, ShieldCheck, User, CheckCircle2, AlertCircle, RefreshCw, FileCode } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VaultSettings;
  onUpdateSettings: (newSettings: VaultSettings) => void;
  entries: GavenEntry[];
  onResetSeedData: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  entries,
  onResetSeedData,
}: SettingsModalProps) {
  const [userName, setUserName] = useState(settings.userName);
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || "");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || "");
  const [savedNotice, setSavedNotice] = useState(false);

  // Connection testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection(supabaseUrl.trim(), supabaseAnonKey.trim());
    setIsTesting(false);
    setTestResult(result);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: VaultSettings = {
      ...settings,
      userName: userName.trim() || "Gavin",
      supabaseUrl: supabaseUrl.trim() || undefined,
      supabaseAnonKey: supabaseAnonKey.trim() || undefined,
    };
    onUpdateSettings(updated);
    saveStoredSettings(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gaven-vault-backup-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportMarkdown = () => {
    let md = `# GAVEN ARCHIVE BACKUP\nGenerated on ${new Date().toLocaleDateString()}\n\n---\n\n`;
    entries.forEach((e) => {
      md += `## ${e.title}\n`;
      md += `*Type: ${e.type} | Date: ${e.date}${e.mood ? ` | Mood: ${e.mood}` : ""}${e.recipient ? ` | To: ${e.recipient}` : ""}*\n\n`;
      md += `${e.content}\n\n`;
      if (e.tags.length > 0) {
        md += `Tags: ${e.tags.map((t) => `#${t}`).join(" ")}\n\n`;
      }
      md += `---\n\n`;
    });

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gaven-archive-backup.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-lg bg-[#151515] border border-white/[0.1] rounded-2xl shadow-2xl p-6 font-sans text-xs font-mono max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C8A96B]" />
            <span className="font-serif text-lg text-[#F2F0EA]">Vault Settings & Supabase</span>
          </div>
          <button onClick={onClose} className="text-[#9A9892] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* User Display Name */}
          <div>
            <label className="text-[#9A9892] flex items-center gap-2 mb-2">
              <User className="w-3.5 h-3.5 text-[#C8A96B]" />
              Sanctuary Owner Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-[#F2F0EA] focus:outline-none focus:border-[#C8A96B]"
            />
          </div>

          {/* Supabase Connection Details */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#C8A96B] font-sans text-sm">
                <Database className="w-4 h-4" />
                <span>Supabase Cloud Database</span>
              </div>
              <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                SQL Schema Ready
              </span>
            </div>

            <p className="text-[#9A9892] text-[11px] leading-relaxed">
              Skrip SQL lengkap sudah disiapkan di file <code className="text-[#C8A96B] bg-white/[0.05] px-1 py-0.5 rounded">supabase/schema.sql</code> (termasuk tabel profiles, entries, tags, dan Row Level Security).
            </p>

            <div>
              <label className="text-[#9A9892] block mb-1">Project URL (NEXT_PUBLIC_SUPABASE_URL)</label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded px-2.5 py-1.5 text-[#F2F0EA] focus:outline-none focus:border-[#C8A96B]"
              />
            </div>

            <div>
              <label className="text-[#9A9892] block mb-1">Anon Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded px-2.5 py-1.5 text-[#F2F0EA] focus:outline-none focus:border-[#C8A96B]"
              />
            </div>

            {/* Test Connection Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !supabaseUrl.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[#F2F0EA] border border-white/[0.08] transition-colors disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isTesting ? "animate-spin text-[#C8A96B]" : ""}`} />
                <span>{isTesting ? "Testing..." : "Test Connection"}</span>
              </button>

              <span className="text-[10px] text-[#5F5D59]">
                Offline-first fallback active
              </span>
            </div>

            {/* Test Connection Result */}
            {testResult && (
              <div
                className={`p-3 rounded-lg border text-[11px] leading-relaxed flex items-start gap-2 ${
                  testResult.success
                    ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                    : "bg-red-950/30 border-red-500/30 text-red-200"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Export / Backup */}
          <div>
            <span className="text-[#9A9892] flex items-center gap-2 mb-2">
              <Download className="w-3.5 h-3.5" />
              Archive Backup & Portability
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="px-3 py-2 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[#F2F0EA] border border-white/[0.06] transition-colors cursor-pointer"
              >
                Export JSON ({entries.length} items)
              </button>
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="px-3 py-2 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[#F2F0EA] border border-white/[0.06] transition-colors cursor-pointer"
              >
                Export Markdown (.md)
              </button>
            </div>
          </div>

          {/* Reset seed data button */}
          <div className="pt-2 flex justify-between items-center text-[11px] text-[#5F5D59]">
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Reset archive to default PRD entries?")) {
                  onResetSeedData();
                  onClose();
                }
              }}
              className="text-[#9A9892] hover:text-red-400 underline cursor-pointer"
            >
              Reset to sample archive
            </button>
            {savedNotice && <span className="text-emerald-400">Settings saved!</span>}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-[#9A9892] hover:text-white"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-[#F2F0EA] text-[#0D0D0D] hover:bg-[#C8A96B] transition-colors font-medium cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
