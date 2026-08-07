import { apiClient } from '../lib/http/client'
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
    const response = await apiClient.get<NotificationRecord[]>('/notifications')
    return response.data.map(toNotification)
  },
  async markRead(id: string) {
    await apiClient.patch(`/notifications/${id}/read`)
  },
  async dismiss(id: string) {
    await apiClient.delete(`/notifications/${id}`)
  },
}
