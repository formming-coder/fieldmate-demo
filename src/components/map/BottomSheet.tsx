import React, { memo, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

const points = [0.3, 0.62, 0.94]

function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  const [snap, setSnap] = useState(1)

  useEffect(() => {
    if (open) setSnap(1)
  }, [open])

  const maxHeight = useMemo(() => {
    const viewport = typeof window === 'undefined' ? 844 : window.innerHeight
    return Math.round(viewport * points[snap])
  }, [snap])

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div className="smart-sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.section
            className="smart-sheet"
            initial={{ y: 280 }}
            animate={{ y: 0, maxHeight }}
            exit={{ y: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 160 || info.velocity.y > 860) {
                onClose()
                return
              }
              if (info.offset.y < -96 && snap < points.length - 1) {
                setSnap((current) => Math.min(current + 1, points.length - 1))
                return
              }
              if (info.offset.y > 96 && snap > 0) {
                setSnap((current) => Math.max(current - 1, 0))
              }
            }}
            transition={{ type: 'spring', stiffness: 250, damping: 28, mass: 0.86 }}
          >
            <div className="smart-sheet-handle" aria-hidden="true" />
            {children}
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  )
}

export default memo(BottomSheet)
