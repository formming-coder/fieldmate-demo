import React, { Suspense, lazy, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import GlobalExperienceBanners from './components/GlobalExperienceBanners'
import AppCover from './pages/AppCover'
import Splash from './pages/Splash'
import ProtectedRoute from './lib/auth/ProtectedRoute'
import { useAuth } from './lib/auth/useAuth'

const ONBOARDING_STORAGE_KEY = 'fieldmate-onboarding-complete'
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Welcome = lazy(() => import('./pages/Welcome'))
const Login = lazy(() => import('./pages/Login'))
const Permission = lazy(() => import('./pages/Permission'))
const Home = lazy(() => import('./pages/Home'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const SmartMap = lazy(() => import('./pages/SmartMap'))
const GISHome = lazy(() => import('./pages/GISHome'))
const RoutePlanner = lazy(() => import('./pages/RoutePlanner'))
const AICamera = lazy(() => import('./pages/AICamera'))
const PropertyAlbum = lazy(() => import('./pages/PropertyAlbum'))
const AISearch = lazy(() => import('./pages/AISearch'))
const AISummary = lazy(() => import('./pages/AISummary'))
const PropertyAssessment = lazy(() => import('./pages/PropertyAssessment'))
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const SharedPropertyIntelligence = lazy(() => import('./pages/SharedPropertyIntelligence'))

function readBooleanFlag(key: string) {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(key) === 'true'
}

function getDefaultRoute(isAuthenticated: boolean, onboardingComplete: boolean) {
  if (!isAuthenticated && !onboardingComplete) return '/onboarding'
  if (!isAuthenticated) return '/login'
  return '/home'
}

function AnimatedRoutes({
  isAuthenticated,
  onboardingComplete,
}: {
  isAuthenticated: boolean
  onboardingComplete: boolean
}) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 10, scale: 0.996 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -10, scale: 0.996 }}
        transition={{ type: 'spring', stiffness: 260, damping: 32, mass: 0.86 }}
        style={{ minHeight: '100vh' }}
      >
        <Suspense fallback={<Splash />}>
        <Routes location={location}>
          <Route path="/" element={<Navigate to={getDefaultRoute(isAuthenticated, onboardingComplete)} replace />} />
          <Route path="/onboarding" element={isAuthenticated ? <Navigate to="/home" replace /> : onboardingComplete ? <Navigate to="/welcome" replace /> : <Onboarding />} />
          <Route path="/welcome" element={isAuthenticated ? <Navigate to="/home" replace /> : <Welcome />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />
          <Route path="/permissions" element={<Permission onComplete={() => {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('fieldmate-permissions-complete', 'true')
            }
          }} />} />
          <Route path="/home" element={<ProtectedRoute route="home"><Home /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute route="dashboard"><Dashboard /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute route="map"><SmartMap /></ProtectedRoute>} />
          <Route path="/gis" element={<ProtectedRoute route="gis"><GISHome /></ProtectedRoute>} />
          <Route path="/route-planner" element={<ProtectedRoute route="routePlanner"><RoutePlanner /></ProtectedRoute>} />
          <Route path="/camera" element={<ProtectedRoute route="camera"><AICamera /></ProtectedRoute>} />
          <Route path="/album" element={<ProtectedRoute route="album"><PropertyAlbum /></ProtectedRoute>} />
          <Route path="/shared-intelligence" element={<ProtectedRoute route="sharedIntelligence"><SharedPropertyIntelligence /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute route="search"><AISearch /></ProtectedRoute>} />
          <Route path="/property/:id" element={<ProtectedRoute route="propertyDetail"><PropertyDetail /></ProtectedRoute>} />
          <Route path="/ai-summary" element={<ProtectedRoute route="aiSummary"><AISummary /></ProtectedRoute>} />
          <Route path="/assessment" element={<ProtectedRoute route="assessment"><PropertyAssessment /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute route="notifications"><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute route="profile"><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute route="settings"><Settings /></ProtectedRoute>} />
        </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  const { isAuthenticated, loading } = useAuth()
  const [showAppCover, setShowAppCover] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [onboardingComplete] = useState(() => readBooleanFlag(ONBOARDING_STORAGE_KEY))

  useEffect(() => {
    if (showAppCover) return
    const timeout = window.setTimeout(() => setLoaded(true), 1000)
    return () => window.clearTimeout(timeout)
  }, [showAppCover])

  return (
    <BrowserRouter>
      <GlobalExperienceBanners />
      {showAppCover && <AppCover onContinue={() => setShowAppCover(false)} />}

      {!showAppCover && (!loaded || loading) && <Splash />}

      {!showAppCover && loaded && !loading && <AnimatedRoutes isAuthenticated={isAuthenticated} onboardingComplete={onboardingComplete} />}
    </BrowserRouter>
  )
}

export default App
