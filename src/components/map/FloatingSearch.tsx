import React, { memo } from 'react'
import { motion } from 'framer-motion'

type FloatingSearchProps = {
  value: string
  onChange: (value: string) => void
  onVoice?: () => void
}

function FloatingSearch({ value, onChange, onVoice }: FloatingSearchProps) {
  return (
    <motion.div
      className="map-floating-search"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <span className="map-floating-search-icon" aria-hidden="true">🔍</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="ค้นหาทรัพย์ จังหวัด ถนน เจ้าของ รหัสทรัพย์"
        aria-label="ค้นหาทรัพย์"
      />
      <button type="button" className="map-floating-search-mic" aria-label="ค้นหาด้วยเสียง" onClick={onVoice}>🎤</button>
    </motion.div>
  )
}

export default memo(FloatingSearch)
