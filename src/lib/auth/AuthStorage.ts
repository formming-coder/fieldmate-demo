import { authSession } from './session'
import { User } from '../../types'
import { secureStorage } from './secureStorage'
import { normalizeRole } from '../../types/auth'

const SESSION_KEY = 'fieldmate_session'
const USER_KEY = 'fieldmate_user'
const ROLE_KEY = 'fieldmate_role'
const TOKEN_KEY = 'fieldmate_token'

export type AuthProviderName = 'demo' | 'microsoft'

export type AuthUser = User & {
  department?: string
}

export type StoredAuthSession = {
  token: string
  expiresAt: number
  provider: AuthProviderName
  rememberMe: boolean
}

export type StoredAuthState = {
  session: StoredAuthSession
  user: AuthUser
}

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function remove(key: string) {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(key)
}

function isExpired(session: StoredAuthSession) {
  return Date.now() >= session.expiresAt
}

export const AuthStorage = {
  read(): StoredAuthState | null {
    const session = readJson<StoredAuthSession>(SESSION_KEY)
    const user = readJson<AuthUser>(USER_KEY)
    const role = typeof window !== 'undefined' ? window.localStorage.getItem(ROLE_KEY) : null
    const token = secureStorage.get(TOKEN_KEY)

    if (!session || !user || !role || !token) {
      return null
    }

    if (isExpired(session)) {
      this.clear()
      return null
    }

    return {
      session: { ...session, token },
      user: { ...user, role: normalizeRole(role) },
    }
  },

  write(input: { user: AuthUser; token: string; expiresAt: number; provider: AuthProviderName; rememberMe: boolean }) {
    const session: StoredAuthSession = {
      token: input.token,
      expiresAt: input.expiresAt,
      provider: input.provider,
      rememberMe: input.rememberMe,
    }

    writeJson(SESSION_KEY, session)
    writeJson(USER_KEY, input.user)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ROLE_KEY, normalizeRole(input.user.role))
      secureStorage.set(TOKEN_KEY, input.token)
    }

    authSession.write({
      accessToken: input.token,
      refreshToken: '',
      expiresAt: input.expiresAt,
      userId: input.user.id,
    })

    return {
      session,
      user: input.user,
    }
  },

  clear() {
    remove(SESSION_KEY)
    remove(USER_KEY)
    remove(ROLE_KEY)
    secureStorage.remove(TOKEN_KEY)
    authSession.clear()
  },

  isAuthenticated() {
    return Boolean(this.read())
  },

  getToken() {
    return this.read()?.session.token || null
  },
}
