import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchTodayEntry, upsertEntry, getDayNumber, formatDate, toISODate } from '../lib/supabase'

// TSS Journal prompts — rotates weekly so there is always a fresh focus
const FOOD_PROMPTS = [
  'How did food affect your energy, mood, and focus today? Did you eat intentionally or reactively?',
  'Notice any automatic eating today. What was the cue, routine, and reward?',
  'How did your environment affect your food choices today?',
  'Describe one moment today where you made an intentional food choice. What made it intentional?',
  'How did you respond to a craving or urge today? Did you act from intention or impulse?',
  'What would your calmest, most controlled self have done differently around food today?',
  'Reflect on your hunger signals today. When did you eat from physical hunger vs. habit or emotion?',
]

const EMPTY_JOURNAL = {
  date: toISODate(),
  daily_affirmation: '',
  food_reflection: '',
  woman_becoming: '',
  emotional_check: '',
}

export default function Journal() {
  const [entry, setEntry]     = useState(EMPTY_JOURNAL)
  const [saveStatus, setSaveStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const saveTimer = useRef(null)

  const dayNumber = getDayNumber()
  const today     = formatDate()

  // Rotate prompt by day number
  const foodPrompt = FOOD_PROMPTS[(dayNumber - 1) % FOOD_PROMPTS.length]

  useEffect(() => {
    fetchTodayEntry().then(e => {
      if (e) setEntry(e)
      setLoading(false)
    })
  }, [])

  const scheduleEntrySave = useCallback((updated) => {
    clearTimeout(saveTimer.current)
    setSaveStatus('saving…')
    saveTimer.current = setTimeout(async () => {
      await upsertEntry(updated)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(''), 2000)
    }, 800)
  }, [])

  function update(field, value) {
    const updated = { ...entry, [field]: value }
    setEntry(updated)
    scheduleEntrySave(updated)
  }

  if (loading) return <div className="loading">Loading…</div>

  return (
    <main className="page">
      <div className="page-header">
        <h1>Journal</h1>
        <div className="meta">Day {dayNumber} of 90 · {today}</div>
      </div>

      {/* ── AFFIRMATION ──────────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Daily Affirmation</div>
        <div className="callout" style={{ marginBottom: 12 }}>
          <div className="callout-label">Why it matters</div>
          <p>Your affirmation primes your mindset. Repeating it rewires your thinking and aligns your actions with who you're becoming.</p>
        </div>
        <div className="field">
          <label>Write your affirmation</label>
          <textarea
            value={entry.daily_affirmation}
            onChange={e => update('daily_affirmation', e.target.value)}
            placeholder="I am the woman who…"
          />
        </div>
      </div>

      {/* ── FOOD REFLECTION ──────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">How Did Food Affect Me Today?</div>
        <div className="callout" style={{ marginBottom: 12 }}>
          <div className="callout-label">Today's prompt</div>
          <p>{foodPrompt}</p>
        </div>
        <div className="field">
          <label>Your reflection</label>
          <textarea
            className="tall"
            value={entry.food_reflection}
            onChange={e => update('food_reflection', e.target.value)}
            placeholder="Write honestly. This is your space to observe, not judge."
          />
        </div>
      </div>

      {/* ── THE WOMAN I AM BECOMING ──────────────────────────────────── */}
      <div className="section">
        <div className="section-label">The Woman I Am Becoming</div>
        <div className="callout" style={{ marginBottom: 12 }}>
          <div className="callout-label">Identity prompt</div>
          <p>Describe the version of you who already lives this lifestyle effortlessly. How does she think about food, her body, her discipline? Write as if you are stepping into her mindset.</p>
        </div>
        <div className="field">
          <label>Write freely</label>
          <textarea
            className="tall"
            value={entry.woman_becoming}
            onChange={e => update('woman_becoming', e.target.value)}
            placeholder="She wakes up and…"
          />
        </div>
      </div>

      {/* ── EMOTIONAL CHECK ──────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Emotional Check</div>
        <div className="callout" style={{ marginBottom: 12 }}>
          <div className="callout-label">Awareness prompt</div>
          <p>Notice any urges, cravings, or emotional reactions today. What triggered them? Did you act from intention or impulse? What would you do differently?</p>
        </div>
        <div className="field">
          <label>Your check</label>
          <textarea
            value={entry.emotional_check}
            onChange={e => update('emotional_check', e.target.value)}
            placeholder="Today I noticed…"
          />
        </div>
      </div>

      <div className="save-status">{saveStatus}</div>
    </main>
  )
}
