"use client";

import React, { useState, useEffect, useRef } from "react";
import { EntryType, GavenEntry, Mood } from "@/lib/types";
import { ArrowLeft, Check, Feather, BookText, Send, Clock, Tag } from "lucide-react";
import { sanctuaryAudio } from "@/lib/audio";

const MOODS: Mood[] = [
  "Peaceful",
  "Happy",
  "Nostalgic",
  "Lonely",
  "Angry",
  "Confused",
  "Grateful",
  "Empty",
  "Hopeful",
];

interface WriteEditorProps {
  initialType?: EntryType;
  editingEntry?: GavenEntry | null;
  onSave: (entry: GavenEntry) => void;
  onCancel: () => void;
}

export default function WriteEditor({
  initialType = "diary",
  editingEntry,
  onSave,
  onCancel,
}: WriteEditorProps) {
  const [type, setType] = useState<EntryType>(editingEntry?.type || initialType);
  const [title, setTitle] = useState(editingEntry?.title || "");
  const [content, setContent] = useState(editingEntry?.content || "");
  const [date, setDate] = useState(
    editingEntry?.date || new Date().toISOString().split("T")[0]
  );
  const [mood, setMood] = useState<Mood | undefined>(editingEntry?.mood);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(editingEntry?.tags || []);
  const [recipient, setRecipient] = useState(editingEntry?.recipient || "");

  // Autosave status state
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "Saved locally">("Saved");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger autosave indicator on change
  const handleContentChange = (val: string) => {
    setContent(val);
    setSaveStatus("Saving...");
    sanctuaryAudio.playGentleKeypress();

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus("Saved locally");
    }, 800);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const formatted = tagInput.trim().replace(/^#/, "").toLowerCase();
      if (!tags.includes(formatted)) {
        setTags([...tags, formatted]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !title.trim()) return;

    const entryToSave: GavenEntry = {
      id: editingEntry?.id || `entry-${Date.now()}`,
      type,
      title: title.trim() || (type === "unsent" ? `To ${recipient || "Someone"}` : "Untitled"),
      content: content.trim(),
      date,
      mood,
      tags,
      recipient: type === "unsent" ? recipient || "Someone" : undefined,
      created_at: editingEntry?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    sanctuaryAudio.playEnterChime();
    onSave(entryToSave);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-10 font-sans animate-fadeIn">
      {/* Top action bar */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-8">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-mono text-[#9A9892] hover:text-[#F2F0EA] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return</span>
        </button>

        {/* Type selector toggle */}
        <div className="flex items-center bg-[#151515] p-1 rounded-xl border border-white/[0.06] text-xs font-mono">
          <button
            type="button"
            onClick={() => setType("diary")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              type === "diary" ? "bg-white/[0.12] text-[#F2F0EA]" : "text-[#9A9892] hover:text-white"
            }`}
          >
            <BookText className="w-3.5 h-3.5" />
            <span>Diary</span>
          </button>
          <button
            type="button"
            onClick={() => setType("poem")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              type === "poem" ? "bg-white/[0.12] text-[#F2F0EA]" : "text-[#9A9892] hover:text-white"
            }`}
          >
            <Feather className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Poem</span>
          </button>
          <button
            type="button"
            onClick={() => setType("unsent")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              type === "unsent" ? "bg-white/[0.12] text-[#F2F0EA]" : "text-[#9A9892] hover:text-white"
            }`}
          >
            <Send className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Unsent</span>
          </button>
        </div>

        {/* Save button and autosave indicator */}
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-mono text-[#5F5D59] hidden sm:inline">
            {saveStatus}
          </span>
          <button
            id="commit-to-vault-btn"
            onClick={handleSubmit}
            className="px-4 py-1.5 rounded-lg bg-[#F2F0EA] hover:bg-[#C8A96B] text-[#0D0D0D] font-mono text-xs font-medium transition-colors cursor-pointer"
          >
            Commit to Vault
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Unsent Recipient Field */}
        {type === "unsent" && (
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3 text-xs font-mono text-[#9A9892]">
            <span className="text-[#C8A96B]">TO:</span>
            <input
              type="text"
              placeholder="Recipient label (e.g. Someone, 2021, A friend I lost touch with)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-transparent text-[#F2F0EA] placeholder:text-[#5F5D59] focus:outline-none"
            />
          </div>
        )}

        {/* Date and Mood row */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#9A9892]">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#5F5D59]" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-[#9A9892] focus:outline-none focus:text-[#F2F0EA] cursor-pointer"
            />
          </div>

          {/* Mood dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[#5F5D59]">Mood:</span>
            <select
              value={mood || ""}
              onChange={(e) => setMood((e.target.value as Mood) || undefined)}
              className="bg-[#151515] border border-white/[0.08] text-[#F2F0EA] text-xs font-mono rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="">(None)</option>
              {MOODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <input
            id="entry-title-input"
            type="text"
            placeholder={type === "poem" ? "Title of Poem..." : "Title of reflection..."}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent font-serif text-3xl md:text-4xl text-[#F2F0EA] placeholder:text-[#5F5D59]/60 focus:outline-none border-none py-2 font-light"
          />
        </div>

        {/* Content Textarea */}
        <div>
          <textarea
            id="entry-content-textarea"
            rows={type === "poem" ? 14 : 12}
            placeholder={
              type === "poem"
                ? "Let the lines breathe...\nWhitespace is part of the poem."
                : type === "unsent"
                ? "Write what you never got the chance to say...\nNo one will ever read this but you."
                : "What did you choose to remember today?"
            }
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className={`w-full bg-transparent text-[#F2F0EA] placeholder:text-[#5F5D59]/60 focus:outline-none resize-none leading-relaxed border-none ${
              type === "poem"
                ? "font-serif text-lg tracking-wide whitespace-pre-wrap"
                : "font-sans text-base font-light leading-7"
            }`}
            autoFocus
          />
        </div>

        {/* Tags input */}
        <div className="pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono text-[#5F5D59]">
            <Tag className="w-3.5 h-3.5" />
            <span>Tags (press Enter to add)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tags.map((t) => (
              <span
                key={t}
                onClick={() => handleRemoveTag(t)}
                className="group inline-flex items-center gap-1 text-xs font-mono bg-white/[0.04] text-[#9A9892] hover:text-red-400 border border-white/[0.06] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                title="Click to remove"
              >
                <span>#{t}</span>
                <span className="text-[10px] opacity-40 group-hover:opacity-100">✕</span>
              </span>
            ))}
            <input
              type="text"
              placeholder="e.g. rain, memory, autumn"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="bg-transparent text-xs font-mono text-[#F2F0EA] placeholder:text-[#5F5D59] focus:outline-none py-1 px-2 border-b border-white/[0.08]"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
