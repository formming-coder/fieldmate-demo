import { isDevelopmentMode } from '../../config/env'

export type PushProvider = 'firebase' | 'webpush'

export const notificationService = {
  async getUnreadCount() {
    try {
      const raw = window.localStorage.getItem('fieldmate:dev:notifications')
      if (!raw) return 0
      const records = JSON.parse(raw) as Array<{ read: boolean | number }>
      return records.filter((item) => !Boolean(item.read)).length
    } catch {
      return 0
    }
  },

  async registerPush(_provider: PushProvider, _publicKey?: string) {
    if (isDevelopmentMode) {
      return { ok: true, mode: 'mock' as const }
    }

    if (!('serviceWorker' in navigator)) {
      return { ok: false, reason: 'service-worker-unsupported' }
    }

    return { ok: true, mode: 'ready' as const }
  },
}
