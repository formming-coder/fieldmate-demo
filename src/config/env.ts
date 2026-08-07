export type AppMode = 'development' | 'production'

const appMode: AppMode = import.meta.env.VITE_APP_MODE === 'production' ? 'production' : 'development'

export const env = {
  appMode,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  r2UploadBaseUrl: import.meta.env.VITE_R2_UPLOAD_BASE_URL || '',
  cloudflareEnv: import.meta.env.VITE_CLOUDFLARE_ENV || 'development',
  entraClientId: import.meta.env.VITE_ENTRA_CLIENT_ID || '',
  entraAuthority: import.meta.env.VITE_ENTRA_AUTHORITY || '',
  entraRedirectUri: import.meta.env.VITE_ENTRA_REDIRECT_URI || '',
  entraScopes: (import.meta.env.VITE_ENTRA_SCOPES || 'openid profile offline_access User.Read').split(/\s+/).filter(Boolean),
}

export const isDevelopmentMode = env.appMode === 'development'
export const isProductionMode = env.appMode === 'production'

export function requireApiBaseUrl() {
  if (!env.apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL is not configured')
  }
  return env.apiBaseUrl
}
