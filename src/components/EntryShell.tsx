import React from 'react'
import { motion } from 'framer-motion'

export default function EntryShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="mobile-shell entry-shell">
        <div className="entry-shell-glow" aria-hidden="true" />
        <motion.main
          className="entry-shell-main"
          initial={{ opacity: 0, y: 14, scale: 0.99 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24, mass: 0.75 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}