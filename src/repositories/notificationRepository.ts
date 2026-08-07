import { apiClient } from '../lib/http/client'
import { isDevelopmentMode } from '../config/env'
import mockNotifications from '../mock/notifications.json'
import { Notification } from '../types'

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

export const notificationRepository = {
  async list() {
    if (isDevelopmentMode) {
      return (mockNotifications as NotificationRecord[]).map(toNotification)
    }

    const response = await apiClient.get<NotificationRecord[]>('/notifications')
    return response.data.map(toNotification)
  },
  async markRead(id: string) {
    if (isDevelopmentMode) {
      return
    }

    await apiClient.patch(`/notifications/${id}/read`)
  },
  async dismiss(id: string) {
    if (isDevelopmentMode) {
      return
    }

    await apiClient.delete(`/notifications/${id}`)
  },
}
