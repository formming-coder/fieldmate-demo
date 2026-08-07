import { AxiosRequestConfig } from 'axios'

const QUEUE_KEY = 'fieldmate:offline:queue'

export type QueueStatus = 'queued' | 'retrying' | 'conflict'

export type OfflineQueueItem = {
  id: string
  method: AxiosRequestConfig['method']
  url: string
  data?: unknown
  headers?: Record<string, string>
  attempts: number
  nextAttemptAt: number
  status: QueueStatus
  entity: 'property' | 'photo' | 'officer' | 'assessment' | 'gis' | 'notification' | 'history'
  conflictKey?: string
  createdAt: string
}

function readQueue(): OfflineQueueItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY)
    return raw ? (JSON.parse(raw) as OfflineQueueItem[]) : []
  } catch {
    return []
  }
}

function writeQueue(items: OfflineQueueItem[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(items))
}

function withBackoff(item: OfflineQueueItem): OfflineQueueItem {
  const attempts = item.attempts + 1
  const delay = Math.min(60000, 1000 * Math.pow(2, attempts))
  return {
    ...item,
    attempts,
    status: 'retrying',
    nextAttemptAt: Date.now() + delay,
  }
}

export function enqueueOfflineItem(item: Omit<OfflineQueueItem, 'id' | 'attempts' | 'nextAttemptAt' | 'status' | 'createdAt'>) {
  const nextItem: OfflineQueueItem = {
    ...item,
    id: `queue-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    attempts: 0,
    nextAttemptAt: Date.now(),
    status: 'queued',
    createdAt: new Date().toISOString(),
  }

  const queue = readQueue()
  writeQueue([nextItem, ...queue])
  return nextItem
}

export async function flushOfflineQueue(executor: (request: AxiosRequestConfig) => Promise<unknown>) {
  const queue = readQueue()
  if (!queue.length) return { flushed: 0, conflicts: 0, remaining: 0 }

  let flushed = 0
  let conflicts = 0
  const retained: OfflineQueueItem[] = []

  for (const item of queue) {
    if (item.nextAttemptAt > Date.now()) {
      retained.push(item)
      continue
    }

    try {
      await executor({ method: item.method, url: item.url, data: item.data, headers: item.headers })
      flushed += 1
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        conflicts += 1
        retained.push({ ...item, status: 'conflict', nextAttemptAt: Date.now() + 60000 })
      } else {
        retained.push(withBackoff(item))
      }
    }
  }

  writeQueue(retained)
  return { flushed, conflicts, remaining: retained.length }
}

export function getOfflineQueueSnapshot() {
  return readQueue()
}
