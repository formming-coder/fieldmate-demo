import React from 'react'
import { motion } from 'framer-motion'
import BrandMark from '../components/BrandMark'

export default function Splash() {
  return (
    <motion.div
      className="splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
    >
      <motion.div
        className="splash-content"
        initial={{ opacity: 0, y: 10, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.98, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="splash-card">
          <BrandMark size="large" animated />
          <div className="splash-copy">
            <h1>Fieldmate AI</h1>
            <p className="splash-subtitle">Smart Property Survey</p>
            <div className="splash-loader" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </motion.div>
      <motion.p
        className="splash-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.28, duration: 0.6 }}
      >
        กำลังเตรียมพื้นที่สำรวจ
      </motion.p>
      <motion.div
        className="splash-glow"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      <motion.div
        className="splash-glow splash-glow-secondary"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.88 }}
      />
      <motion.div
        className="splash-noise"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.16, duration: 0.42 }}
      />
    </motion.div>
  )
}
