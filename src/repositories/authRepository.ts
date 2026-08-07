import { authSession } from '../lib/auth/session'
import { env } from '../config/env'
import { apiEndpoints } from '../services/api/endpoints'
import { apiService } from '../services/api/apiService'

type LoginResponse = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  userId: string
}

function saveSession(payload: LoginResponse) {
  authSession.write({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    expiresAt: Date.now() + payload.expiresIn * 1000,
    userId: payload.userId,
  })
}

export const authRepository = {
  async loginWithPassword(email: string, password: string) {
    const response = await apiService.post<LoginResponse>(apiEndpoints.auth.login, { email, password })
    saveSession(response)
    return response
  },
  async loginWithMicrosoft() {
    const response = await apiService.post<LoginResponse>('/auth/entra/login')
    saveSession(response)
    return response
  },
  async exchangeEntraToken(idToken: string) {
    const response = await apiService.post<LoginResponse>('/auth/entra/exchange', { idToken })
    saveSession(response)
    return response
  },
  buildEntraAuthorizeUrl() {
    const params = new URLSearchParams({
      client_id: env.entraClientId,
      response_type: 'code',
      redirect_uri: env.entraRedirectUri,
      response_mode: 'query',
      scope: 'openid profile offline_access User.Read',
    })
    return `${env.entraAuthority}/oauth2/v2.0/authorize?${params.toString()}`
  },
  async logout() {
    try {
      await apiService.post(apiEndpoints.auth.logout)
    } finally {
      authSession.clear()
    }
  },
}
