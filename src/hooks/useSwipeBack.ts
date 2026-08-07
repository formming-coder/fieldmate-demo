import { useRef } from 'react'

export function useSwipeBack(onBack: () => void, threshold = 72) {
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)

  const onTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    const touch = event.touches[0]
    startX.current = touch?.clientX ?? null
    startY.current = touch?.clientY ?? null
  }

  const onTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (startX.current === null || startY.current === null) return
    const touch = event.changedTouches[0]
    const deltaX = (touch?.clientX ?? 0) - startX.current
    const deltaY = Math.abs((touch?.clientY ?? 0) - startY.current)

    startX.current = null
    startY.current = null

    if (deltaX > threshold && deltaY < 48) {
      onBack()
    }
  }

  return {
    onTouchStart,
    onTouchEnd,
  }
}
