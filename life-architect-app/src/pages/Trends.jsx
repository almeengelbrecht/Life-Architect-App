import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts'
import { fetchRecentEntries, fetchRecentHabits, getDayNumber, formatDate } from '../lib/supabase'

const DAY_COLOR = { green: '#2d6a4f', yellow: '#b5870a', red: '#9b2335', null: '#e4e4e4' }

const ALL_HABITS = [
  { key: 'wake_anchor',     label: 'Wake' },
  { key: 'tea_no_phone',    label: 'Tea' },
  { key: 'read_journal',    label: 'Read' },
  { key: 'prep_task',       label: 'Prep' },
  { key: 'bedtime_routine', label: 'Bed' },
  { key: 'ten_k_steps',     label: 'Steps' },
  { key: 'ten_min_workout', label: 'Workout' },
  { key: 'portion_control', label: 'Portion' },
  { key: 'water_intake',    label: 'Water' },
]

export default function Trends() {
  const [entries, setEntries] = useState([])
  const [habits,  setHabits]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchRecentEntries(30), fetchRecentHabits(30)]).then(([e, h]) => {
      setEntries(e)
      setHabits(h)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading">Loading trends…</div>

  // ── STREAK ─────────────────────────────────────────────────────────────────
  let streak = 0
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  for (const e of sorted) {
    if (e.day_type === 'green') streak++
    else break
  }

  // ── GREEN / YELLOW / RED COUNTS (last 30 days) ─────────────────────────────
  const counts = { green: 0, yellow: 0, red: 0, total: entries.length }
  entries.forEach(e => { if (e.day_type) counts[e.day_type]++ })

  // ── HABIT COMPLETION RATES ──────────────────────────────────────────────────
  const habitData = ALL_HABITS.map(({ key, label }) => {
    const done = habits.filter(h => h[key]).length
    const pct  = habits.length > 0 ? Math.round((done / habits.length) * 100) : 0
    return { label, pct }
  })

  // ── DAY-TYPE TIMELINE (last 14 days for display) ───────────────────────────
  const last14 = entries.slice(-14).map(e => ({
    date:  e.date.slice(5),
    value: e.day_type === 'green' ? 3 : e.day_type === 'yellow' ? 2 : e.day_type === 'red' ? 1 : 0,
    type:  e.day_type,
  }))

  // ── GOAL BLOCK COMPLETION (last 14) ────────────────────────────────────────
  const goalBlockData = entries.slice(-14).map(e => ({
    date:  e.date.slice(5),
    done:  e.goal_block_done === 'done' ? 1 : e.goal_block_done === 'partial' ? 0.5 : 0,
    color: e.goal_block_done === 'done' ? '#0a0a0a' : e.goal_block_done === 'partial' ? '#888' : '#e4e4e4',
  }))

  const dayNumber = getDayNumber()

  return (
    <main className="page">
      <div className="page-header">
        <h1>Trends</h1>
        <div className="meta">Day {dayNumber} · Last 30 days</div>
      </div>

      {/* ── SUMMARY STATS ────────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">At a Glance</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { label: 'Green streak', value: streak, suffix: 'd' },
            { label: 'Green days', value: counts.green, suffix: `/${counts.total}` },
            { label: 'Yellow days', value: counts.yellow, suffix: `/${counts.total}` },
            { label: 'Red days', value: counts.red, suffix: `/${counts.total}` },
          ].map(({ label, value, suffix }) => (
            <div key={label} style={{ border: '1px solid var(--border)', borderRadius: 2, padding: '10px 12px' }}>
              <div style={{ fontSize: 22, fontWeight: 600 }}>{value}<span style={{ fontSize: 12, color: 'var(--mid)', fontWeight: 400 }}>{suffix}</span></div>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mid)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DAY RATING TIMELINE ──────────────────────────────────────── */}
      {last14.length > 0 && (
        <div className="section">
          <div className="section-label">Day Ratings — Last 14 Days</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={last14} barSize={18} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#888' }} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const { date, type } = payload[0].payload
                    return (
                      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 2, padding: '4px 8px', fontSize: 11 }}>
                        {date}: <strong>{type || 'no entry'}</strong>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="value" radius={[1, 1, 0, 0]}>
                  {last14.map((entry, i) => (
                    <Cell key={i} fill={DAY_COLOR[entry.type] || DAY_COLOR.null} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
            {['green', 'yellow', 'red'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--mid)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <span style={{ width: 8, height: 8, borderRadius: 1, background: DAY_COLOR[t], display: 'inline-block' }} />
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── HABIT COMPLETION ─────────────────────────────────────────── */}
      {habits.length > 0 && (
        <div className="section">
          <div className="section-label">Habit Completion — Last 30 Days</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={habitData} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: '#888' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#333' }} tickLine={false} axisLine={false} width={52} />
                <Tooltip formatter={v => `${v}%`} contentStyle={{ fontSize: 11, border: '1px solid var(--border)', borderRadius: 2 }} />
                <Bar dataKey="pct" fill="var(--dark)" radius={[0, 1, 1, 0]} barSize={10}>
                  {habitData.map((entry, i) => (
                    <Cell key={i} fill={entry.pct >= 80 ? '#2d6a4f' : entry.pct >= 50 ? '#0a0a0a' : '#ccc'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: 11, color: 'var(--mid)', marginTop: 6 }}>Green = 80%+. Grey = under 50%.</p>
        </div>
      )}

      {/* ── GOAL BLOCK ───────────────────────────────────────────────── */}
      {goalBlockData.length > 0 && (
        <div className="section">
          <div className="section-label">Goal Block — Last 14 Days</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={goalBlockData} barSize={18} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#888' }} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const { date, done } = payload[0].payload
                    const label = done === 1 ? 'done' : done === 0.5 ? 'partial' : 'skipped'
                    return (
                      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 2, padding: '4px 8px', fontSize: 11 }}>
                        {date}: <strong>{label}</strong>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="done" radius={[1, 1, 0, 0]}>
                  {goalBlockData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {entries.length === 0 && habits.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--mid)', fontSize: 13 }}>
          No data yet. Start filling in your daily check-ins and the trends will appear here.
        </div>
      )}
    </main>
  )
}
