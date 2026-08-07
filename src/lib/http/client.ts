import axios from 'axios'
import { requireApiBaseUrl } from '../../config/env'
import { authSession } from '../auth/session'

const API_BASE_URL = requireApiBaseUrl()
const REFRESH_PATH = '/auth/refresh'

const bare = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
})

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = authSession.getRefreshToken()
  if (!refreshToken) return null

  if (!refreshPromise) {
    refreshPromise = bare
      .post<{ accessToken: string; refreshToken: string; expiresIn: number }>(REFRESH_PATH, { refreshToken })
      .then((response) => {
        const payload = response.data
        authSession.write({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          expiresAt: Date.now() + payload.expiresIn * 1000,
        })
        return payload.accessToken
      })
      .catch(() => {
        authSession.clear()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

apiClient.interceptors.request.use((config) => {
  const token = authSession.getAccessToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined
    if (!original || original._retry) return Promise.reject(error)

    if (error?.response?.status === 401) {
      original._retry = true
      const token = await refreshAccessToken()
      if (!token) return Promise.reject(error)
      original.headers = original.headers || {}
      original.headers.Authorization = `Bearer ${token}`
      return apiClient(original)
    }

    return Promise.reject(error)
  }
)
