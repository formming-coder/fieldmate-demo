import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { isAuthenticated, loading } = useAuth()

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

  return <>{children}</>
}
