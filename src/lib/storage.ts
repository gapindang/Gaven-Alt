import { GavenEntry } from "./types";

const STORAGE_KEY = "gaven_vault_entries_v1";
const SETTINGS_KEY = "gaven_vault_settings_v1";

export interface VaultSettings {
  userName: string;
  theme: "dark";
  soundEnabled: boolean;
  reducedMotion: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

const DEFAULT_SETTINGS: VaultSettings = {
  userName: "Gavin",
  theme: "dark",
  soundEnabled: false,
  reducedMotion: false,
};

// Seed entries reflecting the authentic tone and examples from GAVEN_PRD.md
const INITIAL_ENTRIES: GavenEntry[] = [
  {
    id: "entry-1",
    type: "poem",
    title: "Maybe tomorrow",
    content: `I don't know why
I keep remembering
something that already happened.

Maybe some things
don't really leave.

They only change the way
they sit inside the chest.`,
    date: "2026-09-28",
    created_at: "2026-09-28T22:15:00Z",
    updated_at: "2026-09-28T22:15:00Z",
    mood: "Nostalgic",
    tags: ["memory", "night", "tomorrow"],
  },
  {
    id: "entry-2",
    type: "diary",
    title: "The distance",
    content: `The sky looked different tonight. Cold, slate gray, like the color of wet river stones.
I spent three hours wandering through the station just watching people board trains they'll probably forget taking. 
Strange how you can stand in the middle of a crowd of strangers and feel both invisible and entirely exposed at the exact same moment.

I bought a coffee I didn't finish. Left it on the wooden bench next to an abandoned paperback.
I wonder who will sit there next.`,
    date: "2026-09-24",
    created_at: "2026-09-24T19:40:00Z",
    updated_at: "2026-09-24T19:40:00Z",
    mood: "Lonely",
    tags: ["train", "night", "distance"],
  },
  {
    id: "entry-3",
    type: "unsent",
    title: "Unsent letter #04",
    recipient: "To Someone",
    content: `I wanted to tell you that I finally finished that book you gave me two autumns ago. 
The corner of page 84 is still folded where you stopped reading. 
I thought about calling you when I turned the last page, but the sun had already gone down and I realized I didn't want to explain why it took me two years to read 200 pages.

Some things are easier to write than to say.
Some things aren't meant to be delivered at all.`,
    date: "2026-09-21",
    created_at: "2026-09-21T23:05:00Z",
    updated_at: "2026-09-21T23:05:00Z",
    mood: "Nostalgic",
    tags: ["unsent", "books", "autumn"],
  },
  {
    id: "entry-4",
    type: "diary",
    title: "One year from now",
    content: `September 30, 2025.

I wonder if I'll still remember this one year from now.
The hum of the refrigerator in the small kitchen. The smell of cedar smoke coming from someone's garden down the hill.
How quiet everything is when the rest of the house is sleeping.

If you are reading this in 2026: I hope you found what you were looking for. And if you didn't, I hope you stopped running.`,
    date: "2025-09-30",
    created_at: "2025-09-30T23:55:00Z",
    updated_at: "2025-09-30T23:55:00Z",
    mood: "Peaceful",
    tags: ["on-this-day", "memory", "future"],
  },
  {
    id: "entry-5",
    type: "poem",
    title: "The sky looked different",
    content: `The sky looked different
before the clouds learned
how to gather without warning.

We walked until our shoes were soaked
and called it freedom.

Now the streets are dry
and we stay inside.`,
    date: "2026-08-31",
    created_at: "2026-08-31T18:20:00Z",
    updated_at: "2026-08-31T18:20:00Z",
    mood: "Empty",
    tags: ["rain", "memory"],
  },
  {
    id: "entry-6",
    type: "diary",
    title: "Sanctuary notes",
    content: `Write it.
Keep it.
Forget it.
Find it again.

That's the only rule this place needs. No audience. No statistics. No one to impress or perform for. Just the raw, honest texture of a mind trying to keep what matters before time washes it away.`,
    date: "2024-11-12",
    created_at: "2024-11-12T14:10:00Z",
    updated_at: "2024-11-12T14:10:00Z",
    mood: "Grateful",
    tags: ["sanctuary", "philosophy"],
  },
  {
    id: "entry-7",
    type: "unsent",
    title: "Before the snow",
    recipient: "To 2023",
    content: `I don't hold any grudges anymore. It took almost two winters to realize that people aren't always being cruel when they leave; sometimes they are just as lost as you are.
Thank you for the lessons I didn't want at the time.`,
    date: "2024-12-04",
    created_at: "2024-12-04T21:00:00Z",
    updated_at: "2024-12-04T21:00:00Z",
    mood: "Peaceful",
    tags: ["winter", "forgiveness"],
  }
];

export function getStoredEntries(): GavenEntry[] {
  if (typeof window === "undefined") return INITIAL_ENTRIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ENTRIES));
      return INITIAL_ENTRIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ENTRIES;
  }
}

export function saveStoredEntries(entries: GavenEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error("Failed to save entries to localStorage", err);
  }
}

export function getStoredSettings(): VaultSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: VaultSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save settings", err);
  }
}
