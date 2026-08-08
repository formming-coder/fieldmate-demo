import React, { useEffect, useRef, useState } from 'react'
import {
  AccountInfo,
  AuthenticationResult,
  PublicClientApplication,
} from '@azure/msal-browser'
import { env, isProductionMode } from '../../config/env'
import { AuthContext, AuthLoginInput } from './AuthContext'
import { AuthStorage, AuthUser } from './AuthStorage'
import { createDemoSession } from './DemoAuth'
import { useSessionTimeout } from '../../hooks/useSessionTimeout'
import { AppRole, normalizeRole } from '../../types/auth'

const MICROSOFT_REMEMBER_KEY = 'fieldmate_microsoft_remember'

let msalInstance: PublicClientApplication | null = null

function isMicrosoftConfigured() {
  return Boolean(env.entraClientId && env.entraAuthority && env.entraRedirectUri)
}

async function getMsalInstance() {
  if (!isProductionMode || !isMicrosoftConfigured()) {
    return null
  }

  if (!msalInstance) {
    const { PublicClientApplication } = await import('@azure/msal-browser')
    msalInstance = new PublicClientApplication({
      auth: {
        clientId: env.entraClientId,
        authority: env.entraAuthority,
        redirectUri: env.entraRedirectUri,
        postLogoutRedirectUri: env.entraRedirectUri,
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      },
    })
  }

  return msalInstance
}

function readRememberPreference() {
  if (typeof window === 'undefined') return true
  const value = window.sessionStorage.getItem(MICROSOFT_REMEMBER_KEY)
  return value !== 'false'
}

function clearRememberPreference() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(MICROSOFT_REMEMBER_KEY)
}

function resolveRole(claims: Record<string, unknown> | undefined) {
  if (Array.isArray(claims?.roles) && typeof claims.roles[0] === 'string') {
    return claims.roles[0]
  }

  if (typeof claims?.extension_Role === 'string') {
    return claims.extension_Role
  }

  if (typeof claims?.jobTitle === 'string') {
    return claims.jobTitle
  }

  return 'Officer'
}

function resolveDepartment(claims: Record<string, unknown> | undefined) {
  if (typeof claims?.department === 'string') {
    return claims.department
  }

  return 'Property Valuation'
}

function buildMicrosoftUser(account: AccountInfo, result?: AuthenticationResult): AuthUser {
  const rawClaims = (result?.idTokenClaims || account.idTokenClaims || {}) as Record<string, unknown>
  const email = typeof rawClaims.preferred_username === 'string'
    ? rawClaims.preferred_username
    : account.username

  return {
    id: account.homeAccountId,
    name: typeof rawClaims.name === 'string' ? rawClaims.name : account.name || 'Fieldmate User',
    email,
    role: normalizeRole(resolveRole(rawClaims)),
    department: resolveDepartment(rawClaims),
    avatar: null,
  }
}

function persistMicrosoftSession(result: AuthenticationResult, rememberMe: boolean) {
  const account = result.account
  if (!account) {
    throw new Error('ไม่พบข้อมูลบัญชี Microsoft กรุณาลองใหม่อีกครั้ง')
  }

  const expiresAt = result.expiresOn?.getTime() || Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000
  const user = buildMicrosoftUser(account, result)

  return AuthStorage.write({
    user,
    token: result.accessToken || result.idToken,
    expiresAt,
    provider: 'microsoft',
    rememberMe,
  })
}

async function acquireMicrosoftToken(instance: PublicClientApplication, account: AccountInfo) {
  try {
    return await instance.acquireTokenSilent({
      account,
      scopes: env.entraScopes,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'InteractionRequiredAuthError') {
      return null
    }

    throw error
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [currentRole, setCurrentRole] = useState<AppRole>('Officer')
  const refreshTimerRef = useRef<number | null>(null)

  const syncFromStorage = () => {
    const stored = AuthStorage.read()
    setCurrentUser(stored?.user || null)
    setCurrentRole(normalizeRole(stored?.user?.role))
    return stored
  }

  useEffect(() => {
    let active = true

    const bootstrap = async () => {
      try {
        if (!isProductionMode) {
          if (active) {
            syncFromStorage()
          }
          return
        }

        const instance = await getMsalInstance()
        if (!instance) {
          if (active) {
            syncFromStorage()
          }
          return
        }

        await instance.initialize()

        const redirectResult = await instance.handleRedirectPromise()
        const account = redirectResult?.account || instance.getActiveAccount() || instance.getAllAccounts()[0] || null

        if (account) {
          instance.setActiveAccount(account)
          const rememberMe = readRememberPreference()
          const tokenResult = redirectResult || await acquireMicrosoftToken(instance, account)

          if (tokenResult) {
            persistMicrosoftSession(tokenResult, rememberMe)
          }
        }

        clearRememberPreference()

        if (active) {
          syncFromStorage()
        }
      } catch {
        AuthStorage.clear()
        if (active) {
          setCurrentUser(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void bootstrap()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!isProductionMode || !AuthStorage.isAuthenticated()) {
      return
    }

    const refreshToken = async () => {
      const instance = await getMsalInstance()
      if (!instance) return
      const account = instance.getActiveAccount() || instance.getAllAccounts()[0] || null
      if (!account) return

      const result = await acquireMicrosoftToken(instance, account)
      if (!result) return

      const rememberMe = AuthStorage.read()?.session.rememberMe ?? true
      const stored = persistMicrosoftSession(result, rememberMe)
      setCurrentUser(stored.user)
    }

    const onFocus = () => {
      void refreshToken()
    }

    window.addEventListener('focus', onFocus)
    refreshTimerRef.current = window.setInterval(onFocus, 5 * 60 * 1000)

    return () => {
      window.removeEventListener('focus', onFocus)
      if (refreshTimerRef.current) {
        window.clearInterval(refreshTimerRef.current)
      }
    }
  }, [currentUser])

  const login = async ({ rememberMe, email, password }: AuthLoginInput) => {
    if (!isProductionMode) {
      if (!email?.trim() || !password?.trim()) {
        throw new Error('กรุณากรอกอีเมลและรหัสผ่าน')
      }

      const stored = await createDemoSession(rememberMe)
      setCurrentUser(stored.user)
      setCurrentRole(normalizeRole(stored.user.role))
      return
    }

    const instance = await getMsalInstance()
    if (!instance) {
      throw new Error('ยังไม่ได้ตั้งค่าการยืนยันตัวตนด้วย Microsoft สำหรับรุ่นต้นแบบนี้')
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(MICROSOFT_REMEMBER_KEY, String(rememberMe))
    }

    await instance.loginRedirect({
      scopes: env.entraScopes,
      prompt: 'select_account',
    })
  }

  const logout = async () => {
    const clearLocalSession = () => {
      if (typeof window !== 'undefined') {
        clearRememberPreference()
        window.sessionStorage.removeItem(MICROSOFT_REMEMBER_KEY)
      }
      AuthStorage.clear()
      setCurrentUser(null)
      setCurrentRole('Officer')
    }

    if (isProductionMode) {
      const instance = await getMsalInstance()
      const account = instance?.getActiveAccount() || instance?.getAllAccounts()[0] || null

      if (instance && account) {
        await instance.logoutRedirect({
          account,
          onRedirectNavigate: () => {
            clearLocalSession()
            return true
          },
        })
        return
      }
    }

    clearLocalSession()
  }

  useSessionTimeout({
    enabled: Boolean(currentUser),
    timeoutMs: 30 * 60 * 1000,
    onTimeout: () => {
      void logout()
    },
  })

  return (
    <AuthContext.Provider
      value={{
        appMode: env.appMode,
        isAuthenticated: Boolean(currentUser),
        loading,
        currentUser,
        currentRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
