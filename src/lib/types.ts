export type EntryType = "diary" | "poem" | "unsent";

export type Mood =
  | "Peaceful"
  | "Happy"
  | "Nostalgic"
  | "Lonely"
  | "Angry"
  | "Confused"
  | "Grateful"
  | "Empty"
  | "Hopeful";

export interface GavenEntry {
  id: string;
  type: EntryType;
  title: string;
  content: string;
  date: string; // ISO date string YYYY-MM-DD
  created_at: string;
  updated_at: string;
  mood?: Mood;
  tags: string[];
  recipient?: string; // For unsent letters
  archived?: boolean;
}

export type ViewState =
  | "opening"
  | "vault_gate"
  | "home"
  | "write"
  | "read"
  | "archive"
  | "timeline"
  | "on_this_day"
  | "settings";
