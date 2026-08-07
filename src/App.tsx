import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Splash from './pages/Splash'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SmartMap from './pages/SmartMap'
import AICamera from './pages/AICamera'
import PropertyAlbum from './pages/PropertyAlbum'
import AISearch from './pages/AISearch'
import AISummary from './pages/AISummary'
import PropertyAssessment from './pages/PropertyAssessment'
import PropertyDetail from './pages/PropertyDetail'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import SharedPropertyIntelligence from './pages/SharedPropertyIntelligence'

function App() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoaded(true), 900)
    return () => window.clearTimeout(timeout)
  }, [])

  return (
    <BrowserRouter>
      {!loaded && <Splash onContinue={() => setLoaded(true)} />}

      {loaded && (
        <Routes>
          <Route path="/" element={<Navigate to="/map" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<SmartMap />} />
          <Route path="/camera" element={<AICamera />} />
          <Route path="/album" element={<PropertyAlbum />} />
          <Route path="/shared-intelligence" element={<SharedPropertyIntelligence />} />
          <Route path="/search" element={<AISearch />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/ai-summary" element={<AISummary />} />
          <Route path="/assessment" element={<PropertyAssessment />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      )}
    </BrowserRouter>
  )
}

export default App
