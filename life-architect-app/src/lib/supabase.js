import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
export const START_DATE = new Date('2026-05-18')

export const PHASES = [
  { phase: 1, label: 'Phase 1', focus: 'Stabilise bookends',        start: '2026-05-18', end: '2026-05-24', minimum: 'Wake + close + 10-min prep' },
  { phase: 2, label: 'Phase 2', focus: 'Add morning movement',       start: '2026-05-25', end: '2026-05-31', minimum: '20 minutes of movement' },
  { phase: 3, label: 'Phase 3', focus: 'Add evening steps',          start: '2026-06-01', end: '2026-06-07', minimum: '15-minute walk or dance' },
  { phase: 4, label: 'Phase 4', focus: 'Add goal blocks',            start: '2026-06-08', end: '2026-06-14', minimum: '25 min focused work, 3x/week' },
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
  { time: '08:00', block: 'Work at Kleinbosch' },
  { time: '17:00', block: 'Leave work' },
  { time: '17:30', block: 'Walk / step completion' },
  { time: '18:15', block: 'Shower / dinner prep' },
  { time: '19:00', block: 'Dinner' },
  { time: '19:30', block: 'Goal block' },
  { time: '20:30', block: 'Tomorrow prep' },
  { time: '20:50', block: 'PM skincare, wind down' },
  { time: '21:30', block: 'In bed, read' },
]

// Goal block domain by day of week
export const GOAL_BLOCK_DOMAINS = {
  0: { domain: 'Finances + weekly planning',    suggestion: 'Update your budget, review last week\'s spending, or set financial goals for the week.' },
  1: { domain: 'Learning + admin',              suggestion: 'Complete one module, read an article, or clear your inbox and triage tasks.' },
  2: { domain: 'Light maintenance',             suggestion: 'Admin, planning, small tasks only — dance night, keep it easy.' },
  3: { domain: 'Side hustle / Design business', suggestion: 'Draft a service offering, work on a client project, or update your portfolio.' },
  4: { domain: 'Personal brand / Content',      suggestion: 'Write 3 caption options, plan next week\'s content, or work on your newsletter.' },
  5: { domain: 'Creative deep work',            suggestion: 'Longer design session, side hustle deep dive, or creative personal project.' },
  6: { domain: 'Beauty + personal evolution',   suggestion: 'Update your capsule wardrobe doc, try a new beauty step, or plan your style for next week.' },
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export function getDayNumber(date = new Date()) {
  const d = new Date(date); d.setHours(0, 0, 0, 0)
  const s = new Date(START_DATE); s.setHours(0, 0, 0, 0)
  return Math.max(1, Math.floor((d - s) / 86400000) + 1)
}

export function getCurrentPhase(date = new Date()) {
  const today = new Date(date).toISOString().slice(0, 10)
  return PHASES.find(p => today >= p.start && today <= p.end) || PHASES[PHASES.length - 1]
}

export function formatDate(date = new Date()) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function toISODate(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10)
}

// ─── DAILY ENTRIES ────────────────────────────────────────────────────────────
export async function fetchTodayEntry(date = toISODate()) {
  const { data, error } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('date', date)
    .maybeSingle()
  if (error) console.error('fetchTodayEntry:', error)
  return data || null
}

export async function upsertEntry(entry) {
  const { data, error } = await supabase
    .from('daily_entries')
    .upsert(entry, { onConflict: 'date' })
    .select()
    .maybeSingle()
  if (error) console.error('upsertEntry:', error)
  return data
}

// ─── HABIT LOGS ───────────────────────────────────────────────────────────────
export async function fetchHabits(date = toISODate()) {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('date', date)
    .maybeSingle()
  if (error) console.error('fetchHabits:', error)
  return data || null
}

export async function upsertHabits(habits) {
  const { data, error } = await supabase
    .from('habit_logs')
    .upsert(habits, { onConflict: 'date' })
    .select()
    .maybeSingle()
  if (error) console.error('upsertHabits:', error)
  return data
}

// ─── FLOOR LOGS ───────────────────────────────────────────────────────────────
export async function fetchFloor(date = toISODate()) {
  const { data, error } = await supabase
    .from('floor_logs')
    .select('*')
    .eq('date', date)
    .maybeSingle()
  if (error) console.error('fetchFloor:', error)
  return data || null
}

export async functi