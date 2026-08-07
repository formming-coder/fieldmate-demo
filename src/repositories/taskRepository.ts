import { apiClient } from '../lib/http/client'
import { Task } from '../types'

type TaskRecord = {
  id: string
  title: string
  propertyId?: string
  property_id?: string
  scheduledAt?: string
  scheduled_at?: string
  status: string
}

function toTask(record: TaskRecord): Task {
  return {
    id: record.id,
    title: record.title,
    propertyId: record.propertyId || record.property_id || '',
    scheduledAt: record.scheduledAt || record.scheduled_at || new Date().toISOString(),
    status: record.status,
  }
}

export const taskRepository = {
  async list() {
    const response = await apiClient.get<TaskRecord[]>('/tasks')
    return response.data.map(toTask)
  },
}
