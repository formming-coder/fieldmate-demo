export type AppMode = 'development' | 'production'

const appMode: AppMode = import.meta.env.VITE_APP_MODE === 'production'
  ? 'production'
  : 'development'

function readEnv(primary: string, fallback?: string) {
  const primaryValue = (import.meta.env as Record<string, string | undefined>)[primary]
  if (primaryValue && primaryValue.length > 0) return primaryValue
  if (!fallback) return ''
  return (import.meta.env as Record<string, string | undefined>)[fallback] || ''
}

export const env = {
  appMode,
  apiBaseUrl: readEnv('VITE_API_URL', 'VITE_API_BASE_URL'),
  r2UploadBaseUrl: readEnv('VITE_UPLOAD_BASE_URL', 'VITE_R2_UPLOAD_BASE_URL'),
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  ocrProvider: readEnv('VITE_OCR_PROVIDER') || 'mock',
  ocrApiUrl: readEnv('VITE_OCR_API_URL'),
  ocrMockFail: readEnv('VITE_OCR_MOCK_FAIL') === 'true',
  cloudflareEnv: import.meta.env.VITE_CLOUDFLARE_ENV || 'development',
  entraClientId: readEnv('VITE_MS_CLIENT_ID', 'VITE_ENTRA_CLIENT_ID'),
  entraAuthority: readEnv('VITE_MS_AUTHORITY', 'VITE_ENTRA_AUTHORITY'),
  entraRedirectUri: readEnv('VITE_MS_REDIRECT_URI', 'VITE_ENTRA_REDIRECT_URI'),
  entraScopes: (readEnv('VITE_MS_SCOPES', 'VITE_ENTRA_SCOPES') || 'openid profile offline_access User.Read').split(/\s+/).filter(Boolean),
}

export const isDevelopmentMode = env.appMode === 'development'
export const isProductionMode = env.appMode === 'production'

export function requireApiBaseUrl() {
  if (!env.apiBaseUrl) {
    throw new Error('VITE_API_URL is not configured')
  }
  return env.apiBaseUrl
}

export function hasGoogleMapsApiKey() {
  const key = env.googleMapsApiKey.trim()
  return /^AIza[0-9A-Za-z_-]{20,}$/.test(key)
}
