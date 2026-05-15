import { getCurrentPhase, getDayNumber, formatDate, PHASES, DAILY_SCHEDULE } from '../lib/supabase'

const TUESDAY_SCHEDULE = [
  { time: '17:00', block: 'Leave work' },
  { time: '17:30', block: 'Snack / change / travel' },
  { time: '18:15', block: 'Dance class', highlight: true },
  { time: '19:15', block: 'Shower / dinner' },
  { time: '19:45', block: 'Light goal block only' },
  { time: '20:15', block: 'Tomorrow prep' },
  { time: '20:45', block: 'PM skincare, wind down' },
  { time: '21:15', block: 'In bed, read' },
  { time: '21:30', block: 'Sleep target' },
]

const GOAL_BLOCK_MENU = [
  { energy: 'High', mode: 'Deep work', examples: 'Client project, portfolio, brand strategy, outreach, course design.' },
  { energy: 'Medium', mode: 'Planning / organising', examples: 'Content calendar, budget review, reading plan, email triage.' },
  { energy: 'Low', mode: 'Maintenance', examples: 'Pack bag, refill skincare, delete digital clutter, tidy one drawer.' },
]

export default function Routine() {
  const phase     = getCurrentPhase()
  const dayNumber = getDayNumber()
  const today     = formatDate()
  const dayOfWeek = new Date().getDay() // 0=Sun, 2=Tue
  const isTuesday = dayOfWeek === 2
  const schedule  = isTuesday ? TUESDAY_SCHEDULE : DAILY_SCHEDULE

  const phaseProgress = PHASES.findIndex(p => p.phase === phase.phase)

  return (
    <main className="page">
      <div className="page-header">
        <h1>Routine</h1>
        <div className="meta">Day {dayNumber} · {today}{isTuesday ? ' · Tuesday — Dance' : ''}</div>
      </div>

      {/* ── PHASE STATUS ──────────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Phase Progress</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {PHASES.map(p => (
            <div
              key={p.phase}
              style={{
                flex: 1,
                height: 4,
                background: p.phase <= phase.phase ? 'var(--dark)' : 'var(--border)',
                borderRadius: 2,
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{phase.label} — {phase.focus}</div>
            <div style={{ fontSize: 12, color: 'var(--mid)', marginTop: 2 }}>{phase.start} → {phase.end}</div>
          </div>
        </div>
        <div className="callout" style={{ marginTop: 12 }}>
          <div className="callout-label">Minimum win this phase</div>
          <p>{phase.minimum}</p>
        </div>
      </div>

      {/* ── PHASE RAMP ────────────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Routine Ramp</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Phase</th>
              <th>Dates</th>
              <th>Focus</th>
            </tr>
          </thead>
          <tbody>
            {PHASES.map(p => (
              <tr key={p.phase} style={{ opacity: p.phase < phase.phase ? 0.45 : 1 }}>
                <td style={{ fontWeight: p.phase === phase.phase ? 600 : 400 }}>
                  {p.phase === phase.phase && <span style={{ marginRight: 4 }}>→</span>}
                  {p.label}
                </td>
                <td style={{ color: 'var(--mid)', whiteSpace: 'nowrap', fontSize: 12 }}>
                  {p.start.slice(5).replace('-', ' ')} – {p.end.slice(5).replace('-', ' ')}
                </td>
                <td>{p.focus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── TODAY'S SCHEDULE ──────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">{isTuesday ? 'Tuesday Schedule' : 'Daily Schedule'}</div>
        <table className="data-table">
          <thead>
            <tr><th style={{ width: 60 }}>Time</th><th>Block</th></tr>
          </thead>
          <tbody>
            {schedule.map(({ time, block, highlight }) => (
              <tr key={time} style={{ background: highlight ? 'var(--fill)' : 'transparent' }}>
                <td style={{ color: 'var(--mid)', fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>{time}</td>
                <td style={{ fontWeight: highlight ? 500 : 400 }}>{block}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── GOAL BLOCK MENU ───────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Goal Block Menu (19:30–20:30)</div>
        <table className="data-table">
          <thead>
            <tr><th>Energy</th><th>Mode</th><th>Examples</th></tr>
          </thead>
          <tbody>
            {GOAL_BLOCK_MENU.map(({ energy, mode, examples }) => (
              <tr key={energy}>
                <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{energy}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{mode}</td>
                <td style={{ color: 'var(--grey)', fontSize: 12 }}>{examples}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── RECOVERY PROTOCOL ─────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Recovery Protocol</div>
        {[
          { trigger: 'Miss one morning', rule: 'Keep the evening prep and sleep target. Next morning resumes as normal.' },
          { trigger: 'Miss evening prep', rule: 'Do the 2-minute version: outfit + bag only. Protect sleep anchor.' },
          { trigger: 'Two consecutive red days', rule: 'Soft reset. Bare minimum for 2 days. Re-enter full phase on day 3.' },
          { trigger: 'Full phase week missed', rule: 'Repeat the phase. No judgement. Note what caused it in the weekly review.' },
        ].map(({ trigger, rule }) => (
          <div key={trigger} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid var(--fill)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--grey)', marginBottom: 2 }}>{trigger}</div>
            <div style={{ fontSize: 13 }}>{rule}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
