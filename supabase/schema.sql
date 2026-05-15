-- ─────────────────────────────────────────────────────────────────────────────
-- LIFE ARCHITECT APP — Supabase Schema
-- Paste this into Supabase > SQL Editor > Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── DAILY ENTRIES ─────────────────────────────────────────────────────────────
-- One row per day. Combines Life Architect check-in + TSS journal prompts.
CREATE TABLE IF NOT EXISTS daily_entries (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    UUID REFERENCES auth.users ON DELETE CASCADE,
  date                       DATE NOT NULL,

  -- Life Architect: morning
  day_type                   TEXT CHECK (day_type IN ('green', 'yellow', 'red')),
  energy_level               TEXT CHECK (energy_level IN ('high', 'medium', 'low')),
  morning_intention          TEXT,
  todays_priority            TEXT,

  -- Life Architect: evening
  goal_block_done            TEXT CHECK (goal_block_done IN ('done', 'partial', 'skipped')),
  goal_block_domain          TEXT,
  goal_block_skip_reason     TEXT,
  evening_prep_done          BOOLEAN,
  daily_win                  TEXT,
  daily_accountability_goal  TEXT,

  -- TSS Journal
  daily_affirmation          TEXT,
  food_reflection            TEXT,
  woman_becoming             TEXT,
  emotional_check            TEXT,

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

  -- TSS / Skinni habits
  ten_k_steps      BOOLEAN DEFAULT FALSE,
  ten_min_workout  BOOLEAN DEFAULT FALSE,
  portion_control  BOOLEAN DEFAULT FALSE,
  water_intake     BOOLEAN DEFAULT FALSE,

  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, date)
);

-- ── WEEKLY REVIEWS ────────────────────────────────────────────────────────────
-- One row per week (week_start = Monday). Combines LA + TSS weekly review.
CREATE TABLE IF NOT EXISTS weekly_reviews (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID REFERENCES auth.users ON DELETE CASCADE,
  week_start              DATE NOT NULL,

  -- Life Architect
  green_days              TEXT,
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_daily_entries
  BEFORE UPDATE ON daily_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_habit_logs
  BEFORE UPDATE ON habit_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_weekly_reviews
  BEFORE UPDATE ON weekly_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────
-- Users can only read and write their own data.

ALTER TABLE daily_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;

-- Daily entries policies
CREATE POLICY "Users own their daily entries" ON daily_entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Habit logs policies
CREATE POLICY "Users own their habit logs" ON habit_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Weekly reviews policies
CREATE POLICY "Users own their weekly reviews" ON weekly_reviews
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Done. Your schema is ready.
-- ─────────────────────────────────────────────────────────────────────────────
