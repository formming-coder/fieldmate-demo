import { isDevelopmentMode } from '../config/env'
import mockNotifications from '../mock/notifications.json'
import { Notification } from '../types'
import { apiEndpoints } from '../services/api/endpoints'
import { apiService } from '../services/api/apiService'

const DEV_NOTIFICATION_KEY = 'fieldmate:dev:notifications'

type NotificationRecord = {
  id: string
  title: string
  body: string
  createdAt?: string
  created_at?: string
  read: boolean | number
}

function toNotification(record: NotificationRecord): Notification {
  return {
    id: record.id,
    title: record.title,
    body: record.body,
    createdAt: record.createdAt || record.created_at || new Date().toISOString(),
    read: Boolean(record.read),
  }
}

function readDevNotifications(): NotificationRecord[] {
  if (typeof window === 'undefined') {
    return mockNotifications as NotificationRecord[]
  }

  try {
    const cached = window.localStorage.getItem(DEV_NOTIFICATION_KEY)
    if (cached) {
      return JSON.parse(cached) as NotificationRecord[]
    }
  } catch {
    // ignore read errors
  }

  const seeded = mockNotifications as NotificationRecord[]
  try {
    window.localStorage.setItem(DEV_NOTIFICATION_KEY, JSON.stringify(seeded))
  } catch {
    // ignore seed errors
  }
  return seeded
}

function writeDevNotifications(items: NotificationRecord[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(DEV_NOTIFICATION_KEY, JSON.stringify(items))
  } catch {
    // ignore storage errors
  }
}

export const notificationRepository = {
  async list() {
    if (isDevelopmentMode) {
      return readDevNotifications().map(toNotification)
    }

    const response = await apiService.get<NotificationRecord[]>(apiEndpoints.notifications.list)
    return response.map(toNotification)
  },
  async markRead(id: string) {
    if (isDevelopmentMode) {
      const next = readDevNotifications().map((item) => item.id === id ? { ...item, read: true } : item)
      writeDevNotifications(next)
      return
    }

    await apiService.patch(apiEndpoints.notifications.markRead(id))
  },
  async dismiss(id: string) {
    if (isDevelopmentMode) {
      const next = readDevNotifications().filter((item) => item.id !== id)
      writeDevNotifications(next)
      return
    }

    await apiService.delete(apiEndpoints.notifications.remove(id))
  },
  async markAllRead() {
    if (isDevelopmentMode) {
      const next = readDevNotifications().map((item) => ({ ...item, read: true }))
      writeDevNotifications(next)
      return
    }

    await apiService.patch(apiEndpoints.notifications.readAll)
  },
}
