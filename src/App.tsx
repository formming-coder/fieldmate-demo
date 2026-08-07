import React, { Suspense, lazy, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { authSession } from './lib/auth/session'
import GlobalExperienceBanners from './components/GlobalExperienceBanners'
import AppCover from './pages/AppCover'
import Splash from './pages/Splash'
import { authRepository } from './repositories'

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

const AUTH_STORAGE_KEY = 'fieldmate-authenticated'
const PERMISSION_STORAGE_KEY = 'fieldmate-permissions-complete'

function readBooleanFlag(key: string) {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(key) === 'true'
}

function getDefaultRoute(isAuthenticated: boolean, permissionsComplete: boolean, onboardingComplete: boolean) {
  if (!isAuthenticated && !onboardingComplete) return '/onboarding'
  if (!isAuthenticated) return '/welcome'
  if (!permissionsComplete) return '/permissions'
  return '/home'
}

function GuardedRoute({
  isAuthenticated,
  permissionsComplete,
  children,
}: {
  isAuthenticated: boolean
  permissionsComplete: boolean
  children: React.ReactNode
}) {
  if (!isAuthenticated) return <Navigate to="/welcome" replace />
  if (!permissionsComplete) return <Navigate to="/permissions" replace />
  return <>{children}</>
}

function AnimatedRoutes({
  isAuthenticated,
  permissionsComplete,
  onboardingComplete,
  onLogin,
  onPermissionsComplete,
}: {
  isAuthenticated: boolean
  permissionsComplete: boolean
  onboardingComplete: boolean
  onLogin: (input: { rememberMe: boolean; email?: string; password?: string; provider: 'password' | 'microsoft' }) => Promise<void>
  onPermissionsComplete: () => void
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
          <Route path="/" element={<Navigate to={getDefaultRoute(isAuthenticated, permissionsComplete, onboardingComplete)} replace />} />
          <Route path="/onboarding" element={isAuthenticated ? <Navigate to={permissionsComplete ? '/home' : '/permissions'} replace /> : onboardingComplete ? <Navigate to="/welcome" replace /> : <Onboarding />} />
          <Route path="/welcome" element={isAuthenticated ? <Navigate to={permissionsComplete ? '/home' : '/permissions'} replace /> : <Welcome />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to={permissionsComplete ? '/home' : '/permissions'} replace /> : <Login onLogin={onLogin} />} />
          <Route path="/permissions" element={!isAuthenticated ? <Navigate to="/welcome" replace /> : permissionsComplete ? <Navigate to="/home" replace /> : <Permission onComplete={onPermissionsComplete} />} />
          <Route path="/home" element={<GuardedRoute isAuthenticated={isAuthenticated} permissionsComplete={permissionsComplete}><Home /></GuardedRoute>} />
          <Route path="/dashboard" element={<GuardedRoute isAuthenticated={isAuthenticated} permissionsComplete={permissionsComplete}><Dashboard /></GuardedRoute>} />
          <Route path="/map" element={<GuardedRoute isAuthenticated={isAuthenticated} permissionsComplete={permissionsComplete}><SmartMap /></GuardedRoute>} />
          <Route path="/gis" element={<GuardedRoute isAuthenticated={isAuthenticated} permissionsComplete={permissionsComplete}><GISHome /></GuardedRoute>} />
          <Route path="/route-planner" element={<GuardedRoute isAuthenticated={isAuthenticated} permissionsComplete={permissionsComplete}><RoutePlanner /></GuardedRoute>} />
          <Route path="/camera" element={<GuardedRoute isAuthenticated={isAuthenticated} permissionsComplete={permissionsComplete}><AICamera /></GuardedRoute>} />
          <Route path="/album" element={<GuardedRoute isAuthenticated={isAuthenticated} permissionsComplete={permissionsComplete}><PropertyAlbum /></GuardedRoute>} />
          <Route path="/shared-intelligence" element={<GuardedRoute isAuthenticated={isAuthenticated} permissionsComplete={permissionsComplete}><SharedPropertyIntelligence /></GuardedRoute>} />
          <Route path="/search" element={<GuardedRoute isAuthenticated={isAuthenticated} permissionsComplete={permissionsComplete}><AISearch /></GuardedRoute>} />
          <Route path="/property/:id" element={<GuardedRoute isAuthenticated={isAuthenticated} permissionsComplete={permissionsComplete}><PropertyDetail /></GuardedRoute>} />
          <Route path="/ai-summary" element={<GuardedRoute isAuthenticated={isAuthenticated} permissionsComplete={permissionsComplete}><AISummary /></GuardedRoute>} />
          <Route path="/assessment" element={<GuardedRoute isAuthenticated={isAuthenticated} permissionsComplete={permissionsComplete}><PropertyAssessment /></GuardedRoute>} />
          <Route path="/notifications" element={<GuardedRoute isAuthenticated={isAuthenticated} permissionsComplete={permissionsComplete}><Notifications /></GuardedRoute>} />
          <Route path="/profile" element={<GuardedRoute isAuthenticated={isAuthenticated} permissionsComplete={permissionsComplete}><Profile /></GuardedRoute>} />
          <Route path="/settings" element={<GuardedRoute isAuthenticated={isAuthenticated} permissionsComplete={permissionsComplete}><Settings /></GuardedRoute>} />
        </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  const [showAppCover, setShowAppCover] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(() => authSession.isAuthenticated() || readBooleanFlag(AUTH_STORAGE_KEY))
  const [permissionsComplete, setPermissionsComplete] = useState(() => readBooleanFlag(PERMISSION_STORAGE_KEY))
  const [onboardingComplete] = useState(() => readBooleanFlag(ONBOARDING_STORAGE_KEY))

  useEffect(() => {
    if (showAppCover) return
    const timeout = window.setTimeout(() => setLoaded(true), 1000)
    return () => window.clearTimeout(timeout)
  }, [showAppCover])

  useEffect(() => {
    const syncAuth = () => setIsAuthenticated(authSession.isAuthenticated() || readBooleanFlag(AUTH_STORAGE_KEY))
    window.addEventListener('focus', syncAuth)
    const interval = window.setInterval(syncAuth, 30000)
    return () => {
      window.removeEventListener('focus', syncAuth)
      window.clearInterval(interval)
    }
  }, [])

  const handleLogin = async ({ rememberMe, email, password, provider }: { rememberMe: boolean; email?: string; password?: string; provider: 'password' | 'microsoft' }) => {
    if (provider === 'password') {
      await authRepository.loginWithPassword(email || '', password || '')
    } else {
      await authRepository.loginWithMicrosoft()
    }

    setIsAuthenticated(true)
    if (typeof window !== 'undefined' && rememberMe) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, 'true')
    }
  }

  const handlePermissionsComplete = () => {
    setPermissionsComplete(true)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_STORAGE_KEY, 'true')
      window.localStorage.setItem(PERMISSION_STORAGE_KEY, 'true')
    }
  }

  return (
    <BrowserRouter>
      <GlobalExperienceBanners />
      {showAppCover && <AppCover onContinue={() => setShowAppCover(false)} />}

      {!showAppCover && !loaded && <Splash />}

      {!showAppCover && loaded && <AnimatedRoutes isAuthenticated={isAuthenticated} permissionsComplete={permissionsComplete} onboardingComplete={onboardingComplete} onLogin={handleLogin} onPermissionsComplete={handlePermissionsComplete} />}
    </BrowserRouter>
  )
}

export default App
