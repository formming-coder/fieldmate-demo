import React, { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onVoice: () => void
  onCamera: () => void
}

function SearchBar({ value, onChange, onVoice, onCamera }: SearchBarProps) {
  return (
    <motion.div className="ais-searchbar-wrap" initial={{ opacity: 0, y: 8, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 240, damping: 24 }}>
      <div className="ais-searchbar">
        <span className="ais-searchbar-icon material-symbols-rounded" aria-hidden="true">search</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="ค้นหาทรัพย์ โครงการ เจ้าของ เบอร์โทร ถนน OCR AID"
          aria-label="AI search"
        />
        <AnimatePresence>
          {value ? (
            <motion.button type="button" onClick={() => onChange('')} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} aria-label="ล้างคำค้นหา">
              <span className="material-symbols-rounded" aria-hidden="true">close</span>
            </motion.button>
          ) : null}
        </AnimatePresence>
        <button type="button" onClick={onVoice} aria-label="ค้นหาด้วยเสียง"><span className="material-symbols-rounded" aria-hidden="true">mic</span></button>
        <button type="button" onClick={onCamera} aria-label="ค้นหาด้วยภาพ"><span className="material-symbols-rounded" aria-hidden="true">photo_camera</span></button>
      </div>
    </motion.div>
  )
}

export default memo(SearchBar)
