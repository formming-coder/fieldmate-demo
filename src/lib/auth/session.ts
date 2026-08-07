const SESSION_KEY = 'fieldmate:auth:session'
import { secureStorage } from './secureStorage'

export type AuthSession = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  userId?: string
}

function readSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = secureStorage.get(SESSION_KEY)
    return raw ? (JSON.parse(raw) as AuthSession) : null
  } catch {
    return null
  }
}

function writeSession(session: AuthSession | null) {
  if (typeof window === 'undefined') return
  if (!session) {
    secureStorage.remove(SESSION_KEY)
    return
  }
  secureStorage.set(SESSION_KEY, JSON.stringify(session))
}

export const authSession = {
  read: readSession,
  write: writeSession,
  clear: () => writeSession(null),
  getAccessToken: () => readSession()?.accessToken || null,
  getRefreshToken: () => readSession()?.refreshToken || null,
  isAuthenticated: () => {
    const current = readSession()
    if (!current) return false
    return Date.now() < current.expiresAt
  },
}
