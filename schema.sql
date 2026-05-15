-- ─────────────────────────────────────────────────────────────────────────────
-- LIFE ARCHITECT APP — Supabase Schema (updated)
-- Paste ALL of this into Supabase > SQL Editor > Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── DAILY ENTRIES ─────────────────────────────────────────────────────────────
-- One row per day. Life Architect check-in + TSS journal.
CREATE TABLE IF NOT EXISTS daily_entries (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    UUID REFERENCES auth.users ON DELETE CASCADE,
  date                       DATE NOT NULL,

  -- Morning
  moon_rating                TEXT CHECK (moon_rating IN ('full', 'half', 'new')),
  energy_level               TEXT CHECK (energy_level IN ('high', 'medium', 'low')),
  morning_intention          TEXT,
  todays_priority            TEXT,

  -- Evening
  goal_block_done            TEXT CHECK (goal_block_done IN ('done', 'partial', 'skipped')),
  goal_block_domain          TEXT,
  goal_block_outcome         TEXT,
  goal_block_actual          TEXT,
  goal_block_skip_reason     TEXT,
  evening_prep_done          BOOLEAN,
  daily_win                  TEXT,
  daily_accountability_goal  TEXT,

  -- TSS Journal
  daily_affirmation          TEXT,
  food_reflection            TEXT,
  woman_becoming             TEXT,
  emotional_check            TEXT,
  best_self_would            TEXT,
  food_priority              TEXT,

  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, date)
);

-- ── HABIT LOGS ────────────────────────────────────────────────────────────────
-- One row per day. All daily habit checkboxes.
CREATE TABLE IF NOT EXISTS habit_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users ON DELETE CASCADE,
  date             DATE NOT NULL,

  -- Life Architect habits
  wake_anchor      BOOLEAN DEFAULT FALSE,
  tea_no_phone     BOOLEAN DEFAULT FALSE,
  read_journal     BOOLEAN DEFAULT FALSE,
  prep_task        BOOLEAN DEFAULT FALSE,
  bedtime_routine  BOOLEAN DEFAULT FALSE,

  -- Skinni habits
  ten_k_steps      BOOLEAN DEFAULT FALSE,
  ten_min_workout  BOOLEAN DEFAULT FALSE,
  portion_control  BOOLEAN DEFAULT FALSE,
  water_intake     BOOLEAN DEFAULT FALSE,

  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, date)
);

-- ── FLOOR LOGS ────────────────────────────────────────────────────────────────
-- Daily non-negotiables (gold floor section).
CREATE TABLE IF NOT EXISTS floor_logs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES auth.users ON DELETE CASCADE,
  date                  DATE NOT NULL,

  morning_skincare      BOOLEAN DEFAULT FALSE,
  vitamins              BOOLEAN DEFAULT FALSE,
  protein_meal          BOOLEAN DEFAULT FALSE,
  water_minimum         BOOLEAN DEFAULT FALSE,
  movement_minimum      BOOLEAN DEFAULT FALSE,
  in_bed_by_2200        BOOLEAN DEFAULT FALSE,

  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, date)
);

-- ── TIME ENTRIES ──────────────────────────────────────────────────────────────
-- Each row is one time block (timer session or manual entry).
CREATE TABLE IF NOT EXISTS time_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users ON DELETE CASCADE,
  date          DATE NOT NULL,

  entry_type    TEXT NOT NULL CHECK (entry_type IN ('professional', 'personal')),
  category      TEXT NOT NULL,
  subcategory   TEXT,
  duration_mins INTEGER NOT NULL DEFAULT 0,
  notes         TEXT,

  -- Timer metadata (null for manual entries)
  started_at    TIMESTAMPTZ,
  stopped_at    TIMESTAMPTZ,
  is_timer      BOOLEAN DEFAULT FALSE,

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── WEEKLY REVIEWS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_reviews (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID REFERENCES auth.users ON DELETE CASCADE,
  week_start              DATE NOT NULL,

  -- Life Architect
  moon_summary            TEXT,
  hardest_habit           TEXT,
  automatic_habit         TEXT,
  obstacles               TEXT,
  changes                 TEXT,
  goal_block_sessions     TEXT,
  neglected_domain        TEXT,
  win                     TEXT,
  commitment              TEXT,
  phase_advance           TEXT,

  -- TSS
  impactful_change        TEXT,
  proud_moment            TEXT,
  working_not_working     TEXT,
  week_focus_reflection   TEXT,
  release_reset           TEXT,

  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, week_start)
);

-- ── AUTO-UPDATE TIMESTAMPS ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;