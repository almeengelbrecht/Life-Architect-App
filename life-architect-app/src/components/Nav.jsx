import { NavLink } from 'react-router-dom'

const icons = {
  today: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  journal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  routine: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  review: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  ),
  trends: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
}

export default function Nav() {
  return (
    <nav className="nav">
      <NavLink to="/today"   className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>{icons.today}   Today</NavLink>
      <NavLink to="/journal" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>{icons.journal} Journal</NavLink>
      <NavLink to="/routine" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>{icons.routine} Routine</NavLink>
      <NavLink to="/review"  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>{icons.review}  Review</NavLink>
      <NavLink to="/trends"  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>{icons.trends}  Trends</NavLink>
    </nav>
  )
}
