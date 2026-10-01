import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { GavenEntry } from "./types";
import { getStoredSettings } from "./storage";

let cachedClient: SupabaseClient | null = null;
let lastUrl: string | null = null;
let lastKey: string | null = null;

function sanitizeUrl(rawUrl?: string): string | undefined {
  if (!rawUrl) return undefined;
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

export function getSupabaseClient(): SupabaseClient | null {
  // Try environment variables first
  const envUrl = sanitizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  // Fallback to client settings in localStorage
  const settings = getStoredSettings();
  const url = envUrl || sanitizeUrl(settings.supabaseUrl);
  const key = envKey || settings.supabaseAnonKey?.trim();

  if (!url || !key) return null;

  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key);
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.warn("Could not initialize Supabase client", err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}

export async function testSupabaseConnection(url?: string, key?: string): Promise<{ success: boolean; message: string }> {
  try {
    const cleanUrl = sanitizeUrl(url);
    const cleanKey = key?.trim();
    const client = cleanUrl && cleanKey ? createClient(cleanUrl, cleanKey) : getSupabaseClient();
    if (!client) {
      return { success: false, message: "Missing Supabase Project URL or Anon Key." };
    }

    // Try a simple ping / query to entries
    const { error } = await client.from("entries").select("id").limit(1);

    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      // 42P01 is relation does not exist yet (tables not run yet)
      if (error.message.includes("does not exist") || error.code === "42P01") {
        return {
          success: true,
          message: "Connected! Note: The 'entries' table has not been created yet. Please execute supabase/schema.sql in your Supabase SQL editor.",
        };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: "Successfully connected to your Supabase project (HTTP 200 OK)!" };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unknown connection error occurred.",
    };
  }
}

export async function fetchRemoteEntries(): Promise<GavenEntry[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("entries")
      .select(`
        id,
        type,
        title,
        content,
        date,
        mood,
        recipient,
        archived,
        created_at,
        updated_at
      `)
      .order("date", { ascending: false });

    if (error) {
      console.warn("Supabase fetch entries error:", error.message);
      return null;
    }

    if (!data) return [];

    return data.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      content: item.content,
      date: item.date,
      mood: item.mood,
      recipient: item.recipient,
      archived: item.archived,
      created_at: item.created_at,
      updated_at: item.updated_at,
      tags: [],
    }));
  } catch (err) {
    console.error("Error fetching remote entries", err);
    return null;
  }
}

export async function syncEntryToRemote(entry: GavenEntry): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // If not authenticated, we keep local storage safe
      return false;
    }

    const { error } = await supabase.from("entries").upsert({
      id: entry.id.length === 36 ? entry.id : undefined, // Ensure valid UUID or let Supabase generate
      user_id: user.id,
      type: entry.type,
      title: entry.title,
      content: entry.content,
      date: entry.date,
      mood: entry.mood,
      recipient: entry.recipient,
      archived: entry.archived || false,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("Supabase upsert warning:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase sync failed, cached locally", err);
    return false;
  }
}

export async function deleteRemoteEntry(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("entries").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}
