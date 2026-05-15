-- ─────────────────────────────────────────────────────────────────────────────
-- LIFE ARCHITECT APP — No-auth schema (personal app, no login required)
-- Run this in Supabase > SQL Editor > Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── CLEAN SLATE ───────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS time_entries   CASCADE;
DROP TABLE IF EXISTS floor_logs     CASCADE;
DROP TABLE IF EXISTS habit_logs     CASCADE;
DROP TABLE IF EXISTS weekly_reviews CASCADE;
DROP TABLE IF EXISTS daily_entries  CASCADE;
DROP FUNCTION IF EXISTS update_updated_at CASCADE;

-- ── DAILY ENTRIES ─────────────────────────────────────────────────────────────
CREATE TABLE daily_entries (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date                       DATE NOT NULL UNIQUE,

  moon_rating                TEXT CHECK (moon_rating IN ('full', 'half', 'new')),
  energy_level               TEXT CHECK (energy_level IN ('high', 'medium', 'low')),
  morning_intention          TEXT,
  todays_priority            TEXT,

  goal_block_done            TEXT CHECK (goal_block_done IN ('done', 'partial', 'skipped')),
  goal_block_domain          TEXT,
  goal_block_outcome         TEXT,
  goal_block_actual          TEXT,
  goal_block_skip_reason     TEXT,
  evening_prep_done          BOOLEAN,
  daily_win                  TEXT,
  daily_accountability_goal  TEXT,

  daily_affirmation          TEXT,
  food_reflection            TEXT,
  woman_becoming             TEXT,
  emotional_check            TEXT,
  best_self_would            TEXT,
  food_priority              TEXT,

  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── HABIT LOGS ────────────────────────────────────────────────────────────────
CREATE TABLE habit_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date             DATE NOT NULL UNIQUE,

  wake_anchor      BOOLEAN DEFAULT FALSE,
  tea_no_phone     BOOLEAN DEFAULT FALSE,
  read_journal     BOOLEAN DEFAULT FALSE,
  prep_task        BOOLEAN DEFAULT FALSE,
  bedtime_routine  BOOLEAN DEFAULT FALSE,

  ten_k_steps      BOOLEAN DEFAULT FALSE,
  ten_min_workout  BOOLEAN DEFAULT FALSE,
  portion_control  BOOLEAN DEFAULT FALSE,
  water_intake     BOOLEAN DEFAULT FALSE,

  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── FLOOR LOGS ────────────────────────────────────────────────────────────────
CREATE TABLE floor_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date              DATE NOT NULL UNIQUE,

  morning_skincare  BOOLEAN DEFAULT FALSE,
  vitamins          BOOLEAN DEFAULT FALSE,
  protein_meal      BOOLEAN DEFAULT FALSE,
  water_minimum     BOOLEAN DEFAULT FALSE,
  movement_minimum  BOOLEAN DEFAULT FALSE,
  in_bed_by_2200    BOOLEAN DEFAULT FALSE,

  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── TIME ENTRIES ──────────────────────────────────────────────────────────────
CREATE TABLE time_entries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date           DATE NOT NULL,

  entry_type     TEXT NOT NULL CHECK (entry_type IN ('professional', 'personal')),
  category       TEXT NOT NULL,
  subcategory    TEXT,
  duration_mins  INTEGER NOT NULL DEFAULT 0,
  notes          TEXT,

  started_at     TIMESTAMPTZ,
  stopped_at     TIMESTAMPTZ,
  is_timer       BOOLEAN DEFAULT FALSE,

  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── WEEKLY REVIEWS ────────────────────────────────────────────────────────────
CREATE TABLE weekly_reviews (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start             DATE NOT NULL UNIQUE,

  moon_summary           TEXT,
  hardest_habit          TEXT,
  automatic_habit        TEXT,
  obstacles              TEXT,
  changes                TEXT,
  goal_block_sessions    TEXT,
  neglected_domain       TEXT,
  win                    TEXT,
  commitment             TEXT,
  phase_advance          TEXT,

  impactful_change       TEXT,
  proud_moment           TEXT,
  working_not_working    TEXT,
  week_focus_reflection  TEXT,
  release_reset          TEXT,

  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── AUTO-UPDATE TIMESTAMPS ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_daily_entries
  BEFORE UPDATE ON daily_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_habit_logs
  BEFORE UPDATE ON habit_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_floor_logs
  BEFORE UPDATE ON floor_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_time_entries
  BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_weekly_reviews
  BEFORE UPDATE ON weekly_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── OPEN ACCESS (personal app — no login needed) ──────────────────────────────
-- Allows the app to read and write without requiring a user account.

ALTER TABLE daily_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open_daily_entries"   ON daily_entries  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "open_habit_logs"      ON habit_logs     FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "open_floor_logs"      ON floor_logs     FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "open_time_entries"    ON time_entries   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "open_weekly_reviews"  ON weekly_reviews FOR ALL TO anon USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Done. Five tables, no login required.
-- ─────────────────────────────────────────────────────────────────────────────
