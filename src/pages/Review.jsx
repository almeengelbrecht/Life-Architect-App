import { useState, useCallback, useRef } from 'react'
import { fetchWeeklyReview, upsertWeeklyReview, getDayNumber, formatDate } from '../lib/supabase'

// Get Monday of current week as YYYY-MM-DD
function getMondayOfWeek(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().slice(0, 10)
}

const EMPTY_REVIEW = {
  week_start: getMondayOfWeek(),
  green_days: '',
  hardest_habit: '',
  automatic_habit: '',
  obstacles: '',
  changes: '',
  goal_block_sessions: '',
  neglected_domain: '',
  win: '',
  commitment: '',
  phase_advance: '',
  impactful_change: '',
  proud_moment: '',
  working_not_working: '',
  week_focus_reflection: '',
  release_reset: '',
}

const LA_QUESTIONS = [
  { key: 'green_days',         label: 'How many green days this week?', placeholder: '0–7', short: true },
  { key: 'hardest_habit',      label: 'Which habit was hardest to keep?', placeholder: '' },
  { key: 'automatic_habit',    label: 'Which habit felt automatic?', placeholder: '' },
  { key: 'obstacles',          label: 'What got in the way?', placeholder: '' },
  { key: 'changes',            label: 'What would you do differently?', placeholder: '' },
  { key: 'goal_block_sessions',label: 'Goal block sessions completed (target: 3)', placeholder: '0–7', short: true },
  { key: 'neglected_domain',   label: 'Which domain did you neglect?', placeholder: '' },
  { key: 'win',                label: 'One win from this week', placeholder: '' },
  { key: 'commitment',         label: 'One commitment for next week', placeholder: '' },
  { key: 'phase_advance',      label: 'Ready to advance to next phase?', placeholder: 'Yes / No / Repeat', short: true },
]

const TSS_QUESTIONS = [
  { key: 'impactful_change',      label: 'Most impactful change this week', placeholder: 'The shift I noticed most…' },
  { key: 'proud_moment',          label: 'My proud moment', placeholder: 'When I felt most proud…' },
  { key: 'working_not_working',   label: "What's working / what needs to change", placeholder: 'Keep doing… / Stop doing…' },
  { key: 'week_focus_reflection', label: "This week's focus — how I applied it", placeholder: 'The theme of this week was…' },
  { key: 'release_reset',         label: 'Release and reset (free write)', placeholder: 'Let it out. No structure, no judgement.', tall: true },
]

export default function Review() {
  const [review, setReview]   = useState(EMPTY_REVIEW)
  const [saveStatus, setSave] = useState('')
  const [loaded, setLoaded]   = useState(false)
  const saveTimer = useRef(null)

  const weekStart  = getMondayOfWeek()
  const dayNumber  = getDayNumber()

  // Lazy load on first render
  useState(() => {
    fetchWeeklyReview(weekStart).then(r => {
      if (r) setReview(r)
      setLoaded(true)
    })
  })

  const scheduleReviewSave = useCallback((updated) => {
    clearTimeout(saveTimer.current)
    setSave('saving…')
    saveTimer.current = setTimeout(async () => {
      await upsertWeeklyReview(updated)
      setSave('saved')
      setTimeout(() => setSave(''), 2000)
    }, 800)
  }, [])

  function update(field, value) {
    const updated = { ...review, [field]: value }
    setReview(updated)
    scheduleReviewSave(updated)
  }

  return (
    <main className="page">
      <div className="page-header">
        <h1>Weekly Review</h1>
        <div className="meta">Week of {formatDate(weekStart)} · Day {dayNumber}</div>
      </div>

      <div className="callout" style={{ marginBottom: 24 }}>
        <div className="callout-label">When to do this</div>
        <p>Every Sunday during the goal block or morning quiet time. Aim for 15 minutes.</p>
      </div>

      {/* ── LIFE ARCHITECT REVIEW ─────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Life Architect</div>
        {LA_QUESTIONS.map(({ key, label, placeholder, short, tall }) => (
          <div className="field" key={key}>
            <label>{label}</label>
            {short ? (
              <input
                type="text"
                value={review[key]}
                onChange={e => update(key, e.target.value)}
                placeholder={placeholder}
                style={{ maxWidth: 160 }}
              />
            ) : (
              <textarea
                className={tall ? 'tall' : ''}
                value={review[key]}
                onChange={e => update(key, e.target.value)}
                placeholder={placeholder}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── TSS REVIEW ────────────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Skinni From Scratch</div>
        {TSS_QUESTIONS.map(({ key, label, placeholder, tall }) => (
          <div className="field" key={key}>
            <label>{label}</label>
            <textarea
              className={tall ? 'tall' : ''}
              value={review[key]}
              onChange={e => update(key, e.target.value)}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>

      <div className="save-status">{saveStatus}</div>
    </main>
  )
}
