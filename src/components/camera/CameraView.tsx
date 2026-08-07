import React, { memo } from 'react'
import { motion } from 'framer-motion'

type CameraViewProps = {
  flashActive: boolean
  processing?: boolean
  children?: React.ReactNode
}

function CameraView({ flashActive, processing = false, children }: CameraViewProps) {
  return (
    <motion.section className="cam-view" aria-label="AI inspection camera" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
      <div className="cam-live-scene" />
      {children}
      {processing ? (
        <motion.div className="cam-processing-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="cam-processing-grid" />
          <motion.div className="cam-processing-line" initial={{ y: '-100%' }} animate={{ y: '180%' }} transition={{ duration: 1.35, repeat: Infinity, ease: 'linear' }} />
          <div className="cam-processing-copy">AI กำลังวิเคราะห์ภาพและ OCR</div>
        </motion.div>
      ) : null}
      {flashActive ? (
        <motion.div
          className="cam-shutter-flash"
          initial={{ opacity: 0.75 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        />
      ) : null}
    </motion.section>
  )
}

export default memo(CameraView)
