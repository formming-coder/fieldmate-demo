import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/radius'
import { spacing } from '../../theme/spacing'

export type BottomSheetProps = {
  open: boolean
  children: React.ReactNode
  onClose?: () => void
  snapPoints?: number[]
  initialSnap?: number
  mode?: 'standard' | 'property'
  title?: string
  footer?: React.ReactNode
}

type PropertySheetProps = Pick<BottomSheetProps, 'open' | 'children' | 'onClose' | 'title' | 'footer'>

function PropertySheet({ open, children, onClose, title = 'รายละเอียดทรัพย์สิน', footer }: PropertySheetProps) {
  const titleId = useId()
  const dragControls = useDragControls()
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const onCloseRef = useRef(onClose)
  const deactivateRef = useRef<() => void>(() => undefined)
  const historyMarkerRef = useRef(`fieldmate-property-sheet-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const requestClose = useCallback(() => {
    if (window.history.state?.fieldmatePropertySheet === historyMarkerRef.current) {
      window.history.back()
      return
    }
    deactivateRef.current()
    onCloseRef.current?.()
  }, [])

  useEffect(() => {
    if (!open) return

    const previousBodyOverflow = document.body.style.overflow
    const previousBodyOverscroll = document.body.style.overscrollBehavior
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'
    document.documentElement.style.overflow = 'hidden'

    window.history.pushState(
      { ...window.history.state, fieldmatePropertySheet: historyMarkerRef.current },
      '',
      window.location.href,
    )

    let active = true
    const deactivate = () => {
      if (!active) return
      active = false
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousBodyOverflow
      document.body.style.overscrollBehavior = previousBodyOverscroll
      document.documentElement.style.overflow = previousHtmlOverflow
    }
    const handlePopState = () => {
      deactivate()
      onCloseRef.current?.()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || document.querySelector('[data-property-gallery-fullscreen]')) return
      event.preventDefault()
      requestClose()
    }

    deactivateRef.current = deactivate

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('keydown', handleKeyDown)
    window.requestAnimationFrame(() => closeButtonRef.current?.focus({ preventScroll: true }))

    return deactivate
  }, [open, requestClose])

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="property-sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={requestClose}
          />
          <motion.section
            className="property-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 48 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.16 }}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 720) requestClose()
            }}
            transition={{ type: 'spring', stiffness: 310, damping: 32, mass: 0.8 }}
          >
            <header className="property-sheet-header">
              <div
                className="property-sheet-drag-zone"
                aria-hidden="true"
                onPointerDown={(event) => dragControls.start(event)}
              >
                <span className="property-sheet-handle" />
              </div>
              <div className="property-sheet-nav">
                <button type="button" className="property-sheet-back" onClick={requestClose} aria-label="ย้อนกลับไปแผนที่">
                  <span aria-hidden="true">←</span>
                  <span>ย้อนกลับ</span>
                </button>
                <h2 id={titleId}>{title}</h2>
                <button ref={closeButtonRef} type="button" className="property-sheet-close" onClick={requestClose} aria-label="ปิดรายละเอียดทรัพย์สิน">×</button>
              </div>
            </header>
            <div className="property-sheet-scroll">{children}</div>
            {footer ? <footer className="property-sheet-footer">{footer}</footer> : null}
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  )
}

type StandardSheetProps = Pick<BottomSheetProps, 'open' | 'children' | 'onClose' | 'snapPoints' | 'initialSnap'>

function StandardSheet({ open, children, onClose, snapPoints = [0.38, 0.7, 0.94], initialSnap = 1 }: StandardSheetProps) {
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

export function BottomSheet({ mode = 'standard', title, footer, ...props }: BottomSheetProps) {
  if (mode === 'property') {
    return <PropertySheet open={props.open} onClose={props.onClose} title={title} footer={footer}>{props.children}</PropertySheet>
  }

  return <StandardSheet {...props} />
}
