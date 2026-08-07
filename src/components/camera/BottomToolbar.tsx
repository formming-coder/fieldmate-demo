import React, { memo } from 'react'
import { motion } from 'framer-motion'

type BottomToolbarProps = {
  onGallery: () => void
  onCapture: () => void
  onAIScan: () => void
  onVoice: () => void
  onMore: () => void
  captureProgress: number
}

function BottomToolbar({ onGallery, onCapture, onAIScan, onVoice, onMore, captureProgress }: BottomToolbarProps) {
  return (
    <footer className="cam-bottom-toolbar">
      <button type="button" onClick={onGallery}>Gallery</button>
      <div className="cam-capture-wrap">
        <button type="button" className="cam-capture-btn" onClick={onCapture} aria-label="Capture">
          <motion.span whileTap={{ scale: 0.88 }} transition={{ duration: 0.12 }} />
        </button>
        <svg className="cam-capture-ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="54" pathLength="100" style={{ strokeDasharray: '100', strokeDashoffset: `${100 - captureProgress}` }} />
        </svg>
      </div>
      <button type="button" onClick={onAIScan}>AI Scan</button>
      <button type="button" onClick={onVoice}>Voice Note</button>
      <button type="button" onClick={onMore}>More</button>
    </footer>
  )
}

export default memo(BottomToolbar)
