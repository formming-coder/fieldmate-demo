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
        initial={{ opacity: 0, x: 18, scale: 0.985 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -18, scale: 0.985 }}
        transition={{ type: 'spring', stiffness: 240, damping: 28 }}
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
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><SmartMap /></ProtectedRoute>} />
          <Route path="/gis" element={<ProtectedRoute><GISHome /></ProtectedRoute>} />
          <Route path="/route-planner" element={<ProtectedRoute><RoutePlanner /></ProtectedRoute>} />
          <Route path="/camera" element={<ProtectedRoute><AICamera /></ProtectedRoute>} />
          <Route path="/album" element={<ProtectedRoute><PropertyAlbum /></ProtectedRoute>} />
          <Route path="/shared-intelligence" element={<ProtectedRoute><SharedPropertyIntelligence /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><AISearch /></ProtectedRoute>} />
          <Route path="/property/:id" element={<ProtectedRoute><PropertyDetail /></ProtectedRoute>} />
          <Route path="/ai-summary" element={<ProtectedRoute><AISummary /></ProtectedRoute>} />
          <Route path="/assessment" element={<ProtectedRoute><PropertyAssessment /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
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
