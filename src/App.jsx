import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Nav from './components/Nav'
import Today from './pages/Today'
import Journal from './pages/Journal'
import Routine from './pages/Routine'
import Review from './pages/Review'
import Trends from './pages/Trends'
import Login from './pages/Login'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div className="loading">Loading...</div>

  if (!session) return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/"        element={<Navigate to="/today" replace />} />
          <Route path="/today"   element={<Today />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/routine" element={<Routine />} />
          <Route path="/review"  element={<Review />} />
          <Route path="/trends"  element={<Trends />} />
          <Route path="*"        element={<Navigate to="/today" replace />} />
        </Routes>
        <Nav />
      </div>
    </BrowserRouter>
  )
}
