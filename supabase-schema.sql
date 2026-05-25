-- ═══════════════════════════════════════════════════
-- LITTLE BEREAN — Supabase Database Schema
-- Run this in Supabase SQL Editor to set up your DB
-- ═══════════════════════════════════════════════════

-- Enable Row Level Security on all tables
-- Families table (one per authenticated user)
CREATE TABLE families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own family" ON families
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own family" ON families
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own family" ON families
  FOR UPDATE USING (auth.uid() = user_id);

-- Children profiles
CREATE TABLE children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  age_tier TEXT NOT NULL CHECK (age_tier IN ('preschool', 'elementary', 'upper')),
  avatar_emoji TEXT DEFAULT '🌱',
  current_day INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_devotion_date DATE,
  verses_learned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own children" ON children
  FOR ALL USING (
    family_id IN (SELECT id FROM families WHERE user_id = auth.uid())
  );

-- Completed devotions log
CREATE TABLE completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  journey_day INTEGER NOT NULL,
  theme TEXT,
  ot_book TEXT,
  ot_chapter INTEGER,
  nt_book TEXT,
  nt_chapter INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, journey_day)
);

ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own completions" ON completions
  FOR ALL USING (
    child_id IN (
      SELECT c.id FROM children c
      JOIN families f ON c.family_id = f.id
      WHERE f.user_id = auth.uid()
    )
  );

-- Cached devotion content (avoid re-generating)
CREATE TABLE devotion_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  journey_day INTEGER NOT NULL,
  age_tier TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(journey_day, age_tier)
);

ALTER TABLE devotion_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cache" ON devotion_cache
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can write cache" ON devotion_cache
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Parent discussion notes
CREATE TABLE parent_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  journey_day INTEGER NOT NULL,
  note_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, journey_day)
);

ALTER TABLE parent_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notes" ON parent_notes
  FOR ALL USING (
    child_id IN (
      SELECT c.id FROM children c
      JOIN families f ON c.family_id = f.id
      WHERE f.user_id = auth.uid()
    )
  );

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER children_updated_at BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER parent_notes_updated_at BEFORE UPDATE ON parent_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
