import { useState, useEffect, useCallback, useRef } from 'react'
import {
  fetchTodayEntry, upsertEntry,
  fetchHabits, upsertHabits,
  getDayNumber, getCurrentPhase, formatDate, toISODate
} from '../lib/supabase'

// ─── HABIT CONFIG ─────────────────────────────────────────────────────────────
const LIFE_HABITS = [
  { key: 'wake_anchor',      label: 'Wake anchor (05:00)' },
  { key: 'tea_no_phone',     label: 'Tea, no phone first' },
  { key: 'read_journal',     label: 'Read / journal (15 min)' },
  { key: 'prep_task',        label: 'One prep task tonight' },
  { key: 'bedtime_routine',  label: 'Bedtime routine (21:15)' },
]

const SKINNI_HABITS = [
  { key: 'ten_k_steps',      label: '10K steps' },
  { key: 'ten_min_workout',  label: '10 min workout' },
  { key: 'portion_control',  label: 'Portion / craving control' },
  { key: 'water_intake',     label: '2–3L water' },
]

const DAY_TYPES = ['green', 'yellow', 'red']
const ENERGY_LEVELS = ['high', 'medium', 'low']
const GOAL_BLOCK_STATUS = ['done', 'partial', 'skipped']

const EMPTY_ENTRY = {
  date: toISODate(),
  day_type: null,
  energy_level: null,
  morning_intention: '',
  todays_priority: '',
  goal_block_done: null,
  goal_block_domain: '',
  goal_block_skip_reason: '',
  evening_prep_done: null,
  daily_win: '',
  daily_accountability_goal: '',
}

const EMPTY_HABITS = {
  date: toISODate(),
  wake_anchor: false, tea_no_phone: false, read_journal: false,
  prep_task: false, bedtime_routine: false,
  ten_k_steps: false, ten_min_workout: false,
  portion_control: false, water_intake: false,
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function Today() {
  const [entry, setEntry]   = useState(EMPTY_ENTRY)
  const [habits, setHabits] = useState(EMPTY_HABITS)
  const [saveStatus, setSaveStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const saveTimer = useRef(null)

  const dayNumber  = getDayNumber()
  const phase      = getCurrentPhase()
  const today      = formatDate()

  // Load data on mount
  useEffect(() => {
    async function load() {
      const [e, h] = await Promise.all([fetchTodayEntry(), fetchHabits()])
      if (e) setEntry(e)
      if (h) setHabits(h)
      setLoading(false)
    }
    load()
  }, [])

  // Auto-save entry after 800ms of inactivity
  const scheduleEntrySave = useCallback((updated) => {
    clearTimeout(saveTimer.current)
    setSaveStatus('saving…')
    saveTimer.current = setTimeout(async () => {
      await upsertEntry(updated)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(''), 2000)
    }, 800)
  }, [])

  function updateEntry(field, value) {
    const updated = { ...entry, [field]: value }
    setEntry(updated)
    scheduleEntrySave(updated)
  }

  async function toggleHabit(key) {
    const updated = { ...habits, [key]: !habits[key] }
    setHabits(updated)
    await upsertHabits(updated)
  }

  // Count habits done
  const allHabits   = [...LIFE_HABITS, ...SKINNI_HABITS]
  const habitsDone  = allHabits.filter(h => habits[h.key]).length
  const habitsTotal = allHabits.length

  if (loading) return <div className="loading">Loading today…</div>

  return (
    <main className="page">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="page-header">
        <h1>Life Architect</h1>
        <div className="meta">
          Day {dayNumber} of 90&ensp;·&ensp;{phase.label}&ensp;·&ensp;{today}
        </div>
        <div className="progress-bar" style={{ marginTop: 10 }}>
          <div className="progress-fill" style={{ width: `${Math.min(100, (dayNumber / 90) * 100)}%` }} />
        </div>
      </div>

      {/* ── PHASE MINIMUM ──────────────────────────────────────────── */}
      <div className="callout" style={{ marginBottom: 24 }}>
        <div className="callout-label">{phase.label} — {phase.focus}</div>
        <p>Minimum win: {phase.minimum}</p>
      </div>

      {/* ── MORNING ────────────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Morning</div>

        <div className="field">
          <label>Today's Priority</label>
          <input
            type="text"
            value={entry.todays_priority}
            onChange={e => updateEntry('todays_priority', e.target.value)}
            placeholder="The one non-negotiable action today"
          />
        </div>

        <div className="field">
          <label>Morning Intention</label>
          <input
            type="text"
            value={entry.morning_intention}
            onChange={e => updateEntry('morning_intention', e.target.value)}
            placeholder="What makes today a green day?"
          />
        </div>

        <div className="field">
          <label>Energy Forecast</label>
          <div className="pill-group">
            {ENERGY_LEVELS.map(e => (
              <button
                key={e}
                className={`pill ${entry.energy_level === e ? 'active' : ''}`}
                onClick={() => updateEntry('energy_level', e)}
              >
                {e.charAt(0).toUpperCase() + e.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── HABITS ─────────────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">
          Habits&ensp;
          <span style={{ fontWeight: 400, color: 'var(--mid)' }}>{habitsDone} / {habitsTotal}</span>
        </div>

        <p style={{ fontSize: 11, color: 'var(--mid)', marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Life Architect</p>
        <div className="habit-list" style={{ marginBottom: 16 }}>
          {LIFE_HABITS.map(({ key, label }) => (
            <HabitRow key={key} label={label} checked={habits[key]} onToggle={() => toggleHabit(key)} />
          ))}
        </div>

        <p style={{ fontSize: 11, color: 'var(--mid)', marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Skinni From Scratch</p>
        <div className="habit-list">
          {SKINNI_HABITS.map(({ key, label }) => (
            <HabitRow key={key} label={label} checked={habits[key]} onToggle={() => toggleHabit(key)} />
          ))}
        </div>
      </div>

      {/* ── EVENING ────────────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Evening Check-In</div>

        <div className="field">
          <label>Day Rating</label>
          <div className="pill-group">
            {DAY_TYPES.map(t => (
              <button
                key={t}
                className={`pill ${entry.day_type === t ? `active-${t}` : ''}`}
                onClick={() => updateEntry('day_type', t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Goal Block</label>
          <div className="pill-group">
            {GOAL_BLOCK_STATUS.map(s => (
              <button
                key={s}
                className={`pill ${entry.goal_block_done === s ? 'active' : ''}`}
                onClick={() => updateEntry('goal_block_done', s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          {entry.goal_block_done === 'done' || entry.goal_block_done === 'partial' ? (
            <input
              type="text"
              style={{ marginTop: 8 }}
              value={entry.goal_block_domain}
              onChange={e => updateEntry('goal_block_domain', e.target.value)}
              placeholder="Domain + what you worked on"
            />
          ) : entry.goal_block_done === 'skipped' ? (
            <input
              type="text"
              style={{ marginTop: 8 }}
              value={entry.goal_block_skip_reason}
              onChange={e => updateEntry('goal_block_skip_reason', e.target.value)}
              placeholder="One sentence: why was it skipped?"
            />
          ) : null}
        </div>

        <div className="field">
          <label>Evening Prep</label>
          <div className="pill-group">
            <button className={`pill ${entry.evening_prep_done === true ? 'active' : ''}`}  onClick={() => updateEntry('evening_prep_done', true)}>Done</button>
            <button className={`pill ${entry.evening_prep_done === false ? 'active' : ''}`} onClick={() => updateEntry('evening_prep_done', false)}>Not done</button>
          </div>
        </div>

        <div className="field">
          <label>One Thing That Went Right</label>
          <input
            type="text"
            value={entry.daily_win}
            onChange={e => updateEntry('daily_win', e.target.value)}
            placeholder="Any size counts"
          />
        </div>

        <div className="field">
          <label>Daily Accountability Goal (for tomorrow)</label>
          <input
            type="text"
            value={entry.daily_accountability_goal}
            onChange={e => updateEntry('daily_accountability_goal', e.target.value)}
            placeholder="The one action I commit to tomorrow"
          />
        </div>
      </div>

      <div className="save-status">{saveStatus}</div>
    </main>
  )
}

// ─── HABIT ROW ────────────────────────────────────────────────────────────────
function HabitRow({ label, checked, onToggle }) {
  return (
    <div className="habit-row" onClick={onToggle}>
      <div className={`habit-check ${checked ? 'checked' : ''}`}>
        {checked && (
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor">
            <polyline points="2,6 5,9 10,3" />
          </svg>
        )}
      </div>
      <span className={`habit-name ${checked ? 'checked' : ''}`}>{label}</span>
    </div>
  )
}
