import React, { memo } from 'react'
import { motion } from 'framer-motion'

export type SmartFilter = 'all' | 'land' | 'house' | 'semi' | 'townhouse' | 'townhome' | 'commercial'

type FilterChipsProps = {
  value: SmartFilter
  onChange: (value: SmartFilter) => void
}

const chips: Array<{ key: SmartFilter; label: string }> = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'land', label: 'ที่ดินเปล่า' },
  { key: 'house', label: 'บ้านเดี่ยว' },
  { key: 'semi', label: 'บ้านแฝด' },
  { key: 'townhouse', label: 'ทาวน์เฮ้าส์' },
  { key: 'townhome', label: 'ทาวน์โฮม' },
  { key: 'commercial', label: 'ตึกแถว/อาคารพาณิชย์' },
]

function FilterChips({ value, onChange }: FilterChipsProps) {
  return (
    <div className="map-filter-rail" role="tablist" aria-label="ตัวกรองแผนที่">
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
