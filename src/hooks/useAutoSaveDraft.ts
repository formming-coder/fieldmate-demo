import { useEffect, useMemo, useRef, useState } from 'react'

type UseAutoSaveDraftOptions<T> = {
  key: string
  value: T
  intervalMs?: number
  enabled?: boolean
}

function safeRead<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function useAutoSaveDraft<T>({ key, value, intervalMs = 5000, enabled = true }: UseAutoSaveDraftOptions<T>) {
  const serialized = useMemo(() => JSON.stringify(value), [value])
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const [hasRestored, setHasRestored] = useState(false)
  const [saveError, setSaveError] = useState('')
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!enabled) return
    if (!initializedRef.current) {
      initializedRef.current = true
      return
    }

    const timer = window.setInterval(() => {
      const parsed = JSON.parse(serialized) as T
      const ok = safeWrite(key, parsed)
      if (ok) {
        setLastSavedAt(Date.now())
        setSaveError('')
      } else {
        setSaveError('ไม่สามารถบันทึกแบบร่างอัตโนมัติได้')
      }
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [enabled, intervalMs, key, serialized])

  const readDraft = () => {
    const draft = safeRead<T>(key)
    setHasRestored(Boolean(draft))
    return draft
  }

  const clearDraft = () => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(key)
  }

  return {
    readDraft,
    clearDraft,
    hasRestored,
    lastSavedAt,
    saveError,
  }
}
