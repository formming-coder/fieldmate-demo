import { Navigate } from 'react-router-dom'

export default function Onboarding({ onComplete }: { onComplete?: () => void }) {
  return <Navigate to="/login" replace />
}
