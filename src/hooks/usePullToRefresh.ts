import { useRef, useState } from 'react'

export function usePullToRefresh(onRefresh: () => Promise<void> | void, threshold = 82) {
  const startY = useRef<number | null>(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const onTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    if (window.scrollY > 0) return
    startY.current = event.touches[0]?.clientY ?? null
  }

  const onTouchMove = (event: React.TouchEvent<HTMLElement>) => {
    if (startY.current === null || window.scrollY > 0) return
    const currentY = event.touches[0]?.clientY ?? startY.current
    const distance = Math.max(0, currentY - startY.current)
    setPullDistance(Math.min(distance, 120))
  }

  const onTouchEnd = async () => {
    if (startY.current === null) return
    const shouldRefresh = pullDistance >= threshold
    startY.current = null
    setPullDistance(0)

    if (!shouldRefresh) return
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  return {
    isRefreshing,
    pullDistance,
    bind: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  }
}
