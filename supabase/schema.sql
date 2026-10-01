-- ==============================================================================
-- GAVEN — Database Schema & Row Level Security (RLS)
-- Based on GAVEN_PRD.md (Section 22 & 23)
-- Safe to re-run multiple times (Idempotent)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Enums
DO $$ BEGIN
    CREATE TYPE entry_type AS ENUM ('diary', 'poem', 'unsent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    display_name TEXT DEFAULT 'Gavin'
);

-- 4. Entries Table
CREATE TABLE IF NOT EXISTS public.entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type entry_type NOT NULL DEFAULT 'diary',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    mood TEXT,
    recipient TEXT,
    archived BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- If table was already created with NOT NULL user_id, make it nullable for single-owner sanctuary
ALTER TABLE public.entries ALTER COLUMN user_id DROP NOT NULL;

-- 5. Tags Table
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, name)
);

ALTER TABLE public.tags ALTER COLUMN user_id DROP NOT NULL;

-- 6. Entry Tags Junction Table
CREATE TABLE IF NOT EXISTS public.entry_tags (
    entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (entry_id, tag_id)
);

-- 7. Attachments Table
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE NOT NULL,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- PRD Section 23: Security & Privacy
-- Configured for Single-Owner Sanctuary Access
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (true);

-- ENTRIES POLICIES (Single-Owner Sanctuary)
DROP POLICY IF EXISTS "Users can read own entries" ON public.entries;
CREATE POLICY "Users can read own entries"
    ON public.entries FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert own entries" ON public.entries;
CREATE POLICY "Users can insert own entries"
    ON public.entries FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own entries" ON public.entries;
CREATE POLICY "Users can update own entries"
    ON public.entries FOR UPDATE
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own entries" ON public.entries;
CREATE POLICY "Users can delete own entries"
    ON public.entries FOR DELETE
    USING (true);

-- TAGS POLICIES
DROP POLICY IF EXISTS "Users can manage own tags" ON public.tags;
CREATE POLICY "Users can manage own tags"
    ON public.tags FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ENTRY_TAGS POLICIES
DROP POLICY IF EXISTS "Users can manage entry_tags via entry ownership" ON public.entry_tags;
CREATE POLICY "Users can manage entry_tags via entry ownership"
    ON public.entry_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.entries
            WHERE entries.id = entry_tags.entry_id
            AND entries.user_id = auth.uid()
        )
    );

-- ATTACHMENTS POLICIES
DROP POLICY IF EXISTS "Users can manage attachments via entry ownership" ON public.attachments;
CREATE POLICY "Users can manage attachments via entry ownership"
    ON public.attachments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.entries
            WHERE entries.id = attachments.entry_id
            AND entries.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- When a user signs up via Supabase Auth, automatically create their profile
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', 'Gavin'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_entries_user_date ON public.entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_type ON public.entries(type);
CREATE INDEX IF NOT EXISTS idx_tags_user ON public.tags(user_id);
