import React from 'react'
import { AppMode } from '../../config/env'
import { AuthUser } from './AuthStorage'
import { AppRole } from '../../types/auth'

export type AuthLoginInput = {
  rememberMe: boolean
  email?: string
  password?: string
  provider: 'password' | 'microsoft'
}

export type AuthContextValue = {
  appMode: AppMode
  isAuthenticated: boolean
  loading: boolean
  currentUser: AuthUser | null
  currentRole: AppRole
  login: (input: AuthLoginInput) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = React.createContext<AuthContextValue | null>(null)
