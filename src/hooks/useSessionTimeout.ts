import { useEffect, useRef } from 'react'

type UseSessionTimeoutOptions = {
  enabled: boolean
  timeoutMs?: number
  onTimeout: () => void
}

export function useSessionTimeout({ enabled, timeoutMs = 30 * 60 * 1000, onTimeout }: UseSessionTimeoutOptions) {
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    const restart = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
      timerRef.current = window.setTimeout(() => {
        onTimeout()
      }, timeoutMs)
    }

    const events: Array<keyof WindowEventMap> = ['click', 'keydown', 'touchstart', 'scroll', 'mousemove']
    events.forEach((eventName) => window.addEventListener(eventName, restart, { passive: true }))
    restart()

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, restart))
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [enabled, onTimeout, timeoutMs])
}
