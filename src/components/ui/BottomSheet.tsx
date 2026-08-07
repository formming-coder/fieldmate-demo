import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/radius'
import { spacing } from '../../theme/spacing'

export type BottomSheetProps = {
  open: boolean
  children: React.ReactNode
  onClose?: () => void
  snapPoints?: number[]
  initialSnap?: number
}

export function BottomSheet({ open, children, onClose, snapPoints = [0.38, 0.7, 0.94], initialSnap = 1 }: BottomSheetProps) {
  const points = useMemo(() => [...snapPoints].sort((a, b) => a - b), [snapPoints])
  const [snapIndex, setSnapIndex] = useState(Math.min(initialSnap, points.length - 1))

  useEffect(() => {
    if (open) {
      setSnapIndex(Math.min(initialSnap, points.length - 1))
    }
  }, [open, initialSnap, points.length])

  const viewportHeight = typeof window === 'undefined' ? 844 : window.innerHeight
  const maxHeight = Math.round(viewportHeight * points[snapIndex])

  const simulateHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'fixed', inset: 0, background: colors.overlay, zIndex: 20 }} />
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.12}
            onDragEnd={(_, info) => {
              if (info.offset.y > 160 || info.velocity.y > 860) {
                simulateHaptic()
                onClose?.()
                return
              }

              if (info.offset.y < -96 && snapIndex < points.length - 1) {
                simulateHaptic()
                setSnapIndex((current) => Math.min(current + 1, points.length - 1))
                return
              }

              if (info.offset.y > 96 && snapIndex > 0) {
                simulateHaptic()
                setSnapIndex((current) => Math.max(current - 1, 0))
              }
            }}
            initial={{ y: 280 }}
            animate={{ y: 0, maxHeight }}
            exit={{ y: 280 }}
            transition={{ type: 'spring', stiffness: 250, damping: 28, mass: 0.9 }}
            style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 21, overflow: 'hidden', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', borderTopLeftRadius: radius.extra, borderTopRightRadius: radius.extra, padding: `${spacing[4]} ${spacing[4]} calc(${spacing[8]} + env(safe-area-inset-bottom))`, boxShadow: '0 -20px 44px rgba(17,24,39,0.18)' }}
          >
            <div aria-hidden="true" style={{ width: 44, height: 5, borderRadius: 999, background: colors.border, margin: '0 auto 12px' }} />
            {children}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
