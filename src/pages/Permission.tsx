import { Navigate } from 'react-router-dom'

export default function Permission({ onComplete }: { onComplete: () => void }) {
  return <Navigate to="/login" replace />
}