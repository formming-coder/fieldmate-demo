import React, { memo } from 'react'
import { motion } from 'framer-motion'

type MapFABProps = {
  label: string
  icon: string
  onClick?: () => void
}

function MapFAB({ label, icon, onClick }: MapFABProps) {
  return (
    <motion.button
      type="button"
      className="map-fab"
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span className="material-symbols-rounded" aria-hidden="true">{icon}</span>
    </motion.button>
  )
}

export default memo(MapFAB)
