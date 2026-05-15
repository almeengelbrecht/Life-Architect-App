import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
export const START_DATE = new Date('2026-05-18') // Day 1 of the 90-day journey

export const PHASES = [
  { phase: 1, label: 'Phase 1', focus: 'Stabilise bookends', start: '2026-05-18', end: '2026-05-24', minimum: 'Wake + close + 10-min prep' },
  { phase: 2, label: 'Phase 2', focus: 'Add morning movement', start: '2026-05-25', end: '2026-05-31', minimum: '20 minutes of movement' },
  { phase: 3, label: 'Phase 3', focus: 'Add evening steps', start: '2026-06-01', end: '2026-06-07', minimum: '15-minute walk or dance' },
  { phase: 4, label: 'Phase 4', focus: 'Add goal blocks', start: '2026-06-08', end: '2026-06-14', minimum: '25 min focused work, 3x/week' },
  { phase: 5, label: 'Phase 5', focus: 'Full routine + flexibility', start: '2026-06-15', end: '2026-06-21', minimum: 'Full structure, no perfectionism' },
]

export const DAILY_SCHEDULE = [
  { time: '05:00', block: 'Wake, skincare, brush teeth' },
  { time: '05:10', block: 'Make tea + feed cats' },
  { time: '05:15', block: 'Read / journal' },
  { time: '05:40', block: 'Quick prep check' },
  { time: '06:00', block: 'Gym / Pilates / movement' },
  { time: '07:15', block: 'Shower, get ready, breakfast' },
  { time: '07:45', block: 'Leave for work' },
  { time: '08:00', block: 'Work at Kleinbosch', span: '9h' },
  { time: '17:00', block: 'Leave work' },
  { time: '17:30', block: 'Walk / step completion' },
  { time: '18:15', block: 'Shower / dinner prep' },
  { time: '19:00', block: 'Dinner' },
  { time: '19:30', block: 'Goal block' },
  { time: '20:30', block: 'Tomorrow prep' },
  { time: '20:50', block: 'PM skincare, wind down' },
  { time: '21:15', block: 'In bed, read' },
  { time: '21:30', block: 'Sleep target' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Returns Day N of the journey (1-indexed) */
export function getDayNumber(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const s = new Date(START_DATE)
  s.setHours(0, 0, 0, 0)
  return Math.max(1, Math.floor((d - s) / 86400000) + 1)
}

/** Returns current phase object based on today's date */
export function getCurrentPhase(date = new Date()) {
  const today = new Date(date).toISOString().slice(0, 10)
  return PHASES.find(p => today >= p.start && today <= p.end) || PHASES[PHASES.length - 1]
}

/** Format date as "18 May 2026" */
export function formatDate(date = new Date()) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Format date as YYYY-MM-DD for DB queries */
export function toISODate(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10)
}

// ─── DB OPERATIONS ────────────────────────────────────────────────────────────

/** Fetch today's entry. Returns null if none exists yet. */
export async function fetchTodayEntry(date = toISODate()) {
  const { data, error } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('date', date)
    .single()
  if (error && error.code !== 'PGRST116') console.error(error)
  return data || null
}

/** Upsert the daily entry (create or update) */
export async function upsertEntry(entry) {
  const { data, error } = await supabase
    .from('daily_entries')
    .upsert(entry, { onConflict: 'date' })
    .select()
    .single()
  if (error) console.error(error)
  return data
}

/** Fetch habit log for a given date */
export async function fetchHabits(date = toISODate()) {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('date', date)
    .single()
  if (error && error.code !== 'PGRST116') console.error(error)
  return data || null
}

/** Upsert habit log */
export async function upsertHabits(habits) {
  const { data, error } = await supabase
    .from('habit_logs')
    .upsert(habits, { onConflict: 'date' })
    .select()
    .single()
  if (error) console.error(error)
  return data
}

/** Fetch last N days of entries for trends */
export async function fetchRecentEntries(days = 30) {
  const from = new Date()
  from.setDate(from.getDate() - days)
  const { data, error } = await supabase
    .from('daily_entries')
    .select('date, day_type, goal_block_done')
    .gte('date', toISODate(from))
    .order('date', { ascending: true })
  if (error) console.error(error)
  return data || []
}

/** Fetch last N days of habit logs for trends */
export async function fetchRecentHabits(days = 30) {
  const from = new Date()
  from.setDate(from.getDate() - days)
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .gte('date', toISODate(from))
    .order('date', { ascending: true })
  if (error) console.error(error)
  return data || []
}

/** Fetch weekly review for a given week start */
export async function fetchWeeklyReview(weekStart) {
  const { data, error } = await supabase
    .from('weekly_reviews')
    .select('*')
    .eq('week_start', weekStart)
    .single()
  if (error && error.code !== 'PGRST116') console.error(error)
  return data || null
}

/** Upsert weekly review */
export async function upsertWeeklyReview(review) {
  const { data, error } = await supabase
    .from('weekly_reviews')
    .upsert(review, { onConflict: 'week_start' })
    .select()
    .single()
  if (error) console.error(error)
  return data
}
