import React, { memo } from 'react'
import { motion } from 'framer-motion'

export type SmartFilter = 'all' | 'house' | 'townhome' | 'condo' | 'land' | 'commercial' | 'latest' | 'nearby'

type FilterChipsProps = {
  value: SmartFilter
  onChange: (value: SmartFilter) => void
}

const chips: Array<{ key: SmartFilter; label: string }> = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'house', label: 'บ้านเดี่ยว' },
  { key: 'townhome', label: 'ทาวน์โฮม' },
  { key: 'condo', label: 'คอนโด' },
  { key: 'land', label: 'ที่ดิน' },
  { key: 'commercial', label: 'อาคารพาณิชย์' },
  { key: 'latest', label: 'ล่าสุด' },
  { key: 'nearby', label: 'ใกล้ฉัน' },
]

function FilterChips({ value, onChange }: FilterChipsProps) {
  return (
    <div className="map-filter-rail" role="tablist" aria-label="map filters">
      {chips.map((chip) => {
        const isActive = chip.key === value
        return (
          <button key={chip.key} type="button" className="map-chip" onClick={() => onChange(chip.key)} role="tab" aria-selected={isActive}>
            {isActive ? <motion.span className="map-chip-active-bg" layoutId="map-chip-active" /> : null}
            <span>{chip.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default memo(FilterChips)
