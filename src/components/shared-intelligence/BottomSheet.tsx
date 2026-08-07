import React, { memo, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

const snapPoints = [0.34, 0.72, 0.95]

function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  const [snap, setSnap] = useState(1)

  useEffect(() => {
    if (open) setSnap(1)
  }, [open])

  const maxHeight = useMemo(() => {
    const viewport = typeof window === 'undefined' ? 844 : window.innerHeight
    return Math.round(viewport * snapPoints[snap])
  }, [snap])

  const simulateHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div className="spi-sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.section
            className="spi-sheet"
            initial={{ y: 320 }}
            animate={{ y: 0, maxHeight }}
            exit={{ y: 340 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 160 || info.velocity.y > 860) {
                simulateHaptic()
                onClose()
                return
              }
              if (info.offset.y < -82 && snap < snapPoints.length - 1) {
                simulateHaptic()
                setSnap((current) => Math.min(current + 1, snapPoints.length - 1))
                return
              }
              if (info.offset.y > 82 && snap > 0) {
                simulateHaptic()
                setSnap((current) => Math.max(current - 1, 0))
              }
            }}
            transition={{ type: 'spring', stiffness: 250, damping: 28, mass: 0.9 }}
          >
            <div className="spi-sheet-handle" />
            {children}
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  )
}

export default memo(BottomSheet)
