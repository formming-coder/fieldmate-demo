import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { AppRouteKey, canAccessRoute } from './rbac'

export default function ProtectedRoute({ children, route }: { children: React.ReactNode; route: AppRouteKey }) {
  const location = useLocation()
  const { isAuthenticated, loading, currentRole } = useAuth()

  if (loading) {
    return (
      <div className="auth-loading-overlay" role="status" aria-live="polite">
        <div className="auth-loading-card">
          <div className="auth-loading-spinner" aria-hidden="true" />
          <strong>กำลังตรวจสอบสิทธิ์การเข้าใช้งาน</strong>
          <span>เตรียมระบบก่อนเข้าสู่การทำงานภาคสนาม</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!canAccessRoute(currentRole, route)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
