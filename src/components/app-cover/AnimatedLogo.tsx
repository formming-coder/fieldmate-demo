import React from 'react'
import { motion } from 'framer-motion'
import BrandMark from '../BrandMark'

type AnimatedLogoProps = {
  title: string
  tagline: string
  subtitle: string
}

export default function AnimatedLogo({ title, tagline, subtitle }: AnimatedLogoProps) {
  return (
    <motion.section
      className="app-cover-logo"
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="app-cover-logo-glow" aria-hidden="true" />
      <motion.div
        className="app-cover-logo-mark"
        animate={{ y: [0, -6, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <BrandMark size="large" animated />
      </motion.div>

      <div className="app-cover-logo-copy">
        <h1>{title}</h1>
        <p className="app-cover-tagline">{tagline}</p>
        <p className="app-cover-subtitle">{subtitle}</p>
      </div>
    </motion.section>
  )
}
